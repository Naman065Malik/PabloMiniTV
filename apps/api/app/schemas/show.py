"""Show schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ShowCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    section: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=100)

    model_config = ConfigDict(populate_by_name=True)


class ShowUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    status: str | None = Field(default=None, pattern="^(draft|published|archived)$")
    description: str | None = Field(default=None, max_length=5000)
    section: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=100)

    model_config = ConfigDict(populate_by_name=True)


class ShowResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str | None
    section: str | None
    category: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ShowListResponse(BaseModel):
    items: list[ShowResponse]
    page: int
    page_size: int
    total: int
