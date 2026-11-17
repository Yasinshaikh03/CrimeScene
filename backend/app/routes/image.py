import os
from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.schemas import ImageAnalysisResponse, VCIAnalysisResponse
from app.services.clip_service import analyze_image, is_model_ready
from app.services.vci_service import analyze_image_vci
from app.utils.parser import parse_descriptions

router = APIRouter()


@router.post(
    "/analyze/image",
    response_model=ImageAnalysisResponse,
    summary="Analyze image with CLIP",
    description="Compare an image against candidate descriptions using OpenAI CLIP cosine similarity."
)
async def analyze_uploaded_image(
    file: UploadFile = File(..., description="Uploaded image file (JPG, JPEG, PNG)"),
    descriptions: str = Form(
        ...,
        description="Candidate descriptions as a JSON array (recommended), newline-separated, or comma-separated."
    )
):
    filename = (file.filename or "").lower()
    extension = os.path.splitext(filename)[1]

    if extension not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are supported."
        )

    # Validate and parse descriptions
    description_list = parse_descriptions(descriptions)

    # Read and validate file size
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image size must not exceed {settings.MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB."
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

    # Check if model is initialized
    if not is_model_ready():
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready. Please try again shortly."
        )

    # Run CLIP inference in a worker thread to keep the asyncio event loop responsive
    try:
        results = await run_in_threadpool(analyze_image, image, description_list)
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
        "filename": file.filename or "uploaded_image",
        "total_descriptions": len(results),
        "results": results,
        "note": "Similarity scores are not probabilities or proof of an event."
    }


@router.post(
    "/analyze/image/vci",
    response_model=VCIAnalysisResponse,
    summary="Visual Counterfactual Intelligence (VCI) analysis",
    description="Analyze image sensitivity by systematically masking spatial grid patches and measuring CLIP similarity shifts."
)
async def analyze_uploaded_image_vci(
    file: UploadFile = File(..., description="Uploaded image file (JPG, JPEG, PNG)"),
    description: str = Form(..., description="Target text description to evaluate against image regions"),
    grid_size: int = Form(
        settings.DEFAULT_GRID_SIZE,
        description=f"Grid size N for NxN patch masking ({settings.MIN_GRID_SIZE} to {settings.MAX_GRID_SIZE})"
    )
):
    filename = (file.filename or "").lower()
    extension = os.path.splitext(filename)[1]

    if extension not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are supported."
        )

    if not description.strip() or len(description) > settings.MAX_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Provide a description of {settings.MIN_DESCRIPTION_LENGTH} to {settings.MAX_DESCRIPTION_LENGTH} characters."
        )

    if grid_size < settings.MIN_GRID_SIZE or grid_size > settings.MAX_GRID_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Grid size must be between {settings.MIN_GRID_SIZE} and {settings.MAX_GRID_SIZE}."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image size must not exceed {settings.MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    try:
        image = Image.open(BytesIO(contents))
        image.load()
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid supported image."
        )

    if not is_model_ready():
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready."
        )

    # Run VCI analysis in a worker thread so the event loop remains unblocked
    try:
        result = await run_in_threadpool(
            analyze_image_vci,
            image,
            description.strip(),
            grid_size
        )
    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready."
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image VCI analysis failed."
        )

    return {
        "success": True,
        "filename": file.filename or "uploaded_image",
        **result
    }
