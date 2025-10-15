import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapeia símbolos comuns para IDs da API CoinGecko
const cryptoIdMap: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
}

// Funções auxiliares para buscar dados de cada fonte
async function fetchStock(ticker: string) {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${ticker}?range=1d&interval=1d&fundamental=false`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return null;
    return {
      symbol: result.symbol,
      name: result.shortName || result.longName,
      price: result.regularMarketPrice,
      changePercent: result.regularMarketChangePercent,
      type: 'STOCK',
    };
  } catch (error) {
    console.error(`Error fetching stock ${ticker}:`, error.message);
    return null;
  }
}

async function fetchCrypto(symbol: string) {
  const id = cryptoIdMap[symbol.toUpperCase()];
  if (!id) return null;
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=brl`);
    if (!res.ok) return null;
    const data = await res.json();
    const price = data?.[id]?.brl;
    if (price === undefined) return null;
    return {
      symbol: symbol.toUpperCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      price: price,
      changePercent: null, // API simples não fornece variação
      type: 'CRYPTO',
    };
  } catch (error) {
    console.error(`Error fetching crypto ${symbol}:`, error.message);
    return null;
  }
}

async function fetchFx(pair: string) { // Ex: "USD-BRL"
  try {
    const res = await fetch(`https://economia.awesomeapi.com.br/last/${pair}`);
    if (!res.ok) return null;
    const data = await res.json();
    const key = pair.replace('-', '');
    const result = data?.[key];
    if (!result) return null;
    return {
      symbol: pair.replace('-', '/'),
      name: result.name,
      price: parseFloat(result.bid),
      changePercent: parseFloat(result.pctChange),
      type: 'FX',
    };
  } catch (error) {
    console.error(`Error fetching FX ${pair}:`, error.message);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { assets } = await req.json(); // Espera: { assets: [{ ticker: 'PETR4', type: 'STOCK' }] }

    if (!Array.isArray(assets)) {
      throw new Error('Request body must be an array of assets.');
    }

    const promises = assets.map(asset => {
      switch (asset.type) {
        case 'STOCK':
          return fetchStock(asset.ticker);
        case 'CRYPTO':
          return fetchCrypto(asset.ticker);
        case 'FX':
          return fetchFx(asset.ticker);
        default:
          return Promise.resolve(null);
      }
    });

    const results = await Promise.all(promises);
    const successfulResults = results.filter(r => r !== null);

    return new Response(JSON.stringify({ data: successfulResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})