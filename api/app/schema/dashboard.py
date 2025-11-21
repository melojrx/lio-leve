"""Schemas para métricas do dashboard."""
from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel

from app.models.enums import AssetType


class PortfolioSummary(BaseModel):
    total_assets: int
    total_transactions: int
    total_invested: Decimal


class AllocationItem(BaseModel):
    asset_type: AssetType
    asset_count: int
    type_total: Decimal
    percentage: float


class AllocationResponse(BaseModel):
    items: list[AllocationItem]
