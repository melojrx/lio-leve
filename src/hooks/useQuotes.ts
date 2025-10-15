import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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

async function fetchQuotes(assets: AssetIdentifier[]): Promise<Quote[]> {
  if (!assets || assets.length === 0) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke('get-quote', {
    body: { assets },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(`Falha ao buscar cotações: ${error.message}`);
  }

  // A resposta da função está aninhada em um objeto 'data'
  return (data?.data as Quote[]) || [];
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