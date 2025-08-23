# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

**Investorion.com.br** é um aplicativo de gerenciamento de carteiras de investimento de baixo custo e extremamente informativo. O projeto visa criar um MVP (Produto Mínimo Viável) para consolidação e acompanhamento de carteiras de investimentos.

## Comandos de Desenvolvimento

### Scripts disponíveis
- `npm run dev` - Inicia o servidor de desenvolvimento na porta 8080
- `npm run build` - Executa build de produção com Vite
- `npm run build:dev` - Executa build em modo desenvolvimento
- `npm run lint` - Executa ESLint para verificação de código
- `npm run preview` - Visualiza o build de produção

### Variáveis de Ambiente
- `VITE_API_BASE_URL` - URL base da API Django (padrão: http://localhost:8000/api)

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
- **Backend**: Django com Django Rest Framework (DRF)
- **Autenticação**: JWT (JSON Web Tokens)
- **UI Components**: shadcn/ui + Radix UI
- **Estilização**: Tailwind CSS
- **State Management**: React Query (TanStack Query) + Context API
- **Roteamento**: React Router
- **Gráficos**: Recharts

### Estrutura da Aplicação

#### Autenticação e API
- `src/lib/api.ts` - Cliente API para comunicação com Django backend
- `src/contexts/AuthContext.tsx` - Gerencia estado de autenticação via JWT
- Sistema de autenticação baseado em tokens JWT armazenados no localStorage
- Refresh automático de tokens quando necessário

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
✅ Sistema de autenticação JWT
✅ Layout responsivo
✅ Páginas de login e cadastro
✅ Dashboard com gráficos
✅ Integração com APIs de cotações

#### Funcionalidades Planejadas (conforme docs/Plano de Desenvolvimento)
- [ ] Cadastro manual de ativos com validação de ticker
- [ ] CRUD completo de transações
- [ ] Cálculo automático de preço médio e rentabilidade
- [ ] Dashboard consolidado com filtros de período
- [ ] Cotações em tempo real com cache Redis
- [ ] Gráficos de composição da carteira

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

### Backend API Endpoints (Django)

Endpoints esperados da API Django:

#### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/user/` - Dados do usuário autenticado

#### Carteira e Transações
- `GET /api/portfolio/` - Dados da carteira
- `POST /api/transactions/` - Criar transação
- `GET /api/transactions/` - Listar transações
- `PUT /api/transactions/{id}/` - Atualizar transação
- `DELETE /api/transactions/{id}/` - Deletar transação

#### Validação e Cotações
- `GET /api/assets/validate-ticker/` - Validar ticker
- `GET /api/quotes/` - Cotações atuais

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
- Cache inteligente para cotações será implementado no backend
- Projeto em transição do Supabase para Django API