"""Show model."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, enum_type

if TYPE_CHECKING:
    from app.models.artwork import Artwork
    from app.models.publish_run import PublishRunShow
    from app.models.season import Season


class ShowStatus(str, enum.Enum):
    """Publication status for a show."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Show(Base):
    """A TV show."""

    __tablename__ = "shows"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    section: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[ShowStatus] = mapped_column(
        enum_type(ShowStatus), default=ShowStatus.DRAFT, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    seasons: Mapped[list[Season]] = relationship(
        back_populates="show", cascade="all, delete-orphan"
    )
    artworks: Mapped[list[Artwork]] = relationship(
        back_populates="show", cascade="all, delete-orphan"
    )
    publish_run_shows: Mapped[list[PublishRunShow]] = relationship(back_populates="show")

    def __repr__(self) -> str:
        return f"<Show id={self.id} title={self.title!r} slug={self.slug!r}>"
