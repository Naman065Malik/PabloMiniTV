"""Season service."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.season import Season
from app.models.show import Show
from app.schemas.season import SeasonCreate, SeasonUpdate


def create(db: Session, show_id: int, data: SeasonCreate) -> Season:
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise ValueError("show_not_found")
    season = Season(
        show_id=show_id,
        season_number=data.season_number,
        title=data.title,
    )
    db.add(season)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("conflict")
    db.refresh(season)
    return season


def list_for_show(db: Session, show_id: int) -> list[Season]:
    return db.query(Season).filter(Season.show_id == show_id).all()


def get(db: Session, season_id: int) -> Season | None:
    return db.query(Season).filter(Season.id == season_id).first()


def update(db: Session, season_id: int, data: SeasonUpdate) -> Season:
    season = get(db, season_id)
    if not season:
        raise ValueError("not_found")
    if data.season_number is not None:
        season.season_number = data.season_number
    if data.title is not None:
        season.title = data.title
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("conflict")
    db.refresh(season)
    return season


def delete(db: Session, season_id: int) -> None:
    season = get(db, season_id)
    if not season:
        raise ValueError("not_found")
    db.delete(season)
    db.commit()
