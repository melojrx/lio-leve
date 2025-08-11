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
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAssets, saveAssets } from "@/lib/storage";
import { searchCryptos, getSimplePricesBRL } from "@/lib/crypto";
import type { CoinResult } from "@/lib/crypto";
import type { Asset } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

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

// Asset type moved to shared file

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
  // Lista local de ativos (apenas demonstração)
  const [assets, setAssets] = useState<Asset[]>(() => getAssets());
  useEffect(() => { saveAssets(assets); }, [assets]);

  // Sheet state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Wizard Poupança
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [query, setQuery] = useState("");
const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
// Criptoativos
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

// Etapa 2 (Cripto): quantidade e preço unitário BRL
const [qtyStr, setQtyStr] = useState<string>("");
const [unitPriceMask, setUnitPriceMask] = useState<string>("");
const quantity = useMemo(() => {
  const s = qtyStr.replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}, [qtyStr]);
const unitPrice = useMemo(() => parseMaskedCurrencyToNumber(unitPriceMask || "0"), [unitPriceMask]);
const totalBRL = useMemo(() => Math.max(0, quantity * unitPrice), [quantity, unitPrice]);

// KPIs e gráficos do resumo da carteira
const totalAmount = useMemo(() => assets.reduce((sum, a) => sum + (a.amount || 0), 0), [assets]);

const largestClass = useMemo(() => {
  const m = new Map<string, number>();
  assets.forEach((a) => m.set(a.type, (m.get(a.type) || 0) + (a.amount || 0)));
  let res: { name: string; value: number } | null = null;
  m.forEach((v, name) => { if (!res || v > res.value) res = { name, value: v }; });
  return res;
}, [assets]);

const composition = useMemo(() => {
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--muted-foreground))",
    "hsl(var(--secondary))",
  ];
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
  return Object.entries(sums)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ t: `${k.slice(5, 7)}/${k.slice(2, 4)}`, v }));
}, [assets]);

const [showFutureConfirm, setShowFutureConfirm] = useState(false);

// Carrega bancos uma única vez quando a categoria Poupança ou Conta Corrente é aberta na etapa 1
useEffect(() => {
  const needsBanks = (selectedCategory === "Poupança" || selectedCategory === "Conta Corrente");
  if (needsBanks && step === 1 && banks.length === 0 && !loadingBanks) {
    setLoadingBanks(true);
    fetch("https://brasilapi.com.br/api/banks/v1")
      .then((r) => r.json())
      .then((data: Bank[]) => setBanks(data))
      .catch(() => setBanks([]))
      .finally(() => setLoadingBanks(false));
  }
}, [selectedCategory, step, banks.length, loadingBanks]);

// Busca criptomoedas quando categoria "Criptoativos" estiver ativa na etapa 1
useEffect(() => {
  if (selectedCategory !== "Criptoativos" || step !== 1) return;
  const q = query.trim();
  if (!q) { setCryptoResults([]); return; }
  const ctrl = new AbortController();
  setLoadingCryptos(true);
  const t = setTimeout(() => {
    searchCryptos(q, { signal: ctrl.signal })
      .then((res) => setCryptoResults(res))
      .catch(() => setCryptoResults([]))
      .finally(() => setLoadingCryptos(false));
  }, 300);
  return () => { ctrl.abort(); clearTimeout(t); };
}, [selectedCategory, step, query]);

// Obtém preços BRL para os resultados de cripto
useEffect(() => {
  if (selectedCategory !== "Criptoativos" || step !== 1) { setCryptoPrices({}); return; }
  const ids = cryptoResults.map((c) => c.id);
  if (!ids.length) { setCryptoPrices({}); return; }
  setLoadingPrices(true);
  getSimplePricesBRL(ids)
    .then((p) => setCryptoPrices(p))
    .catch(() => setCryptoPrices({}))
    .finally(() => setLoadingPrices(false));
}, [selectedCategory, step, cryptoResults]);

  const filteredBanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Bank[];
    return banks.filter((b) => (b.name || b.fullName)?.toLowerCase().includes(q));
  }, [banks, query]);

function resetWizard() {
  setStep(1);
  setQuery("");
  setSelectedBank(null);
  setSelectedCoin(null);
  setCryptoResults([]);
  setLoadingCryptos(false);
  setCryptoPrices({});
  setLoadingPrices(false);
  setDate(undefined);
  setAmountMask("");
  setCdiMask("");
  setQtyStr("");
  setUnitPriceMask("");
  setShowFutureConfirm(false);
}

function handleCategoryClick(c: Category) {
  setSelectedCategory(c);
  if (c === "Poupança" || c === "Conta Corrente" || c === "Criptoativos") {
    resetWizard();
  }
}

  function handleNextFromStep2() {
    if (!date) return;
    const today = new Date();
    const isFuture = date > new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isFuture) {
      setShowFutureConfirm(true);
    } else {
      finalizeCreation();
    }
  }

function finalizeCreation() {
  if (selectedCategory === "Criptoativos" && selectedCoin) {
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      type: "CRIPTO",
      institution: selectedCoin.name,
      date: (date || new Date()).toISOString(),
      amount: totalBRL,
      coinId: selectedCoin.id,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      coinThumb: selectedCoin.thumb,
      quantity,
      unitPriceBRL: unitPrice,
    } as Asset;
    setAssets((prev) => [newAsset, ...prev]);
    setStep(3);
    return;
  }
  const newAsset: Asset = {
    id: crypto.randomUUID(),
    type: selectedCategory === "Conta Corrente" ? "CONTA_CORRENTE" : "POUPANÇA",
    institution: selectedBank?.fullName || selectedBank?.name || "",
    date: (date || new Date()).toISOString(),
    amount,
    ...(selectedCategory === "Conta Corrente" && cdiPercent > 0 ? { cdiPercent } : {}),
  } as Asset;
  setAssets((prev) => [newAsset, ...prev]);
  setStep(3);
}

  return (
    <div className="min-h-screen">
      <SEO title="Minha Carteira — investorion.com.br" description="Resumo da carteira, composição e histórico de aportes." canonical="/carteira" />

      <Sheet>
        <section className="container py-10 md:py-14">
          <header className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Carteira</h1>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar ativo
              </Button>
            </SheetTrigger>
          </header>

          {assets.length > 0 ? (
            <div className="mt-8 space-y-4">
              {assets.map((a) => (
                <div key={a.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">{a.type}</div>
                      <div className="font-medium">{a.institution}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{format(new Date(a.date), "dd.MM.yyyy")}</div>
                      <div className="font-semibold">{formatCurrencyBRL(a.amount)}</div>
                      <Link to={`/carteira/ativo/${a.id}`} className="inline-block mt-2">
                        <Button size="sm" variant="outline">Ver detalhes</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Estado vazio
            <div className="mt-10 flex flex-col items-center justify-center rounded-lg border p-10 text-center">
              <div className="grid place-items-center h-12 w-12 rounded-full border bg-muted">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-medium">Você ainda não cadastrou nenhum ativo.</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione seu primeiro ativo para começar a acompanhar sua carteira.
              </p>
              <div className="mt-6">
                <SheetTrigger asChild>
                  <Button variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar ativo
                  </Button>
                </SheetTrigger>
              </div>
            </div>
          )}

          {/* Painel lateral */}
          <SheetContent side="right" className="w-full sm:max-w-md">
            {selectedCategory == null ? (
              <>
                <SheetHeader>
                  <SheetTitle>Adicionar novo ativo</SheetTitle>
                  <SheetDescription>
                    Escolha uma categoria para cadastrar manualmente.
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCategoryClick(c)}
                      className="w-full flex items-center justify-between rounded-lg border p-3 text-left hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span aria-hidden className="h-8 w-1 rounded-full bg-primary" />
                        <span className="font-medium">{c}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </>
) : selectedCategory === "Poupança" || selectedCategory === "Conta Corrente" || selectedCategory === "Criptoativos" ? (
              <div className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Adicionar {selectedCategory}</SheetTitle>
<SheetDescription>
  {step === 1 && (selectedCategory === "Criptoativos" ? "Busque e selecione a criptomoeda" : "Busque e selecione a instituição")}
  {step === 2 && (
    selectedCategory === "Conta Corrente"
      ? "Informe a data, o valor aplicado e o % sobre o CDI (opcional)"
      : selectedCategory === "Criptoativos"
        ? "Informe a data, a quantidade e o preço unitário (BRL)"
        : "Informe a data e o valor aplicado"
  )}
  {step === 3 && "Ativo adicionado com sucesso"}
</SheetDescription>
                </SheetHeader>

                {/* Stepper simple indicator */}
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "h-1 flex-1 rounded-full bg-muted",
                        step >= (s as 1 | 2 | 3) && "bg-primary"
                      )}
                    />
                  ))}
                </div>

                {/* Conteúdo das etapas */}
                <div className="mt-6 flex-1 overflow-auto">
                  {step === 1 && (
<div className="space-y-4">
  {selectedCategory === "Criptoativos" ? (
    <>
      <label className="text-sm font-medium">Buscar criptoativo</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Digite o nome da criptomoeda (ex: Bitcoin)"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loadingCryptos ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Buscando criptos...
        </div>
      ) : query ? (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Resultados da pesquisa:</div>
          {cryptoResults.length === 0 ? (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              Nenhuma cripto encontrada.
            </div>
          ) : (
            cryptoResults.slice(0, 10).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCoin(c);
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left hover:bg-muted",
                  selectedCoin?.id === c.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {c.thumb ? (
                      <img src={c.thumb} alt={`${c.name} logo`} className="h-6 w-6 rounded-sm" />
                    ) : (
                      <div className="h-6 w-6 rounded-sm bg-muted" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name} <span className="text-xs text-muted-foreground">({c.symbol})</span></span>
                      <span className="text-xs text-muted-foreground">ID: {c.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {cryptoPrices[c.id] != null ? formatCurrencyBRL(cryptoPrices[c.id]) : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {loadingPrices ? "Atualizando..." : "Cotação em BRL"}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Busque pela criptomoeda usando o campo acima.
        </div>
      )}
    </>
  ) : (
    <>
      <label className="text-sm font-medium">Buscar nova instituição</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Digite o nome da instituição"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loadingBanks ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando instituições...
        </div>
      ) : query ? (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Resultados da pesquisa:</div>
          {filteredBanks.length === 0 ? (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              Nenhuma instituição encontrada.
            </div>
          ) : (
            filteredBanks.slice(0, 10).map((b) => (
              <button
                key={b.ispb + (b.code ?? "")}
                type="button"
                onClick={() => {
                  setSelectedBank(b);
                }}
                className={cn(
                  "w-full rounded-lg border p-3 text-left hover:bg-muted",
                  selectedBank?.ispb === b.ispb && "ring-2 ring-primary"
                )}
              >
                {b.fullName || b.name}
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          Escolha uma instituição financeira usando o campo de busca acima.
        </div>
      )}
    </>
  )}
</div>
                  )}

{step === 2 && (
  <div className="space-y-6">
    {selectedCategory === "Criptoativos" ? (
      <>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Cripto selecionada</div>
              <div className="font-medium">{selectedCoin?.name} <span className="text-xs text-muted-foreground">({selectedCoin?.symbol})</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cotação atual</div>
              <div className="font-semibold">{selectedCoin ? (cryptoPrices[selectedCoin.id] != null ? formatCurrencyBRL(cryptoPrices[selectedCoin.id]) : "—") : "—"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de compra</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd.MM.yyyy") : "DD.MM.AAAA"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade</label>
              <Input
                inputMode="decimal"
                value={qtyStr}
                onChange={(e) => setQtyStr(e.target.value)}
                placeholder="0,00000000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço unitário (BRL)</label>
              <Input
                inputMode="numeric"
                value={unitPriceMask}
                onChange={(e) => {
                  const value = e.target.value;
                  const number = parseMaskedCurrencyToNumber(value);
                  setUnitPriceMask(
                    number ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ""
                  );
                }}
                placeholder="R$ 0,00"
              />
              <p className="text-xs text-muted-foreground">
                Dica: você pode usar a cotação atual como referência.
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold">{formatCurrencyBRL(totalBRL)}</span>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Data e valor do investimento</div>
          <p className="text-sm text-muted-foreground">Agora informe a data e o valor que você aplicou.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de compra</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd.MM.yyyy") : "DD.MM.AAAA"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor aplicado</label>
            <Input
              inputMode="numeric"
              value={amountMask}
              onChange={(e) => {
                const value = e.target.value;
                const number = parseMaskedCurrencyToNumber(value);
                setAmountMask(
                  number ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ""
                );
              }}
              placeholder="R$ 0,00"
            />
          </div>

          {selectedCategory === "Conta Corrente" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">% sobre o CDI (opcional)</label>
              <Input
                inputMode="numeric"
                value={cdiMask}
                onChange={(e) => {
                  const raw = e.target.value;
                  const digits = raw.replace(/\D/g, "");
                  const n = Number(digits) / 100;
                  setCdiMask(
                    n ? `${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : ""
                  );
                }}
                placeholder="0,00% (opcional)"
              />
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}

                  {step === 3 && (
                    <div className="flex h-full flex-col items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-primary" />
                      <h3 className="mt-4 text-lg font-semibold">Adicionado com sucesso</h3>
                      <p className="text-sm text-muted-foreground">O ativo foi adicionado à sua carteira.</p>

                      <div className="mt-6 grid w-full gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCategory(null);
                          }}
                        >
                          Adicionar um novo ativo
                        </Button>
<Button
  onClick={() => {
    resetWizard();
    setSelectedCategory(selectedCategory);
    setStep(1);
  }}
  variant="outline"
>
  Adicionar uma nova {selectedCategory}
</Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer de navegação */}
                {step !== 3 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="flex gap-2">
                      {step > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setStep((s) => (s === 2 ? 1 : 2))}
                        >
                          Voltar
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                        Cancelar
                      </Button>
                    </div>
{step === 1 ? (
  <Button
    disabled={selectedCategory === "Criptoativos" ? !selectedCoin : !selectedBank}
    onClick={() => setStep(2)}
  >
    Avançar
  </Button>
) : (
  <Button
    disabled={selectedCategory === "Criptoativos" ? !date || quantity <= 0 || unitPrice <= 0 : !date || amount <= 0}
    onClick={handleNextFromStep2}
  >
    Avançar
  </Button>
)}
                  </div>
                )}

                {/* Diálogo de confirmação de data futura */}
                <Dialog open={showFutureConfirm} onOpenChange={setShowFutureConfirm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirme o cadastro de aplicação em data futura!</DialogTitle>
                      <DialogDescription>
                        Você está prestes a adicionar uma movimentação em uma data futura. Seu ativo
                        ficará em "Aguardando Precificação" até que tenhamos os dados necessários.
                        Deseja continuar assim mesmo?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowFutureConfirm(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          setShowFutureConfirm(false);
                          finalizeCreation();
                        }}
                      >
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              // Placeholder para outras categorias (não implementadas ainda)
              <>
                <SheetHeader>
                  <SheetTitle>{selectedCategory}</SheetTitle>
                  <SheetDescription>
                    Em breve você poderá cadastrar ativos desta categoria.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                    Voltar às categorias
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </section>
      </Sheet>
    </div>
  );
};

export default Portfolio;
