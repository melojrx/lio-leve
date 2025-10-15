import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Wallet,
  MoreHorizontal,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { BackButton } from "@/components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useAssets,
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
  usePortfolioSummary
} from "@/hooks/usePortfolio";
import type { AssetType, Asset } from "@/lib/api";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--secondary))"];

function formatCurrencyBRL(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return numValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const Portfolio = () => {
  // Fetch data from API
  const {
    data: assets = [],
    isLoading: isLoadingAssets,
    error: assetsError
  } = useAssets();

  const {
    data: summary,
    isLoading: isLoadingSummary
  } = usePortfolioSummary();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  // Add asset form state
  const [newTicker, setNewTicker] = useState("");
  const [newType, setNewType] = useState<AssetType>("STOCK");
  const [newSector, setNewSector] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit asset form state
  const [editNotes, setEditNotes] = useState("");

  // Prepare composition data
  const compositionData = useMemo(() => {
    if (!summary?.allocation_by_type) return [];

    return Object.entries(summary.allocation_by_type).map(([name, percentage], index) => ({
      name,
      value: parseFloat(percentage.toString()),
      color: COLORS[index % COLORS.length],
    }));
  }, [summary]);

  // Prepare history data (placeholder)
  const historyData = useMemo(() => {
    if (!assets.length) return [{ t: "Início", v: 0 }];

    const sorted = [...assets].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sorted.map((_, index) => ({
      t: `Mês ${index + 1}`,
      v: index + 1,
    }));
  }, [assets]);

  const handleAddAsset = () => {
    if (!newTicker.trim()) return;

    createAsset.mutate(
      {
        ticker: newTicker.toUpperCase().trim(),
        type: newType,
        sector: newSector.trim() || undefined,
        notes: newNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewTicker("");
          setNewType("STOCK");
          setNewSector("");
          setNewNotes("");
        },
      }
    );
  };

  const handleDeleteAsset = () => {
    if (!assetToDelete) return;
    deleteAsset.mutate(assetToDelete.id, {
      onSuccess: () => setAssetToDelete(null),
    });
  };

  const handleEditAsset = () => {
    if (!assetToEdit) return;
    updateAsset.mutate(
      {
        id: assetToEdit.id,
        data: {
          notes: editNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => setAssetToEdit(null),
      }
    );
  };

  const totalAmount = summary ? parseFloat(summary.total_invested) : 0;
  const largestClass = compositionData.length > 0 ? compositionData[0] : null;

  // Loading state
  if (isLoadingAssets || isLoadingSummary) {
    return (
      <div className="min-h-screen page-shell-gradient">
        <SEO title="Minha Carteira — investorion.com.br" />
        <section className="container py-10 md:py-14">
          <BackButton />
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-96 w-full" />
        </section>
      </div>
    );
  }

  // Error state
  if (assetsError) {
    return (
      <div className="container py-10">
        <SEO title="Minha Carteira — investorion.com.br" />
        <BackButton />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar carteira. Por favor, tente novamente.
            {(assetsError as Error)?.message && `: ${(assetsError as Error).message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-shell-gradient">
      <SEO
        title="Minha Carteira — investorion.com.br"
        description="Resumo da carteira, composição e histórico de aportes."
        canonical="/carteira"
      />

      <section className="container py-10 md:py-14">
        <BackButton />
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Minha Carteira</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Adicionar ativo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Ativo</DialogTitle>
                <DialogDescription>
                  Cadastre um novo ativo na sua carteira. Você poderá adicionar transações depois.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Ticker / Símbolo</label>
                  <Input
                    placeholder="PETR4, ITUB4, BTC, etc."
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <label>Tipo de Ativo</label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as AssetType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOCK">Ação</SelectItem>
                      <SelectItem value="FII">Fundo Imobiliário</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="RENDA_FIXA">Renda Fixa</SelectItem>
                      <SelectItem value="CRYPTO">Criptomoeda</SelectItem>
                      <SelectItem value="FUND">Fundo de Investimento</SelectItem>
                      <SelectItem value="BDR">BDR</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Setor (opcional)</label>
                  <Input
                    placeholder="Tecnologia, Financeiro, etc."
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label>Notas (opcional)</label>
                  <Input
                    placeholder="Observações sobre este ativo"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddAsset}
                  disabled={!newTicker.trim() || createAsset.isPending}
                >
                  {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Tabs defaultValue="resumo" className="mt-6">
          <TabsList className="justify-start">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <h2 className="text-xl font-semibold">Resumo da Carteira</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Bruto</CardTitle>
                  <CardDescription>Visão geral do seu patrimônio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrencyBRL(totalAmount)}</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {largestClass ? `${largestClass.name}: ${largestClass.value.toFixed(1)}%` : "—"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor Aplicado</CardTitle>
                  <CardDescription>Soma de todos os aportes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrencyBRL(totalAmount)}</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {assets.length} {assets.length === 1 ? "ativo" : "ativos"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
                  <CardDescription>Consolidada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary ? `${parseFloat(summary.profit_loss_percent).toFixed(2)}%` : "0,00%"}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {summary && formatCurrencyBRL(summary.profit_loss)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Meta de Patrimônio</CardTitle>
                  <CardDescription>Renda Passiva</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="mt-2 text-xs text-muted-foreground">Meta: R$ -</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Composição da Carteira</CardTitle>
                  <CardDescription>Distribuição por classe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={compositionData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          stroke="transparent"
                        >
                          {compositionData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {compositionData.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Sem dados ainda. Adicione ativos e transações para ver a composição.
                      </p>
                    ) : (
                      compositionData.map((c) => (
                        <div key={c.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                            <span>{c.name}</span>
                          </div>
                          <span className="text-muted-foreground">{c.value.toFixed(1)}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Histórico</CardTitle>
                  <CardDescription>Patrimônio ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <XAxis dataKey="t" tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ativos">
            {assets.length > 0 ? (
              <div className="mt-4 space-y-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">{asset.type_display}</div>
                        <div className="font-medium text-lg">{asset.ticker}</div>
                        {asset.sector && <div className="mt-1 text-sm text-muted-foreground">{asset.sector}</div>}
                        {asset.notes && <div className="mt-2 text-sm">{asset.notes}</div>}
                        <div className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs ${
                          asset.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {asset.status_display}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/carteira/ativo/${asset.id}`}>
                          <Button size="sm" variant="outline">Detalhes</Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setAssetToEdit(asset);
                                setEditNotes(asset.notes || "");
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setAssetToDelete(asset)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center rounded-lg border p-10 text-center">
                <div className="grid place-items-center h-12 w-12 rounded-full border bg-muted">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="mt-4 text-lg font-medium">Você ainda não cadastrou nenhum ativo.</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione seu primeiro ativo para começar a acompanhar sua carteira.
                </p>
                <div className="mt-6">
                  <Button variant="secondary" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar ativo
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!assetToEdit} onOpenChange={(open) => !open && setAssetToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ativo</DialogTitle>
            <DialogDescription>Atualizar informações do ativo {assetToEdit?.ticker}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Notas</label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observações sobre este ativo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetToEdit(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditAsset} disabled={updateAsset.isPending}>
              {updateAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o ativo{" "}
              <strong>{assetToDelete?.ticker}</strong> e todas as suas transações da sua carteira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset} disabled={deleteAsset.isPending}>
              {deleteAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Portfolio;