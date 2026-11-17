import io
import json
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def create_test_image_bytes(color="red", size=(100, 100), fmt="PNG"):
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_analyze_image_json_array(client):
    img_bytes = create_test_image_bytes("red")
    files = {"file": ("scene.png", img_bytes, "image/png")}
    data = {"descriptions": json.dumps(["red color", "blue color", "green color"])}

    response = client.post("/api/analyze/image", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["filename"] == "scene.png"
    assert res["total_descriptions"] == 3
    assert len(res["results"]) == 3
    # "red color" should be ranked highest for a red image
    assert res["results"][0]["description"] == "red color"


def test_analyze_image_comma_separated(client):
    img_bytes = create_test_image_bytes("blue")
    files = {"file": ("blue_scene.jpg", img_bytes, "image/jpeg")}
    data = {"descriptions": "blue color, yellow color, red color"}

    response = client.post("/api/analyze/image", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["total_descriptions"] == 3
    assert res["results"][0]["description"] == "blue color"


def test_analyze_image_natural_sentence(client):
    img_bytes = create_test_image_bytes("red")
    files = {"file": ("scene.png", img_bytes, "image/png")}
    data = {"descriptions": "a bright red canvas, filled with scarlet paint"}

    response = client.post("/api/analyze/image", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["total_descriptions"] == 1
    assert res["results"][0]["description"] == "a bright red canvas, filled with scarlet paint"


def test_analyze_image_unsupported_format(client):
    files = {"file": ("document.txt", b"not an image", "text/plain")}
    data = {"descriptions": "knife"}
    response = client.post("/api/analyze/image", files=files, data=data)
    assert response.status_code == 400
    assert "Only JPG, JPEG and PNG images are supported" in response.json()["detail"]


def test_analyze_image_empty_file(client):
    files = {"file": ("empty.png", b"", "image/png")}
    data = {"descriptions": "knife"}
    response = client.post("/api/analyze/image", files=files, data=data)
    assert response.status_code == 400
    assert "Uploaded file is empty" in response.json()["detail"]


def test_analyze_image_vci_valid(client):
    img_bytes = create_test_image_bytes("red", size=(64, 64))
    files = {"file": ("scene.png", img_bytes, "image/png")}
    data = {"description": "a red box", "grid_size": 2}

    response = client.post("/api/analyze/image/vci", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["grid_size"] == 2
    assert "original_similarity" in res
    assert len(res["regions"]) == 4  # 2x2 grid = 4 regions
    assert "similarity_change" in res["regions"][0]


def test_analyze_image_vci_invalid_grid(client):
    img_bytes = create_test_image_bytes("red")
    files = {"file": ("scene.png", img_bytes, "image/png")}
    data = {"description": "a red box", "grid_size": 10}  # max is 8

    response = client.post("/api/analyze/image/vci", files=files, data=data)
    assert response.status_code == 400
    assert "Grid size must be between 2 and 8" in response.json()["detail"]
