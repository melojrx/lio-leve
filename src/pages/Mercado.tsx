import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFX, fetchStocks, fetchBCBSeries } from "@/lib/market";
import { getSimplePricesBRL } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";

// Favoritos em localStorage
const FAV_KEY = "market_favorites";
function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    } catch {
      return [] as string[];
    }
  });
  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }, [favs]);
  const toggle = (k: string) => setFavs((prev) => (prev.includes(k) ? prev.filter((i) => i !== k) : [...prev, k]));
  return { favs, toggle };
}

function formatNumber(n?: number, decimals = 2) {
  if (n === undefined || n === null || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function formatPct(n?: number) {
  if (n === undefined || n === null || Number.isNaN(n)) return "-";
  return `${n > 0 ? "+" : ""}${formatNumber(n, 2)}%`;
}

const keyAssets = {
  fx: ["USD/BRL", "EUR/BRL"],
  stocks: ["^BVSP", "IFIX", "PETR4", "VALE3"],
  crypto: ["BTC", "ETH"],
  macro: ["CDI", "Selic", "IPCA"],
};

const bcbSeries = [
  { id: 12, name: "CDI", unit: "% a.a." },
  { id: 432, name: "Selic", unit: "% a.a." },
  { id: 433, name: "IPCA", unit: "% a.a." },
];

export default function Mercado() {
  const [q, setQ] = useState("");
  const { favs, toggle } = useFavorites();

  // FX – 10s
  const fxQuery = useQuery({
    queryKey: ["fx", keyAssets.fx],
    queryFn: () => fetchFX(["USD-BRL", "EUR-BRL"]),
    refetchInterval: 10_000,
  });

  // Crypto – 10s
  const cryptoQuery = useQuery({
    queryKey: ["crypto", keyAssets.crypto],
    queryFn: async () => {
      const prices = await getSimplePricesBRL(["bitcoin", "ethereum"]);
      return [
        { symbol: "BTC", price: prices.bitcoin },
        { symbol: "ETH", price: prices.ethereum },
      ];
    },
    refetchInterval: 10_000,
  });

  // Stocks/Índices – 45s
  const stocksQuery = useQuery({
    queryKey: ["stocks", keyAssets.stocks],
    queryFn: () => fetchStocks(["^BVSP", "IFIX", "PETR4", "VALE3"]),
    refetchInterval: 45_000,
  });

  // Macro (BCB/SGS) – 60s
  const macroQuery = useQuery({
    queryKey: ["macro", bcbSeries.map((s) => s.id)],
    queryFn: () => fetchBCBSeries(bcbSeries),
    refetchInterval: 60_000,
  });

  const isLoading = fxQuery.isLoading || cryptoQuery.isLoading || stocksQuery.isLoading || macroQuery.isLoading;

  const rows = useMemo(() => {
    const list: { key: string; label: string; value?: number | string; changePct?: number; group: string }[] = [];

    // FX
    fxQuery.data?.forEach((f) => {
      list.push({ key: f.pair, label: f.pair, value: f.bid, changePct: f.pctChange, group: "Câmbio" });
    });

    // Stocks
    stocksQuery.data?.forEach((s) => {
      list.push({ key: s.symbol, label: s.shortName || s.symbol, value: s.regularMarketPrice, changePct: s.regularMarketChangePercent, group: "Ações/Índices" });
    });

    // Macro
    macroQuery.data?.forEach((m) => {
      list.push({ key: m.name, label: m.name, value: m.value, group: "Juros/Inflação" });
    });

    // Crypto
    cryptoQuery.data?.forEach((c) => {
      list.push({ key: c.symbol, label: c.symbol, value: c.price, group: "Cripto" });
    });

    return list;
  }, [fxQuery.data, stocksQuery.data, macroQuery.data, cryptoQuery.data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? rows.filter((r) => r.key.toLowerCase().includes(term) || r.label.toLowerCase().includes(term) || r.group.toLowerCase().includes(term)) : rows;
    // Ordena: favoritos primeiro
    return base.sort((a, b) => Number(favs.includes(b.key)) - Number(favs.includes(a.key)) || a.label.localeCompare(b.label));
  }, [rows, q, favs]);

  const refreshAll = () => {
    fxQuery.refetch();
    stocksQuery.refetch();
    cryptoQuery.refetch();
    macroQuery.refetch();
  };

  return (
    <>
      <SEO title="Mercado – Cotações em Tempo Real" description="Cotações em tempo real: câmbio, ações, índices, juros, inflação e cripto." canonical="/mercado" />
      <main className="container py-8">
        <BackButton />
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Mercado – Cotações em Tempo Real</h1>
          <div className="flex gap-2">
            <Input placeholder="Buscar ativo, grupo ou código" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={refreshAll} aria-label="Atualizar">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Cards principais */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {/* FX cards */}
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={`sk-${i}`}>
                <CardHeader className="pb-2"><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {fxQuery.data?.map((f) => (
                <Card key={f.pair}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{f.pair}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-semibold">R$ {formatNumber(f.bid, 4)}</div>
                      {f.pctChange !== undefined && (
                        <Badge variant={f.pctChange >= 0 ? "default" : "secondary"} className={cn(f.pctChange >= 0 ? "text-green-600" : "text-red-600")}>{formatPct(f.pctChange)}</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Atualizado: {f.updatedAt || "-"}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Stocks highlights */}
              {stocksQuery.data?.filter((s) => keyAssets.stocks.includes(s.symbol)).map((s) => (
                <Card key={s.symbol}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{s.shortName || s.symbol}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-semibold">{s.currency === "BRL" ? "R$ " : ""}{formatNumber(s.regularMarketPrice)}</div>
                      {s.regularMarketChangePercent !== undefined && (
                        <Badge variant={s.regularMarketChangePercent >= 0 ? "default" : "secondary"} className={cn(s.regularMarketChangePercent >= 0 ? "text-green-600" : "text-red-600")}>{formatPct(s.regularMarketChangePercent)}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Macro */}
              {macroQuery.data?.map((m) => (
                <Card key={m.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{m.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-semibold">{formatNumber(m.value)} <span className="text-sm font-normal text-muted-foreground">{m.unit}</span></div>
                    <p className="mt-2 text-xs text-muted-foreground">Referência: {m.date || "-"}</p>
                  </CardContent>
                </Card>
              ))}

              {/* Crypto */}
              {cryptoQuery.data?.map((c) => (
                <Card key={c.symbol}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{c.symbol}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-semibold">R$ {formatNumber(c.price)}</div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </section>

        {/* Tabela completa */}
        <section>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead className="text-right">Preço/Valor</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.key} className="hover:bg-muted/30">
                    <TableCell className="w-10">
                      <button
                        onClick={() => toggle(r.key)}
                        aria-label={favs.includes(r.key) ? "Remover dos favoritos" : "Favoritar"}
                        className="inline-flex items-center justify-center"
                      >
                        <Star className={cn("h-4 w-4", favs.includes(r.key) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-muted-foreground">{r.group}</TableCell>
                    <TableCell className="text-right">{typeof r.value === "number" ? (r.group === "Juros/Inflação" ? `${formatNumber(r.value)} %` : `R$ ${formatNumber(r.value)}`) : r.value || "-"}</TableCell>
                    <TableCell className="text-right">
                      {r.changePct !== undefined ? (
                        <span className={cn(r.changePct >= 0 ? "text-green-600" : "text-red-600")}>{formatPct(r.changePct)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Mercado – Cotações em Tempo Real',
          description: 'Cotações em tempo real: câmbio, ações, índices, juros, inflação e cripto.',
          url: typeof window !== 'undefined' ? window.location.href : 'https://investorion.com.br/mercado',
        })}
      </script>
    </>
  );
}