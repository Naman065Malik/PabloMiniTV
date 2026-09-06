"""Admin API router package.

Aggregates the admin routers (shows, seasons, episodes, artworks,
validation, publishing) under `/api/admin`.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.admin.artworks import router as artworks_router
from app.api.admin.episodes import router as episodes_router
from app.api.admin.publishing import router as publishing_router
from app.api.admin.seasons import router as seasons_router
from app.api.admin.shows import router as shows_router
from app.api.admin.seed_import import router as seed_import_router
from app.api.admin.validation import router as validation_router
from app.api.admin.users import router as users_router

admin_router = APIRouter(prefix="/admin", tags=["admin"])
admin_router.include_router(shows_router)
admin_router.include_router(seasons_router)
admin_router.include_router(episodes_router)
admin_router.include_router(artworks_router)
admin_router.include_router(validation_router)
admin_router.include_router(publishing_router)
admin_router.include_router(seed_import_router)
admin_router.include_router(users_router)

__all__ = ["admin_router"]
