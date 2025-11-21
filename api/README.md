# Investorion API

Backend FastAPI monolítico que substituirá o Supabase. Requisitos mínimos: Python 3.11 e Postgres 15 acessível.

## Setup local
```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e .[dev]
cp .env.example .env  # (crie este arquivo com DATABASE_URL, SECRET_KEY etc.)
```

Variáveis suportadas: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`, `FIRST_SUPERUSER_EMAIL`, `FIRST_SUPERUSER_PASSWORD`, `FIRST_SUPERUSER_FULL_NAME`, `BROKER_URL`, `RESULT_BACKEND` (Redis padrão em Docker).

## Comandos úteis
- `alembic upgrade head` — aplica o schema inicial (tabelas, índices, views e triggers descritas em `docs/supabase-schema.sql`).
- `uvicorn app.main:app --reload` — sobe a API em `http://localhost:8000` com hot reload (cria superusuário inicial automaticamente se variáveis estiverem definidas).
- `pytest` — (futuro) roda a suíte de testes.
- `python scripts/seed_admin.py admin@investorion.com senha123` — cria um usuário administrador usando o banco configurado.
- `celery -A app.worker.celery_app worker -l info` — sobe o worker para processar tasks (cotações, jobs futuros).

### Docker / Compose
```bash
cp api/.env.docker.example api/.env.docker
docker compose up --build
# ou ambiente de desenvolvimento com hot reloads
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
Serviços provisionados:
- `db` (Postgres 15) e `redis` (broker/resultados do Celery)
- `api` (FastAPI) e `worker` (Celery) usando a mesma imagem Python.
- `web` (Nginx) servindo o build do Vite e proxyando `/api` → `api:8000` quando rodando apenas `docker-compose.yml` (modo produção). No modo dev (`docker-compose.dev.yml`) a aplicação roda com Vite (`http://localhost:5173`) com hot reload, mas mantém a topologia idêntica (db/redis/api/worker).

## Estrutura
- `app/core` — configurações e utilitários (CORS, segurança JWT, sessão do banco).
- `app/models` — modelos SQLAlchemy equivalentes ao schema Supabase.
- `app/api/v1` — routers FastAPI (`/auth`, `/profile`, `/assets`, `/transactions`, `/blog`, `/dashboard`, `/quotes`). `POST /auth/token` retorna access+refresh tokens, `POST /auth/refresh` renova o par e `/quotes/jobs` agenda buscas assíncronas via Celery.
- `app/schema` — contratos Pydantic usados pelo frontend/React Query.
- `app/worker` — configuração do Celery e tasks (ex.: `quotes.fetch_batch`).
- `alembic/` — migrations versionadas.
