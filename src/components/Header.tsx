import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Video, Image, Sofa, MapPin, CreditCard, Mail, Sparkles, Menu, X, UserCheck, Users, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  label: string;
  href: string;
  /** If true, renders as a React Router <Link> instead of <a> */
  internal?: boolean;
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
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors"
      >
        {icon}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 glass rounded-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              {items.map((item) => {
                const itemClass = "flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors";
                const inner = (
                  <>
                    {item.icon && (
                      <span className="mt-0.5 w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.08)] flex items-center justify-center shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <div>
                      <div className="text-sm font-medium text-[var(--ds-fg)]">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{item.description}</div>
                      )}
                    </div>
                  </>
                );
                return item.internal ? (
                  <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className={itemClass}>
                    {inner}
                  </Link>
                ) : (
                  <a key={item.href} href={item.href} onClick={() => setOpen(false)} className={itemClass}>
                    {inner}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(5,8,11,0.88)] backdrop-blur-xl border-b border-[var(--ds-border)] shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-18 flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img src="/images/logo-header.png" alt="ImobCreator AI" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#home" className="text-sm font-medium text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors">
            Home
          </a>

          <DropdownMenu
            label="Produtos"
            icon={<Package className="w-3.5 h-3.5 text-[var(--ds-gold)]" />}
            items={[
              { label: "ImobCreator Criativos", href: "/criativos", internal: true, description: "Posts e artes com IA para imóveis", icon: <Image className="w-4 h-4 text-[var(--ds-gold-light)]" /> },
              { label: "ImobCreator Vídeos",    href: "/videos",    internal: true, description: "Fotos viram Reels profissionais",   icon: <Video className="w-4 h-4 text-[#60C8FF]" /> },
            ]}
          />

          <DropdownMenu
            label="Serviços IA"
            icon={<Sparkles className="w-3.5 h-3.5 text-[var(--ds-gold)]" />}
            items={[
              { label: "Gerar Criativos",    href: "#criativos", description: "Posts e artes com IA",           icon: <Image   className="w-4 h-4 text-[var(--ds-gold-light)]" /> },
              { label: "Vídeos Imobiliários",href: "#criativos", description: "Fotos viram vídeos cinemáticos", icon: <Video   className="w-4 h-4 text-[#60C8FF]" /> },
              { label: "Mobiliar Ambientes", href: "#criativos", description: "Decoração virtual com IA",       icon: <Sofa    className="w-4 h-4 text-[#6EE7B7]" /> },
              { label: "Demarcar Terrenos",  href: "#criativos", description: "Delimitação inteligente",        icon: <MapPin  className="w-4 h-4 text-[#FCA5A5]" /> },
            ]}
          />

          <DropdownMenu
            label="Soluções"
            icon={<Users className="w-3.5 h-3.5 text-[var(--ds-cyan-dim)]" />}
            items={[
              { label: "Para Corretores",   href: "/para-corretores",   internal: true, description: "Trabalha sozinho e precisa de velocidade",    icon: <UserCheck className="w-4 h-4 text-[var(--ds-gold-light)]" /> },
              { label: "Para Imobiliárias", href: "/para-imobiliarias", internal: true, description: "Escala, padronização e controle de marca",     icon: <Building2 className="w-4 h-4 text-[#60C8FF]" /> },
              { label: "Para Equipes",      href: "/para-equipes",      internal: true, description: "Times alinhados, sem retrabalho",              icon: <Users     className="w-4 h-4 text-[#6EE7B7]" /> },
            ]}
          />

          <a href="#planos" className="flex items-center gap-1.5 text-sm font-medium text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors">
            <CreditCard className="w-3.5 h-3.5" />
            Planos
          </a>

          <a href="#contatos" className="flex items-center gap-1.5 text-sm font-medium text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors">
            <Mail className="w-3.5 h-3.5" />
            Contatos
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-medium text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors hidden sm:block">
            Entrar
          </Link>
          <Link to="/auth" className="btn-primary !py-2.5 !px-5 !text-sm">
            Começar Agora
          </Link>

          <button
            type="button"
            className="lg:hidden p-2 text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="bg-[rgba(5,8,11,0.95)] backdrop-blur-xl border-t border-[var(--ds-border)]">
              <div className="container mx-auto px-6 py-5 flex flex-col gap-1">
                <a href="#home"     onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[var(--ds-fg)]">Home</a>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-2">Produtos</div>
                  <Link to="/criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">ImobCreator Criativos</Link>
                  <Link to="/videos"    onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">ImobCreator Vídeos</Link>
                </div>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-2">Serviços IA</div>
                  <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Gerar Criativos</a>
                  <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Vídeos Imobiliários</a>
                  <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Mobiliar Ambientes</a>
                  <a href="#criativos" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Demarcar Terrenos</a>
                </div>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-2">Soluções</div>
                  <Link to="/para-corretores"   onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Para Corretores</Link>
                  <Link to="/para-imobiliarias" onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Para Imobiliárias</Link>
                  <Link to="/para-equipes"      onClick={() => setMobileOpen(false)} className="block py-2.5 pl-3 text-sm text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">Para Equipes</Link>
                </div>
                <a href="#planos"   onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[var(--ds-fg)]">Planos</a>
                <a href="#contatos" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[var(--ds-fg)]">Contatos</a>
                <div className="pt-4 flex flex-col gap-2.5">
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-secondary py-3 text-center justify-center text-sm">
                    Entrar
                  </Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-primary py-3 justify-center text-sm">
                    Começar Agora
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
