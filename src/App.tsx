import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import RequireAuth from "@/components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* TooltipProvider removido temporariamente */}
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          {/* Layout */}
          {/* header */}
          <Routes>
            <Route path="/" element={<AppShell><Index /></AppShell>} />
            <Route path="/login" element={<AppShell><Login /></AppShell>} />
            <Route path="/cadastro" element={<AppShell><Register /></AppShell>} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <AppShell><Dashboard /></AppShell>
                </RequireAuth>
              }
            />
            <Route
              path="/carteira"
              element={
                <RequireAuth>
                  <AppShell><Portfolio /></AppShell>
                </RequireAuth>
              }
            />
            <Route
              path="/transacoes"
              element={
                <RequireAuth>
                  <AppShell><Transactions /></AppShell>
                </RequireAuth>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <RequireAuth>
                  <AppShell><Settings /></AppShell>
                </RequireAuth>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<AppShell><NotFound /></AppShell>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    
  </QueryClientProvider>
);

export default App;
