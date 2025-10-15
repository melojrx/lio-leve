import SEO from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Plus, Search, Calendar as CalendarIcon, ArrowUpDown, AlertCircle, Loader2, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useTransactions, useCreateTransaction, useAssets, useUpdateTransaction, useDeleteTransaction } from "@/hooks/usePortfolio";
import type { Transaction, TransactionType } from "@/lib/api";

function formatCurrencyBRL(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return numValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumberToMask(value: number) {
  if (typeof value !== 'number' || isNaN(value)) return "";
  const fixedValue = value.toFixed(2);
  const [integer, decimals] = fixedValue.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedInteger},${decimals}`;
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  if (digits === "") return 0;
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
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // State for "Add Transaction" form
  const [addAssetId, setAddAssetId] = useState<string>("");
  const [addType, setAddType] = useState<TransactionType>("BUY");
  const [addDate, setAddDate] = useState<Date | undefined>();
  const [addQuantityStr, setAddQuantityStr] = useState("");
  const [addUnitPriceMask, setAddUnitPriceMask] = useState("");
  const [addFeesMask, setAddFeesMask] = useState("");

  // State for "Edit Transaction" form
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editQuantityStr, setEditQuantityStr] = useState("");
  const [editUnitPriceMask, setEditUnitPriceMask] = useState("");
  const [editFeesMask, setEditFeesMask] = useState("");

  // Memoized calculations for forms
  const addQuantity = useMemo(() => parseFloat(addQuantityStr.replace(",", ".")) || 0, [addQuantityStr]);
  const addUnitPrice = useMemo(() => parseMaskedCurrencyToNumber(addUnitPriceMask), [addUnitPriceMask]);
  const addFees = useMemo(() => parseMaskedCurrencyToNumber(addFeesMask), [addFeesMask]);
  const addTotal = useMemo(() => (addQuantity * addUnitPrice) + addFees, [addQuantity, addUnitPrice, addFees]);

  const editQuantity = useMemo(() => parseFloat(editQuantityStr.replace(",", ".")) || 0, [editQuantityStr]);
  const editUnitPrice = useMemo(() => parseMaskedCurrencyToNumber(editUnitPriceMask), [editUnitPriceMask]);
  const editFees = useMemo(() => parseMaskedCurrencyToNumber(editFeesMask), [editFeesMask]);
  const editTotal = useMemo(() => (editQuantity * editUnitPrice) + editFees, [editQuantity, editUnitPrice, editFees]);

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
    if (!addAssetId || !addDate || addQuantity <= 0 || addUnitPrice <= 0) return;
    createTransaction.mutate({
      asset: addAssetId,
      type: addType,
      quantity: addQuantity.toString(),
      unit_price: addUnitPrice.toString(),
      fees: addFees.toString(),
      date: addDate.toISOString(),
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setAddAssetId(""); setAddType("BUY"); setAddDate(undefined);
        setAddQuantityStr(""); setAddUnitPriceMask(""); setAddFeesMask("");
      },
    });
  };

  const handleOpenEditDialog = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setEditDate(new Date(tx.date));
    setEditQuantityStr(tx.quantity.toString().replace(".", ","));
    setEditUnitPriceMask(formatNumberToMask(tx.unit_price));
    setEditFeesMask(formatNumberToMask(tx.fees));
  };

  const handleUpdateTransaction = () => {
    if (!transactionToEdit || !editDate || editQuantity <= 0 || editUnitPrice <= 0) return;
    updateTransaction.mutate({
      id: transactionToEdit.id,
      data: {
        date: editDate.toISOString(),
        quantity: editQuantity.toString(),
        unit_price: editUnitPrice.toString(),
        fees: editFees.toString(),
        asset: transactionToEdit.asset_id,
        type: transactionToEdit.type,
      },
    }, {
      onSuccess: () => setTransactionToEdit(null),
    });
  };

  const handleDeleteTransaction = () => {
    if (!transactionToDelete) return;
    deleteTransaction.mutate(transactionToDelete.id, {
      onSuccess: () => setTransactionToDelete(null),
    });
  };

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
      <SEO title="Transações — investorion.com.br" description="Histórico de compras e vendas." />
      <section className="container py-10 md:py-14">
        <BackButton />
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Transações</h1>
            <p className="mt-1 text-sm text-muted-foreground">Seu histórico completo de movimentações.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nova Transação</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Nova Transação</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Ativo</label>
                  <Select value={addAssetId} onValueChange={setAddAssetId}>
                    <SelectTrigger><SelectValue placeholder="Selecione um ativo" /></SelectTrigger>
                    <SelectContent>{assets.map((asset) => <SelectItem key={asset.id} value={asset.id}>{asset.ticker}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Tipo</label>
                  <Select value={addType} onValueChange={(v) => setAddType(v as TransactionType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="BUY">Compra</SelectItem><SelectItem value="SELL">Venda</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Data</label>
                  <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal">{addDate ? format(addDate, "dd/MM/yyyy") : "Selecione"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={addDate} onSelect={setAddDate} /></PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label>Quantidade</label><Input placeholder="0,00" value={addQuantityStr} onChange={(e) => setAddQuantityStr(e.target.value)} /></div>
                  <div className="space-y-2"><label>Preço unitário</label><Input placeholder="R$ 0,00" value={addUnitPriceMask} onChange={(e) => setAddUnitPriceMask(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><label>Taxas (opcional)</label><Input placeholder="R$ 0,00" value={addFeesMask} onChange={(e) => setAddFeesMask(e.target.value)} /></div>
                {addTotal > 0 && <div className="rounded-lg bg-muted p-3 text-sm font-semibold flex justify-between"><span>Total:</span><span>{formatCurrencyBRL(addTotal)}</span></div>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddTransaction} disabled={!addAssetId || !addDate || addQuantity <= 0 || addUnitPrice <= 0 || createTransaction.isPending}>
                  {createTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ticker..." className="pl-9 w-full sm:w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos os tipos</SelectItem><SelectItem value="BUY">Compra</SelectItem><SelectItem value="SELL">Venda</SelectItem></SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" onClick={() => requestSort("asset_ticker")} className="-ml-4">Ticker <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort("type")}>Tipo <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort("date")}>Data <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right"><Button variant="ghost" onClick={() => requestSort("total_amount")}>Total <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length > 0 ? (
                filteredAndSortedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.asset_ticker}</TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tx.type === "BUY" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{tx.type_display}</span></TableCell>
                    <TableCell>{format(new Date(tx.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">{tx.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(tx.unit_price)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrencyBRL(tx.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenEditDialog(tx)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setTransactionToDelete(tx)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Nenhuma transação encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={!!transactionToEdit} onOpenChange={(open) => !open && setTransactionToEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Transação de {transactionToEdit?.asset_ticker}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Data</label>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal">{editDate ? format(editDate, "dd/MM/yyyy") : "Selecione"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editDate} onSelect={setEditDate} /></PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label>Quantidade</label><Input placeholder="0,00" value={editQuantityStr} onChange={(e) => setEditQuantityStr(e.target.value)} /></div>
              <div className="space-y-2"><label>Preço unitário</label><Input placeholder="R$ 0,00" value={editUnitPriceMask} onChange={(e) => setEditUnitPriceMask(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><label>Taxas (opcional)</label><Input placeholder="R$ 0,00" value={editFeesMask} onChange={(e) => setEditFeesMask(e.target.value)} /></div>
            {editTotal > 0 && <div className="rounded-lg bg-muted p-3 text-sm font-semibold flex justify-between"><span>Total:</span><span>{formatCurrencyBRL(editTotal)}</span></div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionToEdit(null)}>Cancelar</Button>
            <Button onClick={handleUpdateTransaction} disabled={!editDate || editQuantity <= 0 || editUnitPrice <= 0 || updateTransaction.isPending}>
              {updateTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação de <strong>{transactionToDelete?.asset_ticker}</strong> do dia {transactionToDelete && format(new Date(transactionToDelete.date), "dd/MM/yyyy")} será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} disabled={deleteTransaction.isPending}>
              {deleteTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;