"""Publish run model and its association with shows."""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.catalogue import CatalogueVersion
    from app.models.show import Show
    from app.models.user import User


class PublishRunStatus(str, enum.Enum):
    """Status of a publishing run."""

    DRAFT = "draft"
    QUEUED = "queued"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"


class PublishRun(Base):
    """A publishing session/run."""

    __tablename__ = "publish_runs"
    __table_args__ = (
        Index("ix_publish_runs_status", "status"),
        Index("ix_publish_runs_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[PublishRunStatus] = mapped_column(
        Enum(PublishRunStatus),
        default=PublishRunStatus.DRAFT,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    catalogue_version_id: Mapped[int | None] = mapped_column(ForeignKey("catalogue_versions.id"), nullable=True)
    shows_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    episodes_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    created_by_user: Mapped[User | None] = relationship(
        "User",
        lazy="joined",
    )
    shows: Mapped[list[PublishRunShow]] = relationship(
        back_populates="publish_run",
        cascade="all, delete-orphan",
    )
    catalogue_version: Mapped[CatalogueVersion | None] = relationship(
        "CatalogueVersion",
        back_populates="publish_run",
    )

    def __repr__(self) -> str:
        return f"<PublishRun id={self.id} status={self.status.value}>"


class PublishRunShow(Base):
    """Join table between PublishRun and Show."""

    __tablename__ = "publish_run_shows"
    __table_args__ = (
        Index("ix_publish_run_shows_publish_run_id", "publish_run_id"),
        Index("ix_publish_run_shows_show_id", "show_id"),
        # A show should not belong to multiple active publishing sessions
        # simultaneously. "Active" = QUEUED or PROCESSING.
        Index(
            "uq_publish_run_shows_active_one_per_show",
            "show_id",
            unique=True,
            postgresql_where="status IN ('queued', 'processing')",
        ),
    )

    publish_run_id: Mapped[int] = mapped_column(
        ForeignKey("publish_runs.id", ondelete="CASCADE"),
        primary_key=True,
    )
    show_id: Mapped[int] = mapped_column(
        ForeignKey("shows.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Denormalized status so the partial unique index can enforce
    # "one active session per show" without joining.
    status: Mapped[str] = mapped_column(String(50), nullable=False)

    publish_run: Mapped[PublishRun] = relationship(back_populates="shows")
    show: Mapped[Show] = relationship()

    def __repr__(self) -> str:
        return f"<PublishRunShow publish_run_id={self.publish_run_id} show_id={self.show_id}>"
