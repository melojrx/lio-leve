import SEO from "@/components/SEO";

const Portfolio = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Carteira — Orion Invest" description="Lista detalhada de ativos e posições." />
      <section className="container py-10 md:py-14">
        <h1 className="text-2xl font-semibold">Carteira</h1>
        <p className="mt-1 text-sm text-muted-foreground">Em breve: listagem de ativos com quantidade, preço médio e resultado.</p>
        <div className="mt-6 rounded-lg border p-6">Sem dados ainda. Adicione suas transações para começar.</div>
      </section>
    </div>
  );
};

export default Portfolio;
