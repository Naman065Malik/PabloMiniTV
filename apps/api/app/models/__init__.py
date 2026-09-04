"""SQLAlchemy models package.

No models are defined yet. The shared base and metadata are exposed for
future model definitions and Alembic migration generation.
"""

from app.core.database import Base

metadata = Base.metadata

__all__ = ["Base", "metadata"]
