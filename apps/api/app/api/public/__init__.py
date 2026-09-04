"""Public API router package.

Aggregates the public routers (catalogue) under `/api/public`.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.public.catalogue import router as catalogue_router

public_router = APIRouter(prefix="/public", tags=["public"])
public_router.include_router(catalogue_router)

__all__ = ["public_router"]
