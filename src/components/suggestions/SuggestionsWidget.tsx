import React, { useMemo, useState } from "react";
import { MessageSquarePlus, ThumbsUp, Send, Search, Bug, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSuggestions, useCreateSuggestion, useAddVote } from "@/hooks/useSuggestions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  kind: "ideia" | "bug";
  votes: number;
  created_at: string;
  user_id: string | null;
};

export default function SuggestionsWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"votes" | "recent">("votes");

  // Data fetching from Supabase
  const { data: items = [], isLoading, error } = useSuggestions();
  const createSuggestion = useCreateSuggestion();
  const addVote = useAddVote();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"ideia" | "bug">("ideia");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((i) =>
      [i.title, i.description].some((t) => t.toLowerCase().includes(q))
    );
    list = list.sort((a, b) =>
      sort === "votes"
        ? b.votes - a.votes || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return list;
  }, [items, query, sort]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.warning("Preencha todos os campos", { description: "Título e descrição são obrigatórios." });
      return;
    }
    createSuggestion.mutate({ title, description, kind }, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setKind("ideia");
      }
    });
  }

  function handleVote(id: string) {
    if (!user) {
      toast.info("Login necessário", { description: "Você precisa estar logado para votar." });
      return;
    }
    addVote.mutate(id);
  }

  function kindBadge(k: Suggestion["kind"]) {
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
      <DialogTrigger asChild>
        <Button aria-label="Abrir mural de sugestões" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 h-12 w-12 rounded-full shadow-lg z-50">
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mural de sugestões</DialogTitle>
          <DialogDescription>Compartilhe ideias e relate problemas. Vote nas sugestões para priorizarmos.</DialogDescription>
        </DialogHeader>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="sug-title">Título</Label><Input id="sug-title" placeholder="Ex.: Filtro por corretora" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Tipo</Label><div className="flex gap-2"><Button type="button" variant={kind === "ideia" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setKind("ideia")}><Lightbulb className="h-4 w-4" /> Ideia</Button><Button type="button" variant={kind === "bug" ? "destructive" : "outline"} size="sm" className="gap-2" onClick={() => setKind("bug")}><Bug className="h-4 w-4" /> Bug</Button></div></div>
            </div>
            <div className="space-y-2"><Label htmlFor="sug-desc">Descrição</Label><Textarea id="sug-desc" placeholder="Descreva sua ideia ou problema..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
            <div className="flex justify-end"><Button type="submit" className="gap-2" disabled={createSuggestion.isPending}>{createSuggestion.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Enviar sugestão</Button></div>
          </form>
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4 rounded-lg border">Faça login para enviar uma sugestão.</div>
        )}

        <Separator className="my-1" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Button variant={sort === "votes" ? "secondary" : "outline"} size="sm" onClick={() => setSort("votes")}>Mais votados</Button><Button variant={sort === "recent" ? "secondary" : "outline"} size="sm" onClick={() => setSort("recent")}>Mais recentes</Button></div>
          <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="pl-8 w-full sm:w-64" /></div>
        </div>

        <div className="mt-2 space-y-3 max-h-[40vh] overflow-auto pr-1">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : error ? (
            <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Não foi possível carregar as sugestões.</AlertDescription></Alert>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">Nenhuma sugestão encontrada.</div>
          ) : (
            filtered.map((it) => (
              <article key={it.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium leading-tight break-words">{it.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{it.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">{kindBadge(it.kind)}<span className="text-muted-foreground">{new Date(it.created_at).toLocaleDateString()}</span></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Button variant="outline" size="sm" className="flex flex-col h-16 w-14 gap-1" onClick={() => handleVote(it.id)} disabled={addVote.isPending}><ThumbsUp className="h-4 w-4" /><span className="text-xs">{it.votes}</span></Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}