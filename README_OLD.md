<div align="center">
	<img src="docs/assets/logo.svg" alt="Logo investorion" height="72" />
	<h1>investorion.com.br – Plataforma de Acompanhamento de Investimentos</h1>
	<p>Dashboard unificado, carteira multi-ativos, cotações em tempo quase real e roadmap para proventos & integrações B3.</p>
</div>

---
## 1. Visão Geral
O objetivo do projeto é oferecer um hub simples e poderoso para investidores acompanharem patrimônio, composição da carteira, evolução histórica, além de consultar cotações de diferentes classes de ativos (ações, índices, cripto, câmbio e macro). O MVP foca no cadastro manual e consolidação básica; evoluções incluirão proventos, importação CEI/B3 e análises avançadas.

## 2. Principais Funcionalidades (MVP)
- Autenticação (login, registro, sessão persistente)
- Dashboard de patrimônio (gráficos e períodos)
- Carteira com cadastro manual (Poupança, Conta Corrente, Cripto) – persistência local (fase inicial)
- Histórico e composição (gráficos de alocação)
- Página Mercado (cotações via APIs públicas: FX, ações, macro, cripto)
- SEO básico + tema dark/light

### Pós-MVP Planejado
- Proventos (dividendos, JCP)
- Integração CEI/B3 (importação de notas / posições)
- Notícias / comparadores
- Aplicativo Mobile (React Native / Expo) consumindo a mesma API
- Importação automática e sincronização backend de todas as classes

## 3. Arquitetura Alta Nível
| Camada | Tecnologias | Observações |
|--------|-------------|-------------|
| Frontend (MVP) | Vite, React 18, TypeScript, Tailwind, shadcn-ui, React Router, React Query | PWA instalável; foco web primeiro |
| Backend | Django + DRF, PostgreSQL, Redis, Celery | JWT Auth, cache de cotações, agregações |
| Infra | Docker, Nginx, Gunicorn, CI/CD (GitHub Actions) | Deploy em VPS / cloud + observabilidade |
| Dados Externos | Brapi, CoinGecko, AwesomeAPI, BCB/SGS | Fallback + cache Redis |
| Mobile (Pós-MVP) | React Native / Expo | Reutiliza API, possíveis schemas compartilhados |

## 4. Estrutura de Pastas (Frontend)
```
src/
	components/        # Design system + componentes de layout
	contexts/          # Contextos (Auth, etc.)
	hooks/             # Hooks reutilizáveis
	lib/               # APIs, utils de domínio, storage local
	pages/             # Páginas (rotas)
	types/             # Tipos de domínio (Asset, etc.)
	config/            # Variáveis centralizadas (env.ts)
docs/                # Documentação (planos técnicos, MVP)
```

## 5. Variáveis de Ambiente (Frontend)
Crie um arquivo `.env.local` baseado em `.env.example`.

| Variável | Default | Descrição |
|----------|---------|-----------|
| VITE_API_BASE_URL | http://localhost:8000/api | URL base da API Django |
| VITE_APP_NAME | investorion.com.br | Nome usado em branding / SEO |
| VITE_POLL_INTERVAL_DEFAULT | 10000 | Intervalo padrão de polling (ms) |
| VITE_ENABLE_MOCKS | false | Ativa modo mocks (a implementar) |

## 6. Executando Localmente
Pré‑requisitos: Node 18+ (ou Bun). Para apenas visualizar frontend sem backend, os recursos de carteira funcionam via localStorage.

```bash
git clone <repo-url>
cd lio-leve
cp .env.example .env.local
npm install
npm run dev
# Acesse: http://localhost:8080
```

### Backend (Planejado – Django DRF)
Repositório separado (futuro). Endpoints esperados: `/auth/`, `/assets/`, `/transactions/`, `/portfolio/summary`, `/market/quotes`.

## 7. Testes (Planejado)
- **Frontend**: Vitest + React Testing Library (smoke components, hooks, lógicas de agregação).  
- **E2E**: Playwright (fluxo login → adicionar ativo → verificar dashboard).  

## 8. Roadmap Técnico (Resumo)
1. Backend base (User, Auth, Asset, Transaction) + Docker.
2. Integração frontend PWA → backend (remover storage local gradualmente).
3. Serviço de cotações centralizado + cache.
4. Otimizações PWA (code splitting, offline refinado) + testes.
5. Proventos & precificação detalhada (início Pós-MVP).
6. Integração CEI/B3 + importadores.
7. App Mobile (React Native/Expo) compartilhando autenticação e serviços.
8. Observabilidade (Sentry, métricas) e hardening segurança.

Detalhes completos: ver `docs/Plano_Tecnico_Implementacao_Melhorias.md`.

## 9. Melhores Práticas Implementadas / Planejadas
- Separação de responsabilidades (lib vs components vs pages)
- Tailwind tokens via CSS variables (temas)
- React Query para polling controlado
- Futuro: centralizar erros com ErrorBoundary e logging estruturado

## 10. Contribuição
1. Fork / branch feature (`feat/nome-feature`).
2. Commits semânticos (ex: `feat: adiciona endpoint de allocation`).
3. Pull Request com descrição clara e checklist.
4. Rodar lint & (futuramente) testes antes de abrir PR.

## 11. Desenvolvedor
**Desenvolvedor Full Stack:** Júnior Melo  
**GitHub:** [melojrx](https://github.com/melojrx)  
**LinkedIn:** [Perfil](https://www.linkedin.com/in/j%C3%BAnior-melo-a4817127/)  
**WhatsApp:** +55 85 96924-1833  

## 12. Licença
Definir (MIT recomendada). Adicionar arquivo LICENSE em etapa futura.

---
Documento vivo – mantenha sincronizado com a evolução do backend e novas features.
