# CrimeScene · Photo Analysis

Photo analysis UI built with React, Vite, TypeScript, and CSS.

## Run locally

In Windows PowerShell, from the `CrimeScene` repository directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The app opens in Vite's local development server. Mock mode is enabled by default so the UI can be reviewed before the backend contract is available. Mock responses are separate from the API service and are visibly labelled in the results.

## Backend integration status

The expected endpoints are `GET /api/health`, `POST /api/analyze/image`, and `POST /api/analyze/image/vci`. The request and response field names are not defined here. Live request handling must be completed after Yasin confirms the API contract; the UI does not claim to connect to the backend while mock mode is enabled.

Set `VITE_API_BASE_URL` and `VITE_USE_MOCKS=false` in `.env` only after that contract has been confirmed and implemented in `src/api.ts`.
