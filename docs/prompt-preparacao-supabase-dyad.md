# 🧹 PROMPT PREPARAÇÃO - INVESTORION PARA SUPABASE + DYAD

## 🎯 OBJETIVO

Você é um engenheiro de software especialista em refatoração e preparação de código. Sua missão é:

1. **REMOVER** toda a infraestrutura Django (backend, Docker, Nginx, configurações)
2. **MANTER** o frontend React intacto (componentes, UI, estrutura)
3. **PREPARAR** o código para integração com Supabase
4. **DOCUMENTAR** passo a passo para criação manual do banco Supabase
5. Deixar o projeto pronto para o **Dyad** (ferramenta de desenvolvimento IA) assumir

---

## 📁 ESTRUTURA ATUAL DO REPOSITÓRIO

```
investorion/
├── backend/                    # ❌ DELETAR TUDO
│   ├── accounts/
│   ├── portfolio/
│   ├── market/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # ✅ MANTER E LIMPAR
│   ├── src/
│   │   ├── components/        # ✅ Manter (shadcn/ui)
│   │   ├── contexts/          # 🔄 Limpar (remover AuthContext antigo)
│   │   ├── hooks/             # 🔄 Limpar (criar estrutura vazia)
│   │   ├── lib/               # 🔄 Limpar (remover api.ts, storage.ts)
│   │   ├── pages/             # ✅ Manter (Dashboard, Portfolio, etc)
│   │   ├── types/             # 🆕 Criar pasta vazia
│   │   └── main.tsx           # ✅ Manter
│   ├── package.json           # ✅ Manter
│   └── vite.config.ts         # ✅ Manter
├── docker-compose.yml          # ❌ DELETAR
├── Dockerfile                  # ❌ DELETAR
├── nginx/                      # ❌ DELETAR PASTA
├── .env.example               # 🔄 Atualizar (apenas vars frontend)
└── README.md                  # 🔄 Atualizar
```

---

## ✅ TAREFAS A EXECUTAR (EM ORDEM)

### **TAREFA 1: DELETAR Backend Django Completo**

**Arquivos e pastas a DELETAR**:

```bash
# Execute os comandos abaixo:

# 1. Deletar pasta backend inteira
rm -rf backend/

# 2. Deletar arquivos Docker
rm -f docker-compose.yml
rm -f Dockerfile
rm -f Dockerfile.prod

# 3. Deletar configurações Nginx
rm -rf nginx/

# 4. Deletar scripts de backend
rm -f backend.sh
rm -f start-backend.sh

# 5. Deletar arquivos de configuração de backend
rm -f .dockerignore
rm -f .python-version
rm -f pyrightconfig.json

# 6. Deletar environment files antigos
rm -f .env
rm -f .env.local
rm -f .env.production
```

**Crie um commit**:
```bash
git add .
git commit -m "chore: remove Django backend infrastructure"
```

---

### **TAREFA 2: Limpar Frontend - Remover Código Django-Dependente**

#### **2.1: Deletar arquivos antigos**

```bash
cd frontend/src

# Deletar arquivos de integração antiga
rm -f lib/api.ts          # API client Django antiga
rm -f lib/storage.ts      # localStorage mock
rm -f contexts/AuthContext.tsx  # Auth JWT manual
```

#### **2.2: Criar estrutura limpa**

```bash
# Criar pastas vazias para nova arquitetura
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/contexts
```

#### **2.3: Criar arquivos placeholder**

Crie os seguintes arquivos VAZIOS (apenas estrutura):

```typescript
// frontend/src/lib/supabase.ts
// TODO: Configurar cliente Supabase aqui
// Será implementado após criar projeto no Supabase

export const supabase = null as any
```

```typescript
// frontend/src/contexts/AuthContext.tsx
// TODO: Implementar AuthContext com Supabase
// Será implementado pelo Dyad

import { createContext } from 'react'

export const AuthContext = createContext(null)
export const AuthProvider = ({ children }: any) => children
export const useAuth = () => null
```

```typescript
// frontend/src/hooks/useAssets.ts
// TODO: Implementar hooks de Assets
// Será implementado pelo Dyad

export const useAssets = () => ({ data: [], isLoading: false })
export const useCreateAsset = () => ({ mutate: () => {} })
export const useDeleteAsset = () => ({ mutate: () => {} })
```

```typescript
// frontend/src/types/database.types.ts
// TODO: Gerar tipos do Supabase
// Comando: supabase gen types typescript --project-id XXX > src/types/database.types.ts

export type Database = {}
```

**Crie um commit**:
```bash
git add .
git commit -m "refactor: clean frontend and prepare for Supabase integration"
```

---

### **TAREFA 3: Atualizar Configurações do Projeto**

#### **3.1: Atualizar package.json (adicionar scripts úteis)**

```json
{
  "name": "investorion-frontend",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.14.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

**Note**: NÃO instale `@supabase/supabase-js` ainda. Isso será feito depois.

#### **3.2: Atualizar .env.example**

```bash
# .env.example

# Supabase (preencher após criar projeto)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Opcional
VITE_APP_NAME=Investorion
```

#### **3.3: Criar .gitignore atualizado**

```bash
# .gitignore

# Dependencies
node_modules/
frontend/node_modules/

# Build
frontend/dist/
frontend/.vite/

# Environment
.env
.env.local
.env.production
frontend/.env
frontend/.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Vercel
.vercel/

# Supabase (quando usar CLI)
supabase/.temp/
```

**Crie um commit**:
```bash
git add .
git commit -m "chore: update project configuration for Supabase architecture"
```

---

### **TAREFA 4: Atualizar README.md**

Substitua o conteúdo do README.md por:

```markdown
# 🚀 Investorion.com.br - Plataforma de Investimentos

Plataforma 100% gratuita para acompanhamento de carteiras de investimento com dados governamentais em primeira mão.

## 📊 Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** + shadcn/ui (UI components)
- **React Query** (TanStack Query)
- **React Router** (navegação)

### Backend (Supabase)
- **PostgreSQL** (database)
- **Supabase Auth** (autenticação)
- **Row Level Security** (segurança)
- **Edge Functions** (serverless)
- **Storage** (arquivos)

### Deploy
- **Vercel** (frontend)
- **Supabase Cloud** (backend)

---

## 🏗️ Status do Projeto

### ✅ Implementado
- [x] UI completa (componentes shadcn/ui)
- [x] Páginas: Dashboard, Portfolio, Transactions, Mercado
- [x] Layout responsivo
- [x] Estrutura de rotas

### 🔄 Em Implementação (via Dyad)
- [ ] Integração Supabase Auth
- [ ] CRUD de Assets
- [ ] CRUD de Transações
- [ ] Dashboard com métricas
- [ ] Cotações em tempo real (Edge Functions)
- [ ] Sistema de blog
- [ ] Deploy Vercel

---

## 🚀 Pré-requisitos

1. **Node.js** 18+ instalado
2. **Projeto Supabase** criado (ver instruções abaixo)
3. **Conta Vercel** (para deploy)

---

## 📝 Setup do Banco de Dados (Supabase)

### Passo 1: Criar Projeto Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `investorion-mvp`
   - **Database Password**: Gere uma senha forte
   - **Region**: `South America (São Paulo)` ⚠️ IMPORTANTE para latência
   - **Pricing Plan**: Free
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos (criação do banco)

### Passo 2: Copiar Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (começa com `eyJ...`)
3. Cole no arquivo `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://seu-projeto-aqui.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Passo 3: Criar Tabelas (SQL Editor)

1. No dashboard Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Copie e cole o SQL abaixo:

<details>
<summary>📄 SQL Completo - Schema Inicial (Clique para expandir)</summary>

```sql
-- ============================================
-- INVESTORION - SCHEMA COMPLETO
-- ============================================

-- 1. Tabela de Perfis (estende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Assets (Ativos da carteira)
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('STOCK', 'FII', 'CRYPTO', 'FIXED_INCOME')),
  sector TEXT,
  quantity NUMERIC(20, 8) NOT NULL DEFAULT 0,
  average_price NUMERIC(20, 8) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL')),
  quantity NUMERIC(20, 8) NOT NULL,
  unit_price NUMERIC(20, 8) NOT NULL,
  fees NUMERIC(20, 8) DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Posts do Blog
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_ticker ON assets(ticker);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_transactions_asset_id ON transactions(asset_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published) WHERE published = TRUE;

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at 
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: AUTO-CRIAR PERFIL APÓS REGISTRO
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO: RECALCULAR PREÇO MÉDIO (FIFO)
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_average_price()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
  total_quantity NUMERIC;
  total_cost NUMERIC;
  avg_price NUMERIC;
BEGIN
  -- Determinar qual asset_id usar
  v_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);
  
  -- Calcular totais de transações de COMPRA
  SELECT 
    COALESCE(SUM(quantity), 0),
    COALESCE(SUM(quantity * unit_price), 0)
  INTO total_quantity, total_cost
  FROM transactions
  WHERE asset_id = v_asset_id
    AND transaction_type = 'BUY';
  
  -- Subtrair vendas
  SELECT 
    total_quantity - COALESCE(SUM(quantity), 0)
  INTO total_quantity
  FROM transactions
  WHERE asset_id = v_asset_id
    AND transaction_type = 'SELL';
  
  -- Calcular preço médio
  IF total_quantity > 0 THEN
    avg_price := total_cost / total_quantity;
  ELSE
    avg_price := 0;
  END IF;
  
  -- Atualizar asset
  UPDATE assets
  SET 
    quantity = total_quantity,
    average_price = avg_price,
    updated_at = NOW()
  WHERE id = v_asset_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_asset_average_price
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_average_price();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ASSETS
CREATE POLICY "Users can view own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- BLOG POSTS
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Authors can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON blog_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- VIEWS PARA DASHBOARD
-- ============================================

-- View: Resumo do Portfolio
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
  a.user_id,
  COUNT(DISTINCT a.id) as total_assets,
  SUM(a.quantity * a.average_price) as total_invested,
  COUNT(DISTINCT t.id) as total_transactions
FROM assets a
LEFT JOIN transactions t ON t.asset_id = a.id
WHERE a.is_active = TRUE
GROUP BY a.user_id;

-- View: Alocação por Tipo
CREATE OR REPLACE VIEW portfolio_allocation AS
WITH user_totals AS (
  SELECT 
    user_id,
    SUM(quantity * average_price) as user_total
  FROM assets
  WHERE is_active = TRUE
  GROUP BY user_id
)
SELECT 
  a.user_id,
  a.asset_type,
  COUNT(a.id) as asset_count,
  SUM(a.quantity * a.average_price) as type_total,
  ROUND(
    (SUM(a.quantity * a.average_price) / ut.user_total) * 100, 
    2
  ) as percentage
FROM assets a
JOIN user_totals ut ON ut.user_id = a.user_id
WHERE a.is_active = TRUE
GROUP BY a.user_id, a.asset_type, ut.user_total;

-- ============================================
-- FINALIZADO! 🎉
-- ============================================
```

</details>

4. Clique em **"Run"** (ícone de play)
5. ✅ Verifique se apareceu "Success" (sem erros)

### Passo 4: Verificar Tabelas Criadas

1. No dashboard, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `profiles`
   - `assets`
   - `transactions`
   - `blog_posts`

### Passo 5: Configurar Auth Providers (Opcional)

1. Vá em **Authentication** → **Providers**
2. Habilite:
   - ✅ **Email** (já vem habilitado)
   - [ ] **Google** (opcional)
   - [ ] **GitHub** (opcional)
3. Configure URLs permitidas em **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:5173` (dev)
   - **Redirect URLs**: 
     - `http://localhost:5173/**`
     - `https://seu-dominio.vercel.app/**` (produção)

---

## 💻 Desenvolvimento Local

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Criar .env.local com credenciais Supabase
# (copie de .env.example e preencha)

# 3. Rodar servidor dev
npm run dev

# 4. Abrir no browser
# http://localhost:5173
```

---

## 🎨 Estrutura de Componentes UI

O projeto usa **shadcn/ui** com os seguintes componentes já instalados:

- `Button` - Botões
- `Card` - Cards
- `Input` - Inputs de formulário
- `Label` - Labels
- `Select` - Dropdowns
- `Dialog` - Modais
- `Alert` - Alertas
- `Loader` - Loading states
- E muitos outros...

Todos os componentes estão em `frontend/src/components/ui/`.

---

## 📦 Próximos Passos (Com Dyad)

### 1. Instalar Supabase Client
```bash
npm install @supabase/supabase-js @supabase/auth-ui-react
```

### 2. Implementar Features
- [ ] AuthContext com Supabase
- [ ] CRUD de Assets (hooks + UI)
- [ ] CRUD de Transações
- [ ] Dashboard com métricas
- [ ] Cotações (Edge Function)
- [ ] Blog público

### 3. Deploy
- [ ] Conectar GitHub ao Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Deploy automático

---

## 🔗 Links Úteis

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **shadcn/ui**: https://ui.shadcn.com

---

## 📄 Licença

MIT

---

## 👨‍💻 Autor

Júnior Melo - Economista | Engenheiro de Dados | MGI  
[LinkedIn](https://linkedin.com/in/seu-perfil) | [GitHub](https://github.com/melojrx)
```

**Crie um commit**:
```bash
git add README.md
git commit -m "docs: update README with Supabase setup instructions"
```

---

### **TAREFA 5: Criar Arquivo de Documentação para Dyad**

Crie um novo arquivo `DYAD_INSTRUCTIONS.md`:

```markdown
# 📘 INSTRUÇÕES PARA DYAD

## 🎯 Contexto do Projeto

Este é o **Investorion.com.br** - uma plataforma de gestão de investimentos.

**Estado Atual**:
- ✅ Frontend React completo (UI e estrutura)
- ✅ Banco de dados Supabase criado e configurado
- ⏳ Funcionalidades de backend aguardando implementação

**Seu objetivo**: Implementar todas as funcionalidades faltantes usando Supabase como backend.

---

## 🏗️ Arquitetura

```
Frontend (React)
├── UI completa (shadcn/ui)
└── Estrutura de pastas pronta

Backend (Supabase)
├── PostgreSQL (tabelas criadas)
├── Auth (configurado)
├── RLS (ativo)
└── Edge Functions (a implementar)

Deploy
└── Vercel (conectar via GitHub)
```

---

## ✅ FEATURES A IMPLEMENTAR

### 1. Autenticação (Prioridade: CRÍTICA)

**Arquivo**: `frontend/src/contexts/AuthContext.tsx`

**Requisitos**:
- Usar `@supabase/supabase-js`
- Implementar: `signIn`, `signUp`, `signOut`
- Hook: `useAuth()` retornando `{ user, session, loading }`
- Persistir sessão (localStorage)
- Auto-refresh de token

**Páginas afetadas**:
- `frontend/src/pages/auth/Login.tsx`
- `frontend/src/pages/auth/Register.tsx`

---

### 2. CRUD de Assets (Carteira)

**Arquivos**: 
- `frontend/src/hooks/useAssets.ts`
- `frontend/src/pages/Portfolio.tsx`

**Requisitos**:
- Hooks: `useAssets()`, `useCreateAsset()`, `useUpdateAsset()`, `useDeleteAsset()`
- Usar React Query (@tanstack/react-query)
- Tipos TypeScript do banco
- Validação de formulários
- Toasts de feedback (sonner)

**Campos da tabela `assets`**:
- `ticker` (string, obrigatório)
- `name` (string, obrigatório)
- `asset_type` (enum: STOCK, FII, CRYPTO, FIXED_INCOME)
- `sector` (string, opcional)
- `quantity` (number, calculado automaticamente)
- `average_price` (number, calculado automaticamente)

**UI**:
- Lista de assets em cards
- Dialog para adicionar novo asset
- Botão de deletar (soft delete via `is_active`)
- Loading states

---

### 3. CRUD de Transações

**Arquivos**:
- `frontend/src/hooks/useTransactions.ts`
- `frontend/src/pages/Transactions.tsx`

**Requisitos**:
- Hooks: `useTransactions()`, `useCreateTransaction()`, `useDeleteTransaction()`
- Formulário wizard (step-by-step)
- Campos:
  - Seleção de asset (dropdown)
  - Tipo: BUY ou SELL
  - Quantidade (number)
  - Preço unitário (number)
  - Taxas (number, default 0)
  - Data (date picker)
  - Notas (textarea, opcional)

**Comportamento**:
- Ao criar transação, o preço médio do asset é recalculado AUTOMATICAMENTE (via trigger SQL)
- Listar transações com paginação
- Filtros: data (range), tipo (BUY/SELL)

---

### 4. Dashboard com Métricas

**Arquivos**:
- `frontend/src/hooks/useDashboard.ts`
- `frontend/src/pages/Dashboard.tsx`

**Requisitos**:
- Usar views SQL: `portfolio_summary` e `portfolio_allocation`
- Exibir:
  - Total de ativos
  - Total investido
  - Total de transações
  - Gráfico de alocação por tipo (Pie Chart - Recharts)
  - Lista de top 5 ativos (por valor investido)

**Bibliotecas**:
- `recharts` para gráficos

---

### 5. Cotações em Tempo Real (Edge Function)

**Backend** (Supabase Edge Function):
- Criar função `get-quote`
- Integrar APIs:
  - **Ações BR**: Brapi.dev (`https://brapi.dev/api/quote/{ticker}`)
  - **Cripto**: CoinGecko (`https://api.coingecko.com/api/v3/simple/price`)
  - **Câmbio**: AwesomeAPI (`https://economia.awesomeapi.com.br/json/last/{pair}`)

**Frontend**:
- Arquivo: `frontend/src/hooks/useQuote.ts`
- Hook: `useQuote(ticker, type)` retornando `{ price, currency, source }`
- Atualização automática a cada 30s (React Query `refetchInterval`)

**Página**: `frontend/src/pages/Mercado.tsx`
- Input de busca de ticker
- Cards com cotações
- Seção: Top 10 Ibovespa
- Seção: Top 5 Cryptos
- Seção: Câmbio (USD, EUR)

---

### 6. Blog (Opcional - Fase 2)

**Requisitos**:
- Listar posts publicados (`blog_posts` WHERE `published = TRUE`)
- Página individual de post (`/blog/{slug}`)
- Renderizar markdown (react-markdown)
- Interface admin para criar/editar posts (apenas para admins)

---

## 🔧 DEPENDÊNCIAS NECESSÁRIAS

Instale estas dependências:

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
npm install @tanstack/react-query
npm install recharts
npm install react-markdown
npm install sonner  # Para toasts
npm install date-fns  # Para formatação de datas
```

---

## 📝 VARIÁVEIS DE AMBIENTE

Certifique-se de que `frontend/.env.local` contém:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## 🚀 DEPLOY (Vercel)

### Passo 1: Conectar GitHub
1. Push do código para GitHub
2. Acesse https://vercel.com
3. Import Project → Selecione o repositório
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Passo 2: Variáveis de Ambiente
No Vercel → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Passo 3: Deploy
Push para branch `main` = deploy automático ✅

---

## 📊 PRIORIZAÇÃO

1. 🔴 **Crítico** (Semana 1):
   - Autenticação
   - CRUD de Assets
   - CRUD de Transações

2. 🟡 **Importante** (Semana 2):
   - Dashboard com métricas
   - Cotações (Edge Function)

3. 🟢 **Desejável** (Semana 3):
   - Blog
   - Melhorias de UX

---

## 🎯 CRITÉRIOS DE SUCESSO

- [ ] Usuário consegue se cadastrar e fazer login
- [ ] Usuário consegue adicionar assets à carteira
- [ ] Usuário consegue registrar transações de compra/venda
- [ ] Preço médio é calculado automaticamente (FIFO)
- [ ] Dashboard mostra métricas corretas
- [ ] Cotações atualizam em tempo real
- [ ] App deployado no Vercel
- [ ] Zero erros no console do browser

---

## 💡 DICAS PARA IMPLEMENTAÇÃO

1. **Sempre use TypeScript**: Gere tipos do Supabase com:
   ```bash
   supabase gen types typescript --project-id XXX > src/types/database.types.ts
   ```

2. **React Query é seu amigo**: Use para cache e invalidação
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['assets'],
     queryFn: fetchAssets
   })
   ```

3. **RLS já está configurado**: Não precisa verificar permissões no frontend, o banco faz isso

4. **Triggers automáticos**: Preço médio é calculado automaticamente pelo banco (trigger SQL)

5. **Error Handling**: Sempre mostre mensagens de erro amigáveis ao usuário

---

## 🆘 TROUBLESHOOTING

### Erro: "relation does not exist"
**Solução**: Execute o SQL do README.md no Supabase SQL Editor

### Erro: "Missing Supabase environment variables"
**Solução**: Verifique `.env.local` e reinicie o servidor

### Erro: "Row Level Security prevents access"
**Solução**: Verifique se o usuário está autenticado

### Erro: "Edge Function timeout"
**Solução**: Edge Functions têm timeout de 60s. Otimize chamadas.

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído:

- [ ] Todas as páginas carregam sem erros
- [ ] Autenticação funciona (login, logout, persistência)
- [ ] CRUD de assets completo
- [ ] CRUD de transações completo
- [ ] Dashboard renderiza métricas corretas
- [ ] Cotações funcionam e atualizam
- [ ] App responsivo (mobile + desktop)
- [ ] Deploy no Vercel funcionando
- [ ] Sem erros no console
- [ ] Lighthouse score ≥90

---

Boa sorte! 🚀
```

**Crie um commit**:
```bash
git add DYAD_INSTRUCTIONS.md
git commit -m "docs: add comprehensive Dyad implementation guide"
```

---

## ✅ VALIDAÇÃO FINAL

### Checklist de Validação:

Após executar TODAS as tarefas acima, verifique:

- [ ] Pasta `backend/` foi deletada completamente
- [ ] Arquivos Docker deletados (docker-compose.yml, Dockerfile, nginx/)
- [ ] Frontend mantido intacto (componentes UI preservados)
- [ ] Arquivos placeholder criados (supabase.ts, AuthContext.tsx, hooks/)
- [ ] .env.example atualizado
- [ ] .gitignore atualizado
- [ ] README.md atualizado com instruções Supabase
- [ ] DYAD_INSTRUCTIONS.md criado
- [ ] Todos os commits criados
- [ ] Projeto roda localmente sem erros: `cd frontend && npm run dev`

### Comandos finais:

```bash
# Push para GitHub
git push origin main

# Verificar que projeto roda
cd frontend
npm install
npm run dev

# Abrir http://localhost:5173
# Deve carregar a UI (mesmo sem funcionalidades)
```

---

## 🎯 RESULTADO ESPERADO

Após executar este prompt, o projeto estará:

✅ **Limpo** - Backend Django completamente removido  
✅ **Organizado** - Frontend com estrutura preparada  
✅ **Documentado** - README e DYAD_INSTRUCTIONS completos  
✅ **Pronto para Dyad** - Arquivo de instruções detalhado  
✅ **Pronto para Supabase** - Banco criado manualmente pelo usuário  

---

## 📦 ENTREGÁVEIS

Ao final, você terá:

1. **Repositório limpo** (sem Django)
2. **README.md atualizado** (com SQL completo do Supabase)
3. **DYAD_INSTRUCTIONS.md** (guia para Dyad implementar features)
4. **Estrutura preparada** (pastas vazias para nova arquitetura)
5. **Projeto funcional** (UI carrega, mas sem backend ainda)

---

## 🚀 PRÓXIMOS PASSOS (MANUAL DO USUÁRIO)

### 1. Após executar este prompt:
```bash
# Revisar mudanças
git status
git log --oneline -10

# Push para GitHub
git push origin main
```

### 2. Criar projeto Supabase (5 min):
- Seguir **Passo 1** do README.md
- Copiar credenciais

### 3. Criar banco de dados (5 min):
- Seguir **Passo 3** do README.md
- Executar SQL completo no SQL Editor

### 4. Opção A - Usar Dyad:
- Criar novo projeto no Dyad
- Clonar repositório GitHub
- Copiar conteúdo de `DYAD_INSTRUCTIONS.md` para o Dyad
- Deixar Dyad implementar tudo

### 5. Opção B - Implementar manualmente:
- Seguir instruções do README.md
- Implementar feature por feature

---

## 🎉 CONCLUSÃO

Este prompt prepara o código para uma **migração limpa** de Django para Supabase, mantendo todo o trabalho de UI já feito e criando uma base sólida para o Dyad implementar as funcionalidades rapidamente.

**Tempo estimado de execução**: 15-20 minutos  
**Complexidade**: Baixa (maioria é delete/criar arquivos)  
**Risco**: Mínimo (backend Django já será preservado via Git)

---

**Está pronto para executar? Execute as tarefas em ordem! 🚀**