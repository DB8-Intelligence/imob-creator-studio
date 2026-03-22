import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
              Automação de conteúdo imobiliário com IA para gerar posts, reels e vídeos cinematográficos — tudo pelo dashboard, do upload ao Instagram.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#criativos" className="text-primary-foreground/60 hover:text-accent transition-colors">Imagem Creator AI</a></li>
              <li><a href="#videos-ia" className="text-primary-foreground/60 hover:text-accent transition-colors">Videos AI</a></li>
              <li><a href="#planos-criativos" className="text-primary-foreground/60 hover:text-accent transition-colors">Planos</a></li>
              <li><Link to="/auth" className="text-primary-foreground/60 hover:text-accent transition-colors">Começar Agora</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><a href="#como-funciona" className="text-primary-foreground/60 hover:text-accent transition-colors">Como funciona</a></li>
              <li><a href="#contatos" className="text-primary-foreground/60 hover:text-accent transition-colors">Contatos</a></li>
              <li><Link to="/auth" className="text-primary-foreground/60 hover:text-accent transition-colors">Entrar</Link></li>
              <li><Link to="/termos" className="text-primary-foreground/60 hover:text-accent transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2026 ImobCreator AI. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Termos de Uso
            </Link>
            <Link to="/termos" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
