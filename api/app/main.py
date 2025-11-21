"""Ponto de entrada principal do FastAPI."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.settings import settings
from app.db.session import SessionLocal
from app.services.user_service import ensure_superuser

_DEV_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]


def _build_cors_origins() -> list[str]:
    """Une origens configuradas com hosts locais úteis em dev, evitando duplicatas."""
    origins = list(dict.fromkeys(settings.cors_origins))
    if settings.environment != "production":
        for origin in _DEV_CORS_ORIGINS:
            if origin not in origins:
                origins.append(origin)
    return origins


app = FastAPI(title=settings.project_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["infra"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")

media_path = Path(settings.media_root)
media_path.mkdir(parents=True, exist_ok=True)
app.mount(settings.media_url, StaticFiles(directory=media_path), name="media")


@app.on_event("startup")
def ensure_initial_superuser() -> None:
    if settings.first_superuser_email and settings.first_superuser_password:
        session = SessionLocal()
        try:
            ensure_superuser(
                session,
                email=settings.first_superuser_email,
                password=settings.first_superuser_password,
                full_name=settings.first_superuser_full_name,
            )
        finally:
            session.close()
