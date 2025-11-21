"""Dependências reutilizáveis das rotas."""
from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_session
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_db() -> Session:
    yield from get_session()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        subject: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")
    except Exception:  # jwt.InvalidTokenError
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    if not subject:
        raise HTTPException(status_code=401, detail="Token inválido")
    if token_type != "access":
        raise HTTPException(status_code=401, detail="Token inválido para esta operação")

    try:
        user_id = uuid.UUID(subject)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Token inválido") from exc

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário inativo ou inexistente")
    return user
