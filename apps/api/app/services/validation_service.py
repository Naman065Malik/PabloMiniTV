"""Validation service for publish readiness."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.artwork import Artwork, ArtworkType
from app.models.episode import Episode
from app.models.season import Season
from app.models.show import Show


class ValidationIssue:
    def __init__(self, code: str, message: str, entity_type: str, entity_id: int | None, field: str | None, severity: str = "ERROR") -> None:
        self.code = code
        self.message = message
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.field = field
        self.severity = severity

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "field": self.field,
            "severity": self.severity,
        }


class ValidationResult:
    def __init__(self, valid: bool, errors: list[ValidationIssue], warnings: list[ValidationIssue] | None = None) -> None:
        self.valid = valid
        self.errors = errors
        self.warnings = warnings or []

    def to_dict(self) -> dict:
        return {
            "valid": self.valid,
            "errors": [e.to_dict() for e in self.errors],
            "warnings": [w.to_dict() for w in self.warnings],
        }


def _required_artwork_exists(db: Session, parent_type: str, parent_id: int, artwork_type: str) -> bool:
    # Check that at least one artwork of required type exists for parent
    query = db.query(Artwork).filter(
        getattr(Artwork, f"{parent_type}_id") == parent_id,
        Artwork.type == artwork_type,
    )
    return query.first() is not None


def validate_show_for_publish(db: Session, show_id: int) -> ValidationResult:
    errors: list[ValidationIssue] = []
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        return ValidationResult(False, [ValidationIssue("NOT_FOUND", "Show not found.", "show", show_id, None)])

    if not show.title or not show.title.strip():
        errors.append(ValidationIssue("MISSING_TITLE", "Show must have a title.", "show", show.id, "title"))
    if not show.slug or not show.slug.strip():
        errors.append(ValidationIssue("MISSING_SLUG", "Show must have a slug.", "show", show.id, "slug"))
    if show.section is None or (isinstance(show.section, str) and not show.section.strip()):
        errors.append(ValidationIssue("MISSING_SECTION", "Show must have a section before publishing.", "show", show.id, "section"))
    # Required artwork
    for art_type in (ArtworkType.POSTER.value, ArtworkType.BANNER.value, ArtworkType.THUMBNAIL.value):
        if not _required_artwork_exists(db, "show", show.id, art_type):
            errors.append(ValidationIssue("MISSING_ARTWORK", f'Show "{show.title}" is missing required {art_type} artwork.', "show", show.id, "artwork"))

    # Season/episode validation
    seasons = db.query(Season).filter(Season.show_id == show.id).all()
    for season in seasons:
        if season.season_number < 0:
            errors.append(ValidationIssue("INVALID_SEASON", f"Season {season.id} has invalid number.", "season", season.id, "season_number"))
        episodes = db.query(Episode).filter(Episode.season_id == season.id).all()
        for episode in episodes:
            # Episode-level issues caught centrally
            if not episode.duration_seconds or episode.duration_seconds <= 0:
                errors.append(ValidationIssue("MISSING_DURATION", f"Episode {episode.id} is missing duration.", "episode", episode.id, "duration_seconds"))
            if not episode.language or not str(episode.language).strip():
                errors.append(ValidationIssue("MISSING_LANGUAGE", f"Episode {episode.id} is missing language.", "episode", episode.id, "language"))
            if not episode.content_group or not str(episode.content_group).strip():
                errors.append(ValidationIssue("MISSING_CONTENT_GROUP", f"Episode {episode.id} is missing content_group.", "episode", episode.id, "content_group"))
            if episode.status != "published":
                errors.append(ValidationIssue("INVALID_EPISODE_STATUS", f"Episode {episode.id} status is not PUBLISHED.", "episode", episode.id, "status"))
            for art_type in (ArtworkType.THUMBNAIL.value,):
                if not _required_artwork_exists(db, "episode", episode.id, art_type):
                    errors.append(ValidationIssue("MISSING_ARTWORK", f'Episode "{episode.title}" in show "{show.title}" is missing required {art_type} artwork.', "episode", episode.id, "artwork"))

    return ValidationResult(valid=len(errors) == 0, errors=errors)


def validate_episode_for_publish(db: Session, episode_id: int) -> ValidationResult:
    errors: list[ValidationIssue] = []
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        return ValidationResult(False, [ValidationIssue("NOT_FOUND", "Episode not found.", "episode", episode_id, None)])
    if not episode.duration_seconds or episode.duration_seconds <= 0:
        errors.append(ValidationIssue("MISSING_DURATION", "Episode must have a duration greater than zero.", "episode", episode.id, "duration_seconds"))
    if not episode.language or not str(episode.language).strip():
        errors.append(ValidationIssue("MISSING_LANGUAGE", "Episode must have a language.", "episode", episode.id, "language"))
    if not episode.content_group or not str(episode.content_group).strip():
        errors.append(ValidationIssue("MISSING_CONTENT_GROUP", "Episode must have a content_group.", "episode", episode.id, "content_group"))
    show = None
    season = db.query(Season).filter(Season.id == episode.season_id).first()
    if not season:
        errors.append(ValidationIssue("INVALID_SEASON", "Episode belongs to invalid season.", "episode", episode.id, "season_id"))
    else:
        show = db.query(Show).filter(Show.id == season.show_id).first()
        if not show:
            errors.append(ValidationIssue("INVALID_SHOW", "Season belongs to invalid show.", "season", season.id, "show_id"))
    for art_type in (ArtworkType.THUMBNAIL.value,):
        if not _required_artwork_exists(db, "episode", episode.id, art_type):
            show_title = show.title if show else "Unknown show"
            errors.append(ValidationIssue("MISSING_ARTWORK", f'Episode "{episode.title}" in show "{show_title}" is missing required {art_type} artwork.', "episode", episode.id, "artwork"))
    return ValidationResult(valid=len(errors) == 0, errors=errors)
