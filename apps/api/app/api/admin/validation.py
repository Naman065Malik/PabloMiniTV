"""Admin validation router."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.core.deps import require_editor
from app.models.user import User
from app.models.publish_run import PublishRun, PublishRunStatus
from app.services import validation_service

router = APIRouter(prefix="/validation", tags=["Admin Validation"])


@router.get("/validation-report")
def validation_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    Show = __import__("app.models.show", fromlist=["Show"]).Show
    shows = db.query(Show).filter(Show.status == "published").all()
    total_shows = len(shows)
    valid_shows = 0
    invalid_shows = 0
    total_episodes = 0
    valid_episodes = 0
    invalid_episodes = 0
    errors = []
    warnings = []

    for show in shows:
        result = validation_service.validate_show_for_publish(db, show.id)
        if result.valid:
            valid_shows += 1
        else:
            invalid_shows += 1
        errors.extend(result.errors)
        # Episode checks via show season relationships (simplified)
    # For episode-level, scan all episodes
    from app.models.episode import Episode
    episodes = db.query(Episode).join(Episode.season).join(Show).filter(
        Episode.status == "published",
        Show.status == "published",
    ).all()
    total_episodes = len(episodes)
    for ep in episodes:
        result = validation_service.validate_episode_for_publish(db, ep.id)
        if result.valid:
            valid_episodes += 1
        else:
            invalid_episodes += 1
        errors.extend(result.errors)

    last_failed_run = db.query(PublishRun).filter(
        PublishRun.status == PublishRunStatus.FAILED,
        PublishRun.error_message.isnot(None),
    ).order_by(PublishRun.created_at.desc()).first()

    return {
        "total_shows": total_shows,
        "valid_shows": valid_shows,
        "invalid_shows": invalid_shows,
        "total_episodes": total_episodes,
        "valid_episodes": valid_episodes,
        "invalid_episodes": invalid_episodes,
        "errors": [e.to_dict() for e in errors],
        "warnings": [w.to_dict() for w in warnings],
        "last_publish_failure": {
            "run_id": last_failed_run.id,
            "message": last_failed_run.error_message,
            "created_at": last_failed_run.created_at,
        } if last_failed_run else None,
    }


@router.get("/shows/{show_id}/validation")
def show_validation(
    show_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_editor),
):
    result = validation_service.validate_show_for_publish(db, show_id)
    return {
        "show_id": show_id,
        "valid": result.valid,
        "errors": [e.to_dict() for e in result.errors],
        "warnings": [w.to_dict() for w in result.warnings],
    }
