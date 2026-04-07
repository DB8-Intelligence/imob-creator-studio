import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[var(--ds-bg)]">
      {/* top divider */}
      <div className="ds-divider" />

      <div className="container mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo + description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--ds-gold)] to-[var(--ds-gold-light)] rounded-xl flex items-center justify-center shadow-lg shadow-[rgba(212,175,55,0.2)]">
                <Building2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-display text-xl font-semibold">
                <span style={{ color: "#002B5B" }} className="text-[var(--ds-fg)]">Imob</span><span style={{ color: "#FFD700" }}>Creator</span> <span className="text-sm text-[var(--ds-fg-muted)]">AI</span>
              </span>
            </div>
            <p className="text-[var(--ds-fg-muted)] max-w-md leading-relaxed text-sm">
              Plataforma completa de IA para o mercado imobiliário. Gere vídeos, artes, staging virtual, renders, demarcações e muito mais — tudo integrado em um único dashboard.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-[var(--ds-fg)] mb-4 text-xs uppercase tracking-widest">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#criativos"     className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Serviços de IA</a></li>
              <li><a href="#como-funciona" className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Como funciona</a></li>
              <li><a href="#planos"        className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Planos e Preços</a></li>
              <li><Link to="/auth"         className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Começar Agora</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[var(--ds-fg)] mb-4 text-xs uppercase tracking-widest">Empresa</h4>
            <ul className="space-y-3">
              <li><a href="#contatos"  className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Contatos</a></li>
              <li><Link to="/auth"     className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Entrar</Link></li>
              <li><Link to="/termos"   className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Termos de Uso</Link></li>
              <li><Link to="/termos"   className="text-[var(--ds-fg-muted)] hover:text-[var(--ds-gold-light)] transition-colors text-sm">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="ds-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--ds-fg-subtle)] text-sm">
            © 2026 ImobCreator AI. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="text-[var(--ds-fg-subtle)] hover:text-[var(--ds-gold-light)] text-sm transition-colors">Termos de Uso</Link>
            <Link to="/termos" className="text-[var(--ds-fg-subtle)] hover:text-[var(--ds-gold-light)] text-sm transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
