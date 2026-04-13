/**
 * ThemePreviewModal.tsx — Modal fullscreen estilo galeria para preview de tema.
 * Fundo escuro, preview centralizada, setas laterais e filmstrip de miniaturas.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Home, Building2, User, MessageSquare, Phone, LayoutGrid } from "lucide-react";
import type { TemaCorr, CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";
import ThemeRenderer from "@/components/site-temas/ThemeRenderer";

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_SITE: CorretorSite = {
  id: "demo", user_id: "demo", nome_completo: "Maria Silva Imoveis",
  creci: "12345-F", foto_url: "", bio: "Especialista em imoveis de alto padrao com mais de 10 anos de experiencia no mercado imobiliario. Atendimento personalizado e exclusivo para encontrar o imovel perfeito para voce.",
  especialidades: ["Apartamentos", "Casas", "Coberturas"],
  anos_experiencia: 10, telefone: "(11) 99999-0000", whatsapp: "5511999990000",
  email_contato: "contato@mariasilva.com.br", instagram: "", facebook: "", linkedin: "", youtube: "",
  slug: "maria-silva", dominio_customizado: "", dominio_verificado: false,
  dominio_verificado_at: null, cname_token: "",
  tema: "brisa", cor_primaria: "", cor_secundaria: "",
  logo_url: "", banner_hero_url: "",
  banner_hero_titulo: "Encontre o Imovel dos Seus Sonhos",
  banner_hero_subtitulo: "Apartamentos, casas e coberturas com a melhor assessoria do mercado imobiliario.",
  meta_titulo: "", meta_descricao: "", google_analytics_id: "",
  publicado: true, created_at: "", updated_at: "",
};

const DEMO_IMOVEIS: SiteImovel[] = [
  {
    id: "1", user_id: "demo", site_id: "demo", titulo: "Apartamento Vista Mar",
    descricao: "Lindo apartamento com vista para o mar", tipo: "apartamento",
    finalidade: "venda", status: "disponivel", endereco: "Av. Atlantica, 1000",
    bairro: "Copacabana", cidade: "Rio de Janeiro", estado: "RJ", cep: "22000-000",
    preco: 1250000, area_total: 120, area_construida: 110,
    quartos: 3, suites: 1, banheiros: 2, vagas: 2,
    fotos: [], foto_capa: "", features: ["Piscina", "Academia", "Churrasqueira"],
    publicar_zap: false, publicar_olx: false, publicar_vivareal: false,
    codigo_externo: "", destaque: true, ordem_exibicao: 1,
    created_at: "", updated_at: "",
  },
  {
    id: "2", user_id: "demo", site_id: "demo", titulo: "Casa em Condominio Fechado",
    descricao: "Casa espacosa em condominio de luxo", tipo: "casa",
    finalidade: "venda", status: "disponivel", endereco: "Rua das Palmeiras, 500",
    bairro: "Alphaville", cidade: "Sao Paulo", estado: "SP", cep: "06000-000",
    preco: 2800000, area_total: 350, area_construida: 280,
    quartos: 4, suites: 2, banheiros: 4, vagas: 3,
    fotos: [], foto_capa: "", features: ["Piscina", "Jardim", "Home Office"],
    publicar_zap: false, publicar_olx: false, publicar_vivareal: false,
    codigo_externo: "", destaque: true, ordem_exibicao: 2,
    created_at: "", updated_at: "",
  },
  {
    id: "3", user_id: "demo", site_id: "demo", titulo: "Cobertura Duplex",
    descricao: "Cobertura duplex com terraco panoramico", tipo: "cobertura",
    finalidade: "venda", status: "disponivel", endereco: "Rua Oscar Freire, 200",
    bairro: "Jardins", cidade: "Sao Paulo", estado: "SP", cep: "01426-000",
    preco: 4500000, area_total: 280, area_construida: 250,
    quartos: 5, suites: 3, banheiros: 5, vagas: 4,
    fotos: [], foto_capa: "", features: ["Terraco", "Piscina Privativa", "Sauna"],
    publicar_zap: false, publicar_olx: false, publicar_vivareal: false,
    codigo_externo: "", destaque: true, ordem_exibicao: 3,
    created_at: "", updated_at: "",
  },
];

const DEMO_DEPOIMENTOS: SiteDepoimento[] = [
  { id: "1", user_id: "demo", site_id: "demo", nome_cliente: "Carlos Mendes", foto_url: "", texto: "Excelente atendimento! Encontrei meu apartamento em tempo recorde.", avaliacao: 5, tipo_negocio: "Compra", ativo: true, ordem: 1, created_at: "" },
  { id: "2", user_id: "demo", site_id: "demo", nome_cliente: "Ana Costa", foto_url: "", texto: "Profissionalismo e dedicacao. Recomendo a todos!", avaliacao: 5, tipo_negocio: "Venda", ativo: true, ordem: 2, created_at: "" },
  { id: "3", user_id: "demo", site_id: "demo", nome_cliente: "Roberto Lima", foto_url: "", texto: "A melhor experiencia que tive na compra de um imovel.", avaliacao: 5, tipo_negocio: "Compra", ativo: true, ordem: 3, created_at: "" },
];

/* ------------------------------------------------------------------ */
/*  Page sections                                                      */
/* ------------------------------------------------------------------ */

const PAGE_SECTIONS = [
  { id: "hero", label: "Pagina Inicial", icon: Home },
  { id: "imoveis", label: "Imoveis", icon: Building2 },
  { id: "sobre", label: "Sobre", icon: User },
  { id: "depoimentos", label: "Depoimentos", icon: MessageSquare },
  { id: "contato", label: "Contato", icon: Phone },
  { id: "rodape", label: "Rodape", icon: LayoutGrid },
] as const;

const SECTION_COUNT = PAGE_SECTIONS.length;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ThemePreviewModalProps {
  open: boolean;
  onClose: () => void;
  themeId: TemaCorr;
  themeName: string;
  onSelectTheme?: (themeId: TemaCorr) => void;
}

export default function ThemePreviewModal({
  open,
  onClose,
  themeId,
  themeName,
  onSelectTheme,
}: ThemePreviewModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const previewSite: CorretorSite = { ...DEMO_SITE, tema: themeId };

  useEffect(() => {
    setActiveIdx(0);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [themeId]);

  // Scroll to section by fraction of total content height
  const scrollToSection = useCallback((idx: number) => {
    setActiveIdx(idx);
    const el = mainRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const targetScroll = (idx / (SECTION_COUNT - 1)) * maxScroll;
    el.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    scrollToSection(Math.min(activeIdx + 1, SECTION_COUNT - 1));
  }, [activeIdx, scrollToSection]);

  const goPrev = useCallback(() => {
    scrollToSection(Math.max(activeIdx - 1, 0));
  }, [activeIdx, scrollToSection]);

  // Keep active thumbnail centered
  useEffect(() => {
    if (!thumbStripRef.current) return;
    const strip = thumbStripRef.current;
    const child = strip.children[activeIdx] as HTMLElement | undefined;
    if (child) {
      strip.scrollTo({
        left: child.offsetLeft - strip.offsetWidth / 2 + child.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeIdx]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onClose]);

  // Track scroll position -> active section
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    const fraction = el.scrollTop / maxScroll;
    const idx = Math.round(fraction * (SECTION_COUNT - 1));
    const clamped = Math.max(0, Math.min(SECTION_COUNT - 1, idx));
    if (clamped !== activeIdx) setActiveIdx(clamped);
  }, [activeIdx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Top bar */}
      <div
        className="relative z-20 flex shrink-0 items-center justify-between px-5 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          {themeName}
        </span>
        <div className="flex items-center gap-3">
          {onSelectTheme && (
            <button
              type="button"
              onClick={() => { onSelectTheme(themeId); onClose(); }}
              className="rounded-lg bg-[#FF5A3C] px-5 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-[#e5432a]"
            >
              Usar este tema
            </button>
          )}
          <button
            type="button"
            title="Fechar preview"
            onClick={onClose}
            className="rounded-lg bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main content with arrows */}
      <div
        className="relative z-10 flex flex-1 items-stretch justify-center overflow-hidden px-14 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left arrow */}
        <button
          type="button"
          title="Secao anterior"
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur-sm transition hover:bg-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed md:left-2 md:p-3"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          title="Proxima secao"
          onClick={goNext}
          disabled={activeIdx === SECTION_COUNT - 1}
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur-sm transition hover:bg-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed md:right-2 md:p-3"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Rendered site preview */}
        <div
          ref={mainRef}
          onScroll={handleScroll}
          className="w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        >
          <ThemeRenderer
            site={previewSite}
            imoveis={DEMO_IMOVEIS}
            depoimentos={DEMO_DEPOIMENTOS}
          />
        </div>
      </div>

      {/* Bottom filmstrip */}
      <div
        className="relative z-10 shrink-0 px-6 pb-4 md:px-14"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={thumbStripRef}
          className="mx-auto flex max-w-4xl items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none md:gap-3"
        >
          {PAGE_SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isActive = idx === activeIdx;
            return (
              <button
                key={section.id}
                type="button"
                title={section.label}
                onClick={() => scrollToSection(idx)}
                className={`group relative flex shrink-0 flex-col items-center gap-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "ring-[3px] ring-white shadow-[0_0_24px_rgba(255,255,255,0.25)] scale-[1.08]"
                    : "ring-1 ring-white/20 opacity-50 hover:opacity-85 hover:ring-white/40"
                }`}
              >
                <div className="flex h-[90px] w-[140px] flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 md:h-[100px] md:w-[160px]">
                  <Icon className={`h-6 w-6 transition ${isActive ? "text-white" : "text-white/50"}`} />
                  <span className={`text-[10px] font-semibold leading-none md:text-[11px] transition ${isActive ? "text-white" : "text-white/50"}`}>
                    {section.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
