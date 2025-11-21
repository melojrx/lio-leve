"""Script simples para criar um usuário administrador."""
from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.user_service import create_user, get_user_by_email
from app.schema.user import UserCreate


def seed_admin(email: str, password: str, full_name: str | None = None) -> None:
    session: Session = SessionLocal()
    try:
        existing = get_user_by_email(session, email)
        if existing:
            print("Usuário já existe, abortando.")
            return
        user = create_user(
            session,
            UserCreate(email=email, password=password, full_name=full_name),
            is_superuser=True,
        )
        print(f"Usuário administrador criado: {user.email}")
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed de usuário admin")
    parser.add_argument("email", help="E-mail do admin")
    parser.add_argument("password", help="Senha do admin")
    parser.add_argument("--full-name", dest="full_name", default=None)
    args = parser.parse_args()
    seed_admin(args.email, args.password, args.full_name)
