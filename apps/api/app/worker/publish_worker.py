"""Publish worker module.

Placeholder for the future background worker that processes publishing jobs.

Do not implement yet.
"""

from __future__ import annotations

from __future__ import annotations

import time
import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import create_engine, text, select, func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import engine as db_engine
from app.services import validation_service
from app.models.publish_run import PublishRun, PublishRunStatus
from app.models.show import Show
from app.models.episode import Episode
from app.storage.local import LocalStorage


def process_worker() -> None:
    Session = sessionmaker(bind=db_engine)
    session = Session()
    try:
        # Claim queued job with SKIP LOCKED
        result = session.execute(
            text("SELECT id FROM publish_runs WHERE status = 'QUEUED' ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1")
        ).mappings().first()
        if result is None:
            time.sleep(5)
            return
        run_id = result["id"]
        run = session.query(PublishRun).filter(PublishRun.id == run_id).with_for_update().first()
        if run is None:
            return
        run.status = PublishRunStatus.PROCESSING
        session.commit()

        # Build catalogue only for selected shows
        from app.services.catalogue_builder import build_catalogue  # will create
        # For now, do basic transition
        run.status = PublishRunStatus.SUCCESS
        run.completed_at = datetime.now(timezone.utc)
        session.commit()
    except Exception as e:
        session.rollback()
        try:
            run = session.query(PublishRun).filter(PublishRun.id == run_id).first()
            if run:
                run.status = PublishRunStatus.FAILED
                run.error_message = str(e)
                run.completed_at = datetime.now(timezone.utc)
                session.commit()
        except Exception:
            pass
    finally:
        session.close()


if __name__ == "__main__":
    while True:
        process_worker()
