export interface VideoMetadataInfo {
  name: string
  size: number
  type: string
  duration: number
  width: number
  height: number
  lastModified: number
}

export interface CandidateDescription {
  id: string
  text: string
}

export interface AnalysisConfig {
  sampleRate: number // Frames sampled per second (e.g., 0.5, 1, 2)
  confidenceThreshold: number // 0.0 - 1.0
  enableVCI: boolean // Visual Counterfactual Intelligence heatmap
}

export interface FrameSimilarity {
  description: string
  cosineSimilarity: number
}

export interface ExtractedFrame {
  id: string
  index: number
  timestamp: number // in seconds
  timestampFormatted: string
  dataUrl: string
  scores: FrameSimilarity[]
  topScore: number
  topDescription: string
  vciHeatmapUrl?: string
}

export interface RankedDescriptionResult {
  description: string
  peakSimilarity: number
  bestTimestamp: number
  bestTimestampFormatted: string
  bestFrameId: string
}

export interface VideoAnalysisResult {
  videoName: string
  duration: number
  totalFrames: number
  analyzedAt: string
  descriptions: string[]
  frames: ExtractedFrame[]
  rankedResults: RankedDescriptionResult[]
  isSimulation: boolean
}

export type ProcessingStage = 
  | 'idle'
  | 'extracting_frames'
  | 'computing_clip'
  | 'generating_vci'
  | 'completed'
  | 'error'

export interface ProcessingStatus {
  stage: ProcessingStage
  progress: number // 0 to 100
  message: string
}
