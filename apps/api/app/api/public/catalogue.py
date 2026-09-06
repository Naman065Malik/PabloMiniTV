"""Public catalogue API."""
from __future__ import annotations

import json
import os

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.catalogue import CatalogueState, CatalogueVersion
from app.storage.local import LocalStorage

router = APIRouter(prefix="/catalog", tags=["catalog"])


def _load_current_catalogue(db: Session) -> dict:
    state = db.query(CatalogueState).filter(CatalogueState.id == 1).first()
    if not state or state.current_version_id is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No catalogue has been published yet.")
    version = db.query(CatalogueVersion).filter(CatalogueVersion.id == state.current_version_id).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Catalogue version not found.")
    storage = LocalStorage(settings.local_storage_path)
    storage_key = version.storage_key
    if os.path.isabs(storage_key):
        storage_key = os.path.relpath(storage_key, settings.local_storage_path)
    if not storage.exists(storage_key):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Catalogue storage missing.")
    try:
        raw = storage.get(storage_key)
        return json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Catalogued source is malformed.")


@router.get("/catalog")
def get_catalogue(db: Session = Depends(get_db)):
    return _load_current_catalogue(db)


@router.get("/catalog/assets/{storage_key:path}")
def get_artwork_asset(storage_key: str, db: Session = Depends(get_db)):
    storage = LocalStorage(settings.local_storage_path)
    try:
        key_path = storage_key if not storage_key.startswith("/") else storage_key.lstrip("/")
        from app.models.artwork import Artwork
        artwork = db.query(Artwork).filter(Artwork.storage_key == key_path).first()
        if not artwork:
            raise FileNotFoundError(key_path)
        data = storage.get(key_path)
        return Response(content=data, media_type=artwork.mime_type)
    except Exception:
        raise HTTPException(status_code=404, detail="Artwork not found")

@router.get("/catalog/search")
def search_catalogue(
    q: str | None = Query(None),
    category: str | None = Query(None),
    language: str | None = Query(None),
    section: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    catalogue = _load_current_catalogue(db)
    sections = catalogue.get("sections", {})
    items = []
    for section_name in sorted(sections):
        section = sections[section_name]
        for show in section.get("shows", []):
            if section is not None and section_name != section:
                if section and section_name != section:
                    pass
            match = True
            if section is not None:
                if show.get("section") != section:
                    match = False
            # Simple server-side filtering against loaded catalogue
            if q:
                q_low = q.lower().strip()
                text = f"{show.get('title','')} {show.get('description','')}"
                # include episode titles/descriptions
                for season in show.get("seasons", []):
                    for ep in season.get("episodes", []):
                        text += f" {ep.get('title','')} {ep.get('description','')}"
                if q_low not in text.lower():
                    match = False
            if category:
                if show.get("category") != category:
                    match = False
            # Language filter must understand content_group collapse
            if language:
                has_lang = False
                for season in show.get("seasons", []):
                    for ep in season.get("episodes", []):
                        if language in (ep.get("languages") or []):
                            has_lang = True
                if not has_lang:
                    match = False
            if match:
                items.append({"section": section_name, **show})
    # Pagination
    total = len(items)
    paginated = items[(page - 1) * page_size : page * page_size]
    return {
        "items": paginated,
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.get("/catalog/shows/{show_id}")
def get_catalogue_show(show_id: int, db: Session = Depends(get_db)):
    catalogue = _load_current_catalogue(db)
    for section in catalogue.get("sections", {}).values():
        for show in section.get("shows", []):
            if show.get("id") == show_id:
                return show
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Show not found in published catalogue")
