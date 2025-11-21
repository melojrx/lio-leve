"""Agrupa os endpoints da versão 1."""
from . import assets, auth, blog, dashboard, profile, quotes, suggestions, transactions

__all__ = ["auth", "profile", "assets", "transactions", "blog", "dashboard", "quotes", "suggestions"]
