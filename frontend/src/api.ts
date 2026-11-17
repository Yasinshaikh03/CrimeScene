import { createMockResponse, type AnalysisResponse } from './mockData';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function analyzeImage(_image: File, descriptions: string[]): Promise<AnalysisResponse> {
  if (useMocks) {
    await new Promise((resolve) => window.setTimeout(resolve, 1250));
    return createMockResponse(descriptions);
  }
  const form = new FormData();
  form.append('file', _image);
  form.append('descriptions', JSON.stringify(descriptions));

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/analyze/image`, { method: 'POST', body: form });
  } catch {
    throw new Error('Could not reach the analysis service. Check that the backend is running and try again.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = isRecord(payload) && typeof payload.detail === 'string' ? payload.detail : 'Image analysis failed. Please try again.';
    throw new Error(detail);
  }
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw new Error('The analysis service returned an unexpected response.');
  }

  const results = payload.results.map((item) => {
    if (!isRecord(item) || typeof item.description !== 'string' || typeof item.cosine_similarity !== 'number') {
      throw new Error('The analysis service returned an unexpected result format.');
    }
    return { description: item.description, score: item.cosine_similarity };
  });
  return {
    results,
    note: typeof payload.note === 'string' ? payload.note : undefined,
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

export { useMocks };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
