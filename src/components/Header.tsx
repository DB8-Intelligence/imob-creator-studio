import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  label: string;
  href: string;
  internal?: boolean;
  description?: string;
  emoji?: string;
  badge?: string;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
}

const DropdownMenu = ({ label, items }: DropdownMenuProps) => {
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
        className="flex items-center gap-1.5 text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors"
      >
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
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-xl border border-[#E5E7EB] shadow-lg shadow-black/5 overflow-hidden z-50"
          >
            <div className="p-2">
              {items.map((item) => {
                const cls = "flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#F8FAFF] transition-colors";
                const inner = (
                  <>
                    {item.emoji && (
                      <span className="mt-0.5 text-lg shrink-0">{item.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0A1628]">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280]">{item.badge}</span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-[#6B7280] mt-0.5">{item.description}</div>
                      )}
                    </div>
                  </>
                );
                return item.internal ? (
                  <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <a key={item.href} href={item.href} onClick={() => setOpen(false)} className={cls}>
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

  const solutions: DropdownItem[] = [
    { label: "Criativos",       href: "/criativos",             internal: true, emoji: "🎨", description: "Posts e artes com IA para imóveis" },
    { label: "Vídeos",          href: "/videos",                internal: true, emoji: "🎬", description: "Fotos viram Reels profissionais" },
    { label: "Site + Portais",  href: "/site-imobiliario",      internal: true, emoji: "🏠", description: "Site com SEO e integração portais", badge: "Em breve" },
    { label: "CRM",             href: "/crm-imobiliario",       internal: true, emoji: "🤝", description: "Organize leads e feche mais",      badge: "Em breve" },
    { label: "WhatsApp",        href: "/whatsapp-imobiliario",  internal: true, emoji: "📱", description: "Foto no WA → post no Instagram",   badge: "Em breve" },
    { label: "Publicação Social", href: "/publicacao-social",   internal: true, emoji: "📣", description: "Agende e publique IG + FB",        badge: "Em breve" },
  ];

  const audiences: DropdownItem[] = [
    { label: "Para Corretores",   href: "/para-corretores",   internal: true, emoji: "👤", description: "Velocidade e autonomia" },
    { label: "Para Imobiliárias", href: "/para-imobiliarias", internal: true, emoji: "🏢", description: "Escala e padronização" },
    { label: "Para Equipes",      href: "/para-equipes",      internal: true, emoji: "👥", description: "Alinhamento sem retrabalho" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-[#F0F0F0] shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0 flex items-center gap-1.5">
          <img src="/images/logo-header.png" alt="ImobCreator AI" className="h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          <Link to="/" className="text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors">Home</Link>
          <DropdownMenu label="Soluções" items={solutions} />
          <DropdownMenu label="Para quem" items={audiences} />
          <a href="#planos" className="text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors">Planos</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors">
            Entrar
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors"
          >
            Começar Agora
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 text-[#374151] hover:text-[#002B5B] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

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
            <div className="bg-white border-t border-[#F0F0F0]">
              <div className="container mx-auto px-6 py-5 flex flex-col gap-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[#0A1628]">Home</Link>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Soluções</div>
                  {solutions.map((s) => (
                    <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 pl-3 text-sm text-[#374151] hover:text-[#002B5B]">
                      <span>{s.emoji}</span> {s.label}
                      {s.badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280]">{s.badge}</span>}
                    </Link>
                  ))}
                </div>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Para quem</div>
                  {audiences.map((a) => (
                    <Link key={a.href} to={a.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 pl-3 text-sm text-[#374151] hover:text-[#002B5B]">
                      <span>{a.emoji}</span> {a.label}
                    </Link>
                  ))}
                </div>
                <div className="pt-4 flex flex-col gap-2.5">
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-3 text-center text-sm font-medium text-[#002B5B] border border-[#CBD5E1] rounded-[10px]">
                    Entrar
                  </Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-3 text-center text-sm font-semibold text-white bg-[#002B5B] rounded-[10px]">
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
