import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) return;
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Bem-vindo!", { description: "Login realizado com sucesso." });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Falha ao entrar", { 
        description: "Credenciais inválidas. Verifique seu email e senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <SEO title="Entrar — investorion.com.br" description="Acesse sua conta investorion.com.br." />
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
                <h1 className="text-4xl font-bold text-white">investorion.com.br</h1>
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
              <h1 className="text-2xl font-semibold text-foreground">Entre ou crie sua conta</h1>
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
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  to="/esqueci-senha" 
                  className="text-sm text-primary hover:text-primary-glow transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary-glow text-primary-foreground font-medium"
                >
                  {loading ? "Entrando..." : "Entrar na minha conta"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full h-12 border-slate-700 text-white hover:bg-slate-800"
                >
                  <Link to="/cadastro">Criar uma conta</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;