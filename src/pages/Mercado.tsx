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
import { fetchBCBSeries } from "@/lib/market";
import { useQuotes, AssetIdentifier } from "@/hooks/useQuotes";
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

const assetsToFetch: AssetIdentifier[] = [
  { ticker: 'USD-BRL', type: 'FX' },
  { ticker: 'EUR-BRL', type: 'FX' },
  { ticker: '^BVSP', type: 'STOCK' },
  { ticker: 'IFIX', type: 'STOCK' },
  { ticker: 'PETR4', type: 'STOCK' },
  { ticker: 'VALE3', type: 'STOCK' },
  { ticker: 'BTC', type: 'CRYPTO' },
  { ticker: 'ETH', type: 'CRYPTO' },
];

const bcbSeries = [
  { id: 12, name: "CDI", unit: "% a.a." },
  { id: 432, name: "Selic", unit: "% a.a." },
  { id: 433, name: "IPCA", unit: "% a.a." },
];

export default function Mercado() {
  const [q, setQ] = useState("");
  const { favs, toggle } = useFavorites();

  const { data: quotes = [], isLoading: isLoadingQuotes, refetch: refetchQuotes } = useQuotes(assetsToFetch, {
    refetchInterval: 45_000,
  });

  const macroQuery = useQuery({
    queryKey: ["macro", bcbSeries.map((s) => s.id)],
    queryFn: () => fetchBCBSeries(bcbSeries),
    refetchInterval: 60_000,
  });

  const isLoading = isLoadingQuotes || macroQuery.isLoading;

  const rows = useMemo(() => {
    const list: { key: string; label: string; value?: number | string; changePct?: number; group: string }[] = [];

    quotes.forEach(q => {
      let group = "Outros";
      if (q.type === 'FX') group = "Câmbio";
      else if (q.type === 'CRYPTO') group = "Cripto";
      else if (q.type === 'STOCK') group = "Ações/Índices";

      list.push({
        key: q.symbol,
        label: q.name || q.symbol,
        value: q.price,
        changePct: q.changePct ?? undefined,
        group: group,
      });
    });

    macroQuery.data?.forEach((m) => {
      list.push({ key: m.name, label: m.name, value: m.value, group: "Juros/Inflação" });
    });

    return list;
  }, [quotes, macroQuery.data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? rows.filter((r) => r.key.toLowerCase().includes(term) || r.label.toLowerCase().includes(term) || r.group.toLowerCase().includes(term)) : rows;
    return base.sort((a, b) => Number(favs.includes(b.key)) - Number(favs.includes(a.key)) || a.label.localeCompare(b.label));
  }, [rows, q, favs]);

  const refreshAll = () => {
    refetchQuotes();
    macroQuery.refetch();
  };

  const findQuote = (symbol: string) => quotes.find(item => item.symbol === symbol || item.symbol === symbol.replace('/', '-'));

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

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={`sk-${i}`}>
                <CardHeader className="pb-2"><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="pt-0 space-y-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-16" /></CardContent>
              </Card>
            ))
          ) : (
            <>
              {assetsToFetch.map(asset => {
                const quote = findQuote(asset.ticker);
                if (!quote) return null;
                return (
                  <Card key={quote.symbol}>
                    <CardHeader className="pb-2"><CardTitle className="text-base">{quote.name || quote.symbol}</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-semibold">{quote.type === 'FX' ? `R$ ${formatNumber(quote.price, 4)}` : `R$ ${formatNumber(quote.price)}`}</div>
                        {quote.changePercent !== null && (
                          <Badge variant={quote.changePercent >= 0 ? "default" : "secondary"} className={cn(quote.changePercent >= 0 ? "text-green-600" : "text-red-600")}>{formatPct(quote.changePercent)}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {macroQuery.data?.map((m) => (
                <Card key={m.name}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{m.name}</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-semibold">{formatNumber(m.value)} <span className="text-sm font-normal text-muted-foreground">{m.unit}</span></div>
                    <p className="mt-2 text-xs text-muted-foreground">Referência: {m.date || "-"}</p>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </section>

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
                      <button onClick={() => toggle(r.key)} aria-label={favs.includes(r.key) ? "Remover dos favoritos" : "Favoritar"} className="inline-flex items-center justify-center">
                        <Star className={cn("h-4 w-4", favs.includes(r.key) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-muted-foreground">{r.group}</TableCell>
                    <TableCell className="text-right">{typeof r.value === "number" ? (r.group === "Juros/Inflação" ? `${formatNumber(r.value)} %` : `R$ ${formatNumber(r.value)}`) : r.value || "-"}</TableCell>
                    <TableCell className="text-right">
                      {r.changePct !== undefined ? (<span className={cn(r.changePct >= 0 ? "text-green-600" : "text-red-600")}>{formatPct(r.changePct)}</span>) : (<span className="text-muted-foreground">-</span>)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  );
}