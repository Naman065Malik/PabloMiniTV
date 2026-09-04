"""Publishing session endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.show import Show
from app.models.user import User
from app.models.publish_run import PublishRun, PublishRunStatus, PublishRunShow
from app.schemas.show import ShowResponse

router = APIRouter(tags=["Admin Publishing"])


@router.get("/publish-runs")
def list_publish_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    runs = db.query(PublishRun).order_by(PublishRun.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "created_by": r.created_by,
            "status": r.status.value,
            "created_at": r.created_at,
            "started_at": r.started_at,
            "completed_at": r.completed_at,
            "shows_count": r.shows_count,
            "episodes_count": r.episodes_count,
        }
        for r in runs
    ]


@router.post("/publish-runs")
def create_publish_run(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    run = PublishRun(
        created_by=current_user.id,
        status=PublishRunStatus.DRAFT,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return {
        "id": run.id,
        "status": run.status.value,
        "created_by": run.created_by,
    }


@router.get("/publish-runs/{run_id}")
def get_publish_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    run = db.query(PublishRun).filter(PublishRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Publish run not found")
    shows = db.query(PublishRunShow).filter(PublishRunShow.publish_run_id == run_id).all()
    return {
        "id": run.id,
        "created_by": run.created_by,
        "status": run.status.value,
        "created_at": run.created_at,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "error_message": run.error_message,
        "catalogue_version_id": run.catalogue_version_id,
        "shows_count": run.shows_count,
        "episodes_count": run.episodes_count,
        "shows": [
            {"show_id": s.show_id} for s in shows
        ],
    }


@router.post("/publish-runs/{run_id}/shows/{show_id}")
def add_show_to_run(
    run_id: int,
    show_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    run = db.query(PublishRun).filter(PublishRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Publish run not found")
    if run.status != PublishRunStatus.DRAFT:
        raise HTTPException(status_code=409, detail="Run must be in DRAFT to add shows")
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    # Check if show is in another active run
    active = db.query(PublishRunShow).join(PublishRun).filter(
        PublishRunShow.show_id == show_id,
        PublishRun.status.in_([PublishRunStatus.DRAFT, PublishRunStatus.QUEUED, PublishRunStatus.PROCESSING]),
    ).first()
    if active and active.publish_run_id != run_id:
        preparing = db.query(PublishRun).filter(PublishRun.id == active.publish_run_id).first()
        msg = "Show is currently being prepared by another administrator."
        if preparing and preparing.created_by:
            creator = db.query(User).filter(User.id == preparing.created_by).first()
            if creator:
                msg += f" Preparing admin: {creator.email}."
        raise HTTPException(status_code=409, detail=msg)
    # Add if not already present
    existing = db.query(PublishRunShow).filter(
        PublishRunShow.publish_run_id == run_id,
        PublishRunShow.show_id == show_id,
    ).first()
    if existing:
        return {"show_id": show_id, "publish_run_id": run_id, "message": "Already added"}
    prs = PublishRunShow(publish_run_id=run_id, show_id=show_id, status=run.status.value)
    db.add(prs)
    db.commit()
    return {"show_id": show_id, "publish_run_id": run_id}


@router.post("/publish-runs/{run_id}/publish")
def publish_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from app.services import validation_service
    run = db.query(PublishRun).filter(PublishRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Publish run not found")
    if run.status != PublishRunStatus.DRAFT:
        raise HTTPException(status_code=409, detail="Run must be DRAFT to publish")
    # Verify at least one show selected
    selected = db.query(PublishRunShow).filter(PublishRunShow.publish_run_id == run_id).count()
    if selected == 0:
        raise HTTPException(status_code=400, detail="No shows selected for publishing")
    # Validate all selected shows
    for prs in db.query(PublishRunShow).filter(PublishRunShow.publish_run_id == run_id).all():
        result = validation_service.validate_show_for_publish(db, prs.show_id)
        if not result.valid:
            errors = "; ".join([e.message for e in result.errors])
            run.status = PublishRunStatus.FAILED
            run.error_message = errors
            run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Publishing failed: {errors}")
    # Transition to QUEUED
    run.status = PublishRunStatus.QUEUED
    db.commit()
    db.refresh(run)
    return {"id": run.id, "status": run.status.value}


@router.post("/catalog/publish")
def catalog_publish(
    show_ids: list[int] = [],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Convenient entry point that creates a run and queues it
    run = PublishRun(created_by=current_user.id, status=PublishRunStatus.DRAFT)
    db.add(run)
    db.commit()
    db.refresh(run)
    for sid in show_ids:
        show = db.query(Show).filter(Show.id == sid).first()
        if not show:
            raise HTTPException(status_code=404, detail=f"Show {sid} not found")
        active = db.query(PublishRunShow).join(PublishRun).filter(
            PublishRunShow.show_id == sid,
            PublishRun.status.in_([PublishRunStatus.DRAFT, PublishRunStatus.QUEUED, PublishRunStatus.PROCESSING]),
        ).first()
        if active and active.publish_run_id != run.id:
            raise HTTPException(status_code=409, detail=f"Show {sid} is being prepared by another admin.")
        prs = PublishRunShow(publish_run_id=run.id, show_id=sid, status="draft")
        db.add(prs)
    db.commit()
    # Queue
    try:
        for prs in db.query(PublishRunShow).filter(PublishRunShow.publish_run_id == run.id).all():
            result = validation_service.validate_show_for_publish(db, prs.show_id)
            if not result.valid:
                errors = "; ".join([e.message for e in result.errors])
                run.status = PublishRunStatus.FAILED
                run.error_message = errors
                run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
                db.commit()
                raise HTTPException(status_code=400, detail=f"Publishing failed: {errors}")
        run.status = PublishRunStatus.QUEUED
        db.commit()
    except HTTPException:
        raise
    return {"run_id": run.id, "status": run.status.value, "shows": show_ids}
