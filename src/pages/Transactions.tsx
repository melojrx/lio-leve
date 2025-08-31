import SEO from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { useEffect, useMemo, useState } from "react";
import { getAssets, getMovements, saveMovements } from "@/lib/storage";
import type { Asset, Movement, MovementKind } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Plus, Search, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Helper types and functions
type EnrichedMovement = Movement & { assetInstitution: string };

function formatCurrencyBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  return Number(digits) / 100;
}

const Transactions = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [movements, setMovements] = useState<EnrichedMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MovementKind>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof EnrichedMovement; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  // State for "Add Transaction" dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [newMoveKind, setNewMoveKind] = useState<MovementKind>("APLICACAO");
  const [newMoveDate, setNewMoveDate] = useState<Date | undefined>();
  const [newMoveAmountMask, setNewMoveAmountMask] = useState("");
  const newMoveAmount = useMemo(() => parseMaskedCurrencyToNumber(newMoveAmountMask), [newMoveAmountMask]);

  const loadData = () => {
    const allAssets = getAssets();
    setAssets(allAssets);
    const allMovements = allAssets.flatMap((asset) =>
      getMovements(asset.id).map((move) => ({
        ...move,
        assetInstitution: asset.institution,
      }))
    );
    setMovements(allMovements);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAndSortedMovements = useMemo(() => {
    let filtered = movements.filter((move) => {
      const searchMatch = move.assetInstitution.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === "all" || move.kind === typeFilter;
      return searchMatch && typeMatch;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [movements, searchQuery, typeFilter, sortConfig]);

  const requestSort = (key: keyof EnrichedMovement) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddTransaction = () => {
    if (!selectedAssetId || !newMoveDate || newMoveAmount <= 0) {
      toast({ title: "Dados inválidos", description: "Preencha todos os campos para continuar." });
      return;
    }
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      assetId: selectedAssetId,
      kind: newMoveKind,
      date: newMoveDate.toISOString(),
      amount: newMoveAmount,
    };
    const currentMovements = getMovements(selectedAssetId);
    saveMovements(selectedAssetId, [newMovement, ...currentMovements]);
    toast({ title: "Sucesso!", description: "Movimentação adicionada à sua carteira." });
    
    // Reset form and reload data
    setIsDialogOpen(false);
    setSelectedAssetId("");
    setNewMoveKind("APLICACAO");
    setNewMoveDate(undefined);
    setNewMoveAmountMask("");
    loadData();
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nova Transação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Ativo</label>
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger><SelectValue placeholder="Selecione um ativo" /></SelectTrigger>
                    <SelectContent>
                      {assets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.institution}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Tipo</label>
                  <Select value={newMoveKind} onValueChange={(v) => setNewMoveKind(v as MovementKind)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APLICACAO">Aplicação / Compra</SelectItem>
                      <SelectItem value="RESGATE">Resgate / Venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label>Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {newMoveDate ? format(newMoveDate, "dd/MM/yyyy") : "Selecione"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newMoveDate} onSelect={setNewMoveDate} /></PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label>Valor</label>
                    <Input
                      placeholder="R$ 0,00"
                      value={newMoveAmountMask}
                      onChange={(e) => setNewMoveAmountMask(e.target.value.replace(/[^0-9]/g, '').replace(/(\d{2})$/, ',$1').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddTransaction}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ativo..." className="pl-9 w-full sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="APLICACAO">Aplicação / Compra</SelectItem>
              <SelectItem value="RESGATE">Resgate / Venda</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("assetInstitution")} className="-ml-4">
                    Ativo <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("kind")}>
                    Tipo <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("date")}>
                    Data <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort("amount")}>
                    Valor <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedMovements.length > 0 ? (
                filteredAndSortedMovements.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell className="font-medium">{move.assetInstitution}</TableCell>
                    <TableCell>{move.kind}</TableCell>
                    <TableCell>{format(new Date(move.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(move.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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