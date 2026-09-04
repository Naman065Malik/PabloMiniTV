"""Catalogue builder for publishing."""
from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.storage.base import StorageProtocol
from app.storage.local import LocalStorage
from app.core.config import settings


def build_catalogue(db: Session, show_ids: list[int], storage: StorageProtocol | None = None) -> dict:
    """Build deterministic catalogue from selected published shows."""
    if storage is None:
        storage = LocalStorage(settings.local_storage_path)

    sections = defaultdict(lambda: {"shows": []})
    # Load selected shows with eager relationships
    from app.models.show import Show
    from app.models.season import Season
    from app.models.episode import Episode
    from app.models.artwork import Artwork

    shows = db.query(Show).filter(Show.id.in_(show_ids), Show.status == "published").all()
    for show in shows:
        section = show.section or "Uncategorized"
        show_entry = {
            "id": show.id,
            "title": show.title,
            "slug": show.slug,
            "description": show.description,
            "category": show.category,
            "section": section,
            "seasons": [],
            "artworks": {},
        }
        # Artworks for show
        artworks = db.query(Artwork).filter(Artwork.show_id == show.id).all()
        for aw in artworks:
            if aw.type and aw.storage_key:
                show_entry["artworks"][aw.type.value] = f"/api/catalog/assets/{aw.storage_key}"
        # Seasons
        seasons = db.query(Season).filter(Season.show_id == show.id).order_by(Season.season_number).all()
        for season in seasons:
            season_entry = {
                "id": season.id,
                "season_number": season.season_number,
                "title": season.title,
                "episodes": [],
            }
            episodes = db.query(Episode).filter(Episode.season_id == season.id, Episode.status == "published").order_by(Episode.episode_number).all()
            # Group by content_group for language collapse
            groups = defaultdict(lambda: {"languages": [], "episodes": []})
            for ep in episodes:
                groups[ep.content_group]["languages"].append(ep.language)
                groups[ep.content_group]["episodes"].append({
                    "id": ep.id,
                    "title": ep.title,
                    "episode_number": ep.episode_number,
                    "duration_seconds": ep.duration_seconds,
                    "language": ep.language,
                    "description": ep.description,
                })
            # Build logical episodes from groups
            for group_key in sorted(groups):
                group = groups[group_key]
                # Use first episode as base; combine languages
                first_ep = group["episodes"][0]
                logical_ep = {
                    "id": first_ep["id"],
                    "title": first_ep["title"],
                    "episode_number": first_ep["episode_number"],
                    "duration_seconds": first_ep["duration_seconds"],
                    "languages": sorted(set(group["languages"])),
                    "description": first_ep["description"],
                }
                # Artworks for episode (use first episode's artworks if needed; for simplicity use first)
                ep_artworks = db.query(Artwork).filter(Artwork.episode_id == first_ep["id"]).all()
                art_map = {}
                for aw in ep_artworks:
                    if aw.type and aw.storage_key:
                        art_map[aw.type.value] = f"/api/catalog/assets/{aw.storage_key}"
                if art_map:
                    logical_ep["artworks"] = art_map
                season_entry["episodes"].append(logical_ep)
            show_entry["seasons"].append(season_entry)
        sections[section]["shows"].append(show_entry)

    # Sort deterministically
    result = {
        "version": None,
        "sections": {},
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "show_count": len(shows),
        },
    }
    for section in sorted(sections):
        shows_in = sorted(sections[section]["shows"], key=lambda s: s["title"])
        result["sections"][section] = {"shows": shows_in}

    return result


def checksum_catalogue(data: dict) -> str:
    payload = json.dumps(data, sort_keys=True, ensure_ascii=False, default=str)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
