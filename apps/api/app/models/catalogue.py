"""Catalogue models."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.publish_run import PublishRun


class CatalogueVersion(Base):
    """An immutable published catalogue file version.

    Represents a file stored outside PostgreSQL (e.g. in
    ``catalogues/versions/v5.json``). PostgreSQL stores metadata.
    """

    __tablename__ = "catalogue_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    publish_run_id: Mapped[int | None] = mapped_column(
        ForeignKey("publish_runs.id", ondelete="SET NULL"),
        nullable=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    checksum: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    publish_run: Mapped[PublishRun | None] = relationship(
        "PublishRun",
        back_populates="catalogue_version",
    )


class CatalogueState(Base):
    """Tracks which catalogue version is currently live."""

    __tablename__ = "catalogue_state"
    __table_args__ = (
        CheckConstraint("id = 1", name="ck_catalogue_state_single_row"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    current_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("catalogue_versions.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    current_version: Mapped[CatalogueVersion | None] = relationship(
        "CatalogueVersion",
        lazy="joined",
    )