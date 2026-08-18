export type Category = 'AI' | 'DSA' | 'Java' | 'HLD' | 'Cybersecurity' | 'Cloud' | 'Hardware' | 'Career' | 'Other';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Confidence = 'High' | 'Medium' | 'Low' | 'Insufficient technology signal';
export type Source = 'ai' | 'fallback';
export type InteractionType = 'Meme' | 'Lifestyle' | 'Tutorial' | 'Discussion' | 'Comparison' | 'Other';

export interface InteractionReel {
  id: string;
  title: string;
  category: InteractionType;
  description: string;
}

export interface CandidateReel {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  description: string;
  hypeRisk: 'High' | 'Medium' | 'Low';
}

export interface RecommendationResponse {
  currentReelTitle: string;
  interestDetected: string;
  whyInterest: string;
  recommendedReel: CandidateReel | null;
  category: Category | null;
  whyRecommendation: string | null;
  difficulty: Difficulty | null;
  confidence: Confidence;
  source: Source;
}
