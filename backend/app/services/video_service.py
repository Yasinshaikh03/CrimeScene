import base64
import io
import os
import tempfile
from typing import Any, Dict, List

import cv2
from PIL import Image

from app.config import settings
from app.services.clip_service import analyze_image


def frame_to_base64_thumbnail(
    image: Image.Image,
    max_dim: int = settings.VIDEO_THUMBNAIL_MAX_DIM,
    quality: int = settings.VIDEO_THUMBNAIL_QUALITY
) -> str:
    """Resize image to a manageable thumbnail and encode as a data URL base64 JPEG."""
    thumb = image.copy()
    thumb.thumbnail((max_dim, max_dim))
    buffer = io.BytesIO()
    thumb.save(buffer, format="JPEG", quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def analyze_video(
    video_bytes: bytes,
    file_extension: str,
    descriptions: List[str],
    interval_seconds: float = settings.DEFAULT_VIDEO_INTERVAL,
    max_frames: int = settings.DEFAULT_MAX_FRAMES
) -> Dict[str, Any]:
    """
    Extract frames from video at specified intervals and analyze them against descriptions using CLIP.
    Returns metadata, similarity scores, and base64 preview thumbnails for each sampled frame.
    """
    if not video_bytes:
        raise ValueError("Uploaded video is empty.")

    if not descriptions:
        raise ValueError("At least one description is required.")

    if interval_seconds < settings.MIN_VIDEO_INTERVAL or interval_seconds > settings.MAX_VIDEO_INTERVAL:
        raise ValueError(
            f"Interval must be between {settings.MIN_VIDEO_INTERVAL} and {settings.MAX_VIDEO_INTERVAL} seconds."
        )

    if max_frames < settings.MIN_MAX_FRAMES or max_frames > settings.MAX_MAX_FRAMES:
        raise ValueError(
            f"Maximum frames must be between {settings.MIN_MAX_FRAMES} and {settings.MAX_MAX_FRAMES}."
        )

    temp_path = None
    capture = None

    try:
        # Save uploaded bytes to a temporary file for OpenCV
        with tempfile.NamedTemporaryFile(
            suffix=file_extension,
            delete=False
        ) as temp_file:
            temp_file.write(video_bytes)
            temp_path = temp_file.name

        capture = cv2.VideoCapture(temp_path)

        if not capture.isOpened():
            raise ValueError("Unable to read the uploaded video. The file may be corrupt or an unsupported codec.")

        fps = capture.get(cv2.CAP_PROP_FPS)
        total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

        if fps <= 0 or total_frames <= 0:
            raise ValueError("Video metadata is invalid or unsupported (fps or frame count is zero).")

        duration = total_frames / fps
        frames: List[Dict[str, Any]] = []

        # Seek frames by target timestamp to avoid decoding every unused frame
        target_time = 0.0
        while len(frames) < max_frames and target_time < duration:
            target_frame_idx = int(target_time * fps)
            if target_frame_idx >= total_frames:
                break

            capture.set(cv2.CAP_PROP_POS_FRAMES, target_frame_idx)
            success, raw_frame = capture.read()

            if not success or raw_frame is None:
                break

            # Convert BGR (OpenCV) to RGB (PIL)
            rgb_frame = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_frame)

            # Analyze frame with CLIP
            frame_results = analyze_image(pil_image, descriptions)

            # Generate lightweight preview thumbnail
            thumbnail_b64 = frame_to_base64_thumbnail(pil_image)

            frames.append({
                "frame_index": target_frame_idx,
                "timestamp_seconds": round(target_time, 2),
                "thumbnail_base64": thumbnail_b64,
                "results": frame_results
            })

            target_time += interval_seconds

        if not frames:
            raise ValueError("No frames could be extracted from the video.")

        return {
            "duration_seconds": round(duration, 2),
            "fps": round(fps, 2),
            "total_video_frames": total_frames,
            "analyzed_frames": len(frames),
            "sampling_interval_seconds": interval_seconds,
            "frames": frames,
            "note": "Similarity scores are not probabilities or proof of an event."
        }

    finally:
        if capture is not None:
            capture.release()

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
