
"""Admin seed import endpoints."""
from __future__ import annotations

import json
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.deps import require_editor
from app.core.database import get_db
from app.models.user import User
from app.services.seed_validator import SeedValidator
from app.services import show_service, season_service, episode_service
from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode

router = APIRouter(tags=["Admin Seed Import"])

@router.post("/import/seed/validate")
def validate_seed(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = json.load(file.file)
    except Exception:
        return {"can_import": False, "summary": {"errors": 1, "records_checked": 0, "shows_detected": 0}, "issues": [{"severity":"error","code":"BAD_JSON","message":"File is not valid JSON."}]}
    if not isinstance(data, list):
        return {"can_import": False, "summary": {"errors": 1, "records_checked": 0}, "issues": [{"severity":"error","code":"BAD_FORMAT","message":"Expected top-level array."}]}
    validator = SeedValidator(data)
    return validator.validate()

@router.post("/import/seed")
def import_seed(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = json.load(file.file)
    except Exception:
        return {"can_import": False, "summary": {"errors": 1}, "issues": [{"severity":"error","code":"BAD_JSON","message":"File is not valid JSON."}], "imported": False}
    if not isinstance(data, list):
        return {"can_import": False, "summary": {"errors": 1}, "issues": [{"severity":"error","code":"BAD_FORMAT","message":"Expected top-level array."}], "imported": False}
    validator = SeedValidator(data)
    report = validator.validate()
    if not report.get("can_import"):
        return {**report, "imported": False, "message": "Blocking validation errors prevent import."}
    # Transactional import
    try:
        shows_map = {}
        seasons_map = {}
        for r in data:
            if not isinstance(r, dict):
                continue
            slug = r.get("slug")
            show_title = r.get("show_title")
            # Show
            if slug and slug not in shows_map:
                existing = db.query(Show).filter(Show.slug == slug).first()
                if existing:
                    shows_map[slug] = existing
                else:
                    s = Show(title=show_title or slug, slug=slug, description=r.get("synopsis"), section=r.get("section"), category=",".join(r.get("categories") or []))
                    db.add(s); db.flush(); shows_map[slug] = s
            show = shows_map.get(slug)
            if not show:
                continue
            # Season
            season_key = (show.id, r.get("season_number"))
            if season_key not in seasons_map:
                existing_season = db.query(Season).filter(Season.show_id == show.id, Season.season_number == r.get("season_number")).first()
                if existing_season:
                    seasons_map[season_key] = existing_season
                else:
                    se = Season(show_id=show.id, season_number=r.get("season_number"), title=None)
                    db.add(se); db.flush(); seasons_map[season_key] = se
            season = seasons_map.get(season_key)
            # Episode
            ep = Episode(
                season_id=season.id,
                title=r.get("episode_title"),
                description=r.get("synopsis"),
                episode_number=r.get("episode_number"),
                duration_seconds=r.get("duration_seconds"),
                language=r.get("language"),
                content_group=r.get("content_group"),
                status=r.get("status"),
            )
            db.add(ep)
        db.commit()
        return {**report, "imported": True, "message": "Seed imported transactionally."}
    except Exception as e:
        db.rollback()
        return {**report, "imported": False, "message": f"Import failed: {str(e)}"}
