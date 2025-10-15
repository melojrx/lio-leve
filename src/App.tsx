import { Toaster } from "@/components/ui/toaster";
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
import Account from "./pages/Account";
import Help from "./pages/Help";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/auth/RequireAuth";
import { ThemeProvider } from "next-themes";
import AssetDetails from "./pages/AssetDetails";
import AccountData from "./pages/AccountData";
import Mercado from "./pages/Mercado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
            {/* header */}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<AppShell><Index /></AppShell>} />
              <Route path="/login" element={<AppShell><Login /></AppShell>} />
              <Route path="/cadastro" element={<AppShell><Register /></AppShell>} />
              <Route path="/ajuda" element={<AppShell><Help /></AppShell>} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<AppShell><RequireAuth><Dashboard /></RequireAuth></AppShell>} />
              <Route path="/carteira" element={<AppShell><RequireAuth><Portfolio /></RequireAuth></AppShell>} />
              <Route path="/carteira/ativo/:id" element={<AppShell><RequireAuth><AssetDetails /></RequireAuth></AppShell>} />
              <Route path="/transacoes" element={<AppShell><RequireAuth><Transactions /></RequireAuth></AppShell>} />
              <Route path="/mercado" element={<AppShell><RequireAuth><Mercado /></RequireAuth></AppShell>} />
              <Route path="/configuracoes" element={<AppShell><RequireAuth><Settings /></RequireAuth></AppShell>} />
              <Route path="/conta" element={<AppShell><RequireAuth><Account /></RequireAuth></AppShell>} />
              <Route path="/conta/dados" element={<AppShell><RequireAuth><AccountData /></RequireAuth></AppShell>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<AppShell><NotFound /></AppShell>} />
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;