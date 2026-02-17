import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const MarketingFooter = () => (
  <footer className="bg-primary py-16">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold text-primary-foreground">
              ImobCreator <span className="text-gradient">AI</span>
            </span>
          </div>
          <p className="text-primary-foreground/60 max-w-md leading-relaxed">
            Posts de imóveis automáticos: do WhatsApp direto pro Instagram.
            Economize tempo e venda mais com inteligência artificial.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-primary-foreground mb-4">Produto</h4>
          <ul className="space-y-3">
            <li><Link to="/como-funciona" className="text-primary-foreground/60 hover:text-accent transition-colors">Como Funciona</Link></li>
            <li><Link to="/planos" className="text-primary-foreground/60 hover:text-accent transition-colors">Planos</Link></li>
            <li><Link to="/resultados" className="text-primary-foreground/60 hover:text-accent transition-colors">Resultados</Link></li>
            <li><Link to="/faq" className="text-primary-foreground/60 hover:text-accent transition-colors">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary-foreground mb-4">Suporte</h4>
          <ul className="space-y-3">
            <li><Link to="/contato" className="text-primary-foreground/60 hover:text-accent transition-colors">Contato</Link></li>
            <li><Link to="/auth" className="text-primary-foreground/60 hover:text-accent transition-colors">Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} ImobCreator AI. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">Termos</a>
          <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">Privacidade</a>
        </div>
      </div>
    </div>
  </footer>
);

export default MarketingFooter;
