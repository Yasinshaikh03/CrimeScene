import type { AnalysisResponse } from '../types';
import { createMockPhotoResponse } from './mockPhotoService';

// Keep the Photo Analysis module in mock mode unless explicitly enabled for live testing.
export const useMocks = import.meta.env.VITE_PHOTO_USE_MOCKS !== 'false';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function analyzeImage(
  image: File,
  descriptions: string[]
): Promise<AnalysisResponse> {
  if (useMocks) return createMockPhotoResponse(descriptions);

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
      'Could not reach the CrimeScene backend. Check that FastAPI is running and try again.'
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
    return { description: item.description, score: item.cosine_similarity };
  });

  return {
    results,
    note:
      typeof payload.note === 'string'
        ? payload.note
        : 'Similarity scores are not probabilities or proof of an event.',
  };
}

export async function checkServiceHealth(): Promise<boolean> {
  if (useMocks) return false;
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
