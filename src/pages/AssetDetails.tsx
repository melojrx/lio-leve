import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";
import { useAsset, useTransactions, useCreateTransaction, useDeleteAsset } from "@/hooks/usePortfolio";
import { TransactionType } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatCurrencyBRL(value: number | string) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";
  return numValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  return Number(digits) / 100;
}

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data fetching
  const { data: asset, isLoading: isLoadingAsset, error: assetError } = useAsset(id!);
  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useTransactions(id!);
  const createTransaction = useCreateTransaction();
  const deleteAsset = useDeleteAsset();

  // Dialog states
  const [isAddTxDialogOpen, setIsAddTxDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state for new transaction
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

  const handleAddTransaction = () => {
    if (!id || !newDate || quantity <= 0 || unitPrice <= 0) {
      toast.warning("Campos inválidos", { description: "Preencha todos os campos obrigatórios." });
      return;
    }

    createTransaction.mutate(
      {
        asset: id,
        type: newType,
        quantity: quantity.toString(),
        unit_price: unitPrice.toString(),
        fees: fees.toString(),
        date: newDate.toISOString(),
      },
      {
        onSuccess: () => {
          setIsAddTxDialogOpen(false);
          // Reset form
          setNewType("BUY");
          setNewDate(undefined);
          setQuantityStr("");
          setUnitPriceMask("");
          setFeesMask("");
        },
      }
    );
  };

  const handleDeleteAsset = () => {
    if (!id) return;
    deleteAsset.mutate(id, {
      onSuccess: () => {
        toast.success("Ativo removido", { description: "O ativo e seu histórico foram removidos." });
        navigate("/carteira");
      },
    });
  };

  if (isLoadingAsset || isLoadingTransactions) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (assetError || transactionsError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do ativo. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container py-10">
        <SEO title="Ativo não encontrado" />
        <BackButton />
        <p className="mt-4 text-sm text-muted-foreground">Ativo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`Detalhes de ${asset.ticker}`}
        description={`Gerencie transações e veja detalhes do ativo ${asset.ticker}.`}
        canonical={`/carteira/ativo/${asset.id}`}
      />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <BackButton />
            <h1 className="text-2xl font-semibold mt-2">{asset.ticker}</h1>
            <p className="text-sm text-muted-foreground">{asset.name} - {asset.type_display}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setIsAddTxDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Apagar Ativo
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Ativo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Quantidade</div>
                <div className="font-medium">{asset.quantity.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Preço Médio</div>
                <div className="font-medium">{formatCurrencyBRL(asset.average_price)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Custo Total</div>
                <div className="font-medium">{formatCurrencyBRL(asset.quantity * asset.average_price)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Setor</div>
                <div className="font-medium">{asset.sector || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma transação registrada para este ativo.</p>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(new Date(tx.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{tx.type_display}</TableCell>
                          <TableCell className="text-right">{formatCurrencyBRL(tx.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTxDialogOpen} onOpenChange={setIsAddTxDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação para {asset.ticker}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Tipo</label>
              <Select value={newType} onValueChange={(v) => setNewType(v as TransactionType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">Compra</SelectItem>
                  <SelectItem value="SELL">Venda</SelectItem>
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
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newDate} onSelect={setNewDate} /></PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Quantidade</label>
                <Input placeholder="0,00" value={quantityStr} onChange={(e) => setQuantityStr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label>Preço Unitário</label>
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
            {total > 0 && (
              <div className="rounded-lg bg-muted p-3 text-sm font-semibold flex justify-between">
                <span>Total:</span>
                <span>{formatCurrencyBRL(total)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTxDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTransaction} disabled={createTransaction.isPending}>
              {createTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Asset Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar ativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Removerá o ativo {asset.ticker} e todo o seu histórico de transações.
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
}