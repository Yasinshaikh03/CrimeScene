export type SimilarityResult = { description: string; score: number };
export type VciCell = { row: number; column: number; maskedSimilarity: number };
export type AnalysisResponse = { results: SimilarityResult[]; vci?: VciCell[]; note?: string };

// Development-only illustrative values. They are never presented as backend output.
export function createMockResponse(descriptions: string[]): AnalysisResponse {
  const values = descriptions.map((description, index) => ({
    description,
    score: [0.284, 0.231, 0.192, 0.146, 0.113, 0.087][index % 6],
  })).sort((a, b) => b.score - a.score);
  const masked = [0.271, 0.302, 0.249, 0.263, 0.218, 0.291, 0.276, 0.242, 0.285, 0.257, 0.229, 0.296, 0.266, 0.238, 0.278, 0.252];
  return {
    results: values,
    vci: masked.map((maskedSimilarity, index) => ({ row: Math.floor(index / 4) + 1, column: (index % 4) + 1, maskedSimilarity })),
    note: 'Illustrative mock values for interface review. These are not model results.',
  };
}
