import { NavLink } from "react-router-dom";
import { LayoutDashboard, Wallet, ArrowLeftRight, Settings, LifeBuoy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Carteira", url: "/carteira", icon: Wallet },
  { title: "Transações", url: "/transacoes", icon: ArrowLeftRight },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Ajuda", url: "/ajuda", icon: LifeBuoy },
  { title: "Conta", url: "/conta", icon: User },
];

export function AppSidebar() {
  const buttonCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs transition-colors",
      isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
    );

  return (
    <Sidebar className="w-24" collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="!p-0">
                    <NavLink to={item.url} end className={buttonCls} aria-label={item.title}>
                      <item.icon className="h-6 w-6" />
                      <span className="truncate text-[11px] leading-none">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
