import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, ArrowLeftRight, Settings, LifeBuoy, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Carteira", url: "/carteira", icon: Wallet },
  { title: "Mercado", url: "/mercado", icon: TrendingUp },
  { title: "Transações", url: "/transacoes", icon: ArrowLeftRight },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Ajuda", url: "/ajuda", icon: LifeBuoy },
  { title: "Conta", url: "/conta", icon: User },
];

export function AppSidebar() {
  const buttonCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative flex w-full flex-col items-center gap-1 rounded-xl px-2 py-4 text-[11px] leading-tight transition-colors",
      isActive ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
    );

  return (
    <Sidebar className="w-24" collapsible="none">
      <SidebarHeader className="py-4 flex items-center justify-center">
        <NavLink to="/" aria-label="Início" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <img src="/icons/icon-512.png" alt="Logo Investorion" className="h-7 w-7" loading="lazy" />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="!p-0">
                    <NavLink to={item.url} end className={buttonCls} aria-label={item.title}>
                      {({ isActive }) => (
                        <>
                          <item.icon className="h-7 w-7" />
                          <span className="truncate text-[11px] leading-none">{item.title}</span>
                          {isActive && (
                            <span
                              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-primary"
                              aria-hidden
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="py-4">
        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground/70">investorion</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
