"""Admin artworks router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.core.deps import require_editor
from app.core.errors import AppError
from app.models.artwork import Artwork, ArtworkType
from app.models.user import User
from app.schemas.show import ShowResponse  # reused for parent existence check implicitly
from app.services import artwork_service
from app.services.image_validator import validate_image

router = APIRouter(tags=["Admin Artworks"])


def _read_file_safe(upload_file: UploadFile, max_size: int = 200 * 1024) -> bytes:
    # Read actual bytes; do not trust Content-Length / filename / content-type alone
    data = upload_file.file.read()
    if len(data) > max_size:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image exceeds the maximum allowed size of 200 KB.")
    return data


@router.get("/shows/{show_id}/artworks")
def list_show_artworks(
    show_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    # Check parent exists
    from app.models.show import Show
    if not db.query(Show).filter(Show.id == show_id).first():
        raise HTTPException(status_code=404, detail="Show not found")
    artworks = artwork_service.list_artworks(db, "show", show_id)
    return [
        {
            "id": a.id,
            "type": a.type.value,
            "storage_key": a.storage_key,
            "original_filename": a.original_filename,
            "mime_type": a.mime_type,
            "file_size_bytes": a.file_size_bytes,
            "width": a.width,
            "height": a.height,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
        for a in artworks
    ]


@router.post("/shows/{show_id}/artworks")
def upload_show_artwork(
    show_id: int,
    artwork_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    from app.models.show import Show
    if not db.query(Show).filter(Show.id == show_id).first():
        raise HTTPException(status_code=404, detail="Show not found")
    try:
        artwork_type_enum = ArtworkType[artwork_type.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Unknown artwork type.")
    data = _read_file_safe(file)
    try:
        info = validate_image(data, artwork_type_enum.value)
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    result = artwork_service.create_artwork(
        db, "show", show_id, artwork_type_enum, data, file.filename or "unknown", info["mime_type"]
    )
    return {
        "id": result.id,
        "type": result.type.value,
        "storage_key": result.storage_key,
        "original_filename": result.original_filename,
        "mime_type": result.mime_type,
        "file_size_bytes": result.file_size_bytes,
        "width": result.width,
        "height": result.height,
    }


@router.get("/episodes/{episode_id}/artworks")
def list_episode_artworks(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    from app.models.episode import Episode
    if not db.query(Episode).filter(Episode.id == episode_id).first():
        raise HTTPException(status_code=404, detail="Episode not found")
    artworks = artwork_service.list_artworks(db, "episode", episode_id)
    return [
        {
            "id": a.id,
            "type": a.type.value,
            "storage_key": a.storage_key,
            "original_filename": a.original_filename,
            "mime_type": a.mime_type,
            "file_size_bytes": a.file_size_bytes,
            "width": a.width,
            "height": a.height,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
        for a in artworks
    ]


@router.post("/episodes/{episode_id}/artworks")
def upload_episode_artwork(
    episode_id: int,
    artwork_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    from app.models.episode import Episode
    if not db.query(Episode).filter(Episode.id == episode_id).first():
        raise HTTPException(status_code=404, detail="Episode not found")
    try:
        artwork_type_enum = ArtworkType[artwork_type.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail="Unknown artwork type.")
    data = _read_file_safe(file)
    try:
        info = validate_image(data, artwork_type_enum.value)
    except AppError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    result = artwork_service.create_artwork(
        db, "episode", episode_id, artwork_type_enum, data, file.filename or "unknown", info["mime_type"]
    )
    return {
        "id": result.id,
        "type": result.type.value,
        "storage_key": result.storage_key,
        "original_filename": result.original_filename,
        "mime_type": result.mime_type,
        "file_size_bytes": result.file_size_bytes,
        "width": result.width,
        "height": result.height,
    }


@router.delete("/artworks/{artwork_id}")
def delete_artwork(
    artwork_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    try:
        artwork_service.delete_artwork(db, artwork_id)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Artwork not found")
        raise HTTPException(status_code=400, detail=str(msg))
    return None
