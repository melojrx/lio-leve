import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Help from "./pages/Help";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "next-themes";
import AssetDetails from "./pages/AssetDetails";
import AccountData from "./pages/AccountData";
import Mercado from "./pages/Mercado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell><Index /></AppShell>} />
          <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
          <Route path="/carteira" element={<AppShell><Portfolio /></AppShell>} />
          <Route path="/carteira/ativo/:id" element={<AppShell><AssetDetails /></AppShell>} />
          <Route path="/transacoes" element={<AppShell><Transactions /></AppShell>} />
          <Route path="/mercado" element={<AppShell><Mercado /></AppShell>} />
          <Route path="/configuracoes" element={<AppShell><Settings /></AppShell>} />
          <Route path="/ajuda" element={<AppShell><Help /></AppShell>} />
          <Route path="/conta" element={<AppShell><Account /></AppShell>} />
          <Route path="/conta/dados" element={<AppShell><AccountData /></AppShell>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<AppShell><NotFound /></AppShell>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
