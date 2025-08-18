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

// Função helper para buscar via Yahoo Finance com proxy CORS
async function fetchYahooFinance(symbols: string[]): Promise<StockQuote[]> {
  try {
    // Adicionar .SA para ações brasileiras (não índices)
    const correctedSymbols = symbols.map(symbol => 
      symbol.startsWith('^') ? symbol : `${symbol}.SA`
    );
    
    const symbolsStr = correctedSymbols.join(',');
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);
    
    if (!data?.quoteResponse?.result) {
      throw new Error('Invalid response format');
    }
    
    return data.quoteResponse.result.map((quote: any) => ({
      symbol: symbols[correctedSymbols.indexOf(quote.symbol)] || quote.symbol.replace('.SA', ''),
      shortName: quote.shortName || quote.longName || quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      regularMarketVolume: quote.regularMarketVolume,
      fiftyTwoWeekChangePercent: quote.fiftyTwoWeekChangePercent,
      currency: quote.currency || "BRL",
      updatedAt: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Erro Yahoo Finance:', error);
    return [];
  }
}

// Função helper para fallback via Brapi.dev
async function fetchBrapiFallback(symbols: string[]): Promise<StockQuote[]> {
  try {
    // Filtrar apenas ações brasileiras (não índices)
    const stockSymbols = symbols.filter(s => !s.startsWith('^'));
    if (stockSymbols.length === 0) return [];
    
    const symbolsStr = stockSymbols.join(',');
    const response = await fetch(`https://brapi.dev/api/quote/${symbolsStr}?token=demo`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (!data?.results) return [];
    
    return data.results.map((quote: any) => ({
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName || quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      regularMarketVolume: quote.regularMarketVolume,
      fiftyTwoWeekChangePercent: quote.fiftyTwoWeekChangePercent,
      currency: quote.currency || "BRL",
      updatedAt: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Erro Brapi fallback:', error);
    return [];
  }
}

export async function fetchStocks(symbols: string[]): Promise<StockQuote[]> {
  if (!symbols.length) return [];
  
  // Dividir símbolos em lotes de 15 para evitar URLs muito longas
  const batchSize = 15;
  const batches = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }
  
  const allResults: StockQuote[] = [];
  
  // Processar lotes em paralelo
  await Promise.all(
    batches.map(async (batch) => {
      try {
        // Tentar Yahoo Finance primeiro
        const yahooResults = await fetchYahooFinance(batch);
        
        if (yahooResults.length > 0) {
          allResults.push(...yahooResults);
        } else {
          // Fallback para Brapi.dev
          const brapiResults = await fetchBrapiFallback(batch);
          allResults.push(...brapiResults);
        }
      } catch (error) {
        console.error(`Erro no lote ${batch}:`, error);
        // Tentar fallback mesmo em caso de erro
        try {
          const brapiResults = await fetchBrapiFallback(batch);
          allResults.push(...brapiResults);
        } catch (fallbackError) {
          console.error(`Erro no fallback ${batch}:`, fallbackError);
        }
      }
    })
  );
  
  return allResults;
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
