"""Configuração do Celery para tarefas assíncronas."""
from __future__ import annotations

from celery import Celery

from app.core.settings import settings

celery_app = Celery("investorion")
celery_app.conf.broker_url = settings.broker_url
celery_app.conf.result_backend = settings.result_backend
celery_app.conf.task_routes = {
    "quotes.fetch_batch": {"queue": "quotes"},
}
celery_app.conf.task_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.result_serializer = "json"

# Importa módulos contendo tasks para registro automático
celery_app.autodiscover_tasks(["app.worker.tasks"])
