
import json
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.services.clip_service import analyze_image

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze/image")
async def analyze_uploaded_image(
    file: UploadFile = File(...),
    descriptions: str = Form(...)
):
    # Validate file extension
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    filename = (file.filename or "").lower()

    if not any(filename.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are supported."
        )

    # Read and validate file size
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image size must not exceed 10 MB."
        )

    # Parse descriptions
    try:
        description_list = json.loads(descriptions)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Descriptions must be a valid JSON array."
        )

    if (
        not isinstance(description_list, list)
        or not description_list
        or not all(
            isinstance(item, str) and item.strip()
            for item in description_list
        )
    ):
        raise HTTPException(
            status_code=400,
            detail="Provide at least one non-empty text description."
        )

    description_list = [item.strip() for item in description_list]

    if len(description_list) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum 20 descriptions are allowed."
        )

    if any(len(item) > 500 for item in description_list):
        raise HTTPException(
            status_code=400,
            detail="Each description must be at most 500 characters."
        )

    # Safely decode image
    try:
        image = Image.open(BytesIO(contents))
        image.load()
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid supported image."
        )

    # Run CLIP analysis
    try:
        results = analyze_image(image, description_list)
    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready. Please try again shortly."
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image analysis failed."
        )

    return {
        "success": True,
        "filename": file.filename,
        "total_descriptions": len(results),
        "results": results,
        "note": "Similarity scores are not probabilities or proof of an event."
    }
