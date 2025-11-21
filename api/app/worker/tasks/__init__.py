"""Exporta tasks para facilitar import."""
from app.worker.tasks.quotes import fetch_quotes_task

__all__ = ["fetch_quotes_task"]
