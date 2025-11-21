"""Configurações centrais carregadas via variáveis de ambiente."""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "Investorion API"
    environment: str = Field(default="development", description="Nome do ambiente em execução")
    debug: bool = Field(default=True, description="Ativa modo debug do FastAPI")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/investorion",
        description="URL completa de conexão com PostgreSQL",
    )
    secret_key: str = Field(
        default="change-me",
        description="Chave secreta usada para assinar tokens JWT",
    )
    access_token_expire_minutes: int = Field(default=30, description="Duração do token JWT em minutos")
    algorithm: str = Field(default="HS256", description="Algoritmo usado no JWT")
    refresh_token_expire_minutes: int = Field(default=60 * 24 * 7, description="Duração do refresh token em minutos")
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ],
        description="Domínios permitidos para requisições cross-origin",
    )
    first_superuser_email: str | None = Field(default=None, description="E-mail do superusuário inicial")
    first_superuser_password: str | None = Field(default=None, description="Senha do superusuário inicial")
    first_superuser_full_name: str | None = Field(default=None, description="Nome do superusuário inicial")
    broker_url: str = Field(
        default="redis://redis:6379/0",
        description="Broker de mensagens usado pelo Celery",
    )
    result_backend: str = Field(
        default="redis://redis:6379/1",
        description="Backend de resultados do Celery",
    )
    media_root: str = Field(default="media", description="Diretório raiz para uploads de mídia (avatars etc.)")
    media_url: str = Field(default="/media", description="Prefixo público para servir arquivos de mídia")
    password_reset_expire_minutes: int = Field(default=30, description="Validade do token de reset de senha em minutos")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
