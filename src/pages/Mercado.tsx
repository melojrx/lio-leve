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
    symbols: ["^BVSP", "IBRX100", "IBXL", "IBXX", "IBRA", "ICON11", "IDIV11", "IFIX11", "IFNC11", "INDX11", "SMLL11", "MLCX11", "UTIP11", "IVBX11", "ISEE11", "IEEX11", "IMOB11"],
    color: "emerald"
  },
  banks: {
    title: "Bancos",
    symbols: ["BBAS3", "ITSA4", "ITUB4", "BBDC4", "BBDC3", "BPAC11", "SANB11", "BMGB4", "BAZA3", "PINE4", "INBR32", "BPAN4", "BRSR6"],
    color: "orange"
  },
  oil: {
    title: "Petróleo & Energia",
    symbols: ["PETR4", "PETR3", "PRIO3", "VBBR3", "UGPA3", "BRAV3", "CSAN3", "RECV3", "3R11", "ELET3", "ELET6", "ENAT3", "ENMT4"],
    color: "red"
  },
  mining: {
    title: "Mineração & Siderurgia",
    symbols: ["VALE3", "CSNA3", "USIM5", "GOAU4", "GGBR4", "FESA4", "GERD3", "GBIO33", "JFEN3", "AZUL4"],
    color: "amber"
  },
  retail: {
    title: "Varejo",
    symbols: ["LREN3", "MGLU3", "VVAR3", "AMER3", "GUAR3", "CEAB3", "CGRA4", "AMAR3", "VSTE3", "SOMA3", "HBSA3", "ALPA4", "GFSA3"],
    color: "purple"
  },
  tech: {
    title: "Tecnologia",
    symbols: ["MGLU3", "B3SA3", "TOTS3", "LWSA3", "TRIS3", "POSI3", "CASH3", "MELI34", "ORVR3", "LOFT3"],
    color: "blue"
  },
  food: {
    title: "Alimentício",
    symbols: ["JBSS3", "BRF3", "MRFG3", "SMTO3", "BEEF3", "CAML3", "MDIA3", "GRND3", "SLCE3", "DTEX3"],
    color: "green"
  },
  utilities: {
    title: "Utilities",
    symbols: ["ELET3", "ELET6", "CPFE3", "CMIG4", "TAEE11", "NEOE3", "CEBR6", "SBSP3", "SAPR11", "COCE5", "CSMG3"],
    color: "cyan"
  },
  construction: {
    title: "Construção Civil",
    symbols: ["MRVE3", "CYRE3", "EZTC3", "EVEN3", "HBOR3", "JHSF3", "TCSA3", "DIRR3", "PDGR3", "ALSO3"],
    color: "gray"
  },
  healthcare: {
    title: "Saúde",
    symbols: ["RDOR3", "HAPV3", "ONCO3", "DASA3", "FLRY3", "AALR3", "QUAL3", "PARD3"],
    color: "rose"
  },
  personalcare: {
    title: "Cuidados Pessoais",
    symbols: ["NATU3", "BOBR4", "NTCO3", "PNVL3", "ABEV3", "HYPE3"],
    color: "pink"
  },
  telecom: {
    title: "Telecomunicações",
    symbols: ["VIVT3", "TIMS3", "OIBR3", "OIBR4", "TELU3"],
    color: "indigo"
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

  // FX – 10s (expandido com mais pares)
  const fxPairs = ["USD-BRL", "EUR-BRL", "GBP-BRL", "JPY-BRL", "ARS-BRL", "CAD-BRL", "AUD-BRL", "CHF-BRL"];
  const fxQuery = useQuery({
    queryKey: ["fx", fxPairs],
    queryFn: () => fetchFX(fxPairs),
    refetchInterval: 10_000,
  });

  // Crypto – 10s (expandido com mais cryptos)
  const cryptoIds = ["bitcoin", "ethereum", "binancecoin", "cardano", "solana", "polygon", "chainlink", "avalanche-2"];
  const cryptoQuery = useQuery({
    queryKey: ["crypto", cryptoIds],
    queryFn: async () => {
      const prices = await getSimplePricesBRL(cryptoIds);
      return [
        { symbol: "BTC", name: "Bitcoin", price: prices.bitcoin },
        { symbol: "ETH", name: "Ethereum", price: prices.ethereum },
        { symbol: "BNB", name: "BNB", price: prices.binancecoin },
        { symbol: "ADA", name: "Cardano", price: prices.cardano },
        { symbol: "SOL", name: "Solana", price: prices.solana },
        { symbol: "MATIC", name: "Polygon", price: prices.polygon },
        { symbol: "LINK", name: "Chainlink", price: prices.chainlink },
        { symbol: "AVAX", name: "Avalanche", price: prices["avalanche-2"] },
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

        {/* Seção Principal: Ações Brasileiras */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-yellow-500"></div>
              <h2 className="text-2xl font-bold tracking-tight">Mercado de Ações Brasileiras</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Tempo real via APIs múltiplas
            </div>
          </div>
          <p className="text-muted-foreground">
            Cotações em tempo real dos principais ativos da B3, organizadas por setores. 
            Sistema com fallback automático entre Yahoo Finance e Brapi.dev.
          </p>
          
          {/* Grid das Seções de Ações */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Object.entries(marketSections).map(([sectionKey, sectionConfig]) => 
              renderSectionTable(sectionKey, sectionConfig, sectionData[sectionKey] || [])
            )}
          </div>
        </div>

        {/* Câmbio e Cripto - Layout expandido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Câmbio */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  Câmbio
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {isLoading ? "..." : `${fxQuery.data?.length || 0} pares`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="font-medium text-xs text-muted-foreground">Par</TableHead>
                      <TableHead className="font-medium text-xs text-muted-foreground text-right">Cotação</TableHead>
                      <TableHead className="font-medium text-xs text-muted-foreground text-right">Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={`fx-skeleton-${i}`} className="border-none">
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      fxQuery.data?.map((f) => (
                        <TableRow key={f.pair} className="border-none hover:bg-muted/30">
                          <TableCell className="font-medium text-sm py-2">{f.pair}</TableCell>
                          <TableCell className="text-right text-sm py-2">
                            R$ {formatNumber(f.bid, 4)}
                          </TableCell>
                          <TableCell className="text-right text-sm py-2">
                            {f.pctChange !== undefined ? (
                              <span className={cn(
                                "font-medium",
                                f.pctChange >= 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {formatPct(f.pctChange)}
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

          {/* Cripto */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  Criptomoedas
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {isLoading ? "..." : `${cryptoQuery.data?.length || 0} cryptos`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="font-medium text-xs text-muted-foreground">Crypto</TableHead>
                      <TableHead className="font-medium text-xs text-muted-foreground">Nome</TableHead>
                      <TableHead className="font-medium text-xs text-muted-foreground text-right">Preço BRL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={`crypto-skeleton-${i}`} className="border-none">
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      cryptoQuery.data?.map((c) => (
                        <TableRow key={c.symbol} className="border-none hover:bg-muted/30">
                          <TableCell className="font-medium text-sm py-2">{c.symbol}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-2">{c.name}</TableCell>
                          <TableCell className="text-right text-sm py-2">
                            R$ {formatNumber(c.price)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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