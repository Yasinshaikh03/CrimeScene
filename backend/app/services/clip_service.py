
import torch
import torch.nn.functional as F
from transformers import CLIPModel, CLIPProcessor

# Pretrained CLIP model
MODEL_NAME = "openai/clip-vit-base-patch32"

# Global model objects: loaded only once
processor = None
model = None
device = "cpu"


def load_clip_model():
    """Load CLIP model and processor once during startup."""
    global processor, model

    if model is not None and processor is not None:
        return

    print("Loading CLIP model... Please wait.")

    processor = CLIPProcessor.from_pretrained(MODEL_NAME)

    model = CLIPModel.from_pretrained(MODEL_NAME)
    model.to(device)
    model.eval()

    print(f"CLIP model loaded successfully on {device.upper()}.")


def analyze_image(image, descriptions):
    """
    Compare one image against multiple text descriptions.
    Returns cosine similarity scores and ranked descriptions.
    """

    if model is None or processor is None:
        raise RuntimeError("CLIP model has not been loaded.")

    if not descriptions:
        raise ValueError("At least one description is required.")

    # Prepare image and text for CLIP
    inputs = processor(
        text=descriptions,
        images=image,
        return_tensors="pt",
        padding=True
    )

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

    results = []

    for description, score in zip(
        descriptions,
        similarities.tolist()
    ):
        results.append({
            "description": description,
            "cosine_similarity": round(float(score), 4)
        })

    # Highest similarity first
    results.sort(
        key=lambda item: item["cosine_similarity"],
        reverse=True
    )

    return results
