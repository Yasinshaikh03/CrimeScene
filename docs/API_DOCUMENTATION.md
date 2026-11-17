# CrimeScene API Documentation

**API Version:** `1.0.0`  
**Base URL:** `http://localhost:8000/api` (Direct) or `http://localhost:5173/api` (Vite Proxy)  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI) / `http://localhost:8000/redoc` (ReDoc)  

---

## 1. Overview & Authentication

All CrimeScene endpoints accept standard HTTP requests with multipart form-data for file uploads and return structured JSON responses conforming to Pydantic schemas. Currently, endpoints operate in local decision-support mode without requiring API keys.

---

## 2. API Endpoints Reference

### 1. Health Check
Check operational status of the CrimeScene API and background services.

- **Method:** `GET`
- **Path:** `/api/health`
- **Request Headers:** None
- **Request Body:** None

#### Response (200 OK):
```json
{
  "status": "healthy",
  "project": "CrimeScene",
  "message": "CrimeScene backend is running"
}
```

#### cURL Example:
```bash
curl -X GET "http://localhost:8000/api/health"
```

---

### 2. Image Evidence Analysis
Compare a photographic evidence file against candidate textual descriptions using OpenAI CLIP.

- **Method:** `POST`
- **Path:** `/api/analyze/image`
- **Content-Type:** `multipart/form-data`

#### Request Parameters:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | `UploadFile` | **Yes** | Image evidence file (`.jpg`, `.jpeg`, `.png`, max 10 MB). |
| `descriptions` | `string` | **Yes** | Candidate hypotheses. Accepts JSON array (e.g. `["knife", "gun"]`), comma-separated list, newlines, or a natural sentence. |

#### Response (200 OK):
```json
{
  "success": true,
  "filename": "crime_scene.jpg",
  "total_descriptions": 4,
  "results": [
    {
      "description": "a suspect holding a handgun",
      "cosine_similarity": 0.2664
    },
    {
      "description": "broken window glass",
      "cosine_similarity": 0.2476
    },
    {
      "description": "police officer in uniform",
      "cosine_similarity": 0.2429
    },
    {
      "description": "knife on the floor",
      "cosine_similarity": 0.2398
    }
  ],
  "note": "Similarity scores are not probabilities or proof of an event."
}
```

#### cURL Example:
```bash
curl -X POST "http://localhost:8000/api/analyze/image" \
  -F "file=@evidence.jpg" \
  -F "descriptions=suspect holding a handgun, broken glass, police officer"
```

---

### 3. Visual Counterfactual Intelligence (VCI)
Perform explainable AI (XAI) sensitivity analysis on an image by systematically masking spatial grid patches.

- **Method:** `POST`
- **Path:** `/api/analyze/image/vci`
- **Content-Type:** `multipart/form-data`

#### Request Parameters:
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | `UploadFile` | **Yes** | — | Image file (`.jpg`, `.jpeg`, `.png`, max 10 MB). |
| `description` | `string` | **Yes** | — | Single target forensic hypothesis (1 to 500 characters). |
| `grid_size` | `integer` | No | `4` | Spatial grid density $N$ for $N \times N$ patches ($2 \le N \le 8$). |

#### Response (200 OK):
```json
{
  "success": true,
  "filename": "evidence.jpg",
  "description": "a suspect breaking in",
  "grid_size": 3,
  "original_similarity": 0.2906,
  "regions": [
    {
      "row": 0,
      "column": 0,
      "x": 0,
      "y": 0,
      "width": 106,
      "height": 80,
      "masked_similarity": 0.2850,
      "similarity_change": 0.0056
    },
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

#### Interpretation of `similarity_change`:
- $\Delta > 0$ (Positive): Masking this region reduced the model's confidence $\rightarrow$ This region contains **supporting evidence**.
- $\Delta < 0$ (Negative): Masking this region increased the model's confidence $\rightarrow$ This region contains **conflicting features**.
- $\Delta \approx 0$: Irrelevant background.

#### cURL Example:
```bash
curl -X POST "http://localhost:8000/api/analyze/image/vci" \
  -F "file=@evidence.jpg" \
  -F "description=a suspect breaking in" \
  -F "grid_size=3"
```

---

### 4. Surveillance Video Analysis
Ingest video footage, sample keyframes at regular intervals, generate preview thumbnails, and evaluate temporal similarity.

- **Method:** `POST`
- **Path:** `/api/analyze/video`
- **Content-Type:** `multipart/form-data`

#### Request Parameters:
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | `UploadFile` | **Yes** | — | Video file (`.mp4`, `.avi`, `.mov`, max 100 MB). |
| `descriptions` | `string` | **Yes** | — | Candidate hypotheses (JSON array, comma-separated, or newlines). |
| `interval_seconds` | `float` | No | `2.0` | Sampling interval in seconds ($0.1 \le \text{interval} \le 30.0$). |
| `max_frames` | `integer` | No | `20` | Maximum frames to sample ($1 \le \text{max\_frames} \le 30$). |

#### Response (200 OK):
```json
{
  "success": true,
  "filename": "burglary_clip.mp4",
  "descriptions": [
    "burglary suspect",
    "dark night scene",
    "security camera footage",
    "police car"
  ],
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
        {
          "description": "dark night scene",
          "cosine_similarity": 0.2594
        },
        {
          "description": "security camera footage",
          "cosine_similarity": 0.2312
        }
      ]
    },
    {
      "frame_index": 30,
      "timestamp_seconds": 1.0,
      "thumbnail_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "results": [
        {
          "description": "security camera footage",
          "cosine_similarity": 0.3061
        },
        {
          "description": "burglary suspect",
          "cosine_similarity": 0.2880
        }
      ]
    }
  ],
  "note": "Similarity scores are not probabilities or proof of an event."
}
```

#### cURL Example:
```bash
curl -X POST "http://localhost:8000/api/analyze/video" \
  -F "file=@surveillance.mp4" \
  -F "descriptions=burglary suspect, security camera footage" \
  -F "interval_seconds=1.0" \
  -F "max_frames=4"
```

---

## 3. Standard HTTP Status Codes

| Code | Status | Meaning | Typical Trigger |
| :---: | :--- | :--- | :--- |
| `200` | OK | Success | Request succeeded and results are returned. |
| `400` | Bad Request | Validation Failure | Invalid file format, empty descriptions, or parameters out of bounds. |
| `413` | Payload Too Large | File Exceeds Limit | Image $>10\text{ MB}$ or Video $>100\text{ MB}$. |
| `422` | Unprocessable Entity | Pydantic Schema Error | Missing required form field. |
| `500` | Internal Server Error | Processing Failure | Corrupted video stream or OpenCV decoding crash. |
| `503` | Service Unavailable | Model Not Ready | CLIP model has not finished initializing. |

---

## 4. Code Integration Examples

### Python (`requests`)
```python
import requests

url = "http://localhost:8000/api/analyze/image"
files = {"file": open("crime_scene.jpg", "rb")}
data = {"descriptions": "suspect with weapon, police officer, broken glass"}

response = requests.post(url, files=files, data=data)
if response.status_code == 200:
    results = response.json()
    print("Top match:", results["results"][0])
else:
    print("Error:", response.json()["detail"])
```

### JavaScript / TypeScript (`fetch`)
```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("descriptions", "burglary suspect, security camera, police car");

const response = await fetch("http://localhost:8000/api/analyze/image", {
  method: "POST",
  body: formData,
});

if (response.ok) {
  const data = await response.json();
  console.log("Analysis results:", data.results);
} else {
  const error = await response.json();
  console.error("Analysis failed:", error.detail);
}
```
