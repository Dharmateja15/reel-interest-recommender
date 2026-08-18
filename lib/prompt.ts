import { z } from 'zod';
import { InteractionReel, CandidateReel } from './types';

// Strict runtime schema validation using Zod
export const llmOutputSchema = z.object({
  surfaceTopics: z.array(z.string()),
  contextIntents: z.array(z.string()),
  crossReelPattern: z.string(),
  broaderUnderlyingInterest: z.string(),
  confidence: z.enum(['High', 'Medium', 'Low', 'Insufficient technology signal']),
  candidateEvaluations: z.array(
    z.object({
      candidateId: z.string(),
      suitabilityScore: z.number().min(0).max(10),
      justification: z.string()
    })
  ),
  antiHypeEvaluations: z.array(
    z.object({
      candidateId: z.string(),
      hypeRiskScore: z.number().min(0).max(10),
      riskReasoning: z.string()
    })
  ),
  recommendedCandidateId: z.string().nullable(),
  recommendationExplanation: z.string().nullable()
});

export type LlmOutput = z.infer<typeof llmOutputSchema>;

export function buildPrompt(
  currentReel: InteractionReel,
  history: InteractionReel[],
  candidateLibrary: CandidateReel[]
): string {
  // Format interaction history
  const historyText = history
    .map(
      (r, idx) =>
        `${idx + 1}. [ID: ${r.id}] Title: "${r.title}", Type: ${r.category}, Description: "${r.description}"${
          r.id === currentReel.id ? ' (CURRENT REEL)' : ''
        }`
    )
    .join('\n');

  // Format candidates
  const candidatesText = candidateLibrary
    .map(
      (c) =>
        `- [ID: ${c.id}] Title: "${c.title}", Category: ${c.category}, Difficulty: ${c.difficulty}, HypeRisk: ${c.hypeRisk}, Description: "${c.description}"`
    )
    .join('\n');

  return `You are a semantic interest recommendation agent. Your task is to analyze a student's recent Reel interaction history, perform abstractive interest inference, evaluate candidates from a trusted library, filter out hype, and recommend exactly one useful technology Reel.

### Interaction History:
${historyText}

### Current Reel (The last video the user is currently watching):
ID: ${currentReel.id}
Title: "${currentReel.title}"
Type: ${currentReel.category}
Description: "${currentReel.description}"

### Trusted Candidate Library:
${candidatesText}

---

### Step-by-Step Reasoning Pipeline (Must run in this exact order):
1. **History:** Analyze the interaction history as a chronological set of signals.
2. **Surface Topic:** Extract the surface-level topic of each Reel (e.g. a Java syntax joke, a MacBook laptop comparison).
3. **Context / Intent:** Infer the underlying driver or intent of why they watched it (e.g. career anxiety, laptop buying guides, general engineering humor).
4. **Cross-Reel Pattern:** Identify recurring semantic overlaps, threads, or common denominators across the history.
5. **Broader Underlying Interest:** Synthesize the core interest (e.g., Software Engineering, Web Development, Artificial Intelligence).
   * *CRITICAL TRAP SAFEGUARD:* Do not simply match the topic of the current Reel directly (e.g., Java meme -> Java candidate) if a broader engineering/technology interest is evident across the history. Look for the underlying interest pattern.
6. **Confidence:** Assess your confidence in this interest (High, Medium, Low, or Insufficient technology signal). If the history lacks concrete technical depth (e.g., contains mostly lifestyle or general entertainment), you must rate the confidence as "Insufficient technology signal".
7. **Candidate Evaluation:** Evaluate and score each candidate's suitability against the inferred interest (from 0 to 10).
8. **Anti-Hype Evaluation:** Score the hype risk of each candidate (from 0 to 10).
   * *CRITICAL HYPE FILTER:* Candidates with "HypeRisk: High" (such as clickbaity Career guides promising easy money or listing simple AI tools without programming substance) MUST NOT be recommended under any circumstances, even if their topics align. You must filter them out first.
9. **Candidate Selection:** Recommend exactly one candidate ID. If confidence is "Insufficient technology signal" or no suitable candidates remain after anti-hype filtering, return null for recommendedCandidateId.

---

### Output JSON Schema:
You must output a single JSON object. Do not include any markdown styling, wrappers, or explanation outside of the JSON.

Expected JSON format:
{
  "surfaceTopics": ["string", "string"],
  "contextIntents": ["string", "string"],
  "crossReelPattern": "string describing the overlaps",
  "broaderUnderlyingInterest": "string describing the inferred core interest",
  "confidence": "High" | "Medium" | "Low" | "Insufficient technology signal",
  "candidateEvaluations": [
    {
      "candidateId": "string",
      "suitabilityScore": number (0 to 10),
      "justification": "why it fits the interest"
    }
  ],
  "antiHypeEvaluations": [
    {
      "candidateId": "string",
      "hypeRiskScore": number (0 to 10),
      "riskReasoning": "explanation of hype level"
    }
  ],
  "recommendedCandidateId": "string" | null,
  "recommendationExplanation": "why this specific candidate was selected over others"
}
`;
}
