"""Endpoints de métricas do dashboard."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schema.dashboard import AllocationItem, AllocationResponse, PortfolioSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=PortfolioSummary)
def portfolio_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)) -> PortfolioSummary:
    query = text(
        "SELECT total_assets, total_invested, total_transactions FROM portfolio_summary WHERE user_id = :user_id"
    )
    result = db.execute(query, {"user_id": str(current_user.id)}).mappings().first()
    if result is None:
        return PortfolioSummary(total_assets=0, total_transactions=0, total_invested=0)
    return PortfolioSummary(**result)


@router.get("/allocation", response_model=AllocationResponse)
def portfolio_allocation(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
) -> AllocationResponse:
    query = text(
        """
        SELECT asset_type, asset_count, type_total, percentage
        FROM portfolio_allocation
        WHERE user_id = :user_id
        ORDER BY percentage DESC
        """
    )
    rows = db.execute(query, {"user_id": str(current_user.id)}).mappings().all()
    items = [AllocationItem(**row) for row in rows]
    return AllocationResponse(items=items)
