/**
 * CrimeScene API Types
 * Matches backend FastAPI schemas defined in backend/app/schemas.py
 */

export interface HealthResponse {
  status: string;
  project: string;
  message: string;
}

export interface CLIPResult {
  description: string;
  cosine_similarity: number;
}

export interface ImageAnalysisResponse {
  success: boolean;
  filename: string;
  total_descriptions: number;
  results: CLIPResult[];
  note: string;
}

export interface VCIRegion {
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  masked_similarity: number;
  similarity_change: number;
}

export interface VCIAnalysisResponse {
  success: boolean;
  filename: string;
  description: string;
  grid_size: number;
  original_similarity: number;
  regions: VCIRegion[];
  note: string;
}

export interface VideoFrameResult {
  frame_index: number;
  timestamp_seconds: number;
  thumbnail_base64?: string;
  results: CLIPResult[];
}

export interface VideoAnalysisResponse {
  success: boolean;
  filename: string;
  descriptions: string[];
  duration_seconds: number;
  fps: number;
  total_video_frames: number;
  analyzed_frames: number;
  sampling_interval_seconds: number;
  frames: VideoFrameResult[];
  note: string;
}

export interface ApiError {
  detail: string;
}
