"""Base declarative class for all SQLAlchemy models."""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# A single shared MetaData instance so Alembic can discover every model.
metadata = MetaData()


class Base(DeclarativeBase):
    """Declarative base class for all models."""

    metadata = metadata
