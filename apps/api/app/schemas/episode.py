"""Episode schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EpisodeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    episode_number: int | None = Field(default=None, ge=0)
    duration_seconds: int | None = Field(default=None, ge=0)
    language: str = Field(..., min_length=1, max_length=10)
    content_group: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")

    model_config = ConfigDict(populate_by_name=True)


class EpisodeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    episode_number: int | None = Field(default=None, ge=0)
    duration_seconds: int | None = Field(default=None, ge=0)
    language: str | None = Field(default=None, min_length=1, max_length=10)
    content_group: str | None = Field(default=None, min_length=1, max_length=100)
    status: str | None = Field(default=None, pattern="^(draft|published|archived)$")

    model_config = ConfigDict(populate_by_name=True)


class EpisodeResponse(BaseModel):
    id: int
    season_id: int
    title: str | None
    description: str | None
    episode_number: int | None
    duration_seconds: int | None
    language: str
    content_group: str
    status: str
    video_storage_key: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
