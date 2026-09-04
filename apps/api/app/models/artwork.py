"""Artwork model."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, enum_type

if TYPE_CHECKING:
    from app.models.episode import Episode
    from app.models.show import Show


class ArtworkType(str, enum.Enum):
    """Types of artwork."""

    POSTER = "poster"
    BANNER = "banner"
    THUMBNAIL = "thumbnail"


class Artwork(Base):
    """Metadata for an artwork image."""

    __tablename__ = "artworks"
    __table_args__ = (
        CheckConstraint(
            "(show_id IS NOT NULL) OR (episode_id IS NOT NULL)",
            name="ck_artworks_belongs_to_show_or_episode",
        ),
        CheckConstraint(
            "NOT (show_id IS NOT NULL AND episode_id IS NOT NULL)",
            name="ck_artworks_not_both_show_and_episode",
        ),
        CheckConstraint("file_size_bytes >= 0", name="ck_artworks_file_size_non_negative"),
        Index("ix_artworks_show_id", "show_id"),
        Index("ix_artworks_episode_id", "episode_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    show_id: Mapped[int | None] = mapped_column(
        ForeignKey("shows.id", ondelete="CASCADE"), nullable=True
    )
    episode_id: Mapped[int | None] = mapped_column(
        ForeignKey("episodes.id", ondelete="CASCADE"), nullable=True
    )
    type: Mapped[ArtworkType] = mapped_column(enum_type(ArtworkType), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    show: Mapped[Show | None] = relationship(back_populates="artworks", single_parent=True)
    episode: Mapped[Episode | None] = relationship(back_populates="artworks", single_parent=True)
