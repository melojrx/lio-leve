export type CoinResult = {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
};

// Simple search using CoinGecko public API (no key required)
export async function searchCryptos(query: string, init?: RequestInit): Promise<CoinResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}` , init);
  if (!res.ok) return [];
  const data = await res.json();
  const coins = Array.isArray(data?.coins) ? data.coins : [];
  return coins.slice(0, 20).map((c: any) => ({
    id: String(c.id),
    name: String(c.name),
    symbol: String(c.symbol || '').toUpperCase(),
    thumb: c.thumb as string | undefined,
  }));
}

// Optional: get simple price in BRL for a set of coin IDs
export async function getSimplePricesBRL(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=brl`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const json = await res.json();
  const out: Record<string, number> = {};
  for (const [key, val] of Object.entries(json as any)) {
    const price = (val as any)?.brl;
    if (typeof price === 'number') out[key] = price;
  }
  return out;
}
