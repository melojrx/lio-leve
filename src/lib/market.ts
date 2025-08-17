export type FXPair = {
  pair: string; // e.g., USD/BRL
  bid: number; // preço de compra
  pctChange?: number; // variação percentual
  updatedAt?: string;
};

export async function fetchFX(pairs: string[] = ["USD-BRL", "EUR-BRL"]): Promise<FXPair[]> {
  const url = `https://economia.awesomeapi.com.br/last/${encodeURIComponent(pairs.join(","))}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  const out: FXPair[] = [];
  for (const key of Object.keys(json || {})) {
    const item = (json as any)[key];
    if (!item) continue;
    const pair = `${item.code || ""}/${item.codein || ""}`.toUpperCase();
    out.push({
      pair,
      bid: Number(item.bid),
      pctChange: item.pctChange !== undefined ? Number(item.pctChange) : undefined,
      updatedAt: item.create_date,
    });
  }
  return out;
}

export type StockQuote = {
  symbol: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  fiftyTwoWeekChangePercent?: number;
  currency?: string;
  updatedAt?: string;
};

export async function fetchStocks(symbols: string[]): Promise<StockQuote[]> {
  if (!symbols.length) return [];
  
  try {
    // Usar Yahoo Finance API para buscar múltiplas cotações de uma vez
    const symbolsStr = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data?.quoteResponse?.result) {
      throw new Error('Invalid response format');
    }
    
    const results: StockQuote[] = data.quoteResponse.result.map((quote: any) => ({
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName || quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      regularMarketVolume: quote.regularMarketVolume,
      fiftyTwoWeekChangePercent: quote.fiftyTwoWeekChangePercent,
      currency: quote.currency || "BRL",
      updatedAt: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : undefined,
    }));
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return [];
  }
}

export type MacroSeries = {
  id: number;
  name: string;
  unit: string;
  value?: number;
  date?: string; // dd/mm/yyyy
};

// Observação: códigos de séries do SGS
// - IPCA (433)
// - Selic (meta anual) comumente referenciada (432) – pode variar conforme necessidade
// - CDI (12) – algumas referências usam 1178/4389 para médias específicas
// Ajuste conforme necessidade futura.
export async function fetchBCBSeries(ids: { id: number; name: string; unit: string }[]): Promise<MacroSeries[]> {
  const requests = ids.map(async (it) => {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${it.id}/dados/ultimos/1?formato=json`;
    try {
      const res = await fetch(url);
      if (!res.ok) return { ...it } as MacroSeries;
      const json = await res.json();
      const last = Array.isArray(json) ? json[0] : undefined;
      return {
        ...it,
        value: last?.valor ? Number(String(last.valor).replace(",", ".")) : undefined,
        date: last?.data,
      } as MacroSeries;
    } catch {
      return { ...it } as MacroSeries;
    }
  });
  return Promise.all(requests);
}
