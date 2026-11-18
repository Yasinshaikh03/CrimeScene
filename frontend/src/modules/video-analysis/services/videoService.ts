/**
 * ------------------------------------------------------------------
 * PRODUCTION VIDEO ANALYSIS SERVICE — FASTAPI & CLIP INTEGRATION
 * ------------------------------------------------------------------
 * Connects the Video Analysis UI to the live CrimeScene FastAPI backend:
 * POST /api/analyze/video
 * 
 * Extracts frames on the backend with OpenCV, generates in-memory base64
 * JPEG thumbnails, computes genuine OpenAI CLIP ViT-B/32 multi-modal
 * cosine similarity, and reports accurate frame timestamps and ranks.
 * ------------------------------------------------------------------
 */

import type {
  AnalysisConfig,
  ExtractedFrame,
  FrameSimilarity,
  RankedDescriptionResult,
  VideoAnalysisResult,
  ProcessingStatus
} from '../types'

/**
 * Format seconds into mm:ss or mm:ss.ms string
 */
export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`
}

/**
 * Format bytes into human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Backend API raw response schema for POST /api/analyze/video
 */
interface BackendCLIPResult {
  description: string
  cosine_similarity: number
}

interface BackendVideoFrameResult {
  frame_index: number
  timestamp_seconds: number
  thumbnail_base64: string
  results: BackendCLIPResult[]
}

interface BackendVideoResponse {
  success: boolean
  filename: string
  descriptions: string[]
  duration_seconds: number
  fps: number
  total_video_frames: number
  analyzed_frames: number
  sampling_interval_seconds: number
  frames: BackendVideoFrameResult[]
  note: string
}

/**
 * Execute real video analysis via CrimeScene FastAPI backend
 */
export async function analyzeVideoWithBackend(
  videoFile: File,
  descriptions: string[],
  config: AnalysisConfig,
  onStatusUpdate: (status: ProcessingStatus) => void
): Promise<VideoAnalysisResult> {
  // Step 1: Uploading & Frame Extraction
  onStatusUpdate({
    stage: 'extracting_frames',
    progress: 15,
    message: 'Streaming video to CrimeScene backend & extracting OpenCV keyframes...'
  })

  // Interval in seconds: 1 / sampleRate (clamped between 0.1 and 30.0)
  const intervalSeconds = Math.max(0.1, Math.min(30.0, 1.0 / Math.max(0.05, config.sampleRate)))

  const formData = new FormData()
  formData.append('file', videoFile)
  formData.append('descriptions', JSON.stringify(descriptions))
  formData.append('interval_seconds', intervalSeconds.toFixed(2))
  formData.append('max_frames', '25')

  // Smooth intermediate progress simulation for UX while waiting for threadpool inference
  const progressTimer = setInterval(() => {
    onStatusUpdate({
      stage: 'computing_clip',
      progress: Math.min(85, Math.floor(30 + Math.random() * 50)),
      message: 'Running PyTorch OpenAI CLIP ViT-B/32 multi-modal inference on sampled keyframes...'
    })
  }, 1200)

  let backendData: BackendVideoResponse

  try {
    const response = await fetch('/api/analyze/video', {
      method: 'POST',
      body: formData
    })

    clearInterval(progressTimer)

    if (!response.ok) {
      const errBody = await response.json().catch(() => null)
      const errorMsg =
        errBody?.detail ||
        `Video analysis failed with HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMsg)
    }

    backendData = await response.json()
  } catch (error) {
    clearInterval(progressTimer)
    throw error
  }

  // Step 2: Processing and mapping returned frames
  onStatusUpdate({
    stage: 'computing_clip',
    progress: 90,
    message: 'Formatting frame previews and calculating peak temporal alignments...'
  })

  const mappedFrames: ExtractedFrame[] = backendData.frames.map((rawFrame) => {
    const frameId = `frame-${rawFrame.frame_index}`

    const scores: FrameSimilarity[] = rawFrame.results.map((r) => ({
      description: r.description,
      cosineSimilarity: r.cosine_similarity
    }))

    // Sort scores descending
    scores.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity)
    const topScore = scores[0]?.cosineSimilarity ?? 0
    const topDescription = scores[0]?.description ?? ''

    return {
      id: frameId,
      index: rawFrame.frame_index,
      timestamp: rawFrame.timestamp_seconds,
      timestampFormatted: formatTimestamp(rawFrame.timestamp_seconds),
      dataUrl: rawFrame.thumbnail_base64,
      scores,
      topScore,
      topDescription,
      vciHeatmapUrl: undefined // Genuine spatiotemporal video VCI is unavailable
    }
  })

  // Step 3: Calculate peak similarity for each candidate description
  const rankedResults: RankedDescriptionResult[] = descriptions.map((desc) => {
    let maxScore = 0
    let bestTime = 0
    let bestFrameId = mappedFrames[0]?.id || ''

    for (const frame of mappedFrames) {
      const match = frame.scores.find((s) => s.description === desc)
      if (match && match.cosineSimilarity > maxScore) {
        maxScore = match.cosineSimilarity
        bestTime = frame.timestamp
        bestFrameId = frame.id
      }
    }

    return {
      description: desc,
      peakSimilarity: maxScore,
      bestTimestamp: bestTime,
      bestTimestampFormatted: formatTimestamp(bestTime),
      bestFrameId
    }
  })

  // Sort overall results descending by peak similarity
  rankedResults.sort((a, b) => b.peakSimilarity - a.peakSimilarity)

  // Step 4: Finalize
  onStatusUpdate({
    stage: 'completed',
    progress: 100,
    message: 'Backend analysis complete.'
  })

  return {
    videoName: backendData.filename || videoFile.name,
    duration: backendData.duration_seconds,
    totalFrames: backendData.analyzed_frames,
    analyzedAt: new Date().toLocaleTimeString(),
    descriptions: backendData.descriptions,
    frames: mappedFrames,
    rankedResults,
    isSimulation: false // Authentic PyTorch CLIP model inference!
  }
}
