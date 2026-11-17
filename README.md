# CrimeScene 🔍

**CLIP-Based Video and Image Analysis with Visual Counterfactual Intelligence (VCI)**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.163-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/ML-PyTorch_2.15-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/Model-OpenAI_CLIP_ViT--B%2F32-FFD21E.svg)](https://huggingface.co/openai/clip-vit-base-patch32)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Tooling-Vite_8-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Overview

**CrimeScene** is an investigative vision-language intelligence platform designed to triage digital photographic evidence and surveillance video footage. By combining **OpenAI CLIP (Contrastive Language-Image Pre-training)** with **Visual Counterfactual Intelligence (VCI)**, the platform enables forensic examiners to:

1. **Test Multiple Investigative Hypotheses:** Quantify how strongly an image or video keyframe aligns with competing textual descriptions (e.g. *"suspect holding a handgun"* vs. *"security guard in uniform"*).
2. **Explain Model Decision-Making via VCI:** Systematically mask spatial grid patches to reveal which specific visual regions drove the model's confidence and which regions contradicted it.
3. **Analyze Surveillance Timelines:** Extract video keyframes at configurable temporal intervals, generate lightweight base64 preview thumbnails, and track event likelihoods across the video duration.

> ⚠️ **Forensic Notice:** Cosine similarity scores measure geometric alignment in a neural embedding space, **not** calibrated probabilities, physical facts, or legal guilt. VCI indicates model sensitivity, not real-world causation. All outputs are intended for decision support and investigative lead generation under human expert review.

---

## ✨ Features & Capabilities

- **Zero-Shot Image Analysis:** Compare photographic evidence against custom natural-language candidate descriptions with OpenAI CLIP (`openai/clip-vit-base-patch32`).
- **Resilient Input Parsing:** Accepts candidate descriptions as JSON arrays (`["knife", "gun"]`), Python-style lists (`['knife', 'gun']`), comma-separated keyword tags, multiline text, or complex natural-language sentences containing commas (e.g. *"a man in a black jacket, holding a knife"*).
- **Visual Counterfactual Intelligence (VCI):** Spatial grid occlusion ($2 \times 2$ to $8 \times 8$) testing model sensitivity. Positive sensitivity deltas ($\Delta = S_0 - S_{\text{masked}}$) isolate decisive evidence patches.
- **Surveillance Video Keyframe Extraction:** High-speed frame extraction with OpenCV (`CAP_PROP_POS_FRAMES`), configurable sampling intervals ($0.1\text{s}$ to $30.0\text{s}$), and frame limits ($1$ to $30$).
- **In-Memory Thumbnail Generation:** Resizes sampled video frames and returns base64-encoded JPEG data URLs (`data:image/jpeg;base64,...`) for responsive timeline rendering without external object storage.
- **Non-Blocking Asynchronous Backend:** High-throughput FastAPI architecture offloads CPU-heavy PyTorch inference and OpenCV decoding to worker threadpools (`run_in_threadpool`), preventing event loop starvation.
- **Glassmorphic Forensic Dashboard:** Pure React 19 + TypeScript + standard modern CSS with a midnight navy theme, interactive canvas/grid heatmap overlay, and live API status polling.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             CrimeScene React 19 Dashboard              │
│  (Midnight Navy Theme, Glassmorphism, TypeScript)     │
└───────────────┬────────────────────────▲───────────────┘
                │                        │
       HTTP / Multipart           JSON / Base64 Data
       via Vite Proxy (:5173)     URLs & Similarity Scores
                │                        │
┌───────────────▼────────────────────────┴───────────────┐
│               FastAPI Backend (:8000)                  │
│                                                        │
│  • GET  /api/health            • Resilient Input Parser│
│  • POST /api/analyze/image     • Pydantic V2 Schemas   │
│  • POST /api/analyze/image/vci • Worker Threadpool     │
│  • POST /api/analyze/video                             │
└───────────────┬────────────────────────▲───────────────┘
                │                        │
         run_in_threadpool       Inference Results
                │                        │
┌───────────────▼────────────────────────┴───────────────┐
│              Worker Service Layer                      │
│                                                        │
│  • clip_service: OpenAI CLIP ViT-B/32 (PyTorch)        │
│  • vci_service:  Spatial Grid Masking & Perturbation   │
│  • video_service: OpenCV Seeking & Base64 Thumbnails   │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
CrimeScene/
├── backend/
│   ├── app/
│   │   ├── config.py             # Centralized settings & environment limits
│   │   ├── main.py               # FastAPI application entrypoint & CORS
│   │   ├── schemas.py            # Pydantic request & response models
│   │   ├── routes/
│   │   │   ├── health.py         # GET /api/health
│   │   │   ├── image.py          # POST /api/analyze/image & /vci
│   │   │   └── video.py          # POST /api/analyze/video
│   │   ├── services/
│   │   │   ├── clip_service.py   # CLIP model loading & cosine similarity
│   │   │   ├── image_service.py  # Modular service exports
│   │   │   ├── vci_service.py    # Visual Counterfactual Intelligence logic
│   │   │   └── video_service.py  # OpenCV frame extraction & thumbnails
│   │   └── utils/
│   │       └── parser.py         # Resilient description input parser
│   ├── tests/                    # Pytest automated test suite (25 tests)
│   ├── requirements.txt          # Python dependencies
│   ├── pytest.ini               # Pytest configuration
│   └── .env.example              # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navbar with live health badge
│   │   │   ├── Dashboard.tsx     # Project overview & launchpad
│   │   │   ├── ImageAnalysis.tsx # Image evidence analysis module
│   │   │   ├── VCIAnalysis.tsx   # Interactive VCI heatmap & inspector
│   │   │   ├── VideoAnalysis.tsx # Video timeline & frame scrubber
│   │   │   └── Methodology.tsx   # Scientific principles & limitations
│   │   ├── services/
│   │   │   └── api.ts            # Typed HTTP client
│   │   ├── styles/
│   │   │   └── components.css    # Glassmorphism component styles
│   │   ├── types/
│   │   │   └── api.ts            # TypeScript interfaces
│   │   ├── App.tsx               # Root view router & health polling
│   │   ├── App.css               # Main layout styles
│   │   ├── index.css             # Midnight navy design tokens & reset
│   │   └── main.tsx              # React mounting entrypoint
│   ├── index.html                # Web document root
│   ├── vite.config.ts            # Vite proxy configuration
│   └── package.json              # Frontend npm dependencies
│
├── docs/                         # Detailed technical documentation
│   ├── ARCHITECTURE.md           # Deep dive into system design
│   ├── API_DOCUMENTATION.md      # API endpoint reference with curl examples
│   ├── INSTALLATION.md           # Step-by-step setup guide
│   └── METHODOLOGY_AND_LIMITATIONS.md # Forensic methodology & legal limitations
│
└── README.md                     # Project documentation
```

---

## 🛠️ Technology Stack

| Layer | Component | Version / Details |
| :--- | :--- | :--- |
| **Backend Framework** | FastAPI | `0.163` with Uvicorn ASGI |
| **Deep Learning** | PyTorch & Hugging Face Transformers | `torch 2.15`, `transformers 5.23` |
| **Pretrained Model** | OpenAI CLIP | `openai/clip-vit-base-patch32` |
| **Computer Vision** | OpenCV & Pillow | `opencv-python-headless 5.0`, `Pillow 13.0` |
| **Data Validation** | Pydantic V2 | `pydantic 2.14` |
| **Testing** | Pytest | `pytest 9.2` |
| **Frontend Framework** | React 19 | `react 19.3`, `react-dom 19.3` |
| **Language & Tooling** | TypeScript & Vite | `typescript 6.0`, `vite 8.3` |
| **Styling** | Standard Modern CSS | Glassmorphism, CSS Custom Properties |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python:** 3.10 to 3.14
- **Node.js:** v18+ (tested on Node v24, npm v11)
- **Git**

---

### Step 1: Clone Repository & Create Virtual Environment

```bash
git clone https://github.com/your-username/CrimeScene.git
cd CrimeScene

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
```

---

### Step 2: Backend Setup & Installation

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Variables (Optional)
Copy `.env.example` to `.env` if you wish to customize upload limits or CORS origins:

```ini
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CLIP_MODEL_NAME=openai/clip-vit-base-patch32
MAX_IMAGE_SIZE_BYTES=10485760
MAX_VIDEO_SIZE_BYTES=104857600
```

#### Start FastAPI Server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend will be available at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.*

---

### Step 3: Frontend Setup & Installation

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
*The frontend dashboard will be available at `http://127.0.0.1:5173/`.*

---

## 📡 API Reference & Usage Examples

### 1. Health Check
```bash
curl -X GET "http://127.0.0.1:8000/api/health"
```
**Response:**
```json
{
  "status": "healthy",
  "project": "CrimeScene",
  "message": "CrimeScene backend is running"
}
```

---

### 2. Image Analysis
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/image" \
  -F "file=@crime_scene.jpg" \
  -F "descriptions=suspect holding a weapon, blood stain, broken glass, security guard"
```
**Response:**
```json
{
  "success": true,
  "filename": "crime_scene.jpg",
  "total_descriptions": 4,
  "results": [
    {"description": "suspect holding a weapon", "cosine_similarity": 0.2664},
    {"description": "broken glass", "cosine_similarity": 0.2476},
    {"description": "security guard", "cosine_similarity": 0.2429},
    {"description": "blood stain", "cosine_similarity": 0.2398}
  ],
  "note": "Similarity scores are not probabilities or proof of an event."
}
```

---

### 3. Visual Counterfactual Intelligence (VCI)
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/image/vci" \
  -F "file=@evidence.jpg" \
  -F "description=a suspect breaking in" \
  -F "grid_size=3"
```
**Response:**
```json
{
  "success": true,
  "filename": "evidence.jpg",
  "description": "a suspect breaking in",
  "grid_size": 3,
  "original_similarity": 0.2906,
  "regions": [
    {
      "row": 1,
      "column": 0,
      "x": 0,
      "y": 80,
      "width": 106,
      "height": 80,
      "masked_similarity": 0.2790,
      "similarity_change": 0.0116
    }
  ],
  "note": "Positive similarity change means masking the region reduced similarity. This is model sensitivity analysis, not causal proof or evidence of an event."
}
```

---

### 4. Video Timeline Analysis
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/video" \
  -F "file=@surveillance.mp4" \
  -F "descriptions=burglary suspect, dark night scene, security camera footage" \
  -F "interval_seconds=1.0" \
  -F "max_frames=4"
```
**Response:**
```json
{
  "success": true,
  "filename": "surveillance.mp4",
  "descriptions": ["burglary suspect", "dark night scene", "security camera footage"],
  "duration_seconds": 4.0,
  "fps": 30.0,
  "total_video_frames": 120,
  "analyzed_frames": 4,
  "sampling_interval_seconds": 1.0,
  "frames": [
    {
      "frame_index": 0,
      "timestamp_seconds": 0.0,
      "thumbnail_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "results": [
        {"description": "dark night scene", "cosine_similarity": 0.2594}
      ]
    }
  ],
  "note": "Similarity scores are not probabilities or proof of an event."
}
```

---

## 🧪 Testing

### Backend Test Suite (Pytest)
```bash
cd backend
pytest -v
```
*Executes all 25 unit and integration tests covering health checks, description parsing, image analysis, VCI grid calculations, and video frame extraction.*

### Frontend Code Quality (ESLint & TypeScript Build)
```bash
cd frontend
npm run lint
npm run build
```

---

## ⚖️ Ethical & Forensic Limitations

1. **Similarity vs. Probability:** Cosine similarity measures geometric alignment between multimodal feature vectors. It does not output a calibrated probability distribution.
2. **Explainability vs. Causality:** VCI identifies spatial regions that the neural model attended to. It does not establish legal chain-of-custody, intent, or physical causation.
3. **Temporal Aliasing:** Video analysis samples frames at discrete intervals. Rapid micro-events (e.g. actions taking $<0.5\text{s}$) occurring between sample timestamps may not be captured.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
