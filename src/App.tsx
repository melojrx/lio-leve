// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// TooltipProvider removido temporariamente para evitar erro de runtime
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
// import RequireAuth from "@/components/auth/RequireAuth";
import { ThemeProvider } from "next-themes";
import AssetDetails from "./pages/AssetDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* Toaster desabilitado temporariamente */}
      <AuthProvider>
        <BrowserRouter>
            {/* Layout */}
            {/* header */}
            <Routes>
              <Route path="/" element={<AppShell><Index /></AppShell>} />
              <Route path="/login" element={<AppShell><Login /></AppShell>} />
              <Route path="/cadastro" element={<AppShell><Register /></AppShell>} />
              <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
              <Route path="/carteira" element={<AppShell><Portfolio /></AppShell>} />
              <Route path="/carteira/ativo/:id" element={<AppShell><AssetDetails /></AppShell>} />
              <Route path="/transacoes" element={<AppShell><Transactions /></AppShell>} />
              <Route path="/configuracoes" element={<AppShell><Settings /></AppShell>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<AppShell><NotFound /></AppShell>} />
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
