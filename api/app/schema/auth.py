"""Schemas relacionados a autenticação."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str


class TokenPayload(BaseModel):
    sub: UUID
    exp: datetime
    type: str


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetResponse(BaseModel):
    reset_token: str | None = None


class PasswordResetPayload(BaseModel):
    reset_token: str
    new_password: str


class PasswordChangePayload(BaseModel):
    current_password: str
    new_password: str
