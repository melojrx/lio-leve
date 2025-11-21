"""Schemas de ativos."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import AssetType


class AssetBase(BaseModel):
    ticker: str
    name: str
    asset_type: AssetType
    sector: str | None = None
    quantity: float | None = 0
    average_price: float | None = 0
    is_active: bool = True


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    ticker: str | None = None
    name: str | None = None
    asset_type: AssetType | None = None
    sector: str | None = None
    is_active: bool | None = None


class AssetRead(AssetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
