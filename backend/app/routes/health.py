from fastapi import APIRouter
from app.schemas import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check if CrimeScene API is running and healthy."
)
def health_check():
    return {
        "status": "healthy",
        "project": "CrimeScene",
        "message": "CrimeScene backend is running"
    }
