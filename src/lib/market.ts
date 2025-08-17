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
  
  // Buscar dados individuais para melhor confiabilidade
  const results: StockQuote[] = [];
  
  for (const symbol of symbols) {
    try {
      let apiUrl: string;
      
      if (symbol.startsWith("^")) {
        // Índices - usar Yahoo Finance
        apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      } else {
        // Ações brasileiras - usar API brasileira mais confiável
        apiUrl = `https://brapi.dev/api/quote/${symbol}?token=demo`;
      }
      
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
      const res = await fetch(proxyUrl);
      
      if (!res.ok) continue;
      
      const proxyData = await res.json();
      let data;
      
      try {
        data = JSON.parse(proxyData.contents);
      } catch {
        continue;
      }
      
      if (symbol.startsWith("^")) {
        // Processar dados do Yahoo Finance para índices
        if (data?.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          
          if (meta) {
            const currentPrice = meta.regularMarketPrice || meta.previousClose;
            const previousClose = meta.previousClose || meta.chartPreviousClose;
            
            results.push({
              symbol,
              shortName: meta.longName || meta.shortName || symbol,
              regularMarketPrice: currentPrice,
              regularMarketChangePercent: currentPrice && previousClose 
                ? ((currentPrice - previousClose) / previousClose) * 100
                : undefined,
              currency: meta.currency || "BRL",
              updatedAt: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : undefined,
            });
          }
        }
      } else {
        // Processar dados da Brapi para ações brasileiras
        if (data?.results?.[0]) {
          const stock = data.results[0];
          results.push({
            symbol,
            shortName: stock.shortName || stock.longName || symbol,
            regularMarketPrice: stock.regularMarketPrice,
            regularMarketChangePercent: stock.regularMarketChangePercent,
            currency: stock.currency || "BRL",
            updatedAt: stock.regularMarketTime ? new Date(stock.regularMarketTime * 1000).toISOString() : undefined,
          });
        }
      }
    } catch (error) {
      console.log(`Erro ao buscar ${symbol}:`, error);
      // Continua para o próximo símbolo
      continue;
    }
  }
  
  // Se não conseguiu nenhum dado, retorna dados mockados para demonstração
  if (results.length === 0) {
    return symbols.slice(0, 10).map((symbol, index) => ({
      symbol,
      shortName: symbol,
      regularMarketPrice: 50 + Math.random() * 100,
      regularMarketChangePercent: (Math.random() - 0.5) * 10,
      currency: "BRL",
      updatedAt: new Date().toISOString(),
    }));
  }
  
  return results;
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
