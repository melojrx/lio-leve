import { supabase } from './supabase';
import { Database, AssetType, TransactionType, Profile, ProfileUpdateData } from '@/types/database.types';

// Application-specific types
export type Asset = Database['public']['Tables']['assets']['Row'] & {
  type_display: string;
  status: 'ACTIVE' | 'INACTIVE';
  status_display: string;
};

export type AssetCreateData = {
  ticker: string;
  name: string;
  type: AssetType;
  sector?: string;
  notes?: string;
};

export type Transaction = Omit<Database['public']['Tables']['transactions']['Row'], 'transaction_type'> & {
  type: TransactionType;
  asset_ticker: string;
  type_display: string;
  total_amount: string;
};

export type TransactionCreateData = {
  asset: string;
  type: TransactionType;
  quantity: string;
  unit_price: string;
  fees: string;
  date: string;
};

export type PortfolioSummary = {
  assets_count: number | null;
  total_invested: number | null;
  current_value: number | null;
  profit_loss: string;
  profit_loss_percent: string;
  allocation_by_type: Record<string, number | null>;
};

export type AssetSummary = {
  // Define if needed later
};

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");
  return user;
};

const ASSET_TYPE_MAP: Record<AssetType, string> = {
  STOCK: "Ação",
  FII: "Fundo Imobiliário",
  CRYPTO: "Criptomoeda",
  FIXED_INCOME: "Renda Fixa",
  ETF: "ETF",
  RENDA_FIXA: "Renda Fixa",
  FUND: "Fundo de Investimento",
  BDR: "BDR",
  OTHER: "Outro",
};

const TRANSACTION_TYPE_MAP: Record<TransactionType, string> = {
  BUY: "Compra",
  SELL: "Venda",
  TRANSFER: "Transferência",
};

const apiClient = {
  // ... (asset and transaction methods remain the same)
  async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase.from('assets').select('*').eq('is_active', true);
    if (error) throw error;
    return data.map(asset => ({
      ...asset,
      type_display: ASSET_TYPE_MAP[asset.asset_type] || asset.asset_type,
      status: asset.is_active ? 'ACTIVE' : 'INACTIVE',
      status_display: asset.is_active ? 'Ativo' : 'Inativo',
    }));
  },

  async getAsset(id: string): Promise<Asset | null> {
    const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? {
      ...data,
      type_display: ASSET_TYPE_MAP[data.asset_type] || data.asset_type,
      status: data.is_active ? 'ACTIVE' : 'INACTIVE',
      status_display: data.is_active ? 'Ativo' : 'Inativo',
    } : null;
  },

  async createAsset(assetData: Omit<AssetCreateData, 'name'>): Promise<Asset> {
    const user = await getUser();

    const insertPayload: Database['public']['Tables']['assets']['Insert'] = {
      user_id: user.id,
      ticker: assetData.ticker,
      name: assetData.ticker,
      asset_type: assetData.type,
      sector: assetData.sector || null,
      notes: assetData.notes || null,
    };

    const { data, error } = await supabase
      .from('assets')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      type_display: ASSET_TYPE_MAP[data.asset_type] || data.asset_type,
      status: data.is_active ? 'ACTIVE' : 'INACTIVE',
      status_display: data.is_active ? 'Ativo' : 'Inativo',
    };
  },

  async updateAsset(id: string, assetData: Partial<AssetCreateData>): Promise<Asset> {
    const { data, error } = await supabase.from('assets').update(assetData).eq('id', id).select().single();
    if (error) throw error;
    return {
      ...data,
      type_display: ASSET_TYPE_MAP[data.asset_type] || data.asset_type,
      status: data.is_active ? 'ACTIVE' : 'INACTIVE',
      status_display: data.is_active ? 'Ativo' : 'Inativo',
    };
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase.from('assets').update({ is_active: false }).eq('id', id);
    if (error) throw error;
  },

  async getTransactions(assetId?: string): Promise<Transaction[]> {
    let query = supabase.from('transactions').select('*, asset:assets(ticker)');
    if (assetId) {
      query = query.eq('asset_id', assetId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(tx => ({
      ...tx,
      type: tx.transaction_type,
      asset_ticker: (tx.asset as { ticker: string })?.ticker || 'N/A',
      type_display: TRANSACTION_TYPE_MAP[tx.transaction_type] || tx.transaction_type,
      total_amount: (tx.quantity * tx.unit_price + (tx.fees || 0)).toString(),
    }));
  },

  async createTransaction(txData: TransactionCreateData): Promise<Transaction> {
    const user = await getUser();
    const { data, error } = await supabase.from('transactions').insert({
      asset_id: txData.asset,
      transaction_type: txData.type,
      quantity: parseFloat(txData.quantity),
      unit_price: parseFloat(txData.unit_price),
      fees: parseFloat(txData.fees) || 0,
      date: txData.date,
      user_id: user.id,
    }).select('*, asset:assets(ticker)').single();

    if (error) throw error;
    return {
      ...data,
      type: data.transaction_type,
      asset_ticker: (data.asset as { ticker: string })?.ticker || 'N/A',
      type_display: TRANSACTION_TYPE_MAP[data.transaction_type] || data.transaction_type,
      total_amount: (data.quantity * data.unit_price + (data.fees || 0)).toString(),
    };
  },

  async updateTransaction(id: string, txData: Partial<TransactionCreateData>): Promise<Transaction> {
    const updatePayload: Partial<Database['public']['Tables']['transactions']['Update']> = {};
    
    if (txData.date) updatePayload.date = txData.date;
    if (txData.quantity) updatePayload.quantity = parseFloat(txData.quantity);
    if (txData.unit_price) updatePayload.unit_price = parseFloat(txData.unit_price);
    if (txData.fees) updatePayload.fees = parseFloat(txData.fees);
    if (txData.type) updatePayload.transaction_type = txData.type;

    const { data, error } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', id)
      .select('*, asset:assets(ticker)')
      .single();

    if (error) throw error;

    return {
      ...data,
      type: data.transaction_type,
      asset_ticker: (data.asset as { ticker: string })?.ticker || 'N/A',
      type_display: TRANSACTION_TYPE_MAP[data.transaction_type] || data.transaction_type,
      total_amount: (data.quantity * data.unit_price + (data.fees || 0)).toString(),
    };
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const { data: summary, error: summaryError } = await supabase.from('portfolio_summary').select('*').single();
    if (summaryError) throw summaryError;

    const { data: allocation, error: allocationError } = await supabase.from('portfolio_allocation').select('*');
    if (allocationError) throw allocationError;

    const allocation_by_type = allocation.reduce((acc, item) => {
      if (item.asset_type) {
        acc[item.asset_type] = item.percentage;
      }
      return acc;
    }, {} as Record<string, number | null>);

    return {
      assets_count: summary?.total_assets || 0,
      total_invested: summary?.total_invested || 0,
      current_value: summary?.total_invested || 0,
      profit_loss: '0',
      profit_loss_percent: '0',
      allocation_by_type,
    };
  },
  
  async getTransaction(id: string): Promise<Transaction | null> { 
    const { data, error } = await supabase.from('transactions').select('*, asset:assets(ticker)').eq('id', id).single();
    if (error) throw error;
    return data ? {
      ...data,
      type: data.transaction_type,
      asset_ticker: (data.asset as { ticker: string })?.ticker || 'N/A',
      type_display: TRANSACTION_TYPE_MAP[data.transaction_type] || data.transaction_type,
      total_amount: (data.quantity * data.unit_price + (data.fees || 0)).toString(),
    } : null;
  },
  
  async getAssetSummary(id: string): Promise<AssetSummary> { return {}; },

  // Profile Methods
  async getProfile(): Promise<Profile> {
    const user = await getUser();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw error;
    }

    if (profile) {
      return profile;
    }

    // Profile not found, create it (lazy creation)
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    return newProfile!;
  },

  async updateProfile(profileData: ProfileUpdateData): Promise<Profile> {
    const user = await getUser();
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email!, // Always include email for inserts
        ...profileData 
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const user = await getUser();
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  },
};

export { apiClient };