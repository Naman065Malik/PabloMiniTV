"""Season schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SeasonCreate(BaseModel):
    season_number: int = Field(..., ge=0, description="0 = trailers")
    title: str | None = Field(default=None, max_length=255)

    model_config = ConfigDict(populate_by_name=True)


class SeasonUpdate(BaseModel):
    season_number: int | None = Field(default=None, ge=0)
    title: str | None = Field(default=None, max_length=255)

    model_config = ConfigDict(populate_by_name=True)


class SeasonResponse(BaseModel):
    id: int
    show_id: int
    season_number: int
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
