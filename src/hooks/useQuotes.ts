import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/http';

export type AssetIdentifier = {
  ticker: string;
  type: 'STOCK' | 'CRYPTO' | 'FX';
};

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number | null;
  type: 'STOCK' | 'CRYPTO' | 'FX';
};

type QuoteApi = {
  symbol: string;
  name?: string | null;
  price: number;
  change_percent?: number | null;
  type: AssetIdentifier['type'];
};

async function fetchQuotes(assets: AssetIdentifier[]): Promise<Quote[]> {
  if (!assets || assets.length === 0) {
    return [];
  }

  const data = await apiFetch<QuoteApi[]>('/quotes/batch', {
    method: 'POST',
    body: JSON.stringify(assets),
  });

  return data.map((item) => ({
    symbol: item.symbol,
    name: item.name || item.symbol,
    price: item.price,
    changePercent: item.change_percent ?? null,
    type: item.type,
  }));
}

export function useQuotes(assets: AssetIdentifier[], options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['quotes', assets.map(a => a.ticker).sort()],
    queryFn: () => fetchQuotes(assets),
    enabled: assets.length > 0,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: options?.refetchInterval ?? 1000 * 60 * 2, // 2 minutos por padrão
  });
}
