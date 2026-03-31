import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Image, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
  icon?: React.ReactNode;
}

const DropdownMenu = ({ label, items, icon }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {icon && <span>{icon}</span>}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-card border border-border/60 rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50"
        >
          <div className="p-1.5">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
              >
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            DB8 <span className="text-gradient">Intelligence</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </a>

          <DropdownMenu
            label="Imagem Creator AI"
            icon={<Image className="w-3.5 h-3.5" />}
            items={[
              {
                label: "Descritivos e Recursos",
                href: "#criativos",
                description: "Conheça todas as funcionalidades",
              },
              {
                label: "Planos",
                href: "#planos-criativos",
                description: "Escolha o plano ideal",
              },
            ]}
          />

          {/* Videos AI — implementação futura (oculto da landing) */}

          <a
            href="#contatos"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Contatos
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Entrar
          </Link>
          <Link
            to="/auth"
            className="bg-accent-gradient text-primary font-medium text-sm px-5 py-2.5 rounded-lg shadow-glow hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Começar Agora
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            <a href="#home" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-foreground">
              Home
            </a>
            <div className="py-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-0">
                Imagem Creator AI
              </div>
              <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2 pl-3 text-sm text-muted-foreground hover:text-foreground">
                Descritivos e Recursos
              </a>
              <a href="#planos-criativos" onClick={() => setMobileOpen(false)} className="block py-2 pl-3 text-sm text-muted-foreground hover:text-foreground">
                Planos
              </a>
            </div>
            {/* Videos AI mobile — implementação futura */}
            <a href="#contatos" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-foreground">
              Contatos
            </a>
            <div className="pt-3 flex flex-col gap-2">
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-center text-muted-foreground border border-border rounded-lg">
                Entrar
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="bg-accent-gradient text-primary font-medium text-sm px-5 py-2.5 rounded-lg text-center shadow-glow"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
