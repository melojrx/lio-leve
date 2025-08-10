import SEO from "@/components/SEO";

const Settings = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Configurações — investorion.com.br" description="Preferências da conta e suporte." />
      <section className="container py-10 md:py-14">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <div className="mt-6 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
          <a className="mt-2 inline-block underline hover:text-primary" href="mailto:suporte@orion.invest">Fale Conosco</a>
        </div>
      </section>
    </div>
  );
};

export default Settings;
