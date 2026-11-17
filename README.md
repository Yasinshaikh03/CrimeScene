# CrimeScene

CrimeScene compares images and video with natural-language descriptions using CLIP, with Visual Counterfactual Intelligence (VCI) planned for image-region analysis.

## Photo Analysis frontend

The React, Vite, and TypeScript app is in `frontend/`.

```powershell
Set-Location .\frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Mock mode is enabled by default and clearly labels illustrative UI data. Set `VITE_USE_MOCKS=false` to connect the image-analysis page to the FastAPI backend at `VITE_API_BASE_URL` (default `http://localhost:8000`). The frontend uses the confirmed `POST /api/analyze/image` contract.

The current backend returns image similarity scores. Its VCI route is not implemented yet, so live mode shows a pending state for region masking rather than mock heatmap data.

## Backend

The FastAPI service is in `backend/`.
