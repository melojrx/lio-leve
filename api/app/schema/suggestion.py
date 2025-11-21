"""Schemas do mural de sugestões."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import SuggestionKind


class SuggestionBase(BaseModel):
    title: str
    description: str
    kind: SuggestionKind


class SuggestionCreate(SuggestionBase):
    pass


class SuggestionRead(SuggestionBase):
    id: UUID
    user_id: UUID
    votes: int
    created_at: datetime

    model_config = {"from_attributes": True}
