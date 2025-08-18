import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";


const Header = () => {
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
          <Link to="/mercado" className="hover:text-primary transition-colors">Mercado</Link>
          <Link to="/transacoes" className="hover:text-primary transition-colors">Transações</Link>
          <Link to="/configuracoes" className="hover:text-primary transition-colors">Configurações</Link>
        </nav>
        <div className="flex items-center gap-2 max-sm:gap-1">
          <Link to="/conta"><Button variant="outline" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Conta</Button></Link>
          <Link to="/dashboard"><Button variant="soft" className="max-sm:h-9 max-sm:px-3 max-sm:text-xs">Minha área</Button></Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
