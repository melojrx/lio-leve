import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Header = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // TODO: Integrar autenticação (Supabase). Placeholder mantém usuário deslogado.
    setIsAuthed(false);
  }, []);

  const handleSignOut = async () => {
    setIsAuthed(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/15 ring-1 ring-primary/25" />
          <span className="font-semibold tracking-tight">investorion.com.br</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/carteira" className="hover:text-primary transition-colors">Carteira</Link>
          <Link to="/transacoes" className="hover:text-primary transition-colors">Transações</Link>
          <Link to="/configuracoes" className="hover:text-primary transition-colors">Configurações</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!isAuthed ? (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="soft">Entrar</Button></Link>
              <Link to="/cadastro"><Button variant="hero" radius="pill">Criar conta</Button></Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/dashboard"><Button variant="soft">Minha área</Button></Link>
              <Button variant="outline" onClick={handleSignOut}>Sair</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
