import { useEffect, useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getAssets } from "@/lib/storage";
import { getSimplePricesBRL } from "@/lib/crypto";
import type { Asset } from "@/types/asset";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary-foreground))", "hsl(var(--muted-foreground))"];

function formatCurrencyBRL(value: number) {
  if (isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Carrega os ativos do localStorage quando o componente é montado.
    setAssets(getAssets());
  }, []);

  // Extrai os IDs das criptomoedas da carteira para buscar seus preços.
  const cryptoIds = useMemo(
    () => assets.filter((a) => a.type === "CRIPTO" && a.coinId).map((a) => a.coinId!),
    [assets]
  );

  // Busca os preços atuais das criptomoedas em BRL.
  const { data: cryptoPrices, isLoading: isLoadingPrices } = useQuery({
    queryKey: ["portfolioCryptoPrices", cryptoIds],
    queryFn: () => getSimplePricesBRL(cryptoIds),
    enabled: cryptoIds.length > 0,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  // Calcula o valor total atual do patrimônio.
  const totalValue = useMemo(() => {
    if (!assets.length) return 0;
    return assets.reduce((sum, asset) => {
      if (asset.type === "CRIPTO" && asset.coinId && cryptoPrices?.[asset.coinId] && asset.quantity) {
        // Para cripto, usa o preço atual * quantidade.
        return sum + cryptoPrices[asset.coinId] * asset.quantity;
      }
      // Para outros ativos, usa o valor salvo.
      return sum + asset.amount;
    }, 0);
  }, [assets, cryptoPrices]);

  // Prepara os dados para o gráfico de composição (pizza).
  const compositionData = useMemo(() => {
    if (!assets.length) return [];
    const compositionMap = new Map<string, number>();

    assets.forEach((asset) => {
      let currentValue = asset.amount;
      if (asset.type === "CRIPTO" && asset.coinId && cryptoPrices?.[asset.coinId] && asset.quantity) {
        currentValue = cryptoPrices[asset.coinId] * asset.quantity;
      }
      compositionMap.set(asset.type, (compositionMap.get(asset.type) || 0) + currentValue);
    });

    return Array.from(compositionMap.entries()).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));
  }, [assets, cryptoPrices]);

  // Prepara os dados para o gráfico histórico de patrimônio (área).
  const historyData = useMemo(() => {
    if (!assets.length) return [{ t: "Início", v: 0 }];
    
    const sortedAssets = [...assets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulativeAmount = 0;
    const series = sortedAssets.map(asset => {
      cumulativeAmount += asset.amount;
      return {
        t: new Date(asset.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        v: cumulativeAmount,
      };
    });

    // Garante que o gráfico não fique vazio se houver apenas um ponto.
    if (series.length === 1) {
      return [{ t: "Início", v: 0 }, ...series];
    }
    
    return series;
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="container py-10 text-center">
        <SEO title="Dashboard — investorion.com.br" />
        <div className="grid place-items-center h-12 w-12 rounded-full border bg-muted mx-auto">
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Seu Dashboard está pronto!</h1>
        <p className="text-muted-foreground">Adicione seu primeiro ativo na página "Carteira" para ver seus gráficos e dados aqui.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-shell-gradient">
      <SEO title="Dashboard — investorion.com.br" description="Resumo do seu patrimônio e desempenho." />
      <section className="container py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patrimônio</CardTitle>
              <CardDescription>Evolução do capital investido ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="1A">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {isLoadingPrices ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    <div className="text-3xl font-semibold">{formatCurrencyBRL(totalValue)}</div>
                  )}
                  <TabsList className="sm:ml-auto">
                    <TabsTrigger value="1A">Histórico</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="1A" className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                        formatter={(value: number) => [formatCurrencyBRL(value), "Patrimônio"]}
                      />
                      <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#pv)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composição da Carteira</CardTitle>
              <CardDescription>Distribuição por tipo de ativo.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={compositionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrencyBRL(value), "Valor"]} />
                  <Legend iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;