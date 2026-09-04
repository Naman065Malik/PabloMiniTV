"""Image validation for artwork uploads."""
from __future__ import annotations

from io import BytesIO

from PIL import Image

from app.core.errors import AppError

# Tolerance: allow ±20% from target aspect ratio and ±30% from target dimensions.
# Minimum dimensions enforce usability.
POLICY = {
    "POSTER": {"target_aspect": 2 / 3, "min_w": 400, "min_h": 600, "max_w": 900, "max_h": 1200},
    "BANNER": {"target_aspect": 16 / 9, "min_w": 800, "min_h": 360, "max_w": 1600, "max_h": 900},
    "THUMBNAIL": {"target_aspect": 16 / 9, "min_w": 320, "min_h": 180, "max_w": 800, "max_h": 450},
}
MAX_FILE_SIZE_BYTES = 200 * 1024  # 200 KB
SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}


def validate_image(data: bytes, artwork_type: str) -> dict:
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise AppError("Image exceeds the maximum allowed size of 200 KB.", 400)

    try:
        img = Image.open(BytesIO(data))
    except Exception:
        raise AppError("Uploaded file is not a valid image.", 400)

    fmt = img.format
    if fmt not in SUPPORTED_FORMATS:
        raise AppError("Unsupported image format.", 400)

    width, height = img.size
    if width <= 0 or height <= 0:
        raise AppError("Uploaded file is not a valid image.", 400)

    policy = POLICY.get(artwork_type)
    if not policy:
        raise AppError("Unknown artwork type.", 400)

    aspect = width / height if height > 0 else 0
    target = policy["target_aspect"]
    # Aspect ratio check within ±20%
    if abs(aspect - target) > target * 0.2:
        expected = f"approximately {target:.2f}:1"
        actual = f"{aspect:.2f}:1"
        raise AppError(
            f"{artwork_type} must use approximately a {expected} aspect ratio. Uploaded image has a {actual} aspect ratio.",
            400,
        )

    if width < policy["min_w"] or height < policy["min_h"]:
        raise AppError("Image dimensions are too small.", 400)

    return {
        "width": width,
        "height": height,
        "mime_type": img.format.lower() if img.format else "jpeg",
        "file_size_bytes": len(data),
    }
