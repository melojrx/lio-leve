import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { UserCog, KeyRound, LifeBuoy, ShieldCheck, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";

const tiles = [
  { title: "Meu Perfil", icon: UserCog, to: "/conta/dados?tab=perfil" },
  { title: "Alterar Senha", icon: KeyRound, to: "/conta/dados?tab=senha" },
  { title: "Abrir Chamado", icon: LifeBuoy, to: "/ajuda" },
  { title: "Privacidade e uso", icon: ShieldCheck, to: "/conta/dados?tab=privacidade" },
  { title: "Sobre o Investorion", icon: Info, to: "/ajuda" },
];

const Account = () => {
  const { user } = useAuth();
  const displayName =
    (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "Investidor";
  const since = user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="min-h-screen">
      <SEO
        title="Conta — investiorion.com.br"
        description="Perfil, segurança e preferências da sua conta."
        canonical="/conta"
      />

      <section className="container py-8 md:py-10">
        <BackButton />
        <h1 className="sr-only">Conta do usuário</h1>

        <div className="rounded-2xl overflow-hidden border bg-card">
          {/* Hero */}
          <div className="relative">
            <div className="aspect-[16/5] w-full bg-gradient-to-r from-primary/15 via-primary/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <div className="max-w-2xl">
                <p className="text-lg md:text-xl font-medium">Olá, {displayName}</p>
                <p className="text-sm text-muted-foreground">Usuário desde: {since}</p>
              </div>

              {/* Tiles */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {tiles.map((t) => (
                  <Link key={t.title} to={t.to} className="block">
                    <Card className="rounded-xl hover:ring-1 hover:ring-primary/30 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <t.icon className="h-5 w-5 text-primary" aria-hidden />
                        <span className="text-sm font-medium">{t.title}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Banner */}
              <div className="mt-6">
                <div className="flex items-center justify-between rounded-xl p-4 md:p-5 bg-gradient-to-r from-primary/20 via-primary/10 to-background border">
                  <div>
                    <p className="text-sm md:text-base font-medium">Conheça nossos planos</p>
                    <p className="text-xs text-muted-foreground">Recursos premium para acelerar sua jornada</p>
                  </div>
                  <Button variant="hero" radius="pill">Ver planos</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;