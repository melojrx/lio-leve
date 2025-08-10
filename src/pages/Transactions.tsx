import SEO from "@/components/SEO";

const Transactions = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Transações — investorion.com.br" description="Histórico de compras e vendas." />
      <section className="container py-10 md:py-14">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Em breve: cadastro manual com validação de tickers e histórico completo.</p>
        <div className="mt-6 rounded-lg border p-6">Nenhuma transação encontrada.</div>
      </section>
    </div>
  );
};

export default Transactions;
