import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      toast.info("Até mais!", { description: "Sessão encerrada." });
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Erro ao sair", { description: "Não foi possível encerrar a sessão." });
    }
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <div aria-hidden className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/25 transition-colors group-hover:from-primary/25 group-hover:to-primary/10">
            <BrandLogo size={20} className="text-primary" />
          </div>
          <span className="font-semibold tracking-tight text-sm sm:text-base">
            investorion.com.br
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {[
            ["/dashboard","Dashboard"],
            ["/carteira","Carteira"],
            ["/mercado","Mercado"],
            ["/transacoes","Transações"],
            ["/configuracoes","Configurações"],
          ].map(([to,label]) => (
            <Link
              key={to}
              to={to}
              className="relative px-1 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 max-sm:gap-1">
          {!user ? (
            <div className="flex items-center gap-2 max-sm:gap-1">
              <Link to="/login"><Button variant="soft" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Entrar</Button></Link>
              <Link to="/cadastro"><Button variant="hero" radius="pill" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Criar conta</Button></Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 max-sm:gap-1">
              <Link to="/conta"><Button variant="outline" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Conta</Button></Link>
              <Link to="/dashboard"><Button variant="soft" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Minha área</Button></Link>
              <Button variant="outline" onClick={handleSignOut} className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Sair</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;