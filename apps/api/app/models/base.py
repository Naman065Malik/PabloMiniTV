"""Base declarative class for all SQLAlchemy models."""

from __future__ import annotations

from enum import Enum as PythonEnum

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# A single shared MetaData instance so Alembic can discover every model.
metadata = MetaData()


class Base(DeclarativeBase):
    """Declarative base class for all models."""

    metadata = metadata


def enum_type(enum_class: type[PythonEnum]) -> SqlEnum:
    """Create a database enum that stores enum values, not member names.

    PostgreSQL enum labels are lowercase application values such as ``draft``.
    SQLAlchemy otherwise persists member names (for example ``DRAFT``).
    """
    return SqlEnum(
        enum_class,
        name=enum_class.__name__.lower(),
        values_callable=lambda members: [member.value for member in members],
    )
