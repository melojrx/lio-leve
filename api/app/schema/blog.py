"""Schemas para posts de blog."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BlogPostSummary(BaseModel):
    id: UUID
    title: str
    slug: str
    excerpt: str | None = None
    category: str
    cover_image: str | None = None
    published_at: datetime | None = None

    model_config = {"from_attributes": True}


class BlogPostDetail(BlogPostSummary):
    content: str
    author_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
