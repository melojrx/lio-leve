import SEO from "@/components/SEO";
import { BackButton } from "@/components/BackButton";

const Help = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Ajuda — investiorion.com.br" description="Central de ajuda e suporte." canonical="/ajuda" />
      <section className="container py-10 md:py-14">
        <BackButton />
        <h1 className="text-2xl font-semibold">Ajuda</h1>
        <p className="mt-1 text-sm text-muted-foreground">Em breve: artigos, FAQs e contato com suporte.</p>
        <div className="mt-6 rounded-lg border p-6">Como podemos ajudar você hoje?</div>
      </section>
    </div>
  );
};

export default Help;