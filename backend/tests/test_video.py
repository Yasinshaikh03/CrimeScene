import json
import os
import tempfile
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="module")
def sample_video_bytes():
    """Generate a small 2-second synthetic MP4 video in memory."""
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        temp_path = f.name

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_path, fourcc, 30.0, (64, 64))
    for i in range(60):
        frame = np.full((64, 64, 3), (i * 4) % 255, dtype=np.uint8)
        out.write(frame)
    out.release()

    with open(temp_path, "rb") as f:
        data = f.read()

    try:
        os.remove(temp_path)
    except OSError:
        pass

    return data


def test_analyze_video_json_array(client, sample_video_bytes):
    files = {"file": ("surveillance.mp4", sample_video_bytes, "video/mp4")}
    data = {
        "descriptions": json.dumps(["dark room", "bright scene"]),
        "interval_seconds": 1.0,
        "max_frames": 5
    }

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["filename"] == "surveillance.mp4"
    assert res["duration_seconds"] > 0
    assert res["analyzed_frames"] >= 1
    assert len(res["frames"]) >= 1

    first_frame = res["frames"][0]
    assert "frame_index" in first_frame
    assert "timestamp_seconds" in first_frame
    assert "results" in first_frame
    assert "thumbnail_base64" in first_frame
    assert first_frame["thumbnail_base64"].startswith("data:image/jpeg;base64,")


def test_analyze_video_comma_separated_reproduction_fix(client, sample_video_bytes):
    """
    Directly tests the reported problem:
    Previously: returned 400 'Descriptions must be a valid JSON array.'
    Now: seamlessly parses comma-separated descriptions and succeeds!
    """
    files = {"file": ("security_cam.mp4", sample_video_bytes, "video/mp4")}
    data = {
        "descriptions": "suspect with weapon, police officer, getaway car",
        "interval_seconds": 1.0,
        "max_frames": 2
    }

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["descriptions"]) == 3
    assert res["descriptions"] == ["suspect with weapon", "police officer", "getaway car"]
    assert len(res["frames"]) >= 1


def test_analyze_video_newline_separated(client, sample_video_bytes):
    files = {"file": ("camera1.mp4", sample_video_bytes, "video/mp4")}
    data = {
        "descriptions": "knife\ngun\nsuspect fleeing",
        "interval_seconds": 1.0,
        "max_frames": 2
    }

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["descriptions"] == ["knife", "gun", "suspect fleeing"]


def test_analyze_video_natural_sentence_preserved(client, sample_video_bytes):
    files = {"file": ("camera2.mp4", sample_video_bytes, "video/mp4")}
    data = {
        "descriptions": "a man in a black jacket, holding a knife",
        "interval_seconds": 1.0,
        "max_frames": 2
    }

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["descriptions"] == ["a man in a black jacket, holding a knife"]


def test_analyze_video_unsupported_extension(client):
    files = {"file": ("script.exe", b"fake binary", "application/octet-stream")}
    data = {"descriptions": "knife"}

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 400
    assert "Only MP4, AVI and MOV videos are supported" in response.json()["detail"]


def test_analyze_video_invalid_interval(client, sample_video_bytes):
    files = {"file": ("test.mp4", sample_video_bytes, "video/mp4")}
    data = {
        "descriptions": "knife",
        "interval_seconds": 50.0  # max is 30
    }

    response = client.post("/api/analyze/video", files=files, data=data)
    assert response.status_code == 400
    assert "Interval must be between" in response.json()["detail"]
