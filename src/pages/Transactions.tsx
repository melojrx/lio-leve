import SEO from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Plus, Search, Calendar as CalendarIcon, ArrowUpDown, AlertCircle, Loader2 } from "lucide-react";
import { useTransactions, useCreateTransaction, useAssets } from "@/hooks/usePortfolio";
import type { Transaction, TransactionType } from "@/lib/api";

function formatCurrencyBRL(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return numValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  return Number(digits) / 100;
}

const Transactions = () => {
  // Fetch data from API
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useTransactions();

  const {
    data: assets = [],
    isLoading: isLoadingAssets
  } = useAssets();

  const createTransaction = useCreateTransaction();

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  // State for "Add Transaction" dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [newType, setNewType] = useState<TransactionType>("BUY");
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [quantityStr, setQuantityStr] = useState("");
  const [unitPriceMask, setUnitPriceMask] = useState("");
  const [feesMask, setFeesMask] = useState("");

  const quantity = useMemo(() => {
    const n = parseFloat(quantityStr.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [quantityStr]);

  const unitPrice = useMemo(() => parseMaskedCurrencyToNumber(unitPriceMask), [unitPriceMask]);
  const fees = useMemo(() => parseMaskedCurrencyToNumber(feesMask), [feesMask]);
  const total = useMemo(() => (quantity * unitPrice) + fees, [quantity, unitPrice, fees]);

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) => {
      const searchMatch = tx.asset_ticker.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === "all" || tx.type === typeFilter;
      return searchMatch && typeMatch;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [transactions, searchQuery, typeFilter, sortConfig]);

  const requestSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddTransaction = () => {
    if (!selectedAssetId || !newDate || quantity <= 0 || unitPrice <= 0) {
      return;
    }

    createTransaction.mutate(
      {
        asset: selectedAssetId,
        type: newType,
        quantity: quantity.toString(),
        unit_price: unitPrice.toString(),
        fees: fees.toString(),
        date: newDate.toISOString(),
      },
      {
        onSuccess: () => {
          // Reset form
          setIsDialogOpen(false);
          setSelectedAssetId("");
          setNewType("BUY");
          setNewDate(undefined);
          setQuantityStr("");
          setUnitPriceMask("");
          setFeesMask("");
        },
      }
    );
  };

  // Loading state
  if (isLoadingTransactions || isLoadingAssets) {
    return (
      <div className="min-h-screen">
        <SEO title="Transações — investorion.com.br" />
        <section className="container py-10 md:py-14">
          <BackButton />
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-64 w-full" />
        </section>
      </div>
    );
  }

  // Error state
  if (transactionsError) {
    return (
      <div className="container py-10">
        <SEO title="Transações — investorion.com.br" />
        <BackButton />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar transações. Por favor, tente novamente.
            {(transactionsError as Error)?.message && `: ${(transactionsError as Error).message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Transações — investorion.com.br"
        description="Histórico de compras e vendas."
      />
      <section className="container py-10 md:py-14">
        <BackButton />
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Transações</h1>
            <p className="mt-1 text-sm text-muted-foreground">Seu histórico completo de movimentações.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Ativo</label>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ativo" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.ticker} - {asset.type_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Tipo</label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as TransactionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Compra</SelectItem>
                      <SelectItem value="SELL">Venda</SelectItem>
                      <SelectItem value="TRANSFER">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Data</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {newDate ? format(newDate, "dd/MM/yyyy") : "Selecione"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={newDate} onSelect={setNewDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label>Quantidade</label>
                    <Input
                      placeholder="0,00"
                      value={quantityStr}
                      onChange={(e) => setQuantityStr(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Preço unitário</label>
                    <Input
                      placeholder="R$ 0,00"
                      value={unitPriceMask}
                      onChange={(e) =>
                        setUnitPriceMask(
                          e.target.value
                            .replace(/[^0-9]/g, "")
                            .replace(/(\d{2})$/, ",$1")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label>Taxas (opcional)</label>
                  <Input
                    placeholder="R$ 0,00"
                    value={feesMask}
                    onChange={(e) =>
                      setFeesMask(
                        e.target.value
                          .replace(/[^0-9]/g, "")
                          .replace(/(\d{2})$/, ",$1")
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      )
                    }
                  />
                </div>
                {quantity > 0 && unitPrice > 0 && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrencyBRL(quantity * unitPrice)}</span>
                    </div>
                    {fees > 0 && (
                      <div className="flex justify-between">
                        <span>Taxas:</span>
                        <span>{formatCurrencyBRL(fees)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrencyBRL(total)}</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddTransaction}
                  disabled={
                    !selectedAssetId ||
                    !newDate ||
                    quantity <= 0 ||
                    unitPrice <= 0 ||
                    createTransaction.isPending
                  }
                >
                  {createTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ticker..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="BUY">Compra</SelectItem>
              <SelectItem value="SELL">Venda</SelectItem>
              <SelectItem value="TRANSFER">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("asset_ticker")} className="-ml-4">
                    Ticker <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("type")}>
                    Tipo <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("date")}>
                    Data <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort("total_amount")}>
                    Total <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length > 0 ? (
                filteredAndSortedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.asset_ticker}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          tx.type === "BUY"
                            ? "bg-green-50 text-green-700"
                            : tx.type === "SELL"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {tx.type_display}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(tx.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">{parseFloat(tx.quantity.toString()).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(parseFloat(tx.unit_price.toString()))}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrencyBRL(parseFloat(tx.total_amount))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default Transactions;