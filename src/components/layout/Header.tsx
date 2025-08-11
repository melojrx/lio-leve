import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { LineChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erro ao sair", description: error.message });
      return;
    }
    toast({ title: "Até mais!", description: "Sessão encerrada." });
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20"><LineChart className="h-4 w-4" /></div>
            <span className="font-semibold tracking-tight">investorion.com.br</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/carteira" className="hover:text-primary transition-colors">Carteira</Link>
          <Link to="/transacoes" className="hover:text-primary transition-colors">Transações</Link>
          <Link to="/configuracoes" className="hover:text-primary transition-colors">Configurações</Link>
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
