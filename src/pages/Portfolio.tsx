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
import { searchCryptos } from "@/lib/crypto";
import type { CoinResult } from "@/lib/crypto";
import type { Asset } from "@/types/asset";

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
  setDate(undefined);
  setAmountMask("");
  setCdiMask("");
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
      <SEO title="Carteira — investorion.com.br" description="Lista detalhada de ativos e posições." />

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
                                  setStep(2);
                                }}
                                className="w-full rounded-lg border p-3 text-left hover:bg-muted"
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
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
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
                      <Button disabled={!selectedBank} onClick={() => setStep(2)}>
                        Avançar
                      </Button>
                    ) : (
                      <Button disabled={!date || amount <= 0} onClick={handleNextFromStep2}>
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
