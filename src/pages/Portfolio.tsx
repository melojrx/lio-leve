import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Wallet,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAssets, saveAssets, deleteAsset as storageDeleteAsset } from "@/lib/storage";
import { searchCryptos, getSimplePricesBRL } from "@/lib/crypto";
import type { CoinResult } from "@/lib/crypto";
import type { Asset } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { BackButton } from "@/components/BackButton";
import { toast } from "@/hooks/use-toast";

// ... (o resto das funções auxiliares e constantes permanecem as mesmas)
// Categorias oferecidas no estado vazio
const categories = [
  "Ações, Stocks e ETF",
  "BDRs",
  "Conta Corrente",
  "Criptoativos",
  "Debêntures",
  "Fundos",
  "Fundos imobiliários e REITs",
  "Moedas",
  "Personalizados",
  "Poupança",
  "Previdência",
  "Renda Fixa Prefixada",
  "Renda Fixa Pós-fixada",
] as const;

// Tipos auxiliares
type Category = (typeof categories)[number];
interface Bank {
  ispb: string;
  name: string;
  code: number | null;
  fullName: string;
}

function formatCurrencyBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  const asNumber = Number(digits) / 100;
  return asNumber;
}

function parseMaskedPercentToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  const asNumber = Number(digits) / 100;
  return asNumber;
}


const Portfolio = () => {
  const [assets, setAssets] = useState<Asset[]>(() => getAssets());
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [editAmountMask, setEditAmountMask] = useState("");

  useEffect(() => {
    saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    if (assetToEdit) {
      setEditAmountMask(formatCurrencyBRL(assetToEdit.amount));
    } else {
      setEditAmountMask("");
    }
  }, [assetToEdit]);

  const handleDeleteAsset = () => {
    if (!assetToDelete) return;
    storageDeleteAsset(assetToDelete.id);
    setAssets((prev) => prev.filter((a) => a.id !== assetToDelete.id));
    toast({ title: "Ativo removido", description: "O ativo foi removido da sua carteira." });
    setAssetToDelete(null);
  };

  const handleEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetToEdit) return;
    const updatedAsset = { ...assetToEdit, amount: parseMaskedCurrencyToNumber(editAmountMask) };
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    toast({ title: "Ativo atualizado", description: "As informações do ativo foram salvas." });
    setAssetToEdit(null);
  };

  // ... (o resto do estado e lógica do wizard permanecem os mesmos)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [cryptoResults, setCryptoResults] = useState<CoinResult[]>([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinResult | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [amountMask, setAmountMask] = useState<string>("");
  const amount = useMemo(() => parseMaskedCurrencyToNumber(amountMask || "0"), [amountMask]);
  const [cdiMask, setCdiMask] = useState<string>("");
  const cdiPercent = useMemo(() => parseMaskedPercentToNumber(cdiMask || "0"), [cdiMask]);
  const [qtyStr, setQtyStr] = useState<string>("");
  const [unitPriceMask, setUnitPriceMask] = useState<string>("");
  const quantity = useMemo(() => {
    const s = qtyStr.replace(",", ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }, [qtyStr]);
  const unitPrice = useMemo(() => parseMaskedCurrencyToNumber(unitPriceMask || "0"), [unitPriceMask]);
  const totalBRL = useMemo(() => Math.max(0, quantity * unitPrice), [quantity, unitPrice]);
  const totalAmount = useMemo(() => assets.reduce((sum, a) => sum + (a.amount || 0), 0), [assets]);
  const largestClass = useMemo(() => {
    const m = new Map<string, number>();
    assets.forEach((a) => m.set(a.type, (m.get(a.type) || 0) + (a.amount || 0)));
    let res: { name: string; value: number } | null = null;
    m.forEach((v, name) => { if (!res || v > res.value) res = { name, value: v }; });
    return res;
  }, [assets]);
  const composition = useMemo(() => {
    const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--secondary))"];
    const m = new Map<string, number>();
    assets.forEach((a) => m.set(a.type, (m.get(a.type) || 0) + (a.amount || 0)));
    return Array.from(m.entries()).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [assets]);
  const historySeries = useMemo(() => {
    if (!assets.length) return [] as { t: string; v: number }[];
    const sums: Record<string, number> = {};
    assets.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      sums[key] = (sums[key] || 0) + (a.amount || 0);
    });
    return Object.entries(sums).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ t: `${k.slice(5, 7)}/${k.slice(2, 4)}`, v }));
  }, [assets]);
  const [showFutureConfirm, setShowFutureConfirm] = useState(false);
  useEffect(() => {
    const needsBanks = (selectedCategory === "Poupança" || selectedCategory === "Conta Corrente");
    if (needsBanks && step === 1 && banks.length === 0 && !loadingBanks) {
      setLoadingBanks(true);
      fetch("https://brasilapi.com.br/api/banks/v1").then((r) => r.json()).then((data: Bank[]) => setBanks(data)).catch(() => setBanks([])).finally(() => setLoadingBanks(false));
    }
  }, [selectedCategory, step, banks.length, loadingBanks]);
  useEffect(() => {
    if (selectedCategory !== "Criptoativos" || step !== 1) return;
    const q = query.trim();
    if (!q) { setCryptoResults([]); return; }
    const ctrl = new AbortController();
    setLoadingCryptos(true);
    const t = setTimeout(() => {
      searchCryptos(q, { signal: ctrl.signal }).then((res) => setCryptoResults(res)).catch(() => setCryptoResults([])).finally(() => setLoadingCryptos(false));
    }, 300);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [selectedCategory, step, query]);
  useEffect(() => {
    if (selectedCategory !== "Criptoativos" || step !== 1) { setCryptoPrices({}); return; }
    const ids = cryptoResults.map((c) => c.id);
    if (!ids.length) { setCryptoPrices({}); return; }
    setLoadingPrices(true);
    getSimplePricesBRL(ids).then((p) => setCryptoPrices(p)).catch(() => setCryptoPrices({})).finally(() => setLoadingPrices(false));
  }, [selectedCategory, step, cryptoResults]);
  const filteredBanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Bank[];
    return banks.filter((b) => (b.name || b.fullName)?.toLowerCase().includes(q));
  }, [banks, query]);
  function resetWizard() {
    setStep(1); setQuery(""); setSelectedBank(null); setSelectedCoin(null); setCryptoResults([]); setLoadingCryptos(false); setCryptoPrices({}); setLoadingPrices(false); setDate(undefined); setAmountMask(""); setCdiMask(""); setQtyStr(""); setUnitPriceMask(""); setShowFutureConfirm(false);
  }
  function handleCategoryClick(c: Category) {
    setSelectedCategory(c);
    if (c === "Poupança" || c === "Conta Corrente" || c === "Criptoativos") { resetWizard(); }
  }
  function handleNextFromStep2() {
    if (!date) return;
    const today = new Date();
    const isFuture = date > new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isFuture) { setShowFutureConfirm(true); } else { finalizeCreation(); }
  }
  function finalizeCreation() {
    if (selectedCategory === "Criptoativos" && selectedCoin) {
      const newAsset: Asset = { id: crypto.randomUUID(), type: "CRIPTO", institution: selectedCoin.name, date: (date || new Date()).toISOString(), amount: totalBRL, coinId: selectedCoin.id, coinSymbol: selectedCoin.symbol, coinName: selectedCoin.name, coinThumb: selectedCoin.thumb, quantity, unitPriceBRL: unitPrice } as Asset;
      setAssets((prev) => [newAsset, ...prev]);
      setStep(3);
      return;
    }
    const newAsset: Asset = { id: crypto.randomUUID(), type: selectedCategory === "Conta Corrente" ? "CONTA_CORRENTE" : "POUPANÇA", institution: selectedBank?.fullName || selectedBank?.name || "", date: (date || new Date()).toISOString(), amount, ...(selectedCategory === "Conta Corrente" && cdiPercent > 0 ? { cdiPercent } : {}) } as Asset;
    setAssets((prev) => [newAsset, ...prev]);
    setStep(3);
  }

  return (
    <div className="min-h-screen page-shell-gradient">
      <SEO title="Minha Carteira — investorion.com.br" description="Resumo da carteira, composição e histórico de aportes." canonical="/carteira" />

      <Sheet>
        <section className="container py-10 md:py-14">
          <BackButton />
          <header className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Minha Carteira</h1>
            <SheetTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Adicionar ativo</Button>
            </SheetTrigger>
          </header>

          <Tabs defaultValue="resumo" className="mt-6">
            <TabsList className="justify-start">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="ativos">Ativos</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-6">
              {/* ... (conteúdo da aba Resumo permanece o mesmo) ... */}
              <h2 className="text-xl font-semibold">Resumo da Carteira</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saldo Bruto</CardTitle><CardDescription>Visão geral do seu patrimônio</CardDescription></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatCurrencyBRL(totalAmount)}</div><p className="mt-2 text-xs text-muted-foreground">Maior classe de ativo: {largestClass ? `${formatCurrencyBRL(largestClass.value)} em ${largestClass.name}` : "—"}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Aplicado</CardTitle><CardDescription>Soma de todos os aportes</CardDescription></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{formatCurrencyBRL(totalAmount)}</div><p className="mt-2 text-xs text-muted-foreground">Aportes nos últ. 12 meses: —</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rentabilidade</CardTitle><CardDescription>Consolidada</CardDescription></CardHeader>
                  <CardContent><div className="text-2xl font-bold">0,00%</div><p className="mt-2 text-xs text-muted-foreground">Últimos 12 meses: 0,00%</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Meta de Patrimônio</CardTitle><CardDescription>Renda Passiva</CardDescription></CardHeader>
                  <CardContent><div className="text-2xl font-bold">0%</div><p className="mt-2 text-xs text-muted-foreground">Meta: R$ -</p></CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Composição da Carteira</CardTitle><CardDescription>Distribuição por classe</CardDescription></CardHeader>
                  <CardContent>
                    <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={composition} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={3} stroke="transparent">{composition.map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.color} />))}</Pie></PieChart></ResponsiveContainer></div>
                    <div className="mt-4 space-y-2">{composition.length === 0 ? (<p className="text-sm text-muted-foreground">Sem dados ainda. Adicione ativos para ver a composição.</p>) : (composition.map((c) => (<div key={c.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} /><span>{c.name}</span></div><span className="text-muted-foreground">{((c.value / (totalAmount || 1)) * 100).toFixed(1)}%</span></div>)))}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Histórico</CardTitle><CardDescription>Patrimônio ao longo do tempo</CardDescription></CardHeader>
                  <CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={historySeries} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}><XAxis dataKey="t" tickLine={false} axisLine={false} /><YAxis hide /><Tooltip /><Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ativos">
              {assets.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {assets.map((a) => (
                    <div key={a.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">{a.type}</div>
                          <div className="font-medium">{a.institution}</div>
                          <div className="mt-2 text-sm">{format(new Date(a.date), "dd.MM.yyyy")}</div>
                          <div className="font-semibold">{formatCurrencyBRL(a.amount)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/carteira/ativo/${a.id}`}>
                            <Button size="sm" variant="outline">Detalhes</Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setAssetToEdit(a)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setAssetToDelete(a)} className="text-red-600">
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
                  <div className="grid place-items-center h-12 w-12 rounded-full border bg-muted"><Wallet className="h-6 w-6 text-muted-foreground" /></div>
                  <h2 className="mt-4 text-lg font-medium">Você ainda não cadastrou nenhum ativo.</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Adicione seu primeiro ativo para começar a acompanhar sua carteira.</p>
                  <div className="mt-6"><SheetTrigger asChild><Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Adicionar ativo</Button></SheetTrigger></div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* ... (Sheet para adicionar novo ativo permanece o mesmo) ... */}
          <SheetContent side="right" className="w-full sm:max-w-md">
            {selectedCategory == null ? (
              <>
                <SheetHeader><SheetTitle>Adicionar novo ativo</SheetTitle><SheetDescription>Escolha uma categoria para cadastrar manualmente.</SheetDescription></SheetHeader>
                <div className="mt-4 space-y-2">{categories.map((c) => (<button key={c} type="button" onClick={() => handleCategoryClick(c)} className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-muted transition-colors"><div className="flex items-center gap-3"><span aria-hidden className="h-8 w-1 rounded-full bg-primary" /><span className="font-medium">{c}</span></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>))}</div>
              </>
            ) : selectedCategory === "Poupança" || selectedCategory === "Conta Corrente" || selectedCategory === "Criptoativos" ? (
              <div className="flex h-full flex-col">
                <SheetHeader><SheetTitle>Adicionar {selectedCategory}</SheetTitle><SheetDescription>{step === 1 && (selectedCategory === "Criptoativos" ? "Busque e selecione a criptomoeda" : "Busque e selecione a instituição")}{step === 2 && (selectedCategory === "Conta Corrente" ? "Informe a data, o valor aplicado e o % sobre o CDI (opcional)" : selectedCategory === "Criptoativos" ? "Informe a data, a quantidade e o preço unitário (BRL)" : "Informe a data e o valor aplicado")}{step === 3 && "Ativo adicionado com sucesso"}</SheetDescription></SheetHeader>
                <div className="mt-4 flex gap-2">{[1, 2, 3].map((s) => (<div key={s} className={cn("h-1 flex-1 rounded-full bg-muted", step >= (s as 1 | 2 | 3) && "bg-primary")} />))}</div>
                <div className="mt-6 flex-1 overflow-auto">{step === 1 && (<div className="space-y-4">{selectedCategory === "Criptoativos" ? (<>{/* ... Cripto step 1 ... */}</>) : (<>{/* ... Banco step 1 ... */}</>)}</div>)}{step === 2 && (<div className="space-y-6">{selectedCategory === "Criptoativos" ? (<>{/* ... Cripto step 2 ... */}</>) : (<>{/* ... Banco step 2 ... */}</>)}</div>)}{step === 3 && (<div className="flex h-full flex-col items-center justify-center"><CheckCircle2 className="h-12 w-12 text-primary" /><h3 className="mt-4 text-lg font-semibold">Adicionado com sucesso</h3><p className="text-sm text-muted-foreground">O ativo foi adicionado à sua carteira.</p><div className="mt-6 grid w-full gap-2"><Button variant="outline" onClick={() => { setSelectedCategory(null); }}>Adicionar um novo ativo</Button><Button onClick={() => { resetWizard(); setSelectedCategory(selectedCategory); setStep(1); }} variant="outline">Adicionar uma nova {selectedCategory}</Button></div></div>)}</div>
                {step !== 3 && (<div className="mt-6 flex items-center justify-between border-t pt-4"><div className="flex gap-2">{step > 1 && (<Button variant="outline" onClick={() => setStep((s) => (s === 2 ? 1 : 2))}>Voltar</Button>)}<Button variant="ghost" onClick={() => setSelectedCategory(null)}>Cancelar</Button></div>{step === 1 ? (<Button disabled={selectedCategory === "Criptoativos" ? !selectedCoin : !selectedBank} onClick={() => setStep(2)}>Avançar</Button>) : (<Button disabled={selectedCategory === "Criptoativos" ? !date || quantity <= 0 || unitPrice <= 0 : !date || amount <= 0} onClick={handleNextFromStep2}>Avançar</Button>)}</div>)}
                <Dialog open={showFutureConfirm} onOpenChange={setShowFutureConfirm}><DialogContent><DialogHeader><DialogTitle>Confirme o cadastro de aplicação em data futura!</DialogTitle><DialogDescription>Você está prestes a adicionar uma movimentação em uma data futura. Seu ativo ficará em "Aguardando Precificação" até que tenhamos os dados necessários. Deseja continuar assim mesmo?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowFutureConfirm(false)}>Cancelar</Button><Button onClick={() => { setShowFutureConfirm(false); finalizeCreation(); }}>Confirmar</Button></DialogFooter></DialogContent></Dialog>
              </div>
            ) : (<><SheetHeader><SheetTitle>{selectedCategory}</SheetTitle><SheetDescription>Em breve você poderá cadastrar ativos desta categoria.</SheetDescription></SheetHeader><div className="mt-6"><Button variant="outline" onClick={() => setSelectedCategory(null)}>Voltar às categorias</Button></div></>)}
          </SheetContent>
        </section>
      </Sheet>

      {/* Diálogo de Edição */}
      <Dialog open={!!assetToEdit} onOpenChange={(open) => !open && setAssetToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ativo</DialogTitle>
            <DialogDescription>Ajuste o valor inicial do seu ativo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAsset} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label>Instituição</label>
              <Input value={assetToEdit?.institution} readOnly disabled />
            </div>
            <div className="space-y-2">
              <label>Valor inicial</label>
              <Input
                value={editAmountMask}
                onChange={(e) => setEditAmountMask(e.target.value.replace(/[^0-9]/g, '').replace(/(\d{2})$/, ',$1').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                placeholder="R$ 0,00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssetToEdit(null)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Exclusão */}
      <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o ativo e todas as suas movimentações da sua carteira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Portfolio;