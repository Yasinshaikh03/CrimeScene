import torch
import torch.nn.functional as F
from transformers import CLIPModel, CLIPProcessor

from app.config import settings

# Global model objects: loaded once at startup
processor = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"


def load_clip_model():
    """Load CLIP model and processor once during startup."""
    global processor, model, device

    if model is not None and processor is not None:
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading CLIP model ({settings.CLIP_MODEL_NAME}) on {device.upper()}... Please wait.")

    processor = CLIPProcessor.from_pretrained(settings.CLIP_MODEL_NAME)
    model = CLIPModel.from_pretrained(settings.CLIP_MODEL_NAME)
    model.to(device)
    model.eval()

    print(f"CLIP model loaded successfully on {device.upper()}.")


def is_model_ready() -> bool:
    """Check if model and processor are initialized and ready."""
    return model is not None and processor is not None


def analyze_image(image, descriptions):
    """
    Compare one PIL image against multiple text descriptions.
    Returns cosine similarity scores sorted by highest similarity first.
    """
    if not is_model_ready():
        raise RuntimeError("CLIP model has not been loaded.")

    if not descriptions:
        raise ValueError("At least one description is required.")

    # Prepare image and text inputs for CLIP
    inputs = processor(
        text=descriptions,
        images=image,
        return_tensors="pt",
        padding=True
    )

    # Move tensors to the target device (CPU or CUDA)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.inference_mode():
        outputs = model(**inputs)

        image_features = F.normalize(
            outputs.image_embeds,
            p=2,
            dim=-1
        )

        text_features = F.normalize(
            outputs.text_embeds,
            p=2,
            dim=-1
        )

        similarities = (
            image_features @ text_features.T
        ).squeeze(0)

    # Convert to standard Python floats
    scores = similarities.tolist()
    if isinstance(scores, float):
        scores = [scores]

    results = [
        {
            "description": desc,
            "cosine_similarity": round(float(score), 4)
        }
        for desc, score in zip(descriptions, scores)
    ]

    # Highest similarity first
    results.sort(
        key=lambda item: item["cosine_similarity"],
        reverse=True
    )

    return results
