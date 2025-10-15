import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { usePortfolioSummary, useAssets } from "@/hooks/usePortfolio";
import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TopAssetsCard } from "@/components/dashboard/TopAssetsCard";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))"
];

function formatCurrencyBRL(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return numValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "0,00%";
  return `${numValue.toFixed(2)}%`;
}

const Dashboard = () => {
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError
  } = usePortfolioSummary();

  const {
    data: assets = [],
    isLoading: isLoadingAssets,
    error: assetsError
  } = useAssets();

  const compositionData = useMemo(() => {
    if (!summary?.allocation_by_type) return [];
    return Object.entries(summary.allocation_by_type).map(([name, percentage]) => ({
      name,
      value: percentage || 0,
    }));
  }, [summary]);

  const historyData = useMemo(() => {
    // Placeholder data, can be replaced with real historical data later
    return [
      { name: 'Jan', value: 1000 },
      { name: 'Fev', value: 1200 },
      { name: 'Mar', value: 1100 },
      { name: 'Abr', value: 1500 },
      { name: 'Mai', value: 1800 },
    ];
  }, []);

  const topAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return [...assets]
      .sort((a, b) => (b.quantity * b.average_price) - (a.quantity * a.average_price))
      .slice(0, 5);
  }, [assets]);

  if (isLoadingSummary || isLoadingAssets) {
    return (
      <div className="min-h-screen page-shell-gradient">
        <SEO title="Dashboard — investorion.com.br" />
        <section className="container py-10 md:py-14 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="md:col-span-2 h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-72" />
        </section>
      </div>
    );
  }

  if (summaryError || assetsError) {
    return (
      <div className="container py-10">
        <SEO title="Dashboard — investorion.com.br" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Por favor, tente novamente.
            {(summaryError as Error)?.message && `: ${(summaryError as Error).message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!summary || summary.assets_count === 0) {
    return (
      <div className="container py-10 text-center">
        <SEO title="Dashboard — investorion.com.br" />
        <div className="grid place-items-center h-12 w-12 rounded-full border bg-muted mx-auto">
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Seu Dashboard está pronto!</h1>
        <p className="text-muted-foreground mt-2">
          Adicione seu primeiro ativo na página "Carteira" para ver seus gráficos e dados aqui.
        </p>
        <Link to="/carteira" className="mt-6 inline-block">
          <Button>Ir para Carteira</Button>
        </Link>
      </div>
    );
  }

  const totalValue = summary.current_value || 0;
  const profitLoss = parseFloat(summary.profit_loss || '0');
  const profitLossPercent = parseFloat(summary.profit_loss_percent || '0');
  const isProfitable = profitLoss >= 0;

  return (
    <div className="min-h-screen page-shell-gradient">
      <SEO
        title="Dashboard — investorion.com.br"
        description="Resumo do seu patrimônio e desempenho."
      />
      <section className="container py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
              <CardDescription>Valor atual da carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrencyBRL(totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary.assets_count} {summary.assets_count === 1 ? 'ativo' : 'ativos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <CardDescription>Soma dos aportes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyBRL(summary.total_invested || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
              <CardDescription>Lucro/Prejuízo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center gap-2 ${
                isProfitable ? 'text-green-600' : 'text-red-600'
              }`}>
                {isProfitable && <TrendingUp className="h-5 w-5" />}
                {formatPercent(profitLossPercent)}
              </div>
              <p className={`text-xs mt-2 ${
                isProfitable ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrencyBRL(profitLoss)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
              <CardDescription>Classes de ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(summary.allocation_by_type || {}).length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tipos de ativos diferentes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patrimônio</CardTitle>
              <CardDescription>Evolução do capital investido ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="1A">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-3xl font-semibold">{formatCurrencyBRL(totalValue)}</div>
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
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }}
                        formatter={(value: number) => [formatCurrencyBRL(value), "Patrimônio"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="url(#pv)"
                        strokeWidth={2}
                      />
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
              {compositionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compositionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Alocação"]} />
                    <Legend iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sem dados de composição
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <TopAssetsCard assets={topAssets} totalInvested={summary.total_invested || 0} />
      </section>
    </div>
  );
};

export default Dashboard;