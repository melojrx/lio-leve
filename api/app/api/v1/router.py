"""Routes da versão 1 da API."""
from fastapi import APIRouter

from app.api.v1.endpoints import assets, auth, blog, dashboard, profile, quotes, suggestions, transactions

api_router = APIRouter(prefix="/v1")


@api_router.get("/status", tags=["infra"])
def api_status() -> dict[str, str]:
    return {"version": "v1", "message": "API Investorion operacional"}


api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(assets.router)
api_router.include_router(transactions.router)
api_router.include_router(blog.router)
api_router.include_router(dashboard.router)
api_router.include_router(quotes.router)
api_router.include_router(suggestions.router)
