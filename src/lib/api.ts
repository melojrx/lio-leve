import { apiFetch } from '@/lib/http';
import { getApiBaseUrl } from '@/lib/http';
import { AssetType, TransactionType } from '@/types/database.types';

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

type AssetApi = {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  asset_type: AssetType;
  sector: string | null;
  quantity: number | string;
  average_price: number | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type TransactionApi = {
  id: string;
  asset_id: string;
  user_id: string;
  transaction_type: TransactionType;
  quantity: number | string;
  unit_price: number | string;
  fees: number | string;
  date: string;
  created_at: string;
  notes?: string | null;
};

type PortfolioSummaryApi = {
  total_assets: number | null;
  total_transactions: number | null;
  total_invested: number | string | null;
};

type AllocationItemApi = {
  asset_type: AssetType;
  asset_count: number | null;
  type_total: number | string | null;
  percentage: number | string | null;
};

type AllocationResponse = {
  items: AllocationItemApi[];
};

export type Asset = AssetApi & {
  type_display: string;
  status: 'ACTIVE' | 'INACTIVE';
  status_display: string;
};

export type AssetCreateData = {
  ticker: string;
  name?: string;
  type: AssetType;
  sector?: string;
  notes?: string;
};

export type Transaction = Omit<TransactionApi, 'transaction_type'> & {
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
  assets_count: number;
  total_invested: number;
  current_value: number;
  profit_loss: string;
  profit_loss_percent: string;
  allocation_by_type: Record<string, number>;
};

export type AssetSummary = Record<string, never>;

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  cpf?: string | null;
  phone?: string | null;
  birth_date?: string | null;
};

export type ProfileUpdateData = Partial<Profile>;

// Types for Suggestions
export type Suggestion = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  kind: 'ideia' | 'bug';
  votes: number;
  created_at: string;
};

export type SuggestionCreateData = Pick<Suggestion, 'title' | 'description' | 'kind'>;

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
};

const mapAsset = (asset: AssetApi): Asset => ({
  ...asset,
  quantity: toNumber(asset.quantity),
  average_price: toNumber(asset.average_price),
  type_display: ASSET_TYPE_MAP[asset.asset_type] || asset.asset_type,
  status: asset.is_active ? 'ACTIVE' : 'INACTIVE',
  status_display: asset.is_active ? 'Ativo' : 'Inativo',
});

const mapTransaction = (tx: TransactionApi, assetTicker?: string): Transaction => {
  const totalAmount = toNumber(tx.quantity) * toNumber(tx.unit_price) + toNumber(tx.fees);
  return {
    ...tx,
    quantity: toNumber(tx.quantity),
    unit_price: toNumber(tx.unit_price),
    fees: toNumber(tx.fees),
    type: tx.transaction_type,
    asset_ticker: assetTicker || 'N/A',
    type_display: TRANSACTION_TYPE_MAP[tx.transaction_type] || tx.transaction_type,
    total_amount: totalAmount.toString(),
  };
};

const apiClient = {
  normalizeMediaUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = getApiBaseUrl().replace(/\/+$/, '');
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
  },
  // Assets
  async getAssets(): Promise<Asset[]> {
    const data = await apiFetch<AssetApi[]>('/assets');
    return data.map(mapAsset);
  },

  async getAsset(id: string): Promise<Asset | null> {
    const data = await apiFetch<AssetApi>(`/assets/${id}`);
    return data ? mapAsset(data) : null;
  },

  async createAsset(assetData: Omit<AssetCreateData, 'name'>): Promise<Asset> {
    const payload = {
      ticker: assetData.ticker,
      name: assetData.ticker,
      asset_type: assetData.type,
      sector: assetData.sector || null,
    };

    const data = await apiFetch<AssetApi>('/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return mapAsset(data);
  },

  async updateAsset(id: string, assetData: Partial<AssetCreateData>): Promise<Asset> {
    const payload: Record<string, unknown> = {};
    if (assetData.ticker) payload.ticker = assetData.ticker;
    if (assetData.type) payload.asset_type = assetData.type;
    if (assetData.sector !== undefined) payload.sector = assetData.sector;
    if (assetData.name) payload.name = assetData.name;

    const data = await apiFetch<AssetApi>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return mapAsset(data);
  },

  async deleteAsset(id: string): Promise<void> {
    await apiFetch<void>(`/assets/${id}`, { method: 'DELETE' });
  },

  // Transactions
  async getTransactions(assetId?: string): Promise<Transaction[]> {
    const query = assetId ? `/transactions?asset_id=${encodeURIComponent(assetId)}` : '/transactions';
    const [transactions, assets] = await Promise.all([
      apiFetch<TransactionApi[]>(query),
      apiFetch<AssetApi[]>('/assets'),
    ]);
    const tickerMap = new Map(assets.map((a) => [a.id, a.ticker]));
    return transactions.map((tx) => mapTransaction(tx, tickerMap.get(tx.asset_id)));
  },

  async createTransaction(txData: TransactionCreateData): Promise<Transaction> {
    const payload = {
      asset_id: txData.asset,
      transaction_type: txData.type,
      quantity: parseFloat(txData.quantity),
      unit_price: parseFloat(txData.unit_price),
      fees: parseFloat(txData.fees) || 0,
      date: txData.date,
    };

    const data = await apiFetch<TransactionApi>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    let ticker: string | undefined;
    try {
      const asset = await apiFetch<AssetApi>(`/assets/${data.asset_id}`);
      ticker = asset.ticker;
    } catch (_) {
      ticker = undefined;
    }

    return mapTransaction(data, ticker);
  },

  async updateTransaction(id: string, txData: Partial<TransactionCreateData>): Promise<Transaction> {
    const payload: Record<string, unknown> = {};
    if (txData.date) payload.date = txData.date;
    if (txData.quantity) payload.quantity = parseFloat(txData.quantity);
    if (txData.unit_price) payload.unit_price = parseFloat(txData.unit_price);
    if (txData.fees) payload.fees = parseFloat(txData.fees);
    if (txData.type) payload.transaction_type = txData.type;
    if (txData.asset) payload.asset_id = txData.asset;

    const data = await apiFetch<TransactionApi>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    let ticker: string | undefined;
    try {
      const asset = await apiFetch<AssetApi>(`/assets/${data.asset_id}`);
      ticker = asset.ticker;
    } catch (_) {
      ticker = undefined;
    }

    return mapTransaction(data, ticker);
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' });
  },

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const [summary, allocation] = await Promise.all([
      apiFetch<PortfolioSummaryApi>('/dashboard/summary'),
      apiFetch<AllocationResponse>('/dashboard/allocation'),
    ]);

    const allocation_by_type = allocation.items.reduce((acc, item) => {
      acc[item.asset_type] = toNumber(item.percentage);
      return acc;
    }, {} as Record<string, number>);

    return {
      assets_count: summary?.total_assets || 0,
      total_invested: toNumber(summary?.total_invested),
      current_value: toNumber(summary?.total_invested),
      profit_loss: '0',
      profit_loss_percent: '0',
      allocation_by_type,
    };
  },

  async getTransaction(id: string): Promise<Transaction | null> {
    const data = await apiFetch<TransactionApi>(`/transactions/${id}`);
    return data ? mapTransaction(data) : null;
  },

  async getAssetSummary(_id: string): Promise<AssetSummary> {
    return {};
  },

  // Profile Methods
  async getProfile(): Promise<Profile> {
    const profile = await apiFetch<Profile>('/profile/me');
    return { ...profile, avatar_url: apiClient.normalizeMediaUrl(profile.avatar_url) };
  },

  async updateProfile(profileData: ProfileUpdateData): Promise<Profile> {
    const payload: Record<string, unknown> = {};
    if (profileData.full_name !== undefined) payload.full_name = profileData.full_name;
    if (profileData.avatar_url !== undefined) payload.avatar_url = profileData.avatar_url;
    if (profileData.cpf !== undefined) payload.cpf = profileData.cpf;
    if (profileData.phone !== undefined) payload.phone = profileData.phone;
    if (profileData.birth_date !== undefined) payload.birth_date = profileData.birth_date;

    const data = await apiFetch<Profile>('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return { ...data, avatar_url: apiClient.normalizeMediaUrl(data.avatar_url) };
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const data = await apiFetch<{ avatar_url: string }>('/profile/me/avatar', {
      method: 'POST',
      body: formData,
    });

    return apiClient.normalizeMediaUrl(data.avatar_url) || data.avatar_url;
  },

  // Suggestions Methods
  async getSuggestions(): Promise<Suggestion[]> {
    return apiFetch<Suggestion[]>('/suggestions');
  },

  async createSuggestion(suggestionData: SuggestionCreateData): Promise<Suggestion> {
    return apiFetch<Suggestion>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(suggestionData),
    });
  },

  async addVoteToSuggestion(suggestionId: string): Promise<void> {
    await apiFetch<void>(`/suggestions/${suggestionId}/vote`, { method: 'POST' });
  },
};

export { apiClient };
