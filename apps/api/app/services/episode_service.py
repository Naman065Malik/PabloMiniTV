"""Episode service."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.episode import Episode
from app.models.season import Season
from app.schemas.episode import EpisodeCreate, EpisodeUpdate


def create(db: Session, season_id: int, data: EpisodeCreate) -> Episode:
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise ValueError("season_not_found")
    episode = Episode(
        season_id=season_id,
        title=data.title,
        description=data.description,
        episode_number=data.episode_number,
        duration_seconds=data.duration_seconds,
        language=data.language,
        content_group=data.content_group,
        status=data.status,
    )
    db.add(episode)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("conflict")
    db.refresh(episode)
    return episode


def list_for_season(db: Session, season_id: int) -> list[Episode]:
    return db.query(Episode).filter(Episode.season_id == season_id).all()


def get(db: Session, episode_id: int) -> Episode | None:
    return db.query(Episode).filter(Episode.id == episode_id).first()


def update(db: Session, episode_id: int, data: EpisodeUpdate) -> Episode:
    episode = get(db, episode_id)
    if not episode:
        raise ValueError("not_found")
    if data.title is not None:
        episode.title = data.title
    if data.description is not None:
        episode.description = data.description
    if data.episode_number is not None:
        episode.episode_number = data.episode_number
    if data.duration_seconds is not None:
        episode.duration_seconds = data.duration_seconds
    if data.language is not None:
        episode.language = data.language
    if data.content_group is not None:
        episode.content_group = data.content_group
    if data.status is not None:
        episode.status = data.status
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("conflict")
    db.refresh(episode)
    return episode


def delete(db: Session, episode_id: int) -> None:
    episode = get(db, episode_id)
    if not episode:
        raise ValueError("not_found")
    db.delete(episode)
    db.commit()
