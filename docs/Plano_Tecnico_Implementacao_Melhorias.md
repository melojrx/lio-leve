## Plano Técnico e Melhorias – investorion.com.br

Este documento consolida o plano de evolução (MVP e pós-MVP) do aplicativo de investimentos, integrando o roteiro estratégico existente ("Plano de Desenvolvimento_ MVP do Aplicativo de Investimentos.md") com recomendações técnicas adicionais para um backend profissional em **Django REST Framework (DRF)** e aprimoramentos estruturais no frontend (React + Vite).

---
### 1. Objetivos do Produto
Fornecer uma plataforma unificada para cadastro, consolidação e acompanhamento de carteiras de investimento (multi‑classes: renda fixa, ações, cripto, fundos, etc.), incluindo métricas de desempenho, composição, histórico de transações, proventos (pós-MVP) e dados de mercado em tempo quase real.

---
### 2. Escopo do MVP (Refinado)
| Bloco | Descrição | Observações Técnicas |
|-------|-----------|----------------------|
| Autenticação & Onboarding | Registro, login, recuperação de senha, fluxo inicial | DRF JWT + custom user (email como username) + throttling |
| Cadastro Manual de Ativos | Inserção de ativos multi-classe com validação de ticker | Serviço /validate-ticker; normalização de símbolos |
| Dashboard Consolidado | Patrimônio, variação diária, filtros 1D/1M/1A | Agregações calculadas no backend + cache curto |
| Carteira Detalhada | Listagem de ativos com preço médio, preço atual e P/L | Preço médio derivado de Transações; preço atual via serviço de cotações |
| Histórico de Transações | CRUD + filtros por período/classe | Paginação e ordenação; índices DB |
| Gráficos de Composição | Alocação por classe e setor | Endpoint /portfolio/allocation (agrupamentos SQL) |
| Cotações em Tempo Real (near-real) | Polling & cache de múltiplas fontes | Serviço agregador + fallback + Redis |
| Contato (Fale Conosco) | mailto + registro opcional de feedback | Endpoint /feedback opcional (rate limited) |

Pós-MVP: Proventos (dividendos), Integração CEI/B3, Notícias e Comparadores, Importação automática de notas.

---
### 3. Arquitetura Geral (MVP Web PWA)
```
┌─────────────────────┐        ┌──────────────────────────┐
│  Frontend (Vite)    │  HTTPS │   Backend API (DRF)      │
│  React + Query      │ <----> │  Django + DRF + JWT      │
│  Tailwind / Shadcn  │        │  PostgreSQL / Redis      │
└────────┬────────────┘        └────────┬─────────────────┘
         │  CDN (assets estáticos)       │
         │                                │ Cron / Celery (atualização cotações)
         ▼                                ▼
   Navegador PWA                 Serviços externos (Brapi, CoinGecko, BCB, etc.)
```

**Escopo Inicial (MVP)**
- **Frontend Web PWA**: SPA (Vite + React) com Progressive Web App habilitado (service worker em produção) e code splitting gradual. Foco em navegadores desktop/mobile, instalável em dispositivos.
- **Backend**: API REST stateless (exceto refresh tokens). Redis para cache e fila (via Celery) de cotações e sincronizações.
- **Sem aplicativo mobile nativo no MVP** – toda a experiência inicial acontece via Web PWA.

**Evolução Pós-MVP**
- **Aplicativo Mobile (React Native / Expo)**: embalagem das mesmas funcionalidades centrais consumindo a mesma API; compartilhamento de modelos e validações (ex.: extrair esquema Zod/JSON Schemas reutilizáveis). Sincronização offline (query cache persistido + storage seguro) e push notifications para alertas de mercado e proventos.

---
### 4. Modelagem de Dados (Backend DRF)
Resumo de modelos propostos:

| Modelo | Campos Principais | Notas |
|--------|-------------------|-------|
| User (Custom) | email (unique), first_name, last_name | Autenticação JWT |
| Portfolio | user (OneToOne), target_passive_income (decimal) | Campos de metas |
| Asset | user FK, ticker, type (enum), sector, status, created_at | Soft delete (status) |
| Transaction | asset FK, type (BUY/SELL/TRANSFER), quantity, unit_price, date, fees | Calcula preço médio |
| Dividend (pós) | asset FK, amount, ex_date, pay_date, kind | Para proventos |
| PriceSnapshot | ticker, source, price, currency, at (timestamp) | Histórico básico/memo |
| Feedback (opc.) | user FK (nullable), message, created_at, metadata | Rate limiting |

Índices: (asset.user, asset.type), (transaction.asset, date), price_snapshot (ticker, at DESC).

---
### 5. Endpoints Principais (MVP)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Criação de conta |
| POST | /auth/login | JWT obtain pair |
| POST | /auth/refresh | Refresh token |
| GET  | /auth/user | Perfil do usuário logado |
| GET  | /portfolio/summary | Patrimônio, variação, KPIs |
| GET  | /portfolio/allocation | Composição por classe / setor |
| GET  | /assets/ | Listar ativos |
| POST | /assets/ | Criar ativo |
| GET  | /assets/{id} | Detalhe |
| PATCH| /assets/{id} | Atualizar |
| DELETE| /assets/{id} | Soft delete |
| GET  | /transactions/?asset= | Listar transações (paginado) |
| POST | /transactions/ | Criar |
| DELETE | /transactions/{id} | Excluir |
| GET  | /market/quotes?tickers= | Cotações agregadas |
| GET  | /market/validate-ticker?t= | Validação de ticker |

Pós-MVP: /dividends/, /cei/import/, /news/, /comparisons/.

---
### 6. Serviços de Cotações
Camada "QuoteService" orquestra chamadas externas (Brapi, CoinGecko, BCB). Estratégia:
1. Consultar cache Redis.
2. Se desatualizado (> interval per source) enfileirar atualização (Celery) e retornar último valor conhecido.
3. Fallback cadeia: Primário -> Secundário -> Último snapshot persistido.

TTL sugerido:
- Ações/Índices: 30–60s durante pregão.
- FX: 30s.
- Cripto: 15s.
- Macro: 6h (ou até nova referência oficial).

---
### 7. Cálculo de Métricas
- Preço Médio: método FIFO sobre transações BUY/SELL.
- Rentabilidade Bruta: (valor_atual - total_investido) / total_investido.
- Rentabilidade por Período: snapshots agregados + transações (ou cálculo on-demand + cache).
- Alocação: SUM(current_position) GROUP BY type/sector.

---
### 8. Segurança
- JWT com refresh rotation + blacklist.
- Rate limiting DRF (anon/login) e throttling custom para /market/.
- HTTPS enforced; HSTS; cookies httpOnly se migrar de localStorage.
- Política CORS restritiva (origens confiáveis).
- Sanitização e validação robusta (DRF serializers + regex tickers).
- Monitoramento de erros (Sentry).

---
### 9. Performance & Escalabilidade
- N+1: usar select_related / prefetch_related.
- Paginacão cursor-based para grandes listas de transações.
- Cache de queries agregadas (allocation, summary) com chave por usuário + invalidação em nova transação.
- Celery + Redis para jobs (atualizações de cotações, importações CEI, agregações periódicas).

---
### 10. Observabilidade
- Logging estruturado (JSON) – gunicorn + DRF middleware.
- Métricas (Prometheus ou StatsD) para latência, cache hit ratio, erros por endpoint.
- Tracing opcional (OpenTelemetry) se crescer complexidade.

---
### 11. Frontend – Melhorias Planejadas
| Área | Ação | Prioridade |
|------|------|------------|
| Proteção de Rotas | Reativar RequireAuth + lazy routes | Alta |
| Modularização Carteira | Extrair wizard e componentes menores | Alta |
| Gestão de Estado | Reagir menos a re-renders (memoização + seletor) | Média |
| Code Splitting | `React.lazy` por página | Média |
| SEO/APP Name Dinâmico | Usar VITE_APP_NAME em títulos | Média |
| Acessibilidade | aria-* nos botões de favoritos / stepper | Média |
| Testes | Vitest + RTL (smoke + lógica cálculo) | Alta |
| Mocks | Gateado por VITE_ENABLE_MOCKS (fixtures de cotações) | Média |
| Formatação | util único para moeda, porcentagem, datas | Alta |
| Error Boundary | Captura global + fallback amigável | Alta |

---
### 12. Roadmap Técnico Proposto (Sprint View – MVP Web)
**Semana 1:** Backend bootstrap (User, Auth, Asset, Transaction), Docker dev, endpoints básicos.  
**Semana 2:** Transaction logic (preço médio), summary/allocation endpoints, cache Redis, serviço cotações inicial.  
**Semana 3:** Frontend integra backend (auth real, carteira via API), refatoração Portfolio, RequireAuth, code splitting.  
**Semana 4:** Mercado consumindo /market/quotes, testes backend + frontend, ErrorBoundary, mocks.  
**Semana 5:** Otimizações (cache, throttling), acessibilidade, SEO dinâmico, logging/monitoring (Sentry).  
**Semana 6:** Hardening segurança, métricas, preparação deploy prod (CI/CD + infra).  

### 12.1 Pós-MVP (Início do Mobile)
**Fase Mobile 1:** Setup monorepo (opcional) ou repositório dedicado RN/Expo, autenticação compartilhada, sincronização de carteira (somente leitura + cadastro simples).  
**Fase Mobile 2:** Funcionalidades de transações completas, proventos (quando disponível), push notifications.  
**Fase Mobile 3:** Recursos offline-first (cache persistente, fila de transações offline) e otimizações de performance.

---
### 13. Infraestrutura de Produção
- Docker Compose prod: web (Gunicorn), worker (Celery), redis, postgres, nginx (reverse proxy + static).  
- Deploy: VPS / Cloud (DigitalOcean, Render, Fly.io) com pipeline CI (GitHub Actions) executando: lint -> testes -> build -> push -> migrate -> deploy.
- Backup: pg_dump diário + retenção 7/30 dias.

---
### 14. Variáveis de Ambiente (Frontend)
| Nome | Default Dev | Uso |
|------|-------------|-----|
| VITE_API_BASE_URL | http://localhost:8000/api | Base das requisições REST |
| VITE_APP_NAME | investorion.com.br | Branding / títulos |
| VITE_POLL_INTERVAL_DEFAULT | 10000 | Fallback para polling genérico |
| VITE_ENABLE_MOCKS | false | Ativa camada de mocks |

Backend (exemplos): `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `JWT_ACCESS_LIFETIME`, `JWT_REFRESH_LIFETIME`.

---
### 15. Testes
- **Backend**: pytest + coverage; factories (factory_boy).  
- **Frontend**: Vitest + RTL; testes de componentes críticos e hooks (auth, cálculo).  
- **E2E**: Playwright (fluxo login -> adicionar transação -> verificar dashboard).  

Métricas alvo: ≥80% critical logic (preço médio, allocation). 

---
### 16. Riscos & Mitigações (Resumo)
| Risco | Mitigação |
|-------|-----------|
| APIs externas instáveis | Fallback + cache + circuit breaker simples |
| Crescimento de latência | Cache + índices DB + profiling trimestral |
| Vazamento tokens | Migrar para cookies httpOnly + rotacionar refresh |
| Dados inconsistentes transações | Transações atômicas + locks otimizados (select_for_update) |

---
### 17. Próximos Passos Imediatos (Ajustados para PWA Primeiro)
1. Criar repositório backend e provisionar Docker base.  
2. Implementar modelos iniciais + autenticação JWT.  
3. Refatorar frontend PWA para consumir assets/transactions reais.  
4. Introduzir testes automáticos e pipeline CI.  
5. Ativar monitoramento (Sentry) e logging estruturado.  
6. Planejar arquitetura compartilhada para futura camada mobile (decidir monorepo vs repos separados).

---
Documento vivo: atualizar a cada incremento significativo.
