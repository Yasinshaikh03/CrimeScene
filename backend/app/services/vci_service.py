from PIL import Image, ImageDraw

from app.config import settings
from app.services.clip_service import analyze_image


def analyze_image_vci(image, description, grid_size=settings.DEFAULT_GRID_SIZE):
    """
    Perform Visual Counterfactual Intelligence (VCI) analysis.
    Mask image regions in a grid one at a time and measure how CLIP similarity changes.
    """
    if not description or not description.strip():
        raise ValueError("Description cannot be empty.")

    description = description.strip()
    if len(description) > settings.MAX_DESCRIPTION_LENGTH:
        raise ValueError(f"Description must be at most {settings.MAX_DESCRIPTION_LENGTH} characters.")

    if grid_size < settings.MIN_GRID_SIZE or grid_size > settings.MAX_GRID_SIZE:
        raise ValueError(f"Grid size must be between {settings.MIN_GRID_SIZE} and {settings.MAX_GRID_SIZE}.")

    image = image.convert("RGB")
    image_width, image_height = image.size

    # Calculate baseline similarity for unperturbed image
    original_results = analyze_image(image, [description])
    original_score = original_results[0]["cosine_similarity"]

    regions = []
    region_width = image_width / grid_size
    region_height = image_height / grid_size

    # Mask each grid cell individually with neutral grey (128, 128, 128)
    for row in range(grid_size):
        for col in range(grid_size):
            x1 = int(col * region_width)
            y1 = int(row * region_height)
            x2 = int((col + 1) * region_width)
            y2 = int((row + 1) * region_height)

            masked_image = image.copy()
            draw = ImageDraw.Draw(masked_image)
            draw.rectangle([x1, y1, x2, y2], fill=(128, 128, 128))

            masked_results = analyze_image(masked_image, [description])
            masked_score = masked_results[0]["cosine_similarity"]

            # Positive change indicates that masking this region reduced similarity
            score_change = round(original_score - masked_score, 4)

            regions.append({
                "row": row,
                "column": col,
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
                "masked_similarity": masked_score,
                "similarity_change": score_change
            })

    return {
        "description": description,
        "grid_size": grid_size,
        "original_similarity": original_score,
        "regions": regions,
        "note": (
            "Positive similarity change means masking the region reduced similarity. "
            "This is model sensitivity analysis, not causal proof or evidence of an event."
        )
    }
