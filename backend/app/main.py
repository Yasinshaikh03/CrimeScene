
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.image import router as image_router
from app.services.clip_service import load_clip_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting CrimeScene backend...")
    load_clip_model()
    print("CrimeScene backend is ready!")

    yield

    print("Shutting down CrimeScene backend...")


app = FastAPI(
    title="CrimeScene API",
    description="CLIP-Based Video and Image Analysis with Visual Counterfactual Intelligence",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(image_router, prefix="/api", tags=["Image Analysis"])


@app.get("/")
def root():
    return {
        "message": "Welcome to CrimeScene API",
        "docs": "/docs"
    }
