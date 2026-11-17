import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.schemas import VideoAnalysisResponse
from app.services.clip_service import is_model_ready
from app.services.video_service import analyze_video
from app.utils.parser import parse_descriptions

router = APIRouter()


@router.post(
    "/analyze/video",
    response_model=VideoAnalysisResponse,
    summary="Analyze video with CLIP and extract preview frames",
    description="Extract frames from an uploaded video file and compare each against candidate descriptions."
)
async def analyze_uploaded_video(
    file: UploadFile = File(..., description="Uploaded video file (MP4, AVI, MOV)"),
    descriptions: str = Form(
        ...,
        description="Candidate descriptions as a JSON array (recommended), newline-separated, or comma-separated."
    ),
    interval_seconds: float = Form(
        settings.DEFAULT_VIDEO_INTERVAL,
        description=f"Interval in seconds between sampled frames ({settings.MIN_VIDEO_INTERVAL} to {settings.MAX_VIDEO_INTERVAL})"
    ),
    max_frames: int = Form(
        settings.DEFAULT_MAX_FRAMES,
        description=f"Maximum number of frames to extract and analyze ({settings.MIN_MAX_FRAMES} to {settings.MAX_MAX_FRAMES})"
    )
):
    filename = file.filename or ""
    extension = os.path.splitext(filename)[1].lower()

    if extension not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only MP4, AVI and MOV videos are supported."
        )

    if not (settings.MIN_VIDEO_INTERVAL <= interval_seconds <= settings.MAX_VIDEO_INTERVAL):
        raise HTTPException(
            status_code=400,
            detail=f"Interval must be between {settings.MIN_VIDEO_INTERVAL} and {settings.MAX_VIDEO_INTERVAL} seconds."
        )

    if not (settings.MIN_MAX_FRAMES <= max_frames <= settings.MAX_MAX_FRAMES):
        raise HTTPException(
            status_code=400,
            detail=f"Maximum frames must be between {settings.MIN_MAX_FRAMES} and {settings.MAX_MAX_FRAMES}."
        )

    # Parse and validate descriptions using the resilient parser
    description_list = parse_descriptions(descriptions)

    # Read and validate video payload size safely
    contents = await file.read(settings.MAX_VIDEO_SIZE_BYTES + 1)

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded video is empty."
        )

    if len(contents) > settings.MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Video size must not exceed {settings.MAX_VIDEO_SIZE_BYTES // (1024 * 1024)} MB."
        )

    if not is_model_ready():
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready. Please try again."
        )

    # Offload heavy video decoding and CLIP inference to a worker thread
    try:
        result = await run_in_threadpool(
            analyze_video,
            video_bytes=contents,
            file_extension=extension,
            descriptions=description_list,
            interval_seconds=interval_seconds,
            max_frames=max_frames
        )
    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="CLIP model is not ready. Please try again."
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Video analysis failed."
        )

    return {
        "success": True,
        "filename": filename or "uploaded_video",
        "descriptions": description_list,
        **result
    }
