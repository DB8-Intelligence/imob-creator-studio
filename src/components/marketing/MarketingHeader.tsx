import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Planos", href: "/planos" },
  { label: "Resultados", href: "/resultados" },
  { label: "FAQ", href: "/faq" },
  { label: "Contato", href: "/contato" },
];

const MarketingHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            ImobCreator <span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Entrar
          </Link>
          <Button variant="hero" size="default" asChild>
            <Link to="/auth">Começar Grátis</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button variant="hero" size="sm" asChild className="flex-1">
              <Link to="/auth">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingHeader;
