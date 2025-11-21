"""Endpoints para consulta de cotações em lote."""
from __future__ import annotations

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.schema.quote import (
    QuoteInput,
    QuoteJobResponse,
    QuoteJobStatus,
    QuoteResult,
)
from app.services.quote_service import fetch_quotes
from app.worker.celery_app import celery_app
from app.worker.tasks import fetch_quotes_task

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/batch", response_model=list[QuoteResult])
async def batch_quotes(
    assets: list[QuoteInput], current_user=Depends(get_current_user)
) -> list[QuoteResult]:
    if not assets:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lista de ativos vazia")

    return await fetch_quotes(assets)


@router.post("/jobs", response_model=QuoteJobResponse)
def enqueue_quote_job(
    assets: list[QuoteInput], current_user=Depends(get_current_user)
) -> QuoteJobResponse:
    if not assets:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lista de ativos vazia")

    task = fetch_quotes_task.delay([asset.model_dump() for asset in assets])
    return QuoteJobResponse(task_id=task.id)


@router.get("/jobs/{task_id}", response_model=QuoteJobStatus)
def quote_job_status(task_id: str, current_user=Depends(get_current_user)) -> QuoteJobStatus:
    result = AsyncResult(task_id, app=celery_app)
    payload = result.result if result.successful() else None
    return QuoteJobStatus(task_id=task_id, status=result.status, result=payload)
