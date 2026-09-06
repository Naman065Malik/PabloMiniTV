"""Publishing session endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, Body
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.show import Show
from app.models.user import User
from app.models.publish_run import PublishRun, PublishRunStatus, PublishRunShow
from app.schemas.show import ShowResponse

router = APIRouter(tags=["Admin Publishing"])


def _validation_report_json(issues) -> str:
    import json
    return json.dumps([issue.to_dict() for issue in issues], default=str)


def _fallback_validation_report(db: Session, run: PublishRun) -> list[dict]:
    if run.status != PublishRunStatus.FAILED or run.validation_report:
        return []
    from app.services import validation_service
    issues = []
    show_ids = [item.show_id for item in run.shows]
    if not show_ids:
        show_ids = [show.id for show in db.query(Show.id).filter(Show.status == "published").all()]
    for show_id in show_ids:
        issues.extend(validation_service.validate_show_for_publish(db, show_id).errors)
    return [issue.to_dict() for issue in issues]


@router.get("/publish-runs")
def list_publish_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    import json
    from app.models.episode import Episode
    from app.models.season import Season
    runs = db.query(PublishRun).order_by(PublishRun.created_at.desc()).all()
    response = []
    for run in runs:
        show_ids = [item.show_id for item in run.shows]
        if not show_ids and run.shows_count is None:
            show_ids = [show.id for show in db.query(Show.id).filter(Show.status == "published").all()]
        shows_count = run.shows_count if run.shows_count is not None else len(show_ids)
        episodes_count = run.episodes_count
        if episodes_count is None:
            episodes_count = db.query(Episode).join(Season).filter(
                Season.show_id.in_(show_ids),
                Episode.status == "published",
            ).count() if show_ids else 0
        validation_report = json.loads(run.validation_report) if run.validation_report else _fallback_validation_report(db, run)
        response.append({
            "id": run.id,
            "created_by": run.created_by,
            "status": run.status.value,
            "created_at": run.created_at,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
            "shows_count": shows_count,
            "episodes_count": episodes_count,
            "validation_report": validation_report,
        })
    return response


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
    import json
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
        "validation_report": json.loads(run.validation_report) if run.validation_report else _fallback_validation_report(db, run),
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
    # No per-show admin lock — multiple admins may edit/publish
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
    from app.models.episode import Episode
    from app.models.season import Season
    run = db.query(PublishRun).filter(PublishRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Publish run not found")
    if run.status != PublishRunStatus.DRAFT:
        raise HTTPException(status_code=409, detail="Run must be DRAFT to publish")
    # Verify at least one show selected
    selected_shows = db.query(PublishRunShow).filter(PublishRunShow.publish_run_id == run_id).all()
    selected = len(selected_shows)
    if selected == 0:
        raise HTTPException(status_code=400, detail="No shows selected for publishing")
    selected_show_ids = [item.show_id for item in selected_shows]
    run.shows_count = selected
    run.episodes_count = db.query(Episode).join(Season).filter(
        Season.show_id.in_(selected_show_ids),
        Episode.status == "published",
    ).count()
    db.commit()
    # Validate all selected shows
    for prs in selected_shows:
        result = validation_service.validate_show_for_publish(db, prs.show_id)
        if not result.valid:
            errors = "; ".join([e.message for e in result.errors])
            run.status = PublishRunStatus.FAILED
            run.error_message = errors
            run.validation_report = _validation_report_json(result.errors)
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
    show_ids: list[int] = Body(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Convenient entry point that creates a run and queues it
    run = PublishRun(created_by=current_user.id, status=PublishRunStatus.DRAFT)
    db.add(run)
    db.commit()
    db.refresh(run)
    # Full DB validation before any catalogue creation (no per-show lock)
    from app.services import validation_service
    from app.models.episode import Episode
    from app.models.season import Season
    all_shows = db.query(Show).filter(Show.status == "published").all()
    published_show_ids = [show.id for show in all_shows]
    run.shows_count = len(published_show_ids)
    run.episodes_count = db.query(Episode).join(Season).filter(
        Season.show_id.in_(published_show_ids),
        Episode.status == "published",
    ).count() if published_show_ids else 0
    db.commit()
    errors = []
    validation_issues = []
    for sh in all_shows:
        res = validation_service.validate_show_for_publish(db, sh.id)
        if not res.valid:
            errors.extend([e.message for e in res.errors])
            validation_issues.extend(res.errors)
    if errors:
        run.status = PublishRunStatus.FAILED
        run.error_message = "; ".join(errors)
        run.validation_report = _validation_report_json(validation_issues)
        run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
        db.commit()
        raise HTTPException(status_code=400, detail=f"Publishing blocked: {'; '.join(errors)}")
    try:
        # Build catalogue atomically
        from app.services.catalogue_builder import build_catalogue
        from app.storage.local import LocalStorage
        from app.core.config import settings
        import hashlib, json, os, glob
        storage = LocalStorage(settings.local_storage_path)
        catalog_dir = settings.catalogue_storage_path
        os.makedirs(catalog_dir, exist_ok=True)
        catalogue_data = build_catalogue(db, [sh.id for sh in all_shows], storage)
        checksum = hashlib.sha256(json.dumps(catalogue_data, sort_keys=True, ensure_ascii=False, default=str).encode()).hexdigest()
        existing = glob.glob(os.path.join(catalog_dir, "catalog-v*.json"))
        versions = [int(os.path.basename(p).replace("catalog-v", "").replace(".json", "")) for p in existing if os.path.basename(p).startswith("catalog-v")]
        version = max(versions) + 1 if versions else 1
        storage_key = f"catalog/catalog-v{version}.json"
        version_path = os.path.join(catalog_dir, f"catalog-v{version}.json")
        with open(version_path, "w", encoding="utf-8") as f:
            catalogue_data["version"] = version
            json.dump(catalogue_data, f, ensure_ascii=False, indent=2, sort_keys=True, default=str)
        # Verify file exists and valid
        with open(version_path, "r", encoding="utf-8") as f:
            verified = json.load(f)
        assert verified
        # Create CatalogueVersion (use actual model fields)
        from app.models.catalogue import CatalogueVersion, CatalogueState
        version_rec = CatalogueVersion(
            version_number=version,
            storage_key=storage_key,
            checksum=checksum,
            publish_run_id=run.id,
        )
        db.add(version_rec)
        db.flush()
        state = db.query(CatalogueState).filter(CatalogueState.id == 1).first()
        if not state:
            state = CatalogueState(id=1, current_version_id=version_rec.id)
            db.add(state)
        else:
            state.current_version_id = version_rec.id
            state.updated_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
        db.commit()
        run.status = PublishRunStatus.SUCCESS
        run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
        db.commit()
        return {"run_id": run.id, "status": run.status.value, "shows": published_show_ids, "message": "Catalogue published successfully.", "version": version}
    except Exception as exc:
        try:
            db.rollback()
        except Exception:
            pass
        try:
            run.status = PublishRunStatus.FAILED
            run.error_message = f"Unexpected error: {str(exc)[:500]}"
            run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Publishing failed unexpectedly: {str(exc)[:200]}")
    except Exception as exc:
        db.rollback()
        try:
            run.status = PublishRunStatus.FAILED
            run.error_message = f"Unexpected error: {str(exc)[:500]}"
            run.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
            db.commit()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Publishing failed unexpectedly: {str(exc)[:200]}")
