"""Tasks Celery relacionadas a cotações."""
from __future__ import annotations

import asyncio

from app.schema.quote import QuoteInput
from app.services.quote_service import fetch_quotes
from app.worker.celery_app import celery_app


@celery_app.task(name="quotes.fetch_batch")
def fetch_quotes_task(assets: list[dict]) -> list[dict]:
    """Busca cotações em paralelo e armazena o resultado no backend do Celery."""
    parsed_assets = [QuoteInput(**asset) for asset in assets]
    results = asyncio.run(fetch_quotes(parsed_assets))
    return [quote.model_dump() for quote in results]
