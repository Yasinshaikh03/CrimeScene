from typing import List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["healthy"])
    project: str = Field(..., examples=["CrimeScene"])
    message: str = Field(..., examples=["CrimeScene backend is running"])


class CLIPResult(BaseModel):
    description: str = Field(..., description="The candidate text description.")
    cosine_similarity: float = Field(..., description="Cosine similarity score between image and text features.")


class ImageAnalysisResponse(BaseModel):
    success: bool = True
    filename: str
    total_descriptions: int
    results: List[CLIPResult]
    note: str = "Similarity scores are not probabilities or proof of an event."


class VCIRegion(BaseModel):
    row: int
    column: int
    x: int
    y: int
    width: int
    height: int
    masked_similarity: float
    similarity_change: float = Field(
        ...,
        description="original_similarity - masked_similarity. Positive indicates region supported description."
    )


class VCIAnalysisResponse(BaseModel):
    success: bool = True
    filename: str
    description: str
    grid_size: int
    original_similarity: float
    regions: List[VCIRegion]
    note: str = (
        "Positive similarity change means masking the region reduced similarity. "
        "This is model sensitivity analysis, not causal proof or evidence of an event."
    )


class VideoFrameResult(BaseModel):
    frame_index: int
    timestamp_seconds: float
    thumbnail_base64: Optional[str] = Field(
        None,
        description="Base64-encoded JPEG image preview (data:image/jpeg;base64,...)"
    )
    results: List[CLIPResult]


class VideoAnalysisResponse(BaseModel):
    success: bool = True
    filename: str
    descriptions: List[str]
    duration_seconds: float
    fps: float
    total_video_frames: int
    analyzed_frames: int
    sampling_interval_seconds: float
    frames: List[VideoFrameResult]
    note: str = "Similarity scores are not probabilities or proof of an event."


class ErrorResponse(BaseModel):
    detail: str
