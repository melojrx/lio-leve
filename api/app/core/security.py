"""Funções utilitárias de segurança e autenticação."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from app.core.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_token(
    subject: str,
    *,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    expire = datetime.now(tz=timezone.utc) + expires_delta
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    return create_token(subject, token_type="access", expires_delta=delta)


def create_refresh_token(subject: str, expires_delta: timedelta | None = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.refresh_token_expire_minutes)
    return create_token(subject, token_type="refresh", expires_delta=delta)


def create_reset_token(subject: str, expires_delta: timedelta | None = None) -> str:
    delta = expires_delta or timedelta(minutes=settings.password_reset_expire_minutes)
    return create_token(subject, token_type="reset", expires_delta=delta)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
