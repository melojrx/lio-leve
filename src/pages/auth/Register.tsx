import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Register = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro em breve",
      description: "O fluxo de cadastro será integrado ao Supabase.",
    });
  };

  return (
    <div className="min-h-screen">
      <SEO title="Criar conta — Orion Invest" description="Cadastre-se na Orion Invest." />
      <section className="container py-16">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Leva menos de 2 minutos</p>
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="mt-2">Criar conta</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Já possui conta? <Link className="text-primary hover:underline" to="/login">Entrar</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
