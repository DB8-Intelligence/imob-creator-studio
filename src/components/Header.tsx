import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Menu, X, Film, Sparkles, MessageSquare, LayoutGrid, Zap, Star, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// ── Dropdown data ─────────────────────────────────────────────────────────────

const PRODUCT_ITEMS = [
  {
    icon: Sparkles,
    label: "Posts & Reels com IA",
    desc: "Criativos imobiliários em segundos",
    href: "#recursos",
    accent: false,
  },
  {
    icon: Film,
    label: "Vídeos IA",
    desc: "Fotos → vídeo 4K cinematográfico",
    href: "#videos-ia",
    accent: true,
    badge: "Novo",
  },
  {
    icon: MessageSquare,
    label: "Automação WhatsApp",
    desc: "Receba imóveis e publique sem sair do chat",
    href: "#whatsapp",
    accent: false,
  },
  {
    icon: LayoutGrid,
    label: "Templates & Biblioteca",
    desc: "Identidade visual por imobiliária",
    href: "#recursos",
    accent: false,
  },
];

const PLANS_ITEMS = [
  {
    icon: Zap,
    label: "Créditos",
    desc: "R$ 197/mês · entrada sem fidelidade",
    href: "#precos",
    color: "text-muted-foreground",
  },
  {
    icon: Star,
    label: "Pro",
    desc: "R$ 497/mês · posts + vídeo IA incluído",
    href: "#precos",
    color: "text-accent",
  },
  {
    icon: Crown,
    label: "VIP / Enterprise",
    desc: "A partir de R$ 1.497/mês · multi-conta",
    href: "#precos",
    color: "text-amber-500",
  },
];

// ── Dropdown component ────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  children: React.ReactNode;
}

const Dropdown = ({ label, children }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-elevated z-50 overflow-hidden">
          <div className="p-2">{children}</div>
        </div>
      )}
    </div>
  );
};

// ── Mobile menu ───────────────────────────────────────────────────────────────

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-card border-l border-border z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <span className="font-display font-semibold text-foreground">Menu</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Produto */}
          <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground/50 px-3 pt-2 pb-1">
            Produto
          </p>
          {PRODUCT_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-muted transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.accent ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-accent text-primary px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </a>
          ))}

          {/* Planos */}
          <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground/50 px-3 pt-4 pb-1">
            Planos
          </p>
          {PLANS_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition-colors"
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </a>
          ))}

          {/* Other links */}
          <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground/50 px-3 pt-4 pb-1">
            Mais
          </p>
          {[
            { label: "Como funciona", href: "#como-funciona" },
            { label: "Depoimentos", href: "#depoimentos" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <Link
            to="/auth"
            onClick={onClose}
            className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Entrar na conta
          </Link>
          <Link
            to="/auth"
            onClick={onClose}
            className="block w-full text-center py-2.5 rounded-xl bg-accent-gradient text-primary text-sm font-semibold shadow-glow hover:scale-[1.02] transition-all"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </>
  );
};

// ── Header ────────────────────────────────────────────────────────────────────

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-background/60 backdrop-blur-md border-b border-border/30"
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-accent-gradient rounded-lg flex items-center justify-center shadow-glow">
              <Building2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              ImobCreator <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">

            {/* Produto dropdown */}
            <Dropdown label="Produto">
              <div className="space-y-0.5">
                {PRODUCT_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.accent
                          ? "bg-accent text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold bg-accent text-primary px-1.5 py-0.5 rounded-full leading-none">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </Dropdown>

            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>

            {/* Vídeos IA — featured link */}
            <a
              href="#videos-ia"
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              Vídeos IA
              <span className="text-[10px] font-bold bg-accent text-primary px-1.5 py-0.5 rounded-full leading-none">
                Novo
              </span>
            </a>

            {/* Planos dropdown */}
            <Dropdown label="Planos">
              <div className="space-y-0.5">
                {PLANS_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </a>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <a
                    href="#precos"
                    className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-accent hover:bg-accent/5 transition-colors"
                  >
                    Ver comparativo completo
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Dropdown>

          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/auth"
              className="bg-accent-gradient text-primary font-semibold text-sm px-5 py-2.5 rounded-lg shadow-glow hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              Começar grátis
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;
