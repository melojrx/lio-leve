"""Exports dos serviços."""
from app.services.user_service import authenticate, create_user, get_user_by_email

__all__ = ["authenticate", "create_user", "get_user_by_email"]
