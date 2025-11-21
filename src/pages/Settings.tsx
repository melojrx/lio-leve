import SEO from "@/components/SEO";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { BackButton } from "@/components/BackButton";

const Settings = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const current = theme === "dark" || resolvedTheme === "dark" ? "dark" : "light";
  return (
    <div className="min-h-screen">
      <SEO title="Configurações — investiorion.com.br" description="Preferências da conta e suporte." />
      <section className="container py-10 md:py-14">
        <BackButton />
        <h1 className="text-2xl font-semibold">Configurações</h1>

        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Aparência</h2>
          <p className="text-sm text-muted-foreground">Escolha entre Dark e Light. O Dark corresponde à visualização atual.</p>
          <RadioGroup
            className="mt-4 flex gap-6"
            value={current}
            onValueChange={(v) => setTheme(v as "light" | "dark")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id="theme-dark" value="dark" />
              <Label htmlFor="theme-dark">Dark</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="theme-light" value="light" />
              <Label htmlFor="theme-light">Light</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-6 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
          <a className="mt-2 inline-block underline hover:text-primary" href="mailto:suporte@orion.invest">Fale Conosco</a>
        </div>
      </section>
    </div>
  );
};

export default Settings;