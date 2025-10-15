import React, { useEffect, useMemo, useState } from "react";
import { MessageSquarePlus, ThumbsUp, Send, Search, Bug, Lightbulb, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Types
interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  kind: "ideia" | "bug";
  votes: number;
  createdAt: string; // ISO
  mine?: boolean; // created in this browser session
}

const LS_KEY = "investorion:suggestions";

function loadSuggestions(): SuggestionItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as SuggestionItem[];
    return [];
  } catch {
    return [];
  }
}

function saveSuggestions(items: SuggestionItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

export default function SuggestionsWidget() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "votes">("votes");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"ideia" | "bug">("ideia");

  useEffect(() => {
    setItems(loadSuggestions());
  }, []);

  useEffect(() => {
    saveSuggestions(items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((i) =>
      [i.title, i.description].some((t) => t.toLowerCase().includes(q))
    );
    list = list.sort((a, b) =>
      sort === "votes"
        ? b.votes - a.votes || b.createdAt.localeCompare(a.createdAt)
        : b.createdAt.localeCompare(a.createdAt)
    );
    return list;
  }, [items, query, sort]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.warning("Preencha todos os campos", { description: "Título e descrição são obrigatórios." });
      return;
    }
    const newItem: SuggestionItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      kind,
      votes: 0,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    setItems((prev) => [newItem, ...prev]);
    setTitle("");
    setDescription("");
    setKind("ideia");
    toast.success("Sugestão enviada!", { description: "Obrigado por contribuir com melhorias." });
  }

  function vote(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, votes: it.votes + 1 } : it))
    );
  }

  function kindBadge(k: SuggestionItem["kind"]) {
    const Icon = k === "bug" ? Bug : Lightbulb;
    const label = k === "bug" ? "Bug" : "Ideia";
    const variant = k === "bug" ? "destructive" : "secondary";
    return (
      <Badge variant={variant as any} className="gap-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Floating trigger button */}
      <DialogTrigger asChild>
        <Button
          aria-label="Abrir mural de sugestões"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 h-12 w-12 rounded-full shadow-lg z-50"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mural de sugestões</DialogTitle>
          <DialogDescription>
            Compartilhe ideias e relate problemas. Vote nas sugestões para priorizarmos.
          </DialogDescription>
        </DialogHeader>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sug-title">Título</Label>
              <Input
                id="sug-title"
                placeholder="Ex.: Filtro por corretora no extrato"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={kind === "ideia" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setKind("ideia")}
                >
                  <Lightbulb className="h-4 w-4" /> Ideia
                </Button>
                <Button
                  type="button"
                  variant={kind === "bug" ? "destructive" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setKind("bug")}
                >
                  <Bug className="h-4 w-4" /> Bug
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sug-desc">Descrição</Label>
            <Textarea
              id="sug-desc"
              placeholder="Descreva sua ideia ou problema com detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="h-4 w-4 opacity-0" />
              {/* spacer for alignment */}
            </div>
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" /> Enviar sugestão
            </Button>
          </div>
        </form>

        <Separator className="my-1" />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={sort === "votes" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSort("votes")}
            >
              Ordenar por votos
            </Button>
            <Button
              variant={sort === "recent" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSort("recent")}
            >
              Mais recentes
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sugestões..."
              className="pl-8 w-full sm:w-64"
            />
          </div>
        </div>

        {/* List */}
        <div className="mt-2 space-y-3 max-h-[40vh] overflow-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma sugestão ainda. Seja o primeiro a enviar!
            </div>
          ) : (
            filtered.map((it) => (
              <article key={it.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium leading-tight break-words">{it.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {it.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {kindBadge(it.kind)}
                      <span className="text-muted-foreground">
                        {new Date(it.createdAt).toLocaleDateString()}
                      </span>
                      {it.mine && <Badge variant="outline">meu envio</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-16 w-14 gap-1"
                      onClick={() => vote(it.id)}
                      aria-label={`Votar em ${it.title}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs">{it.votes}</span>
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Note */}
        <p className="mt-2 text-xs text-muted-foreground">
          Dica: votos nos ajudam a priorizar as próximas entregas. Em breve, conectaremos este mural ao seu perfil.
        </p>
      </DialogContent>
    </Dialog>
  );
}