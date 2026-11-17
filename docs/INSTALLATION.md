# Installation & Deployment Guide

This guide covers step-by-step instructions for installing, configuring, and deploying the **CrimeScene** platform on Windows, macOS, and Linux.

---

## 1. System Requirements

### Hardware:
- **Processor:** Modern multi-core CPU (x86_64 or Apple Silicon).
- **RAM:** Minimum 8 GB (16 GB recommended for high-resolution video decoding).
- **GPU (Optional):** NVIDIA GPU with CUDA support for accelerated CLIP forward passes. Falls back to CPU automatically.
- **Storage:** At least 2 GB of free disk space (CLIP model weights are $\approx 600\text{ MB}$).

### Software:
- **Python:** 3.10 to 3.14 (Tested on Python 3.14.3).
- **Node.js:** v18.0 or higher (Tested on Node v24.20.0 and npm v11.19.0).
- **Git**

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/CrimeScene.git
cd CrimeScene
```

---

### Step 2: Backend Installation

1. **Create and Activate a Virtual Environment:**

   - **Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
     *Note: If PowerShell displays a script execution policy error, run:*
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

2. **Install Python Dependencies:**
   ```bash
   cd backend
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Verify Python Environment:**
   ```bash
   python -c "import torch, transformers, cv2, fastapi; print('Dependencies OK! Device:', 'CUDA' if torch.cuda.is_available() else 'CPU')"
   ```

4. **Environment Configuration (Optional):**
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   Available settings:
   ```ini
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   CLIP_MODEL_NAME=openai/clip-vit-base-patch32
   MAX_IMAGE_SIZE_BYTES=10485760
   MAX_VIDEO_SIZE_BYTES=104857600
   ```

---

### Step 3: Frontend Installation

Open a second terminal window in the project root:

1. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Node Packages:**
   ```bash
   npm install
   ```

3. **Verify Frontend Build:**
   ```bash
   npm run build
   ```
   *Should build into `dist/` in under 1 second without errors.*

---

## 3. Running the Complete Application

To run the application locally, you run the backend server and frontend development server in parallel:

### Terminal 1: Backend Server (FastAPI)
```bash
# In CrimeScene/backend with .venv activated:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Output: `Uvicorn running on http://127.0.0.1:8000`*

### Terminal 2: Frontend Server (Vite)
```bash
# In CrimeScene/frontend:
npm run dev
```
*Output: `Local: http://127.0.0.1:5173/`*

Now open your web browser and navigate to:  
👉 **`http://127.0.0.1:5173/`**

The top right header will display **`API Online`** with a green dot, confirming that the frontend is successfully communicating with the FastAPI backend through the Vite proxy.

---

## 4. Troubleshooting Common Issues

### Issue 1: PowerShell Script Execution Policy Block (`npm.ps1 cannot be loaded`)
**Symptom:**  
`npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`  
**Fix:**  
Run `npm.cmd` explicitly instead of `npm`, or change your user execution policy:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Issue 2: Port Conflict (Port 8000 or 5173 Already in Use)
**Symptom:**  
`[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`  
**Fix:**  
Check which process is listening on the port and terminate it:
```powershell
# On Windows:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```
Or start Uvicorn on an alternate port and update `vite.config.ts` accordingly.

### Issue 3: Model Weights Download Timeout / Offline Mode
**Symptom:**  
`requests.exceptions.ConnectionError: Couldn't reach Hugging Face Hub`  
**Fix:**  
Ensure an internet connection is available on the first run so `transformers` can download the weights of `openai/clip-vit-base-patch32` ($\approx 600\text{ MB}$). Once downloaded, weights are cached locally in `~/.cache/huggingface/hub/` and the server will start fully offline thereafter.

### Issue 4: Missing System Libraries on Linux (OpenCV)
**Symptom:**  
`ImportError: libGL.so.1: cannot open shared object file: No such file or directory`  
**Fix:**  
Install OpenCV headless dependencies or system OpenGL libraries:
```bash
sudo apt-get update && sudo apt-get install -y libgl1 libglib2.0-0
```
*(CrimeScene uses `opencv-python-headless` in `requirements.txt` to avoid GUI dependencies on headless servers).*
