import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Eye, EyeOff } from "lucide-react";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();
  const resetToken = searchParams.get("token") || sessionStorage.getItem("investorion.reset_token") || "";
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    if (!resetToken) {
      toast.error("Link inválido ou expirado.", {
        description: "Solicite um novo link de redefinição.",
      });
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password, { resetToken });
      toast.success("Senha atualizada!", {
        description: "Você já pode fazer login com sua nova senha.",
      });
      sessionStorage.removeItem("investorion.reset_token");
      navigate("/login");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMessage);
      toast.error("Falha ao atualizar a senha", {
        description: "O link pode ter expirado. Tente solicitar um novo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <SEO title="Atualizar Senha — investiorion.com.br" description="Defina uma nova senha para sua conta." />
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
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8 bg-background dark:bg-slate-900">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-semibold text-foreground">Crie uma nova senha</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sua nova senha deve ser diferente da anterior.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary-glow text-primary-foreground font-medium"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
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

export default UpdatePassword;
