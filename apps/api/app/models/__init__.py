"""All SQLAlchemy models for Alembic discovery."""

from app.models import (
    artwork,  # noqa: F401
    catalogue,  # noqa: F401
    episode,  # noqa: F401
    publish_run,  # noqa: F401
    season,  # noqa: F401
    show,  # noqa: F401
    user,  # noqa: F401
)
from app.models.base import Base, metadata

__all__ = ["Base", "metadata"]
