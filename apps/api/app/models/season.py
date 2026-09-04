"""Season model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.episode import Episode
    from app.models.show import Show


class Season(Base):
    """A season of a show.

    Season 0 represents trailers.
    """

    __tablename__ = "seasons"
    __table_args__ = (
        CheckConstraint("season_number >= 0", name="ck_seasons_season_number_non_negative"),
        UniqueConstraint("show_id", "season_number", name="uq_seasons_show_id_season_number"),
        Index("ix_seasons_show_id", "show_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    show_id: Mapped[int] = mapped_column(ForeignKey("shows.id", ondelete="CASCADE"), nullable=False)
    season_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    show: Mapped[Show] = relationship(back_populates="seasons")
    episodes: Mapped[list[Episode]] = relationship(
        back_populates="season", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Season id={self.id} show_id={self.show_id} number={self.season_number}>"
