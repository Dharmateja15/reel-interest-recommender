import { CandidateReel, Category, InteractionReel, RecommendationResponse } from './types';
import { candidates } from '../data/candidates';
import { fallbackKeywordMap } from '../data/fallback-keyword-map';

export function resolveFallback(
  currentReelTitle: string,
  history: InteractionReel[]
): RecommendationResponse {
  // Initialize tallies for all categories
  const categories: Category[] = ['AI', 'DSA', 'Java', 'HLD', 'Cybersecurity', 'Cloud', 'Hardware', 'Career', 'Other'];
  const tallies = {} as Record<Category, number>;
  for (const cat of categories) {
    tallies[cat] = 0;
  }

  // 1. Tally categories in history based on title/description keyword matching
  for (const reel of history) {
    const text = `${reel.title} ${reel.description}`.toLowerCase();
    const matchedCategoriesInReel = new Set<Category>();

    for (const entry of fallbackKeywordMap) {
      const kw = entry.keyword.toLowerCase();
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        matchedCategoriesInReel.add(entry.category);
      }
    }

    for (const cat of matchedCategoriesInReel) {
      tallies[cat] += 1;
    }
  }

  // 2. Find the highest tally and runner-up to check for a clear plurality
  let maxCategory: Category | null = null;
  let maxTally = 0;
  let hasTie = false;

  for (const cat of categories) {
    const count = tallies[cat];
    if (count > maxTally) {
      maxTally = count;
      maxCategory = cat;
      hasTie = false;
    } else if (count === maxTally && count > 0) {
      hasTie = true;
    }
  }

  // If there is no clear plurality (tie or zero matches), return an insufficient signal response
  if (!maxCategory || maxTally === 0 || hasTie) {
    return {
      currentReelTitle,
      interestDetected: 'Insufficient technology signal',
      whyInterest: 'Fallback analysis: The interaction history does not contain a clear, dominant technology category or interest signal.',
      recommendedReel: null,
      category: null,
      whyRecommendation: null,
      difficulty: null,
      confidence: 'Low',
      source: 'fallback'
    };
  }

  // 3. Filter candidates matching the plurality category and select the one with the lowest hype risk
  const matchingCandidates = candidates.filter(c => c.category === maxCategory);

  if (matchingCandidates.length === 0) {
    return {
      currentReelTitle,
      interestDetected: maxCategory,
      whyInterest: `Fallback analysis: Detected interest in ${maxCategory} based on keyword matching in history.`,
      recommendedReel: null,
      category: maxCategory,
      whyRecommendation: `No candidates available in the library for category ${maxCategory}.`,
      difficulty: null,
      confidence: 'Medium',
      source: 'fallback'
    };
  }

  // Sort matching candidates by hypeRisk: Low first, then Medium, then High
  const riskWeights = { Low: 1, Medium: 2, High: 3 };
  matchingCandidates.sort((a, b) => riskWeights[a.hypeRisk] - riskWeights[b.hypeRisk]);

  const selectedCandidate = matchingCandidates[0];

  return {
    currentReelTitle,
    interestDetected: maxCategory,
    whyInterest: `Fallback analysis: Inferred interest in ${maxCategory} based on keyword matches across interaction history.`,
    recommendedReel: selectedCandidate,
    category: maxCategory,
    whyRecommendation: `Fallback recommendation based on plurality match for category ${maxCategory}. Selecting low-hype candidate.`,
    difficulty: selectedCandidate.difficulty,
    confidence: 'Medium', // Capped at Medium for fallback
    source: 'fallback'
  };
}
