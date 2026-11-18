import type { AnalysisResponse } from '../types';

// Illustrative development fixtures only. Never used for live backend responses.
const MOCK_SCORES = [0.284, 0.231, 0.192, 0.146, 0.113, 0.087];
const MOCK_MASKED_SCORES = [
  0.271, 0.302, 0.249, 0.263,
  0.218, 0.291, 0.276, 0.242,
  0.285, 0.257, 0.229, 0.296,
  0.266, 0.238, 0.278, 0.252,
];

export async function createMockPhotoResponse(
  descriptions: string[]
): Promise<AnalysisResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 900));

  const results = descriptions
    .map((description, index) => ({
      description,
      score: MOCK_SCORES[index % MOCK_SCORES.length],
    }))
    .sort((a, b) => b.score - a.score);

  return {
    results,
    vci: MOCK_MASKED_SCORES.map((maskedSimilarity, index) => ({
      row: Math.floor(index / 4) + 1,
      column: (index % 4) + 1,
      maskedSimilarity,
    })),
    note: 'Illustrative mock data for interface review only. These are not CLIP model results.',
  };
}
