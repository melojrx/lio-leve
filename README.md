<div align="center">
	<img src="docs/assets/logo.svg" alt="Logo investorion" height="72" />
	<h1>🚀 Investorion.com.br - Plataforma de Investimentos</h1>
	<p>Plataforma 100% gratuita para acompanhamento de carteiras de investimento com dados governamentais em primeira mão.</p>
</div>

---

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
3. Cole no arquivo `.env.local`:

```bash
VITE_SUPABASE_URL=https://seu-projeto-aqui.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Passo 3: Criar Tabelas (SQL Editor)

1. No dashboard Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Copie e cole o SQL completo do arquivo: `docs/supabase-schema.sql`
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

Todos os componentes estão em `src/components/ui/`.

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
[LinkedIn](https://www.linkedin.com/in/j%C3%BAnior-melo-a4817127/) | [GitHub](https://github.com/melojrx)
