"""Rotas de autenticação."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models import User
from app.schema.auth import (
    PasswordChangePayload,
    PasswordResetPayload,
    PasswordResetRequest,
    PasswordResetResponse,
    RefreshRequest,
    Token,
)
from app.schema.user import UserCreate, UserRead
from app.services.user_service import authenticate, create_user, get_user_by_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    try:
        user = create_user(db, user_in)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return user


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    user = authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh_access_token(payload: RefreshRequest, db: Session = Depends(get_db)) -> Token:
    try:
        decoded = decode_token(payload.refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token inválido") from None

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token inválido")

    subject = decoded.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Token inválido")

    try:
        user_id = uuid.UUID(str(subject))
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Token inválido") from exc

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário inválido")

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/request-password-reset", response_model=PasswordResetResponse)
def request_password_reset(payload: PasswordResetRequest, db: Session = Depends(get_db)) -> PasswordResetResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        return PasswordResetResponse(reset_token=None)

    token = create_reset_token(subject=str(user.id))
    return PasswordResetResponse(reset_token=token)


@router.post("/reset-password", response_model=Token)
def reset_password(payload: PasswordResetPayload, db: Session = Depends(get_db)) -> Token:
    try:
        decoded = decode_token(payload.reset_token)
    except Exception:
        raise HTTPException(status_code=400, detail="Token de reset inválido ou expirado") from None

    if decoded.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Token inválido para reset de senha")

    subject = decoded.get("sub")
    if not subject:
        raise HTTPException(status_code=400, detail="Token inválido")

    try:
        user_id = uuid.UUID(str(subject))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Token inválido") from exc

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=400, detail="Usuário não encontrado")

    user.hashed_password = get_password_hash(payload.new_password)
    db.add(user)
    db.commit()

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
