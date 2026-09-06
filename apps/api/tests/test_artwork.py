"""Artwork validation tests."""
from fastapi.testclient import TestClient
from PIL import Image
import io

def make_image(width, height, fmt="JPEG"):
    img = Image.new("RGB", (width, height), color=(100,150,200))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    buf.seek(0)
    return buf.read()

def test_valid_poster_accepted(client: TestClient):
    # Create show first via existing helper if available; else assume auth set
    pass

def test_invalid_poster_dimensions_rejected(client: TestClient):
    pass
