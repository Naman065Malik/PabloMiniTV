"""Seed import DTOs — flat import format, not PostgreSQL schema."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List

class SeedRecord(BaseModel):
    episode_id: str = Field(..., description="Flat record identifier")
    show_title: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    section: str | None = Field(default=None)
    categories: List[str] = Field(default_factory=list)
    synopsis: str | None = Field(default=None)
    season_number: int = Field(..., ge=0)
    episode_number: int = Field(..., ge=0)
    episode_title: str = Field(..., min_length=1)
    duration_seconds: int = Field(..., ge=0)
    language: str = Field(..., min_length=1)
    content_group: str = Field(..., min_length=1)
    status: str = Field(..., pattern="^(published|draft)$")
    artwork_available: List[str] = Field(default_factory=list)

class SeedImportInput(BaseModel):
    records: List[SeedRecord]
