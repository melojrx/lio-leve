import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  RefreshCcw,
  BarChart3,
  Building2,
  Fuel,
  Pickaxe,
  ShoppingCart,
  Laptop,
  Utensils,
  Zap,
  HardHat,
  Heart,
  Sparkles,
  Smartphone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFX, fetchStocks, fetchBCBSeries } from "@/lib/market";
import { getSimplePricesBRL } from "@/lib/crypto";
import { cn } from "@/lib/utils";

// Hook para gerenciar favoritos
const useFavorites = () => {
  const [favs, setFavs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("market-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggle = (symbol: string) => {
    const newFavs = favs.includes(symbol) 
      ? favs.filter(f => f !== symbol)
      : [...favs, symbol];
    setFavs(newFavs);
    localStorage.setItem("market-favorites", JSON.stringify(newFavs));
  };

  return { favs, toggle };
};

const formatNumber = (n?: number, decimals = 2) => {
  if (n === undefined || n === null) return "-";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatPct = (n?: number) => {
  if (n === undefined || n === null) return "-";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
};

const sectionIcons = {
  indices: BarChart3,
  banks: Building2,
  oil: Fuel,
  mining: Pickaxe,
  retail: ShoppingCart,
  tech: Laptop,
  food: Utensils,
  utilities: Zap,
  construction: HardHat,
  healthcare: Heart,
  personalcare: Sparkles,
  telecom: Smartphone,
};

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
    title: "Petróleo",
    symbols: ["PETR4", "PETR3", "PRIO3", "VBBR3", "UGPA3", "BRAV3", "CSAN3", "RECV3", "3R11", "ELET3", "ELET6", "ENAT3", "ENMT4"],
    color: "red"
  },
  mining: {
    title: "Mineração & Siderurgia",
    symbols: ["VALE3", "CSNA3", "USIM5", "GOAU4", "GGBR4", "FESA4", "GERD3", "GBIO33", "JFEN3", "AZUL4"],
    color: "amber"
  },
  retail: {
    title: "Comércio Varejista",
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
    title: "Produtos de Cuidado Pessoal e de Limpeza",
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

  // Queries para buscar dados
  const fxQuery = useQuery({
    queryKey: ["fx-rates"],
    queryFn: () => fetchFX(),
    refetchInterval: 30000,
  });

  const cryptoQuery = useQuery({
    queryKey: ["crypto-prices-brl"],
    queryFn: () => getSimplePricesBRL(['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'matic-network', 'chainlink', 'avalanche-2']),
    refetchInterval: 60000,
  });

  const stocksQuery = useQuery({
    queryKey: ["stocks", allStockSymbols],
    queryFn: () => fetchStocks(allStockSymbols),
    refetchInterval: 60000,
  });

  const macroQuery = useQuery({
    queryKey: ["bcb-series"],
    queryFn: () => fetchBCBSeries(bcbSeries),
    refetchInterval: 300000, // 5 minutos
  });

  const isLoading = fxQuery.isLoading || cryptoQuery.isLoading || stocksQuery.isLoading || macroQuery.isLoading;

  // Organizar dados por seção
  const sectionData = useMemo(() => {
    if (!stocksQuery.data) return {};

    const result: Record<string, any[]> = {};
    
    Object.entries(marketSections).forEach(([key, section]) => {
      result[key] = section.symbols
        .map(symbol => stocksQuery.data.find(item => item.symbol === symbol))
        .filter(Boolean);
    });

    return result;
  }, [stocksQuery.data]);

  const refreshAll = () => {
    fxQuery.refetch();
    stocksQuery.refetch();
    cryptoQuery.refetch();
    macroQuery.refetch();
  };

  return (
    <>
      <SEO title="Mercado – Cotações em Tempo Real" description="Cotações em tempo real organizadas por setores: índices, bancos, petróleo, varejo e mais." canonical="/mercado" />
      
      <div className="min-h-screen bg-gray-950 text-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          
          {/* Seções de Ações */}
          {Object.entries(sectionData).map(([sectionKey, data]) => {
            const sectionConfig = marketSections[sectionKey];
            if (!data.length && !isLoading) return null;
            
            // Calcular performance média da seção
            const avgChange = data.length > 0 
              ? data.reduce((acc, item) => acc + (item.regularMarketChangePercent || 0), 0) / data.length 
              : 0;
            
            const SectionIcon = sectionIcons[sectionKey as keyof typeof sectionIcons];
            
            return (
              <div key={sectionKey} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <SectionIcon className="w-4 h-4 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">{sectionConfig.title}</h2>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-2 py-1 rounded",
                    avgChange >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                  )}>
                    {formatPct(avgChange)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-medium border-b border-gray-700 pb-2">
                    <span>Ativo</span>
                    <span className="text-right">Preço</span>
                    <span className="text-right">Variação</span>
                    <span className="text-right">Volume</span>
                    <span className="text-right">Var. 12m</span>
                  </div>
                  
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="grid grid-cols-5 gap-2 py-2">
                        <Skeleton className="h-4 w-12 bg-gray-800" />
                        <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                        <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                        <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                        <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                      </div>
                    ))
                  ) : (
                    data.slice(0, 8).map((item) => (
                      <div key={item.symbol} className="grid grid-cols-5 gap-2 py-2 hover:bg-gray-800/50 rounded px-2">
                        <span className="text-sm font-medium text-white truncate">{item.symbol}</span>
                        <span className="text-sm text-right text-white">
                          {formatNumber(item.regularMarketPrice, 2)}
                        </span>
                        <span className={cn(
                          "text-sm text-right font-bold",
                          item.regularMarketChangePercent >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {formatPct(item.regularMarketChangePercent)}
                        </span>
                        <span className="text-xs text-right text-gray-400">
                          {item.regularMarketVolume ? `${(item.regularMarketVolume / 1000).toFixed(0)}K` : "-"}
                        </span>
                        <span className={cn(
                          "text-sm text-right font-bold",
                          item.fiftyTwoWeekChangePercent >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {item.fiftyTwoWeekChangePercent !== undefined ? formatPct(item.fiftyTwoWeekChangePercent) : "-"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Seção de Macros */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Macros</h2>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-medium border-b border-gray-700 pb-2">
                <span>Ativo</span>
                <span className="text-right">Cotação</span>
                <span className="text-right">Variação</span>
                <span className="text-right">Volume</span>
                <span className="text-right">Var. 12m</span>
              </div>
              
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`macro-skeleton-${i}`} className="grid grid-cols-5 gap-2 py-2">
                    <Skeleton className="h-4 w-12 bg-gray-800" />
                    <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                    <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                    <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                    <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                  </div>
                ))
              ) : (
                (macroQuery.data as any)?.slice(0, 8).map((macro: any) => (
                  <div key={macro.name} className="grid grid-cols-5 gap-2 py-2 hover:bg-gray-800/50 rounded px-2">
                    <span className="text-sm font-medium text-white truncate">{macro.name}</span>
                    <span className="text-sm text-right text-white">
                      {formatNumber(macro.value, 2)} {macro.unit}
                    </span>
                    <span className="text-sm text-right text-gray-400">0,00 Bps</span>
                    <span className="text-xs text-right text-gray-400">-</span>
                    <span className="text-sm text-right text-gray-400">-</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Seção de Câmbio */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Câmbio</h2>
              <span className="text-sm font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                0,42%
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium border-b border-gray-700 pb-2">
                <span>Par</span>
                <span className="text-right">Cotação</span>
                <span className="text-right">Variação</span>
              </div>
              
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`fx-skeleton-${i}`} className="grid grid-cols-3 gap-2 py-2">
                    <Skeleton className="h-4 w-12 bg-gray-800" />
                    <Skeleton className="h-4 w-16 bg-gray-800 ml-auto" />
                    <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                  </div>
                ))
              ) : (
                (fxQuery.data as any)?.slice(0, 8).map((fx: any) => (
                  <div key={fx.pair} className="grid grid-cols-3 gap-2 py-2 hover:bg-gray-800/50 rounded px-2">
                    <span className="text-sm font-medium text-white">{fx.pair}</span>
                    <span className="text-sm text-right text-white">
                      {formatNumber(fx.bid, 4)}
                    </span>
                    <span className={cn(
                      "text-sm text-right font-bold",
                      fx.pctChange >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {formatPct(fx.pctChange)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Seção de Criptomoedas */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Criptomoedas</h2>
              <span className="text-sm font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                2,15%
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium border-b border-gray-700 pb-2">
                <span>Crypto</span>
                <span className="text-right">Preço BRL</span>
                <span className="text-right">Variação</span>
              </div>
              
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`crypto-skeleton-${i}`} className="grid grid-cols-3 gap-2 py-2">
                    <Skeleton className="h-4 w-12 bg-gray-800" />
                    <Skeleton className="h-4 w-20 bg-gray-800 ml-auto" />
                    <Skeleton className="h-4 w-12 bg-gray-800 ml-auto" />
                  </div>
                ))
              ) : (
                (cryptoQuery.data as any)?.slice(0, 8).map((crypto: any) => (
                  <div key={crypto.symbol} className="grid grid-cols-3 gap-2 py-2 hover:bg-gray-800/50 rounded px-2">
                    <span className="text-sm font-medium text-white">{crypto.symbol}</span>
                    <span className="text-sm text-right text-white">
                      R$ {formatNumber(crypto.price)}
                    </span>
                    <span className="text-sm text-right text-green-400 font-bold">
                      +2,4%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
      
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