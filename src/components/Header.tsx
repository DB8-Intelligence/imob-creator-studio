import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Video, Image, Sofa, MapPin, CreditCard, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
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
        className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors"
      >
        {icon && <span>{icon}</span>}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#0f1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
        >
          <div className="p-2">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                {item.icon && (
                  <span className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </span>
                )}
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-white/50 mt-0.5">{item.description}</div>
                  )}
                </div>
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0b0f]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-18 flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
            <Building2 className="w-5 h-5 text-black" />
          </div>
          <span className="font-display text-xl font-semibold text-white">
            DB8 <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Intelligence</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#home" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Home
          </a>

          <DropdownMenu
            label="Servi\u00e7os IA"
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            items={[
              { label: "Gerar Criativos", href: "#criativos", description: "Posts e artes com IA", icon: <Image className="w-4 h-4 text-amber-400" /> },
              { label: "V\u00eddeos Imobili\u00e1rios", href: "#criativos", description: "Fotos viram v\u00eddeos cinem\u00e1ticos", icon: <Video className="w-4 h-4 text-blue-400" /> },
              { label: "Mobiliar Ambientes", href: "#criativos", description: "Decora\u00e7\u00e3o virtual com IA", icon: <Sofa className="w-4 h-4 text-emerald-400" /> },
              { label: "Demarcar Terrenos", href: "#criativos", description: "Delimita\u00e7\u00e3o inteligente", icon: <MapPin className="w-4 h-4 text-rose-400" /> },
            ]}
          />

          <a href="#planos" className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors">
            <CreditCard className="w-3.5 h-3.5" />
            Planos
          </a>

          <a href="#contatos" className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5" />
            Contatos
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block"
          >
            Entrar
          </Link>
          <Link
            to="/auth"
            className="relative bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Comec\u0327ar Agora
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0a0b0f]/95 backdrop-blur-xl border-t border-white/5">
          <div className="container mx-auto px-6 py-5 flex flex-col gap-1">
            <a href="#home" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-white">Home</a>
            <div className="py-2">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Servi\u00e7os IA</div>
              <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-white/60 hover:text-white">Gerar Criativos</a>
              <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-white/60 hover:text-white">V\u00eddeos Imobili\u00e1rios</a>
              <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-white/60 hover:text-white">Mobiliar Ambientes</a>
              <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-white/60 hover:text-white">Demarcar Terrenos</a>
            </div>
            <a href="#planos" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-white">Planos</a>
            <a href="#contatos" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-white">Contatos</a>
            <div className="pt-4 flex flex-col gap-2.5">
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-center text-white/70 border border-white/10 rounded-xl">
                Entrar
              </Link>
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm px-5 py-3 rounded-xl text-center shadow-lg shadow-amber-500/25">
                Comec\u0327ar Agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
