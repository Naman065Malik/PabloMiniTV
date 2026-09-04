"""API router package.

Aggregates the individual routers (public + admin) into a single
`api_router` so that `main.py` can include them in one place.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.admin import admin_router
from app.api.public import public_router

api_router = APIRouter(prefix="/api")
api_router.include_router(public_router)
api_router.include_router(admin_router)

__all__ = ["api_router"]
