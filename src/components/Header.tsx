import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            ImobCreator <span className="text-gradient">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#recursos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </a>
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Como funciona
          </a>
          <a href="#precos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Entrar
          </Link>
          <Link
            to="/auth"
            className="bg-accent-gradient text-primary font-medium text-sm px-5 py-2.5 rounded-lg shadow-glow hover:scale-105 transition-all duration-300"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
