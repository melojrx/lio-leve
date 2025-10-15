const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} investorion.com.br. Todos os direitos reservados.</p>
        <nav className="flex items-center gap-6">
          <a href="mailto:suporte@orion.invest" className="hover:text-primary transition-colors">Fale Conosco</a>
          <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          <a href="#" className="hover:text-primary transition-colors">Termos</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
