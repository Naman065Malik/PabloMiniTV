"""Episode model."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.artwork import Artwork
    from app.models.season import Season


class EpisodeStatus(str, enum.Enum):
    """Publication status for an episode."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Episode(Base):
    """An episode in a season."""

    __tablename__ = "episodes"
    __table_args__ = (
        # (content_group, language) must be unique globally so that a given
        # content group/language combination maps to a single canonical episode.
        Index("uq_episodes_content_group_language", "content_group", "language", unique=True),
        CheckConstraint(
            "duration_seconds IS NULL OR duration_seconds > 0", name="ck_episodes_duration_positive"
        ),
        Index("ix_episodes_season_id", "season_id"),
        Index("ix_episodes_content_group", "content_group"),
        Index("ix_episodes_language", "language"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    episode_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    content_group: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[EpisodeStatus] = mapped_column(
        Enum(EpisodeStatus), default=EpisodeStatus.DRAFT, nullable=False, index=True
    )
    video_storage_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    season: Mapped[Season] = relationship(back_populates="episodes")
    artworks: Mapped[list[Artwork]] = relationship(
        back_populates="episode", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Episode id={self.id} season_id={self.season_id} content_group={self.content_group!r} language={self.language!r}>"
