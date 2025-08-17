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

// Definição dos ativos organizados por setor
const marketSections = {
  indices: {
    title: "Índices",
    symbols: ["^BVSP", "IBRX100", "IBXL", "IBXX", "IBRA", "ICON11", "IDIV11", "IFIX11", "IFNC11", "INDX11", "SMLL11", "MLCX11", "UTIP11", "IVBX11"],
    color: "emerald"
  },
  retail: {
    title: "Comércio Varejista", 
    symbols: ["LREN3", "MGLU3", "VVAR3", "AMER3", "GUAR3", "CEAB3", "CGRA4", "AMAR3", "VSTE3", "SOMA3", "HBSA3"],
    color: "purple"
  },
  banks: {
    title: "Bancos",
    symbols: ["BBAS3", "ITSA4", "ITUB4", "BBDC4", "BBDC3", "BPAC11", "SANB11", "BMGB4", "BAZA3", "PINE4", "INBR32"],
    color: "orange"
  },
  oil: {
    title: "Petróleo & Energia",
    symbols: ["PETR4", "PETR3", "VALE3", "PRIO3", "VBBR3", "UGPA3", "BRAV3", "CSAN3", "RECV3", "3R11", "ELET3", "ELET6"],
    color: "red"
  },
  mining: {
    title: "Mineração",
    symbols: ["VALE3", "CSNA3", "USIM5", "GOAU4", "GGBR4", "FESA4", "GERD3", "GBIO33"],
    color: "amber"
  },
  tech: {
    title: "Tecnologia",
    symbols: ["MGLU3", "B3SA3", "TOTS3", "LWSA3", "TRIS3", "POSI3", "CASH3", "MELI34"],
    color: "blue"
  },
  food: {
    title: "Alimentício",
    symbols: ["JBSS3", "BRF3", "MRFG3", "SMTO3", "BEEF3", "CAML3", "MDIA3", "GRND3"],
    color: "green"
  },
  utilities: {
    title: "Utilities",
    symbols: ["ELET3", "ELET6", "CPFE3", "CMIG4", "TAEE11", "NEOE3", "CEBR6", "SBSP3", "SAPR11"],
    color: "cyan"
  },
  construction: {
    title: "Construção Civil",
    symbols: ["MRVE3", "CYRE3", "EZTC3", "EVEN3", "HBOR3", "JHSF3", "TCSA3", "DIRR3"],
    color: "gray"
  },
  personalcare: {
    title: "Cuidados Pessoais",
    symbols: ["NATU3", "BOBR4", "NTCO3", "PNVL3"],
    color: "pink"
  }
};

const bcbSeries = [
  { id: 12, name: "CDI", unit: "% a.a." },
  { id: 432, name: "Selic", unit: "% a.a." },
  { id: 433, name: "IPCA", unit: "% a.a." },
];

export default function Mercado() {
  const [q, setQ] = useState("");
  const { favs, toggle } = useFavorites();

  // Obter todos os símbolos de ações
  const allStockSymbols = useMemo(() => {
    return Object.values(marketSections).flatMap(section => section.symbols);
  }, []);

  // FX – 10s
  const fxQuery = useQuery({
    queryKey: ["fx", ["USD-BRL", "EUR-BRL"]],
    queryFn: () => fetchFX(["USD-BRL", "EUR-BRL"]),
    refetchInterval: 10_000,
  });

  // Crypto – 10s
  const cryptoQuery = useQuery({
    queryKey: ["crypto", ["BTC", "ETH"]],
    queryFn: async () => {
      const prices = await getSimplePricesBRL(["bitcoin", "ethereum"]);
      return [
        { symbol: "BTC", price: prices.bitcoin },
        { symbol: "ETH", price: prices.ethereum },
      ];
    },
    refetchInterval: 10_000,
  });

  // Stocks/Índices – 30s
  const stocksQuery = useQuery({
    queryKey: ["stocks", allStockSymbols],
    queryFn: () => fetchStocks(allStockSymbols),
    refetchInterval: 30_000,
  });

  // Macro (BCB/SGS) – 60s
  const macroQuery = useQuery({
    queryKey: ["macro", bcbSeries.map((s) => s.id)],
    queryFn: () => fetchBCBSeries(bcbSeries),
    refetchInterval: 60_000,
  });

  const isLoading = fxQuery.isLoading || cryptoQuery.isLoading || stocksQuery.isLoading || macroQuery.isLoading;

  // Organizar dados por seção
  const sectionData = useMemo(() => {
    const data: Record<string, any[]> = {};
    
    Object.entries(marketSections).forEach(([sectionKey, section]) => {
      data[sectionKey] = stocksQuery.data?.filter(stock => 
        section.symbols.includes(stock.symbol)
      ) || [];
    });

    return data;
  }, [stocksQuery.data]);

  const refreshAll = () => {
    fxQuery.refetch();
    stocksQuery.refetch();
    cryptoQuery.refetch();
    macroQuery.refetch();
  };

  const renderSectionTable = (sectionKey: string, sectionConfig: any, data: any[]) => {
    if (!data.length && !isLoading) return null;

    return (
      <Card key={sectionKey} className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-${sectionConfig.color}-500`}></div>
              {sectionConfig.title}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {isLoading ? "..." : `${data.length} ativos`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="font-medium text-xs text-muted-foreground">Ativo</TableHead>
                  <TableHead className="font-medium text-xs text-muted-foreground text-right">Preço</TableHead>
                  <TableHead className="font-medium text-xs text-muted-foreground text-right">Variação</TableHead>
                  <TableHead className="font-medium text-xs text-muted-foreground text-right">Volume</TableHead>
                  <TableHead className="font-medium text-xs text-muted-foreground text-right">Var. 12m</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-none">
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  data.map((item) => (
                    <TableRow key={item.symbol} className="border-none hover:bg-muted/30">
                      <TableCell className="font-medium text-sm py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggle(item.symbol)}
                            aria-label={favs.includes(item.symbol) ? "Remover dos favoritos" : "Favoritar"}
                            className="inline-flex items-center justify-center opacity-60 hover:opacity-100"
                          >
                            <Star className={cn("h-3 w-3", favs.includes(item.symbol) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                          </button>
                          {item.symbol}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm py-2">
                        {formatNumber(item.regularMarketPrice, 2)}
                      </TableCell>
                      <TableCell className="text-right text-sm py-2">
                        {item.regularMarketChangePercent !== undefined ? (
                          <span className={cn(
                            "font-medium",
                            item.regularMarketChangePercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPct(item.regularMarketChangePercent)}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground py-2">
                        {item.regularMarketVolume ? (
                          `${(item.regularMarketVolume / 1000000).toFixed(1)}M`
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm py-2">
                        {item.fiftyTwoWeekChangePercent !== undefined ? (
                          <span className={cn(
                            "font-medium",
                            item.fiftyTwoWeekChangePercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {formatPct(item.fiftyTwoWeekChangePercent)}
                          </span>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SEO title="Mercado – Cotações em Tempo Real" description="Cotações em tempo real organizadas por setores: índices, bancos, petróleo, varejo e mais." canonical="/mercado" />
      <main className="container py-8 space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mercado</h1>
            <p className="text-muted-foreground">Cotações em tempo real por setores</p>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Buscar ativo..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              className="w-64" 
            />
            <Button variant="outline" onClick={refreshAll} aria-label="Atualizar">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Seção de Macros (BCB) */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Macros
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Indicadores econômicos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`macro-skeleton-${i}`} className="text-center space-y-2">
                    <Skeleton className="h-5 w-16 mx-auto" />
                    <Skeleton className="h-8 w-20 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ))
              ) : (
                macroQuery.data?.map((m) => (
                  <div key={m.name} className="text-center space-y-1">
                    <div className="font-medium text-sm text-muted-foreground">{m.name}</div>
                    <div className="text-2xl font-bold">{formatNumber(m.value, 2)}%</div>
                    <div className="text-xs text-muted-foreground">Ref: {m.date || "-"}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seções de Ações por Setor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(marketSections).map(([sectionKey, sectionConfig]) => 
            renderSectionTable(sectionKey, sectionConfig, sectionData[sectionKey] || [])
          )}
        </div>

        {/* Câmbio e Cripto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Câmbio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                Câmbio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={`fx-skeleton-${i}`} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <div className="text-right space-y-1">
                      <Skeleton className="h-6 w-16 ml-auto" />
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </div>
                  </div>
                ))
              ) : (
                fxQuery.data?.map((f) => (
                  <div key={f.pair} className="flex justify-between items-center">
                    <div className="font-medium">{f.pair}</div>
                    <div className="text-right">
                      <div className="font-semibold">R$ {formatNumber(f.bid, 4)}</div>
                      {f.pctChange !== undefined && (
                        <div className={cn(
                          "text-sm font-medium",
                          f.pctChange >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatPct(f.pctChange)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Cripto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Criptomoedas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={`crypto-skeleton-${i}`} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-20 ml-auto" />
                  </div>
                ))
              ) : (
                cryptoQuery.data?.map((c) => (
                  <div key={c.symbol} className="flex justify-between items-center">
                    <div className="font-medium">{c.symbol}</div>
                    <div className="font-semibold">R$ {formatNumber(c.price)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Mercado – Cotações em Tempo Real',
          description: 'Cotações em tempo real organizadas por setores: índices, bancos, petróleo, varejo e mais.',
          url: typeof window !== 'undefined' ? window.location.href : 'https://investorion.com.br/mercado',
        })}
      </script>
    </>
  );
}