"""Configuração do SQLAlchemy e sessão de banco."""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.settings import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

Base = declarative_base()


def get_session() -> Generator:
    """Dependência do FastAPI para fornecer uma sessão de banco por requisição."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
