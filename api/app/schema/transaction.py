"""Schemas de transações."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import TransactionType


class TransactionBase(BaseModel):
    asset_id: UUID
    transaction_type: TransactionType
    quantity: float
    unit_price: float
    fees: float = 0
    date: datetime
    notes: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    asset_id: UUID | None = None
    transaction_type: TransactionType | None = None
    quantity: float | None = None
    unit_price: float | None = None
    fees: float | None = None
    date: datetime | None = None
    notes: str | None = None


class TransactionRead(TransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
