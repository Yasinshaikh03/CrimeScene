import { createMockResponse, type AnalysisResponse } from './mockData';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function analyzeImage(_image: File, descriptions: string[]): Promise<AnalysisResponse> {
  if (useMocks) {
    await new Promise((resolve) => window.setTimeout(resolve, 1250));
    return createMockResponse(descriptions);
  }
  // The backend request and response schema must be supplied by Yasin before this is implemented.
  if (!baseUrl) throw new Error('Set VITE_API_BASE_URL after the backend API contract is confirmed.');
  throw new Error('Live API integration is waiting for Yasin’s request and response contract. Mock mode is available for UI review.');
}

export async function checkServiceHealth(): Promise<boolean> {
  if (useMocks || !baseUrl) return false;
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export { useMocks };
