# Plano de Migração para FastAPI Monolítico

## Contexto e Objetivos
- Substituir o backend Supabase atual por um serviço FastAPI administrando autenticação, regras de negócio (assets, transações, blog) e integrações externas (cotações) em um único repositório.
- Manter o frontend React existente, exposto pelo mesmo domínio via Docker Compose (reverse proxy ou portas distintas) para facilitar deploys e DX.
- Garantir que migrations, scripts e config de infraestrutura fiquem versionados na pasta `docs/` e `docker/`.

## Arquitetura-Alvo
1. **Containers**: `api` (FastAPI + Uvicorn), `web` (Vite build servido via Nginx), `db` (Postgres 15), `redis` (cache e fila opcional), `worker` (processa tarefas de cotações ou emails).
2. **Rede interna**: comunicação via bridge no Compose, expondo apenas nginx (porta 80/443) e, em dev, Vite (`5173`) + API (`8000`).
3. **Persistência**: volumes nomeados para `postgres_data` e `redis_data`.
4. **Configuração**: `.env` raiz contendo variáveis compartilhadas; `api/.env` referenciando credenciais (POSTGRES_DSN, JWT_SECRET, SUPABASE_KEYS se ainda necessários para import).

## Fases de Implementação
### Fase 1 — Fundamentos
- Criar pasta `api/` com FastAPI, Poetry/uv pip, estrutura `app/main.py`, `app/core/settings.py`, `app/models`, `app/api/v1`.
- Traduzir `docs/supabase-schema.sql` em migrations Alembic, mantendo triggers críticos (p. ex. `recalculate_average_price`). Adicionar seeds para dados mínimos.
- Definir modelos SQLAlchemy + pydantic schemas para `profiles`, `assets`, `transactions`, `blog_posts`.

### Fase 2 — Serviços e Autenticação
- Implementar fluxo OAuth2 + JWT (access + refresh) com tabelas `users`/`profiles`; considerar integração social futura via authlib.
- Criar routers para CRUD de assets/transações e agregações (views `portfolio_summary`, `portfolio_allocation` como queries SQLAlchemy/CTE).
- Migrar função `get-quote` para serviço interno (rota `/quotes/batch` + tarefa worker) com caching Redis e timeout configurável.

### Fase 3 — Integração Frontend
- Expor OpenAPI e gerar cliente TypeScript (via `openapi-typescript` ou `orval`) para atualizar hooks React Query.
- Ajustar chamadas do frontend para usar o novo client e JWT storage (refresh automático). Documentar contratos na pasta `docs/api-contracts`.
- Sincronizar assets estáticos: build Vite (`npm run build`) empacotado em imagem `web` servida por Nginx com gzip/cache rules.

### Fase 4 — Observabilidade e Segurança
- Adicionar middlewares de logging estruturado, CORS, rate limiting (slowapi) e tracing (OpenTelemetry opcional).
- Configurar testes: `pytest` + `pytest-asyncio`, coverage mínimo 80% em serviços críticos, pipeline `docker compose run api pytest`.
- Implementar scripts de backup e restauração do Postgres e rotação de segredos.

## Docker Compose
```yaml
services:
  db:
    image: postgres:15
    env_file: .env
    volumes: [postgres_data:/var/lib/postgresql/data]
  redis:
    image: redis:7
  api:
    build: ./api
    env_file:
      - .env
      - api/.env
    depends_on: [db, redis]
  worker:
    build: ./api
    command: ["celery", "-A", "app.worker", "worker", "-l", "info"]
    depends_on: [api, redis]
  web:
    build: ./web
    depends_on: [api]
  proxy:
    image: nginx:alpine
    volumes: [./docker/nginx.conf:/etc/nginx/nginx.conf:ro]
    depends_on: [web, api]
volumes:
  postgres_data:
  redis_data:
```

## Próximos Passos
1. Aprovar esta arquitetura e detalhar tickets por fase (migrations, auth, quotes, docker).
2. Provisionar ambientes (dev/stage/prod) com Compose ou infraestrutura equivalente (Render, Railway, ECS).
3. Planejar janela de migração: exportar dados Supabase, importar no Postgres novo, validar com smoke tests frontend + API.

## Status Atual (Fase 1)
- Estrutura FastAPI criada em `api/` com configuração de ambientes (`app/core/settings.py`) e sessão SQLAlchemy.
- Modelos `User`, `Profile`, `Asset`, `Transaction`, `BlogPost` definidos como espelho do Supabase, com migrations Alembic incluindo índices, triggers e views.
- Autenticação com refresh tokens + bootstrap automático de superusuário, endpoints de perfil, assets, transações, blog, métricas/allocations e cotações (sincronas e jobs Celery) disponíveis em `/api/v1`.
- Script `api/scripts/seed_admin.py` disponível para criação de superusuários e instruções atualizadas em `api/README.md`.
- Dockerfiles de API e frontend, mais compose files (`docker-compose.yml` e `docker-compose.dev.yml`) descrevendo o monolito completo (db, redis, api, worker Celery, frontend). O modo dev espelha produção apenas mudando comandos para hot reload.

## Opções de Ambiente
- **Produção/Stage**: `docker compose up --build` — constrói imagens (API FastAPI, worker Celery, frontend Nginx) e usa Postgres/Redis nomeados. Ideal para staging/produtos.
- **Desenvolvimento**: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build` — reutiliza a mesma topologia porém com `uvicorn --reload`, Celery com `--pool solo` e Vite dev server em `:5173`, mantendo paridade de serviços e variáveis com produção.
