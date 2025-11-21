import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart } from "lucide-react";

const ForgotPassword = () => {
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const token = await sendPasswordResetEmail(email);
      toast.success("Pedido recebido!", {
        description: token
          ? "Use o link abaixo para definir uma nova senha."
          : "Se este e-mail existir, você receberá instruções em instantes.",
      });
      if (token) {
        navigate(`/update-password?token=${encodeURIComponent(token)}`, { replace: true });
      }
    } catch (error) {
      toast.error("Falha ao enviar e-mail", {
        description: "Não foi possível enviar o e-mail de redefinição. Verifique o endereço e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <SEO title="Esqueci a Senha — investiorion.com.br" description="Recupere o acesso à sua conta investiorion.com.br." />
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side - Branding */}
        <div className="hidden lg:flex items-center justify-center bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30">
                <LineChart className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">investiorion.com.br</h1>
                <p className="text-slate-400 text-lg">as a lifestyle</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 text-slate-500 text-sm">
            Valemobi
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8 bg-background dark:bg-slate-900">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground">Recuperar Senha</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Insira seu e-mail para receber o link de redefinição.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary-glow text-primary-foreground font-medium"
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full h-12 border-slate-700 text-white hover:bg-slate-800"
                >
                  <Link to="/login">Voltar para o login</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
