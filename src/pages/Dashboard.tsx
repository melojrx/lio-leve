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
  // Fetch portfolio summary from API
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError
  } = usePortfolioSummary();

  // Fetch assets for history chart
  const {
    data: assets = [],
    isLoading: isLoadingAssets,
    error: assetsError
  } = useAssets();

  // Prepare composition data for pie chart from API data
  const compositionData = useMemo(() => {
    if (!summary?.allocation_by_type) return [];

    return Object.entries(summary.allocation_by_type).map(([name, percentage], index) => ({
      name,
      value: percentage,
      fill: COLORS[index % COLORS.length],
    }));
  }, [summary]);

  // Prepare historical data for area chart
  const historyData = useMemo(() => {
    if (!assets.length) return [{ t: "Início", v: 0 }];

    const sortedAssets = [...assets].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // For now, use a simple cumulative approach
    // TODO: This should be improved to show actual portfolio value over time
    const series = sortedAssets.map((asset, index) => ({
      t: new Date(asset.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      v: index + 1, // Placeholder - should calculate actual value
    }));

    if (series.length === 1) {
      return [{ t: "Início", v: 0 }, ...series];
    }

    return series;
  }, [assets]);

  // Show loading skeleton
  if (isLoadingSummary || isLoadingAssets) {
    return (
      <div className="min-h-screen page-shell-gradient">
        <SEO title="Dashboard — investorion.com.br" />
        <section className="container py-10 md:py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  // Show error state
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

  // Show empty state
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

  const totalValue = parseFloat(summary.current_value);
  const profitLoss = parseFloat(summary.profit_loss);
  const profitLossPercent = parseFloat(summary.profit_loss_percent);
  const isProfitable = profitLoss >= 0;

  return (
    <div className="min-h-screen page-shell-gradient">
      <SEO
        title="Dashboard — investorion.com.br"
        description="Resumo do seu patrimônio e desempenho."
      />
      <section className="container py-10 md:py-14">
        {/* Summary Cards */}
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
                {formatCurrencyBRL(summary.total_invested)}
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

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-3">
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
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
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
                        dataKey="v"
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
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
      </section>
    </div>
  );
};

export default Dashboard;
