import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex w-full flex-1">
          <AppSidebar />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
