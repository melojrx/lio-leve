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

// Função helper para buscar via Yahoo Finance com múltiplos proxies CORS
async function fetchYahooFinance(symbols: string[]): Promise<StockQuote[]> {
  // Adicionar .SA para ações brasileiras (não índices)
  const correctedSymbols = symbols.map(symbol => 
    symbol.startsWith('^') ? symbol : `${symbol}.SA`
  );
  
  const symbolsStr = correctedSymbols.join(',');
  const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`;
  
  // Múltiplos proxies para tentar
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`,
    `https://cors-anywhere.herokuapp.com/${yahooUrl}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`,
    yahooUrl // Tentar direto também (pode funcionar em alguns casos)
  ];
  
  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      
      if (!response.ok) continue;
      
      let data;
      if (proxyUrl.includes('allorigins')) {
        const proxyData = await response.json();
        if (!proxyData.contents) continue;
        data = JSON.parse(proxyData.contents);
      } else {
        data = await response.json();
      }
      
      if (data?.quoteResponse?.result?.length > 0) {
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
      }
    } catch (error) {
      continue;
    }
  }
  
  return [];
}

// Função helper para fallback via Brapi.dev (sem token ou com tokens alternativos)
async function fetchBrapiFallback(symbols: string[]): Promise<StockQuote[]> {
  // Filtrar apenas ações brasileiras (não índices)
  const stockSymbols = symbols.filter(s => !s.startsWith('^'));
  if (stockSymbols.length === 0) return [];
  
  const symbolsStr = stockSymbols.join(',');
  
  // Tentar múltiplas configurações de token
  const apiConfigs = [
    `https://brapi.dev/api/quote/${symbolsStr}`, // Sem token
    `https://brapi.dev/api/quote/${symbolsStr}?token=`,  // Token vazio
    `https://brapi.dev/api/quote/${symbolsStr}?token=demo`, // Token demo original
  ];
  
  for (const apiUrl of apiConfigs) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        continue;
      }
      
      const data = await response.json();
      
      if (data?.results?.length > 0) {
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
      }
    } catch (error) {
      continue;
    }
  }
  
  return [];
}

// Nova função para tentar APIs alternativas brasileiras
async function fetchAlternativeAPIs(symbols: string[]): Promise<StockQuote[]> {
  const stockSymbols = symbols.filter(s => !s.startsWith('^'));
  if (stockSymbols.length === 0) return [];
  
  // API alternativa: HG Finance (gratuita brasileira)
  try {
    // HG Finance aceita múltiplos símbolos
    const symbolsStr = stockSymbols.join(',');
    const response = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=free&symbol=${symbolsStr}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data?.results?.stocks) {
        return Object.values(data.results.stocks).map((stock: any) => ({
          symbol: stock.symbol,
          shortName: stock.name || stock.symbol,
          regularMarketPrice: stock.price,
          regularMarketChangePercent: stock.change_percent,
          regularMarketVolume: stock.volume,
          currency: "BRL",
          updatedAt: new Date().toISOString(),
        }));
      }
    }
  } catch (error) {
    // Fail silently
  }
  
  // Se tudo falhar, retorna dados mock para desenvolvimento
  return stockSymbols.slice(0, 5).map(symbol => ({
    symbol,
    shortName: `${symbol} - Mock Data`,
    regularMarketPrice: Math.random() * 100 + 10,
    regularMarketChangePercent: (Math.random() - 0.5) * 10,
    regularMarketVolume: Math.floor(Math.random() * 1000000),
    currency: "BRL",
    updatedAt: new Date().toISOString(),
  }));
}

export async function fetchStocks(symbols: string[]): Promise<StockQuote[]> {
  if (!symbols.length) return [];
  
  // Dividir símbolos em lotes de 10 para evitar URLs muito longas
  const batchSize = 10;
  const batches = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }
  
  const allResults: StockQuote[] = [];
  
  // Processar lotes em paralelo com estratégia cascata
  await Promise.all(
    batches.map(async (batch, index) => {
      let batchResults: StockQuote[] = [];
      
      try {
        // 1. Tentar Yahoo Finance primeiro
        batchResults = await fetchYahooFinance(batch);
        
        if (batchResults.length > 0) {
          allResults.push(...batchResults);
          return;
        }
        
        // 2. Fallback para Brapi.dev
        batchResults = await fetchBrapiFallback(batch);
        
        if (batchResults.length > 0) {
          allResults.push(...batchResults);
          return;
        }
        
        // 3. Último recurso: APIs alternativas
        batchResults = await fetchAlternativeAPIs(batch);
        
        if (batchResults.length > 0) {
          allResults.push(...batchResults);
        }
        
      } catch (error) {
        // Último recurso: tentar APIs alternativas mesmo com erro
        try {
          batchResults = await fetchAlternativeAPIs(batch);
          if (batchResults.length > 0) {
            allResults.push(...batchResults);
          }
        } catch (lastError) {
          // Fail silently
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
