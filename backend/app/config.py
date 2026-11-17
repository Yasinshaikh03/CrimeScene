import os
from typing import List, Set


class Settings:
    APP_TITLE: str = "CrimeScene API"
    APP_DESCRIPTION: str = "CLIP-Based Video and Image Analysis with Visual Counterfactual Intelligence"
    APP_VERSION: str = "1.0.0"

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]

    # Model settings
    CLIP_MODEL_NAME: str = os.getenv("CLIP_MODEL_NAME", "openai/clip-vit-base-patch32")

    # File upload limits
    MAX_IMAGE_SIZE_BYTES: int = int(os.getenv("MAX_IMAGE_SIZE_BYTES", str(10 * 1024 * 1024)))   # 10 MB
    MAX_VIDEO_SIZE_BYTES: int = int(os.getenv("MAX_VIDEO_SIZE_BYTES", str(100 * 1024 * 1024))) # 100 MB

    ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png"}
    ALLOWED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".avi", ".mov"}

    # Description constraints
    MIN_DESCRIPTIONS: int = 1
    MAX_DESCRIPTIONS: int = 20
    MIN_DESCRIPTION_LENGTH: int = 1
    MAX_DESCRIPTION_LENGTH: int = 500

    # Video extraction & thumbnail settings
    DEFAULT_VIDEO_INTERVAL: float = 2.0
    MIN_VIDEO_INTERVAL: float = 0.1
    MAX_VIDEO_INTERVAL: float = 30.0

    DEFAULT_MAX_FRAMES: int = 20
    MIN_MAX_FRAMES: int = 1
    MAX_MAX_FRAMES: int = 30

    VIDEO_THUMBNAIL_MAX_DIM: int = 320
    VIDEO_THUMBNAIL_QUALITY: int = 80

    # VCI settings
    DEFAULT_GRID_SIZE: int = 4
    MIN_GRID_SIZE: int = 2
    MAX_GRID_SIZE: int = 8


settings = Settings()
