# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

**Investorion.com.br** é um aplicativo de gerenciamento de carteiras de investimento de baixo custo e extremamente informativo. O projeto visa criar um MVP (Produto Mínimo Viável) para consolidação e acompanhamento de carteiras de investimentos.

**⚠️ IMPORTANTE**: O projeto está em migração de Django para Supabase. O backend Django foi removido e o projeto agora usa Supabase como backend.

## Regras

- Não crie documentação sem que o usuário solicite.
- Não faça commits sem que o usuário solicite. 
- Não informe que uma funcionalidade está finalizada antes de testar. 

## Comandos de Desenvolvimento

### Scripts disponíveis
- `npm run dev` - Inicia o servidor de desenvolvimento na porta 5173
- `npm run build` - Executa build de produção com Vite
- `npm run build:dev` - Executa build em modo desenvolvimento
- `npm run lint` - Executa ESLint para verificação de código
- `npm run preview` - Visualiza o build de produção

### Variáveis de Ambiente
- `VITE_SUPABASE_URL` - URL do projeto Supabase (ex: https://xxx.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Chave pública (anon) do Supabase
- `VITE_APP_NAME` - Nome da aplicação (padrão: Investorion)

### Comandos frequentes de desenvolvimento
```bash
# Desenvolvimento local
npm run dev

# Verificar problemas de linting antes de commit
npm run lint

# Build para produção
npm run build
```

## Arquitetura do Projeto

### Stack Tecnológico
- **Frontend**: React 18 com TypeScript
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Autenticação**: Supabase Auth
- **UI Components**: shadcn/ui + Radix UI
- **Estilização**: Tailwind CSS
- **State Management**: React Query (TanStack Query) + Context API
- **Roteamento**: React Router
- **Gráficos**: Recharts

### Estrutura da Aplicação

#### Autenticação e API
- `src/lib/supabase.ts` - Cliente Supabase configurado
- `src/contexts/AuthContext.tsx` - Gerencia estado de autenticação via Supabase Auth
- `src/types/database.types.ts` - Tipos TypeScript gerados do schema Supabase
- Sistema de autenticação baseado em Supabase Auth com sessões persistentes
- Auto-refresh de sessão gerenciado pelo Supabase

#### Layout e Componentes
- `src/components/layout/AppShell.tsx` - Layout principal que envolve todas as páginas
- `src/components/ui/` - Componentes shadcn/ui reutilizáveis
- Todas as páginas são envolvidas pelo `AppShell` que inclui Header, Footer e SuggestionsWidget

#### Páginas Principais (MVP)
- `src/pages/Index.tsx` - Página inicial/landing
- `src/pages/auth/Login.tsx` - Login com email/senha
- `src/pages/auth/Register.tsx` - Cadastro com nome, sobrenome, email e senha
- `src/pages/Dashboard.tsx` - Dashboard principal com gráficos de patrimônio
- `src/pages/Portfolio.tsx` - Visualização da carteira de investimentos
- `src/pages/Transactions.tsx` - Histórico de transações
- `src/pages/Mercado.tsx` - Informações de mercado e cotações

#### Funcionalidades Implementadas
✅ UI completa com shadcn/ui
✅ Layout responsivo
✅ Páginas estruturadas (Dashboard, Portfolio, Transactions, Mercado)
✅ Estrutura de componentes e rotas

#### Funcionalidades Em Implementação
- [ ] Autenticação com Supabase
- [ ] CRUD de ativos (assets)
- [ ] CRUD de transações
- [ ] Dashboard consolidado com métricas
- [ ] Cotações em tempo real (Edge Functions)
- [ ] Gráficos de composição da carteira
- [ ] Sistema de blog

#### Integração com APIs Externas
- `src/lib/market.ts` - Funções para buscar dados de:
  - Câmbio (AwesomeAPI)
  - Ações brasileiras (brapi.dev)
  - Dados macroeconômicos (Banco Central do Brasil)

#### Configurações de Desenvolvimento
- Configuração do Vite com alias `@/` para `./src/`
- ESLint configurado com regras para React e TypeScript
- TypeScript com configurações permissivas para desenvolvimento rápido
- Tailwind com tema customizado usando CSS variables

### Backend (Supabase)

O backend é totalmente gerenciado pelo Supabase:

#### Banco de Dados (PostgreSQL)
- `profiles` - Perfis de usuário (estende auth.users)
- `assets` - Ativos da carteira
- `transactions` - Transações de compra/venda
- `blog_posts` - Posts do blog

#### Views SQL
- `portfolio_summary` - Resumo consolidado do portfolio
- `portfolio_allocation` - Alocação por tipo de ativo

#### Triggers Automáticos
- Auto-criação de perfil ao registrar usuário
- Recálculo automático de preço médio (FIFO) nas transações
- Atualização automática de `updated_at`

#### Row Level Security (RLS)
- Políticas configuradas para garantir que usuários só acessem seus próprios dados
- Posts do blog públicos para leitura, privados para escrita

#### Edge Functions (A implementar)
- `get-quote` - Buscar cotações de ativos
- Integração com APIs externas (Brapi, CoinGecko, AwesomeAPI)

Ver schema completo em: `docs/supabase-schema.sql`

### Padrões de Código
- Componentes React funcionais com TypeScript
- Hooks customizados em `src/hooks/`
- Context API para gerenciamento de estado global
- shadcn/ui para componentes consistentes
- Tailwind classes para estilização
- Tratamento de erros consistente com toast notifications

### Observações de Desenvolvimento
- Service Worker registrado apenas em produção
- TypeScript configurado com verificações relaxadas para desenvolvimento rápido
- Supabase gerencia cache e otimizações de queries automaticamente
- **Projeto migrado de Django para Supabase** - Ver `DYAD_INSTRUCTIONS.md` para próximos passos