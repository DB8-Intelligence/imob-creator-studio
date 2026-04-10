import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface DDItem { label: string; href: string; emoji?: string; desc?: string; badge?: string }

function Dropdown({ label, items, cols = 1 }: { label: string; items: DDItem[]; cols?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} onMouseEnter={() => setOpen(true)} className="flex items-center gap-1 text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors">
        {label} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div key="dd" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} onMouseLeave={() => setOpen(false)}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-xl border border-[#E5E7EB] shadow-lg shadow-black/5 overflow-hidden z-50 ${cols === 2 ? "w-[480px]" : "w-64"}`}>
            <div className={`p-2 ${cols === 2 ? "grid grid-cols-2 gap-1" : ""}`}>
              {items.map((it) => (
                <Link key={it.href} to={it.href} onClick={() => setOpen(false)} className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#F8FAFF] transition-colors">
                  {it.emoji && <span className="mt-0.5 text-lg shrink-0">{it.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0A1628]">{it.label}</span>
                      {it.badge && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${it.badge === "Disponível" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{it.badge}</span>}
                    </div>
                    {it.desc && <div className="text-xs text-[#6B7280] mt-0.5">{it.desc}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const solutions: DDItem[] = [
  { label: "Criativos", href: "/criativos", emoji: "🎨", desc: "Posts e artes com IA", badge: "Disponível" },
  { label: "Vídeos", href: "/videos", emoji: "🎬", desc: "Fotos viram Reels", badge: "Disponível" },
  { label: "Site + Portais", href: "/site-imobiliario", emoji: "🏠", desc: "SEO e integração portais", badge: "Em breve" },
  { label: "CRM", href: "/crm-imobiliario", emoji: "🤝", desc: "Organize leads", badge: "Em breve" },
  { label: "WhatsApp", href: "/whatsapp-imobiliario", emoji: "📱", desc: "Foto → Post automático", badge: "Em breve" },
  { label: "Social", href: "/publicacao-social", emoji: "📣", desc: "Agende e publique", badge: "Em breve" },
];

const recursos: DDItem[] = [
  { label: "Preços", href: "/precos", emoji: "💰" },
  { label: "Contato", href: "/contato", emoji: "✉️" },
];

const empresa: DDItem[] = [
  { label: "Sobre", href: "/sobre", emoji: "🏢" },
  { label: "Termos de Uso", href: "/termos", emoji: "📄" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm border-b border-[#F0F0F0] shadow-sm" : "bg-white border-b border-transparent"}`}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0 flex items-center gap-1.5">
          <span className="text-xl font-bold text-[#002B5B]" style={{ fontFamily: "Rubik, sans-serif" }}>NexoImob</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFD700] text-[#002B5B]">AI</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          <Link to="/" className="text-sm font-medium text-[#374151] hover:text-[#002B5B] transition-colors">Home</Link>
          <Dropdown label="Soluções" items={solutions} cols={2} />
          <Dropdown label="Recursos" items={recursos} />
          <Dropdown label="Empresa" items={empresa} />
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-[#002B5B] border border-[#CBD5E1] px-4 py-2 rounded-[10px] hover:bg-[#F8FAFF] transition-colors">Entrar</Link>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors">
            Começar grátis
          </Link>
          <button type="button" className="lg:hidden p-2 text-[#374151]" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="mob" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="lg:hidden overflow-hidden">
            <div className="bg-white border-t border-[#F0F0F0]">
              <div className="container mx-auto px-6 py-5 flex flex-col gap-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[#0A1628]">Home</Link>
                <div className="py-2">
                  <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Soluções</div>
                  {solutions.map((s) => (
                    <Link key={s.href} to={s.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 pl-3 text-sm text-[#374151]">
                      <span>{s.emoji}</span> {s.label}
                      {s.badge && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.badge === "Disponível" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{s.badge}</span>}
                    </Link>
                  ))}
                </div>
                <Link to="/precos" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[#0A1628]">Preços</Link>
                <Link to="/sobre" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[#0A1628]">Sobre</Link>
                <Link to="/contato" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-medium text-[#0A1628]">Contato</Link>
                <div className="pt-4 flex flex-col gap-2.5">
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-3 text-center text-sm font-medium text-[#002B5B] border border-[#CBD5E1] rounded-[10px]">Entrar</Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="py-3 text-center text-sm font-semibold text-white bg-[#002B5B] rounded-[10px]">Começar grátis</Link>
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
