import type {
  HealthResponse,
  ImageAnalysisResponse,
  VCIAnalysisResponse,
  VideoAnalysisResponse,
  ApiError,
} from '../types/api'

// Base URL defaults to relative '/api' via Vite proxy, or full backend URL
const API_BASE = '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status} (${res.statusText})`
    try {
      const errorJson = (await res.json()) as ApiError
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail
      }
    } catch {
      // Ignore if response body is not JSON
    }
    throw new Error(errorDetail)
  }
  return res.json() as Promise<T>
}

export const apiService = {
  /**
   * Check backend API status
   */
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`)
    return handleResponse<HealthResponse>(res)
  },

  /**
   * Submit an image for CLIP multi-label cosine similarity analysis
   */
  async analyzeImage(file: File, descriptions: string): Promise<ImageAnalysisResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('descriptions', descriptions)

    const res = await fetch(`${API_BASE}/analyze/image`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<ImageAnalysisResponse>(res)
  },

  /**
   * Submit an image for Visual Counterfactual Intelligence (VCI) grid sensitivity analysis
   */
  async analyzeImageVCI(
    file: File,
    description: string,
    gridSize: number = 4
  ): Promise<VCIAnalysisResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', description)
    formData.append('grid_size', gridSize.toString())

    const res = await fetch(`${API_BASE}/analyze/image/vci`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<VCIAnalysisResponse>(res)
  },

  /**
   * Submit a video for frame extraction and CLIP timeline analysis
   */
  async analyzeVideo(
    file: File,
    descriptions: string,
    intervalSeconds: number = 2.0,
    maxFrames: number = 20
  ): Promise<VideoAnalysisResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('descriptions', descriptions)
    formData.append('interval_seconds', intervalSeconds.toString())
    formData.append('max_frames', maxFrames.toString())

    const res = await fetch(`${API_BASE}/analyze/video`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<VideoAnalysisResponse>(res)
  },
}
