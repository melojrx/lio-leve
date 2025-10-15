import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart, Layers, Wallet, Shield } from "lucide-react";
import SEO from "@/components/SEO";
import { APP_NAME } from "@/config/env";
import { Link } from "react-router-dom";
import { useRef } from "react";

const Index = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  };

  return (
    <div onMouseMove={handleMove} ref={ref} className="relative min-h-screen bg-background">
      <SEO
        title={`${APP_NAME} — Consolide e acompanhe seus investimentos`}
        description="Dashboard de investimentos com carteira consolidada, transações e cotações em tempo real."
        canonical="/"
      />
      {/* Signature moment: pointer-reactive light field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(600px circle at var(--x, 50%) var(--y, 30%), hsl(var(--primary)/0.18), transparent 40%)",
        }}
      />

      <section className="container pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Sua carteira, clareza total.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            Consolide investimentos, acompanhe rentabilidade e tome decisões com
            dados em tempo real.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/cadastro">
              <Button variant="hero" radius="pill" size="xl" className="w-full sm:w-auto">
                Começar grátis
                <ArrowRight className="ml-1" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">Ver demo</Button>
            </Link>
            <Link to="/conta">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">Minha Conta</Button>
            </Link>
          </div>
          <div className="mt-10 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" /> Dados protegidos e criptografados
          </div>
        </div>
      </section>

  <section className="container grid gap-6 md:grid-cols-3 md:gap-8">
        {[
          {
            icon: <LineChart />, title: "Dashboard consolidado", desc: "Patrimônio, rentabilidade e variação diária com filtros 1D, 1M, 1A.", to: "/dashboard"
          },
          {
            icon: <Layers />, title: "Cadastro de ativos", desc: "Adicione transações com validação de ticker e preço médio automático.", to: "/transacoes"
          },
          {
            icon: <Wallet />, title: "Carteira detalhada", desc: "Veja posição por ativo, tipo e setor com gráficos de composição.", to: "/carteira"
          },
        ].map((f, i) => (
          <Link to={f.to} key={i} className="block">
            <article className="group rounded-xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20 h-full">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </article>
          </Link>
        ))}
      </section>

  <section className="container mt-16">
    <div className="rounded-2xl border p-6 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Pronto para investir com confiança?</h2>
              <p className="mt-2 text-muted-foreground">Crie sua conta em minutos e importe suas transações.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/cadastro"><Button size="lg" radius="pill">Criar conta</Button></Link>
      <Link to="/login"><Button variant="outline" size="lg" radius="pill" className="hover:border-primary/50">Entrar</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
};

export default Index;