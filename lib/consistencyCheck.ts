import { LlmOutput } from './prompt';

export function checkConsistency(data: LlmOutput): boolean {
  const isInsufficient = data.confidence === 'Insufficient technology signal';
  
  // 1. If confidence is 'Insufficient technology signal', recommendedCandidateId MUST be null
  if (isInsufficient && data.recommendedCandidateId !== null) {
    return false;
  }
  
  // 2. If recommendedCandidateId is NOT null, confidence cannot be 'Insufficient technology signal'
  if (data.recommendedCandidateId !== null && isInsufficient) {
    return false;
  }
  
  // 3. If broaderUnderlyingInterest indicates insufficient signal but confidence is High, that is contradictory
  const interestLower = data.broaderUnderlyingInterest.toLowerCase();
  if (
    data.confidence === 'High' &&
    (interestLower.includes('insufficient') ||
     interestLower.includes('no tech') ||
     interestLower.includes('lack of tech') ||
     interestLower.includes('no technical'))
  ) {
    return false;
  }

  return true;
}
