"""Artwork service using storage abstraction."""
from __future__ import annotations

import uuid
from pathlib import Path

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.artwork import Artwork, ArtworkType
from app.models.show import Show
from app.models.episode import Episode
from app.services.image_validator import validate_image
from app.storage.base import StorageProtocol
from app.storage.local import LocalStorage


def get_storage() -> StorageProtocol:
    if settings.storage_backend == "local":
        return LocalStorage(settings.local_storage_path)
    # Future: R2 / S3
    raise ValueError("Unsupported storage backend")


def _build_key(parent_type: str, parent_id: int, ext: str) -> str:
    # Safe unique key; never use original filename
    safe_ext = ext.lstrip(".")
    return f"artwork/{parent_type}s/{parent_id}/{uuid.uuid4().hex}.{safe_ext}"


def create_artwork(
    db: Session,
    parent_type: str,
    parent_id: int,
    artwork_type: ArtworkType,
    file_bytes: bytes,
    original_filename: str,
    mime_type_hint: str,
) -> Artwork:
    # Validate parent exists
    if parent_type == "show":
        parent = db.query(Show).filter(Show.id == parent_id).first()
    elif parent_type == "episode":
        parent = db.query(Episode).filter(Episode.id == parent_id).first()
    else:
        raise ValueError("invalid parent type")
    if not parent:
        raise ValueError("parent_not_found")

    # Validate image
    info = validate_image(file_bytes, artwork_type.value)

    # Determine extension from validated format
    fmt = info["mime_type"].upper()
    ext_map = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
    ext = ext_map.get(fmt, "jpg")

    key = _build_key(parent_type, parent_id, ext)

    storage = get_storage()
    # If replacing existing artwork of same type, find and prepare removal
    existing = db.query(Artwork).filter(
        Artwork.type == artwork_type,
        getattr(Artwork, f"{parent_type}_id") == parent_id,
    ).first()

    # Save new file first
    storage.put(key, file_bytes)

    # Create/update DB record
    if existing:
        # Remove old file after DB update to avoid orphan risk
        old_key = existing.storage_key
        existing.storage_key = key
        existing.original_filename = original_filename
        existing.mime_type = info["mime_type"]
        existing.file_size_bytes = info["file_size_bytes"]
        existing.width = info["width"]
        existing.height = info["height"]
    else:
        artwork = Artwork(
            **{f"{parent_type}_id": parent_id},
            type=artwork_type,
            storage_key=key,
            original_filename=original_filename,
            mime_type=info["mime_type"],
            file_size_bytes=info["file_size_bytes"],
            width=info["width"],
            height=info["height"],
        )
        db.add(artwork)
        existing = artwork

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        storage.delete(key)
        raise ValueError("conflict")
    db.refresh(existing)

    # Clean up old file after DB commit
    if old_key and old_key != key and storage.exists(old_key):
        storage.delete(old_key)

    return existing


def list_artworks(db: Session, parent_type: str, parent_id: int) -> list[Artwork]:
    if parent_type == "show":
        return db.query(Artwork).filter(Artwork.show_id == parent_id).all()
    elif parent_type == "episode":
        return db.query(Artwork).filter(Artwork.episode_id == parent_id).all()
    raise ValueError("invalid parent")


def get_artwork(db: Session, artwork_id: int) -> Artwork | None:
    return db.query(Artwork).filter(Artwork.id == artwork_id).first()


def delete_artwork(db: Session, artwork_id: int) -> None:
    artwork = get_artwork(db, artwork_id)
    if not artwork:
        raise ValueError("not_found")
    storage = get_storage()
    key = artwork.storage_key
    # Remove DB first, then storage; if storage fails we have DB record missing but no orphan
    db.delete(artwork)
    db.commit()
    if storage.exists(key):
        storage.delete(key)
