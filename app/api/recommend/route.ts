import { NextResponse } from 'next/server';
import { historyScenarios } from '../../../data/history-sets';
import { candidates } from '../../../data/candidates';
import { buildPrompt, llmOutputSchema, LlmOutput } from '../../../lib/prompt';
import { checkConsistency } from '../../../lib/consistencyCheck';
import { resolveFallback } from '../../../lib/fallback';
import { CandidateReel, RecommendationResponse } from '../../../lib/types';

function cleanJsonString(str: string): string {
  // Strip code block markers if present
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (Status ${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API.');
  }

  return text;
}

export async function POST(request: Request) {
  let historyId = '';
  let currentReelId = '';

  try {
    const body = await request.json();
    historyId = body.historyId;
    currentReelId = body.currentReelId;

    if (!historyId || !currentReelId) {
      return NextResponse.json(
        { error: 'Missing required parameters: historyId and currentReelId' },
        { status: 400 }
      );
    }

    // 1. Resolve Scenario and History set on server
    const scenario = historyScenarios[historyId];
    if (!scenario) {
      return NextResponse.json(
        { error: `Invalid historyId: "${historyId}"` },
        { status: 400 }
      );
    }

    // 2. Validate currentReelId exists inside history
    const currentReel = scenario.history.find(r => r.id === currentReelId);
    if (!currentReel) {
      return NextResponse.json(
        { error: `currentReelId "${currentReelId}" does not exist in history set "${historyId}"` },
        { status: 400 }
      );
    }

    // If API Key is missing, trigger fallback immediately and gracefully
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Gracefully routing to deterministic fallback.');
      const fallbackResponse = resolveFallback(currentReel.title, scenario.history);
      return NextResponse.json(fallbackResponse);
    }

    // 3. Call LLM with single retry on schema/consistency errors
    let rawText = '';
    let parsedLlm: LlmOutput | null = null;
    let errorMsg = '';
    let isSuccessful = false;

    // Run first attempt
    try {
      const prompt = buildPrompt(currentReel, scenario.history, candidates);
      rawText = await callGemini(prompt);
      const jsonParsed = JSON.parse(cleanJsonString(rawText));
      parsedLlm = llmOutputSchema.parse(jsonParsed);
      
      if (!checkConsistency(parsedLlm)) {
        throw new Error('Consistency check failed (detected contradiction in confidence/recommendation).');
      }

      // Check if recommendedCandidateId is part of our closed candidate library
      if (parsedLlm.recommendedCandidateId !== null) {
        const candidateExists = candidates.some(c => c.id === parsedLlm!.recommendedCandidateId);
        if (!candidateExists) {
          throw new Error(`Recommended candidate ID "${parsedLlm.recommendedCandidateId}" does not exist in local candidate library.`);
        }
      }

      isSuccessful = true;
    } catch (e: any) {
      errorMsg = e.message || 'Unknown error';
      console.warn(`First LLM recommendation attempt failed: ${errorMsg}. Retrying once...`);
    }

    // Run retry attempt if first attempt failed
    if (!isSuccessful) {
      try {
        const retryPrompt = `${buildPrompt(currentReel, scenario.history, candidates)}
        
WARNING: Your previous output failed verification with the following error:
"${errorMsg}"

Please fix this issue and output correct, parsed, and consistent JSON adhering strictly to the schema.`;
        
        rawText = await callGemini(retryPrompt);
        const jsonParsed = JSON.parse(cleanJsonString(rawText));
        parsedLlm = llmOutputSchema.parse(jsonParsed);
        
        if (!checkConsistency(parsedLlm)) {
          throw new Error('Consistency check failed on retry.');
        }

        if (parsedLlm.recommendedCandidateId !== null) {
          const candidateExists = candidates.some(c => c.id === parsedLlm!.recommendedCandidateId);
          if (!candidateExists) {
            throw new Error(`Recommended candidate ID "${parsedLlm.recommendedCandidateId}" on retry does not exist in local candidate library.`);
          }
        }
        
        isSuccessful = true;
        console.log('LLM recommendation succeeded on retry.');
      } catch (retryErr: any) {
        console.error(`Second LLM attempt failed: ${retryErr.message}. Gracefully falling back to deterministic plurality resolution.`);
      }
    }

    // 4. Return AI response or fall back to Plurality resolver
    if (isSuccessful && parsedLlm) {
      let resolvedReel: CandidateReel | null = null;
      if (parsedLlm.recommendedCandidateId !== null) {
        resolvedReel = candidates.find(c => c.id === parsedLlm!.recommendedCandidateId) || null;
      }

      const response: RecommendationResponse = {
        currentReelTitle: currentReel.title,
        interestDetected: parsedLlm.broaderUnderlyingInterest,
        whyInterest: parsedLlm.crossReelPattern,
        recommendedReel: resolvedReel,
        category: resolvedReel ? resolvedReel.category : null,
        whyRecommendation: parsedLlm.recommendationExplanation,
        difficulty: resolvedReel ? resolvedReel.difficulty : null,
        confidence: parsedLlm.confidence,
        source: 'ai'
      };

      return NextResponse.json(response);
    } else {
      // Fallback
      const fallbackResponse = resolveFallback(currentReel.title, scenario.history);
      return NextResponse.json(fallbackResponse);
    }

  } catch (error: any) {
    console.error('Request handler crashed:', error);
    // If the system crashes, fallback gracefully to prevent 500 error page
    const scenario = historyScenarios[historyId];
    if (scenario) {
      const currentReel = scenario.history.find(r => r.id === currentReelId);
      const fallbackResponse = resolveFallback(currentReel ? currentReel.title : 'Unknown', scenario.history);
      return NextResponse.json(fallbackResponse);
    }
    return NextResponse.json(
      { error: 'An internal error occurred and fallback failed.' },
      { status: 500 }
    );
  }
}
