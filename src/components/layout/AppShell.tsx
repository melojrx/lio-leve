import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SuggestionsWidget from "@/components/suggestions/SuggestionsWidget";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SuggestionsWidget />
    </div>
  );
};

export default AppShell;
