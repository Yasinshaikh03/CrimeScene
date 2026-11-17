
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "CrimeScene",
        "message": "CrimeScene backend is running"
    }
