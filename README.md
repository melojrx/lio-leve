# investiorion.com.br — Plataforma de Investimentos

Aplicação moderna para acompanhamento de carteiras, sugestões de produto e cotações. Monorepo com frontend React/Vite e backend FastAPI posicionado para produção via Docker.

## Stack Atual
- **Frontend**: React 18 + TypeScript, Vite, Tailwind + shadcn/ui, React Router, TanStack Query, clsx/tailwind-merge.
- **Backend**: FastAPI + SQLAlchemy, Alembic (PostgreSQL), autenticação JWT, Celery/Redis para jobs (cotações).
- **Infra/Dev**: Docker Compose (db, redis, api, worker, web), ESLint/Tailwind plugins, Node 18+ (recomendado 20).
- **Docs**: `docs/supabase-schema.sql` mantém paridade com o esquema original do Supabase; o backend já usa SQLAlchemy/Alembic.

## Estrutura de Pastas
- `src/` — Vite + React. `components/ui` (shadcn), `components/layout` (Header/Footer/AppShell), `pages` (rotas), `hooks`/`contexts` (estado global), `lib` (API/http/config).
- `api/` — FastAPI. `app/api/v1` (rotas), `app/models` (SQLAlchemy), `alembic/versions` (migrações), `app/worker` (Celery).
- `docker/` — Dockerfile do web/Nginx.
- `docs/` — schema SQL, materiais de apoio.

## Como Rodar (Docker Compose)
```bash
# dev com hot reload (usa docker-compose + override dev)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# aplicar migrações
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm api alembic upgrade head
```
Serviços principais: API em `http://localhost:8000` (docs em `/docs`), frontend dev em `http://localhost:5173`, PostgreSQL em `5432`, Redis em `6379`.

## Como Rodar Localmente (sem Docker)
Frontend:
```bash
npm install
cp .env.example .env         # ajuste VITE_API_URL se necessário
npm run dev                  # http://localhost:5173
```
Backend:
```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip && pip install -e .[dev]
cp .env.docker.example .env  # edite DATABASE_URL, SECRET_KEY, CORS_ORIGINS etc.
alembic upgrade head
uvicorn app.main:app --reload  # http://localhost:8000
```
Worker (opcional em local): `celery -A app.worker.celery_app worker -l info --pool solo`.

## Variáveis de Ambiente Essenciais
- Frontend (`.env`): `VITE_API_URL` (ex.: `http://localhost:8000`), `VITE_APP_NAME`, `VITE_SUPABASE_URL/ANON_KEY` só se usar o schema legado.
- Backend (`api/.env` ou `.env.docker`): `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (lista separada por vírgula), `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_MINUTES`, `FIRST_SUPERUSER_EMAIL/FIRST_SUPERUSER_PASSWORD`, `BROKER_URL/RESULT_BACKEND` (Redis), `MEDIA_ROOT/MEDIA_URL` se customizar uploads.

## Rotina de Manutenção
- Migrações: `alembic upgrade head` (crie novas em `api/alembic/versions`). Se usar Supabase, replique alterações em `docs/supabase-schema.sql`.
- Lint/build frontend: `npm run lint`, `npm run build`, `npm run build:dev`.
- Sugestões: endpoints em `/api/v1/suggestions` (POST cria, POST `/:id/vote` vota) já expostos ao frontend via React Query.
- Logs/saúde: `/api/health` e `/api/v1/status`.

## Testes/QA manual sugeridos
- Autenticação: login, logout, recuperação/atualização de senha.
- Carteira: CRUD de ativos e transações, cálculo de preço médio.
- Dashboard/mercado: carregamento das métricas e cards.
- Mural de sugestões: criar sugestão, votar uma única vez, listar ordenação por votos/recência.
- Upload de avatar (media service) se configurado.

## Contato
Suporte: `suporte@orion.invest` • DPO: `dpo@investorion.com.br`

