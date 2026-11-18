export interface SimilarityResult {
  description: string
  score: number
}

export interface VciCell {
  row: number
  column: number
  maskedSimilarity: number
}

export interface AnalysisResponse {
  results: SimilarityResult[]
  vci?: VciCell[]
  note?: string
}
