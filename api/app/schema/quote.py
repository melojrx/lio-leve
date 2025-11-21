"""Schemas para consulta de cotações."""
from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class QuoteAssetType(str, Enum):
    STOCK = "STOCK"
    CRYPTO = "CRYPTO"
    FX = "FX"


class QuoteInput(BaseModel):
    ticker: str = Field(..., examples=["PETR4", "BTC", "USD-BRL"])
    type: QuoteAssetType


class QuoteResult(BaseModel):
    symbol: str
    name: str | None = None
    price: float
    change_percent: float | None = None
    type: QuoteAssetType


class QuoteJobResponse(BaseModel):
    task_id: str


class QuoteJobStatus(BaseModel):
    task_id: str
    status: str
    result: list[QuoteResult] | None = None
