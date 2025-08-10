import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Em breve",
      description: "Autenticação será conectada ao Supabase nesta etapa.",
    });
  };

  return (
    <div className="min-h-screen">
      <SEO title="Entrar — investorion.com.br" description="Acesse sua conta investorion.com.br." />
      <section className="container py-16">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bem-vindo de volta</p>
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="voce@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="mt-2">Entrar</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Não possui conta? <Link className="text-primary hover:underline" to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
