-- ============================================
-- INVESTORION - SCHEMA COMPLETO SUPABASE
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
