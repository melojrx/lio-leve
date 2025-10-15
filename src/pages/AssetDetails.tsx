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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeftRight, Trash2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Asset, Movement, MovementKind } from "@/types/asset";
import { deleteAsset as storageDeleteAsset, getAssets, getMovements, saveMovements } from "@/lib/storage";
import { BackButton } from "@/components/BackButton";
import { toast } from "@/hooks/use-toast";

function formatCurrencyBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMaskedCurrencyToNumber(masked: string) {
  const digits = masked.replace(/\D/g, "");
  const asNumber = Number(digits) / 100;
  return asNumber;
}

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);

  // Form state
  const [kind, setKind] = useState<MovementKind>("APLICACAO");
  const [date, setDate] = useState<Date | undefined>();
  const [amountMask, setAmountMask] = useState<string>("");
  const amount = useMemo(() => parseMaskedCurrencyToNumber(amountMask || "0"), [amountMask]);

  useEffect(() => {
    const assets = getAssets();
    const found = assets.find((a) => a.id === id);
    setAsset(found || null);
    if (id) setMovements(getMovements(id));
  }, [id]);

  function addMovement(k: MovementKind) {
    if (!id || !date || amount <= 0) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha a data e o valor da movimentação.",
        variant: "destructive",
      });
      return;
    }
    const newMove: Movement = {
      id: crypto.randomUUID(),
      assetId: id,
      kind: k,
      date: (date || new Date()).toISOString(),
      amount,
    };
    const next = [newMove, ...movements];
    setMovements(next);
    saveMovements(id, next);
    toast({
      title: "Movimentação adicionada!",
      description: "Sua movimentação foi registrada com sucesso.",
    });
    // reset
    setAmountMask("");
    setDate(undefined);
  }

  if (!asset) {
    return (
      <div className="container py-10">
        <SEO title="Ativo não encontrado" description="O ativo solicitado não foi localizado." />
        <BackButton />
        <p className="mt-4 text-sm text-muted-foreground">Ativo não encontrado.</p>
      </div>
    );
  }
const typeLabel = asset.type === "POUPANÇA" ? "Poupança" : asset.type === "CONTA_CORRENTE" ? "Conta Corrente" : asset.type;

return (
  <div className="min-h-screen">
    <SEO
      title={`Gerenciar Ativo — ${asset.institution}`}
      description={`Gerencie movimentações do ativo de ${typeLabel.toLowerCase()} em ${asset.institution}.`}
      canonical={`/carteira/ativo/${asset.id}`}
    />
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{typeLabel}</h1>
            <p className="text-sm text-muted-foreground">{asset.institution}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BackButton className="!mb-0" />
            <Button variant="outline" onClick={() => addMovement("TRANSFERENCIA")}> 
              <ArrowLeftRight className="mr-2 h-4 w-4" /> Transferir
            </Button>
            <AlertDialog>
              <AlertDialogTriggerButton />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar ativo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Removeremos o ativo e todo o histórico local.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      storageDeleteAsset(asset.id);
                      toast({ title: "Ativo removido", description: "O ativo e seu histórico foram removidos." });
                      navigate("/carteira");
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left - Dados do produto */}
          <section className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Dados do produto</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Instituição financeira</div>
                <div className="text-sm font-medium">{asset.institution}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Movimentação inicial</div>
                <div className="text-sm font-medium">{formatCurrencyBRL(asset.amount)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Data de início</div>
                <div className="text-sm font-medium">{format(new Date(asset.date), "dd/MM/yyyy")}</div>
              </div>
            </div>
          </section>

          {/* Right - Gerenciar Movimentações */}
          <section className="rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gerenciar Movimentações</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setKind("APLICACAO")} variant={kind === "APLICACAO" ? "default" : "outline"}>
                  <Plus className="mr-2 h-4 w-4" /> Aplicação
                </Button>
                <Button size="sm" onClick={() => setKind("RESGATE")} variant={kind === "RESGATE" ? "default" : "outline"}>
                  Resgate
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={kind} onValueChange={(v) => setKind(v as MovementKind)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APLICACAO">Aplicação</SelectItem>
                    <SelectItem value="RESGATE">Resgate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-1 w-full justify-start text-left font-normal">
                      {date ? format(date, "dd.MM.yyyy") : "DD.MM.AAAA"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-medium">Valor</label>
                <Input
                  className="mt-1"
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                  value={amountMask}
                  onChange={(e) => {
                    const value = e.target.value;
                    const number = parseMaskedCurrencyToNumber(value);
                    setAmountMask(number ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button disabled={!date || amount <= 0} onClick={() => addMovement(kind)}>
                Adicionar movimentação
              </Button>
            </div>

            <div className="mt-6">
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação a ser exibida</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{format(new Date(m.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{m.kind === "APLICACAO" ? "Aplicação" : m.kind === "RESGATE" ? "Resgate" : "Transferência"}</TableCell>
                          <TableCell className="text-right">{formatCurrencyBRL(m.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Auxiliary components for AlertDialog trigger with icon
function AlertDialogTriggerButton() {
  return (
    <AlertDialogTrigger asChild>
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" /> Apagar
      </Button>
    </AlertDialogTrigger>
  );
}

// Shadcn exports don't include Trigger in alert-dialog.tsx typings, so import here
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";