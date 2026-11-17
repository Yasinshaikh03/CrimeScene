/**
 * ------------------------------------------------------------------
 * MOCK VIDEO ANALYSIS SERVICE — FRONTEND PROTOTYPING & PREVIEW ONLY
 * ------------------------------------------------------------------
 * IMPORTANT BACKEND NOTICE:
 * Yasin owns the CrimeScene backend services (FastAPI + PyTorch CLIP).
 * This client-side helper extracts real frames directly from the HTML5
 * video element in the browser for client preview, and generates clearly-
 * labelled mock/simulated CLIP & VCI results for testing the UI components.
 * 
 * Once Yasin provides the official API contract for /api/analyze/video,
 * this service will be replaced or wired to the production backend route.
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
 * Client-side frame extraction using an in-memory video element and canvas
 */
export async function extractFramesFromVideo(
  videoFile: File,
  sampleRate: number, // frames per second
  onProgress?: (progress: number, stageMessage: string) => void
): Promise<{ frames: { timestamp: number; dataUrl: string }[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(videoFile)
    video.src = objectUrl
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    video.onloadedmetadata = async () => {
      const duration = video.duration || 1
      const interval = 1 / Math.max(0.2, sampleRate)
      const timestamps: number[] = []

      // Generate sampling points
      for (let t = 0; t < duration; t += interval) {
        timestamps.push(t)
      }
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < duration - 0.2) {
        timestamps.push(Math.max(0, duration - 0.1))
      }

      // Limit to max 30 frames for fast client responsiveness
      const targetTimestamps = timestamps.slice(0, 30)
      const extracted: { timestamp: number; dataUrl: string }[] = []

      const canvas = document.createElement('canvas')
      // Downscale slightly for snappy UI rendering
      const scale = Math.min(1, 640 / (video.videoWidth || 640))
      canvas.width = Math.round((video.videoWidth || 640) * scale)
      canvas.height = Math.round((video.videoHeight || 360) * scale)
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        return reject(new Error('Failed to create canvas 2D context for frame capture.'))
      }

      try {
        for (let i = 0; i < targetTimestamps.length; i++) {
          const time = targetTimestamps[i]
          video.currentTime = time

          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked)
              res()
            }
            video.addEventListener('seeked', onSeeked)
          })

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

          extracted.push({
            timestamp: time,
            dataUrl
          })

          if (onProgress) {
            const pct = Math.round(((i + 1) / targetTimestamps.length) * 100)
            onProgress(pct, `Extracting frame ${i + 1} of ${targetTimestamps.length} (${formatTimestamp(time)})...`)
          }
        }

        URL.revokeObjectURL(objectUrl)
        resolve({ frames: extracted, duration })
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        reject(err)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read or decode video file. Format may be unsupported by the browser.'))
    }
  })
}

/**
 * Generate synthetic Visual Counterfactual Intelligence (VCI) heatmap
 * overlays for visual demonstration on the extracted frame canvas.
 */
function createVCIHeatmapCanvas(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)

      // Draw base frame
      ctx.drawImage(img, 0, 0)

      // Add forensic counterfactual gradient mask
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.45,
        canvas.height * 0.5,
        15,
        canvas.width * 0.45,
        canvas.height * 0.5,
        canvas.width * 0.38
      )
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.75)') // Hot Red core
      gradient.addColorStop(0.35, 'rgba(245, 158, 11, 0.6)') // Amber
      gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.35)') // Blue perimeter
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Overlay forensic crosshairs/bounding cues
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      const cx = canvas.width * 0.45
      const cy = canvas.height * 0.5
      const boxW = canvas.width * 0.35
      const boxH = canvas.height * 0.4
      ctx.strokeRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH)

      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => resolve(dataUrl)
  })
}

/**
 * Run Mock Video Analysis workflow
 * Generates realistic simulation results clearly flagged with `isSimulation: true`
 */
export async function runMockVideoAnalysis(
  videoFile: File,
  descriptions: string[],
  config: AnalysisConfig,
  onStatusUpdate: (status: ProcessingStatus) => void
): Promise<VideoAnalysisResult> {
  // Step 1: Extract frames from video
  onStatusUpdate({
    stage: 'extracting_frames',
    progress: 10,
    message: 'Initializing video decoder and extracting keyframes...'
  })

  const { frames: rawFrames, duration } = await extractFramesFromVideo(
    videoFile,
    config.sampleRate,
    (progress, msg) => {
      onStatusUpdate({
        stage: 'extracting_frames',
        progress: Math.round(10 + (progress * 0.4)),
        message: msg
      })
    }
  )

  // Step 2: Compute CLIP similarity simulation
  onStatusUpdate({
    stage: 'computing_clip',
    progress: 55,
    message: 'Computing CLIP multi-modal cosine similarity across prompts...'
  })

  await new Promise((r) => setTimeout(r, 600)) // smooth visual progression

  const processedFrames: ExtractedFrame[] = []
  const descriptionPeaks = new Map<string, { maxScore: number; bestTime: number; bestFrameId: string }>()

  // Initialize peaks
  descriptions.forEach((d) => {
    descriptionPeaks.set(d, { maxScore: 0, bestTime: 0, bestFrameId: '' })
  })

  for (let i = 0; i < rawFrames.length; i++) {
    const raw = rawFrames[i]
    const frameId = `frame-${i + 1}`

    // Calculate simulated cosine similarities
    // Simulates dynamic temporal activity peak around 35%-65% of the video
    const temporalWave = Math.sin((i / Math.max(1, rawFrames.length - 1)) * Math.PI)
    
    const scores: FrameSimilarity[] = descriptions.map((desc, dIndex) => {
      // Deterministic pseudo-randomness based on string length & index
      const baseVariation = ((desc.length * 17 + dIndex * 31) % 40) / 100
      const score = Math.min(0.96, Math.max(0.12, 0.42 + (temporalWave * 0.38) + (baseVariation * 0.15)))
      const rounded = Math.round(score * 1000) / 1000

      // Track peak
      const peak = descriptionPeaks.get(desc)!
      if (rounded > peak.maxScore) {
        descriptionPeaks.set(desc, {
          maxScore: rounded,
          bestTime: raw.timestamp,
          bestFrameId: frameId
        })
      }

      return {
        description: desc,
        cosineSimilarity: rounded
      }
    })

    // Sort frame scores descending
    scores.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity)
    const topScore = scores[0]?.cosineSimilarity || 0
    const topDescription = scores[0]?.description || ''

    // Generate VCI Heatmap if enabled
    let vciHeatmapUrl: string | undefined = undefined
    if (config.enableVCI) {
      vciHeatmapUrl = await createVCIHeatmapCanvas(raw.dataUrl)
    }

    processedFrames.push({
      id: frameId,
      index: i,
      timestamp: raw.timestamp,
      timestampFormatted: formatTimestamp(raw.timestamp),
      dataUrl: raw.dataUrl,
      scores,
      topScore,
      topDescription,
      vciHeatmapUrl
    })
  }

  // Step 3: VCI Synthesis step
  if (config.enableVCI) {
    onStatusUpdate({
      stage: 'generating_vci',
      progress: 88,
      message: 'Synthesizing Visual Counterfactual Intelligence (VCI) heatmaps...'
    })
    await new Promise((r) => setTimeout(r, 450))
  }

  // Build ranked summary
  const rankedResults: RankedDescriptionResult[] = descriptions.map((desc) => {
    const peak = descriptionPeaks.get(desc)!
    return {
      description: desc,
      peakSimilarity: peak.maxScore,
      bestTimestamp: peak.bestTime,
      bestTimestampFormatted: formatTimestamp(peak.bestTime),
      bestFrameId: peak.bestFrameId
    }
  })

  // Sort by peak similarity descending
  rankedResults.sort((a, b) => b.peakSimilarity - a.peakSimilarity)

  onStatusUpdate({
    stage: 'completed',
    progress: 100,
    message: 'Analysis complete.'
  })

  return {
    videoName: videoFile.name,
    duration,
    totalFrames: processedFrames.length,
    analyzedAt: new Date().toLocaleTimeString(),
    descriptions,
    frames: processedFrames,
    rankedResults,
    isSimulation: true // Clearly flagged per project rules
  }
}
