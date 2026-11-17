from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.health import router as health_router
from app.routes.image import router as image_router
from app.routes.video import router as video_router
from app.services.clip_service import load_clip_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting CrimeScene backend...")
    load_clip_model()
    print("CrimeScene backend is ready!")

    yield

    print("Shutting down CrimeScene backend...")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(image_router, prefix="/api", tags=["Image Analysis"])
app.include_router(video_router, prefix="/api", tags=["Video Analysis"])


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_TITLE}",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }
