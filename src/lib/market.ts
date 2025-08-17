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
  currency?: string;
  updatedAt?: string;
};

export async function fetchStocks(symbols: string[]): Promise<StockQuote[]> {
  if (!symbols.length) return [];
  
  // Convert symbols to Yahoo Finance format (add .SA for Brazilian stocks)
  const yahooSymbols = symbols.map(symbol => {
    if (symbol.startsWith("^")) return symbol; // Indices like ^BVSP
    if (symbol.endsWith(".SA")) return symbol; // Already formatted
    return `${symbol}.SA`; // Add .SA for Brazilian stocks
  });
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbols.join(",")}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const results: StockQuote[] = [];
    
    if (data?.chart?.result) {
      data.chart.result.forEach((result: any, index: number) => {
        const meta = result?.meta;
        const quote = result?.indicators?.quote?.[0];
        
        if (meta && quote) {
          const originalSymbol = symbols[index]; // Use original symbol format
          results.push({
            symbol: originalSymbol,
            shortName: meta.longName || meta.shortName || originalSymbol,
            regularMarketPrice: meta.regularMarketPrice || meta.previousClose,
            regularMarketChangePercent: meta.regularMarketPrice && meta.previousClose 
              ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
              : undefined,
            currency: meta.currency || "BRL",
            updatedAt: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : undefined,
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching Yahoo Finance data:", error);
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
