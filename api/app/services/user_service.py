"""Serviços relacionados a usuários."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import Profile, User
from app.schema.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email.lower())
    return db.execute(stmt).scalar_one_or_none()


def create_user(db: Session, user_in: UserCreate, is_superuser: bool = False) -> User:
    if get_user_by_email(db, user_in.email):
        raise ValueError("E-mail já cadastrado")

    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_superuser=is_superuser,
    )

    db.add(user)
    db.flush()  # garante que o ID do usuário seja gerado antes de criar o profile

    profile = Profile(id=user.id, email=user.email, full_name=user.full_name)
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def ensure_superuser(
    db: Session, *, email: str, password: str, full_name: str | None = None
) -> User:
    user = get_user_by_email(db, email)
    if user:
        if not user.is_superuser:
            user.is_superuser = True
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    return create_user(
        db,
        UserCreate(email=email, password=password, full_name=full_name),
        is_superuser=True,
    )
