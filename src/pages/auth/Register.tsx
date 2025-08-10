import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (!email || !password) return;
    if (password !== confirm) {
      toast({ title: "Senhas diferentes", description: "Confirme a mesma senha." });
      return;
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    setLoading(false);

    if (error) {
      toast({ title: "Falha no cadastro", description: error.message });
      return;
    }

    toast({ title: "Conta criada!", description: "Você será redirecionado." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <SEO title="Criar conta — investorion.com.br" description="Cadastre-se na investorion.com.br." />
      <section className="container py-16">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Leva menos de 2 minutos</p>
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" placeholder="Seu nome" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="mt-2" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button>
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
