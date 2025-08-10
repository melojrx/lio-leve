import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronRight, Plus, Wallet } from "lucide-react";

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
];

const Portfolio = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Carteira — investorion.com.br" description="Lista detalhada de ativos e posições." />

      <Sheet>
        <section className="container py-10 md:py-14">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Carteira</h1>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar ativo
              </Button>
            </SheetTrigger>
          </header>

          {/* Estado vazio */}
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

          {/* Painel lateral com categorias */}
          <SheetContent side="right" className="w-full sm:max-w-md">
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
          </SheetContent>
        </section>
      </Sheet>
    </div>
  );
};

export default Portfolio;
