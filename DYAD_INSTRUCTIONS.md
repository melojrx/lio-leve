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

**Arquivo**: `src/contexts/AuthContext.tsx`

**Requisitos**:
- Usar `@supabase/supabase-js`
- Implementar: `signIn`, `signUp`, `signOut`
- Hook: `useAuth()` retornando `{ user, session, loading }`
- Persistir sessão (localStorage)
- Auto-refresh de token

**Páginas afetadas**:
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`

---

### 2. CRUD de Assets (Carteira)

**Arquivos**: 
- `src/hooks/useAssets.ts`
- `src/pages/Portfolio.tsx`

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
- `src/hooks/useTransactions.ts`
- `src/pages/Transactions.tsx`

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
- `src/hooks/useDashboard.ts`
- `src/pages/Dashboard.tsx`

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
- Arquivo: `src/hooks/useQuote.ts`
- Hook: `useQuote(ticker, type)` retornando `{ price, currency, source }`
- Atualização automática a cada 30s (React Query `refetchInterval`)

**Página**: `src/pages/Mercado.tsx`
- Input de busca de ticker
- Cards com cotações
- Seção: Top 10 Ibovespa
- Seção: Top 5 Cryptos
- Seção: Câmbio (USD, EUR)

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

Certifique-se de que `.env.local` contém:

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
