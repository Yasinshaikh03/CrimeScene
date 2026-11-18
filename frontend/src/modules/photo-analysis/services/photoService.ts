import type { AnalysisResponse } from '../types';

// Default to REAL backend unless explicitly overridden by VITE_USE_MOCKS=true
export const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Execute real photo analysis via CrimeScene FastAPI backend:
 * 1. POST /api/analyze/image (Ranked CLIP descriptions)
 * 2. POST /api/analyze/image/vci (Spatial region occlusion grid)
 */
export async function analyzeImage(
  image: File,
  descriptions: string[]
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append('file', image);
  form.append('descriptions', JSON.stringify(descriptions));

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/analyze/image`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new Error(
      'Could not reach the CrimeScene backend. Check that FastAPI is running on port 8000 and try again.'
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === 'string'
        ? payload.detail
        : `Image analysis failed with HTTP ${response.status}.`;
    throw new Error(detail);
  }

  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw new Error('The analysis service returned an unexpected response format.');
  }

  const results = payload.results.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.description !== 'string' ||
      typeof item.cosine_similarity !== 'number'
    ) {
      throw new Error('The analysis service returned an unexpected result format.');
    }
    return {
      description: item.description,
      score: item.cosine_similarity,
    };
  });

  // Query genuine Image VCI from the backend for the top ranked description
  let vciCells: AnalysisResponse['vci'] = undefined;
  if (results.length > 0) {
    try {
      const vciForm = new FormData();
      vciForm.append('file', image);
      vciForm.append('description', results[0].description);
      vciForm.append('grid_size', '4');

      const vciResponse = await fetch(`${baseUrl}/api/analyze/image/vci`, {
        method: 'POST',
        body: vciForm,
      });

      if (vciResponse.ok) {
        const vciData: unknown = await vciResponse.json();
        if (isRecord(vciData) && Array.isArray(vciData.regions)) {
          vciCells = vciData.regions.map((region) => {
            if (
              isRecord(region) &&
              typeof region.row === 'number' &&
              typeof region.column === 'number' &&
              typeof region.masked_similarity === 'number'
            ) {
              return {
                row: region.row + 1,
                column: region.column + 1,
                maskedSimilarity: region.masked_similarity,
              };
            }
            return { row: 1, column: 1, maskedSimilarity: results[0].score };
          });
        }
      }
    } catch {
      // If VCI fails, continue with image analysis results
      vciCells = undefined;
    }
  }

  return {
    results,
    vci: vciCells,
    note:
      typeof payload.note === 'string'
        ? payload.note
        : 'Similarity scores are not probabilities or proof of an event.',
  };
}

export async function checkServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
