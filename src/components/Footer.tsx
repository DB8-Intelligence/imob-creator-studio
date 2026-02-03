import { Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-xl font-semibold text-primary-foreground">
                ImobCreator <span className="text-gradient">Visual</span>
              </span>
            </div>
            <p className="text-primary-foreground/60 max-w-md leading-relaxed">
              A plataforma líder em criação de materiais visuais para o mercado imobiliário. 
              Transforme suas fotos em apresentações que vendem.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Recursos</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Preços</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Exemplos</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Sobre</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Contato</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">Suporte</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 ImobCreator Visual. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
