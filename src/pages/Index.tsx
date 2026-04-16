import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus, Zap, Target, Link2, Award } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { funnel } from "@/lib/funnel";
import { useABVariant } from "@/hooks/useABVariant";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ThemeGallerySection from "@/components/site/ThemeGallerySection";
import SiteThemeMiniGrid from "@/components/site/SiteThemeMiniGrid";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PopupLeadCapture } from "@/components/ui/PopupLeadCapture";
import { CountUp } from "@/components/ui/CountUp";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>{children}</motion.div>;
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="text-[#0A1628] font-semibold text-[15px]">{q}</span>
        <span className="shrink-0 text-[#6B7280]">{open ? <Minus size={16} /> : <Plus size={16} />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="pb-5 text-[#6B7280] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tracks when a section scrolls into view (fires once per section per session). */
function useSectionTracker(sectionName: string, variant: string) {
  const ref = useRef<HTMLElement>(null);
  const firedRef = useRef(false);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (firedRef.current) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          firedRef.current = true;
          funnel.scrollSection(sectionName, { variant });
        }
      }
    },
    [sectionName, variant],
  );
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onIntersect]);
  return ref;
}

// ─── Tabs data ───────────────────────────────────────────────────────────────

const tabsA = [
  {
    id: "criativos", emoji: "🎨", label: "Criativos",
    title: "50 artes/mês geradas por IA", sub: "Posts para Instagram, Facebook e WhatsApp com sua marca aplicada automaticamente.",
    benefits: ["6 estilos profissionais exclusivos", "Copy e headline gerados pela IA", "Identidade visual automática", "Download ou publicação direta"],
    cta: "Ver planos de Criativos", href: "/criativos", accent: "bg-[#EEF2FF]",
    mockup: (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-lg border border-[#E5E7EB] ${i % 2 === 0 ? "bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF]" : "bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF]"} flex items-center justify-center`}>
            <div className="w-6 h-4 bg-[#E5E7EB] rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "Reels profissionais em minutos", sub: "Envie fotos e receba vídeo cinematográfico com Ken Burns, trilha e overlay.",
    benefits: ["Ken Burns automático com crossfade", "6 moods de trilha royalty-free", "Texto overlay com dados do imóvel", "Formato 9:16 para Reels"],
    cta: "Ver planos de Vídeos", href: "/videos", accent: "bg-[#FFF7E0]",
    mockup: (
      <div className="flex flex-col gap-3">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF] border border-[#E5E7EB] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 border border-[#E5E7EB] flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-[#002B5B] border-y-[5px] border-y-transparent ml-0.5" /></div>
        </div>
        <div className="flex gap-1.5">{[80, 100, 60].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-[#E5E7EB]" style={{ width: `${w}%` }} />)}</div>
      </div>
    ),
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Site imobiliário com SEO automático", sub: "Portfólio online com domínio próprio, integrado com portais de imóveis.",
    benefits: ["Template responsivo otimizado", "SEO automático por imóvel", "Integração ZAP, OLX, VivaReal", "Formulário com WhatsApp"],
    cta: "Acessar agora", href: "/site-imobiliario", accent: "bg-[#F0FDF4]",
    mockup: <SiteThemeMiniGrid />,
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Organize leads e feche mais negócios", sub: "Pipeline visual com histórico completo de cada lead.",
    benefits: ["Pipeline Kanban de vendas", "Histórico de interações", "Automação de follow-up", "Relatórios de conversão"],
    cta: "Acessar CRM", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]",
    mockup: (
      <div className="flex gap-2">
        {["Novos", "Negociação", "Fechados"].map((c) => (
          <div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-[#F8FAFF]">
            <div className="text-[9px] font-bold text-[#6B7280] mb-2 text-center">{c}</div>
            {[1,2].map(i=><div key={i} className="h-6 rounded bg-white border border-[#E5E7EB] mb-1.5" />)}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Foto no WA → post no Instagram", sub: "Parceiro envia fotos pelo WhatsApp, a IA cria e publica automaticamente.",
    benefits: ["Recepção automática via WA", "IA analisa e gera criativos", "Publicação automática no IG", "Notificação ao corretor"],
    cta: "Configurar agora", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]",
    mockup: (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] p-4 space-y-2">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#25D366]" /><div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#374151] border border-[#E5E7EB]">📸 Novas fotos do apto 302</div></div>
        <div className="flex gap-2 justify-end"><div className="bg-[#DCF8C6] rounded-lg px-3 py-2 text-[10px] text-[#374151]">✅ Post gerado e publicado!</div></div>
      </div>
    ),
  },
];

const tabsB = [
  {
    id: "criativos", emoji: "🎨", label: "Criativos",
    title: "De foto comum para campanha profissional em 3 segundos", sub: "Upload, escolhe o estilo e pronto. IA adiciona fundo cinematográfico, preço, CTA e logomarca. Resultado: 40% mais cliques.",
    benefits: ["12+ estilos: Dark Premium, Glass Morphism, Luxo Dourado", "Copy e headline gerados pela IA", "Identidade visual automática", "Pronto para Instagram, WhatsApp e anúncio"],
    cta: "Gerar Criativo Agora", href: "/criativos", accent: "bg-[#EEF2FF]",
    mockup: (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`aspect-square rounded-lg border border-[#E5E7EB] ${i % 2 === 0 ? "bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF]" : "bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF]"} flex items-center justify-center`}>
            <div className="w-6 h-4 bg-[#E5E7EB] rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "5 fotos viram vídeo viral em 30 segundos", sub: "Vídeo profissional com Ken Burns, trilha cinematográfica e transições. Converte 3× mais que imagem estática no Reels.",
    benefits: ["Ken Burns automático com crossfade profissional", "6 trilhas royalty-free por mood", "Texto overlay com dados do imóvel", "1 vídeo/dia = 500+ views/semana"],
    cta: "Criar Vídeo Agora", href: "/videos", accent: "bg-[#FFF7E0]",
    mockup: (
      <div className="flex flex-col gap-3">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-[#FFF7E0] to-[#F8FAFF] border border-[#E5E7EB] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 border border-[#E5E7EB] flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-[#002B5B] border-y-[5px] border-y-transparent ml-0.5" /></div>
        </div>
        <div className="flex gap-1.5">{[80, 100, 60].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-[#E5E7EB]" style={{ width: `${w}%` }} />)}</div>
      </div>
    ),
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Seu imóvel em site profissional, sem pagar hosting", sub: "Setup automático em 2min. Tema moderno, galeria com zoom, integração ZAP/OLX, chat de contato. +60% agendamentos vs só WhatsApp.",
    benefits: ["3 temas profissionais: Brisa, Urbano, Litoral", "SEO automático por imóvel", "Integração ZAP, OLX, VivaReal automática", "Formulário direto pro WhatsApp"],
    cta: "Lançar Meu Site", href: "/site-imobiliario", accent: "bg-[#F0FDF4]",
    mockup: <SiteThemeMiniGrid />,
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Nunca mais perca um lead — nem esqueça de ligar", sub: "CRM que rastreia cada cliente. Automação avisa quando é hora de fazer follow-up. Corretores ganham 3-5 vendas/mês a mais.",
    benefits: ["Pipeline Kanban: Interesse → Agendado → Visitou → Negociando", "Histórico completo de interações", "Follow-up automático via WhatsApp", "Relatórios de conversão por período"],
    cta: "Organizar Leads Agora", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]",
    mockup: (
      <div className="flex gap-2">
        {["Novos", "Negociação", "Fechados"].map((c) => (
          <div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-[#F8FAFF]">
            <div className="text-[9px] font-bold text-[#6B7280] mb-2 text-center">{c}</div>
            {[1,2].map(i=><div key={i} className="h-6 rounded bg-white border border-[#E5E7EB] mb-1.5" />)}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Seu WhatsApp vendendo 24/7", sub: "Cliente clica no site, cai no seu WhatsApp com mensagem pronta. Resposta automática agenda visita sem você ao vivo. +50% contatos noturnos.",
    benefits: ["Setup em 5 minutos via QR code", "Templates aprovados pelo Meta", "Agendamento automático de visitas", "Respostas por palavra-chave"],
    cta: "Ativar WhatsApp Agora", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]",
    mockup: (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] p-4 space-y-2">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#25D366]" /><div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#374151] border border-[#E5E7EB]">📸 Novas fotos do apto 302</div></div>
        <div className="flex gap-2 justify-end"><div className="bg-[#DCF8C6] rounded-lg px-3 py-2 text-[10px] text-[#374151]">✅ Post gerado e publicado!</div></div>
      </div>
    ),
  },
];

const modulesA = [
  { emoji: "🎨", title: "Criativos", desc: "Posts e artes profissionais com IA", href: "/criativos", accent: "bg-[#EEF2FF]", available: true },
  { emoji: "🎬", title: "Vídeos", desc: "Fotos viram Reels cinematográficos", href: "/videos", accent: "bg-[#FFF7E0]", available: true },
  { emoji: "🏠", title: "Site + Portais", desc: "10 modelos profissionais + SEO automático", href: "/site-imobiliario", accent: "bg-[#F0FDF4]", available: true },
  { emoji: "🤝", title: "CRM", desc: "Pipeline Kanban completo de leads", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]", available: true },
  { emoji: "📱", title: "WhatsApp", desc: "Inbox + automações inteligentes", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]", available: true },
  { emoji: "📣", title: "Publicação Social", desc: "Agende e publique IG + FB", href: "/publicacao-social", accent: "bg-[#FFFBEB]", available: true },
];

const modulesB = [
  { emoji: "🎨", title: "Criativos em Segundos", desc: "3 cliques geram criativo profissional — economiza 30min por imóvel", href: "/criativos", accent: "bg-[#EEF2FF]", available: true },
  { emoji: "🎬", title: "Vídeos que Vendem", desc: "5 fotos viram Reel cinematográfico em 30s — 3× mais alcance que imagem", href: "/videos", accent: "bg-[#FFF7E0]", available: true },
  { emoji: "🏠", title: "Site Pronto em 2min", desc: "Cada imóvel ganha site profissional com SEO — +60% agendamentos", href: "/site-imobiliario", accent: "bg-[#F0FDF4]", available: true },
  { emoji: "🤝", title: "Nunca Perca um Lead", desc: "CRM com follow-up automático — corretores ganham 3-5 vendas/mês a mais", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]", available: true },
  { emoji: "📱", title: "WhatsApp 24/7", desc: "Respostas automáticas + agendamento — +50% contatos fora do horário", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]", available: true },
  { emoji: "📣", title: "Poste em Tudo", desc: "Um clique publica em Instagram, Facebook e TikTok — economiza 2h/dia", href: "/publicacao-social", accent: "bg-[#FFFBEB]", available: true },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const Index = () => {
  const [activeTab, setActiveTab] = useState("criativos");
  const variant = useABVariant();
  const isB = variant === "b";
  const modules = isB ? modulesB : modulesA;

  // Scroll section tracking (fires once per section per session)
  const solucoesRef = useSectionTracker("solucoes", variant);
  const featuresRef = useSectionTracker("features", variant);
  const metricsRef = useSectionTracker("metrics", variant);
  const differentialsRef = useSectionTracker("diferenciais", variant);
  const testimonialsRef = useSectionTracker("testimonials", variant);
  const pricingRef = useSectionTracker("pricing", variant);
  const ctaFinalRef = useSectionTracker("cta_final", variant);
  const faqRef = useSectionTracker("faq", variant);

  useEffect(() => {
    captureAttribution();
    captureLastTouch();
    funnel.viewLanding({ variant });
  }, [variant]);

  const tabs = isB ? tabsB : tabsA;
  const tab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBanner />
      <Header />
      <HeroSection />

      {/* ── S2: Trust Strip ──────────────────────────────────────────── */}
      <section className="bg-[#F8FAFF] border-y border-[#F0F0F0] py-5 px-6 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center mb-3">
          <p className="text-[#6B7280] text-sm font-medium">Plataforma imobiliária completa — Marketing automatizado em um só lugar</p>
        </div>
        <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
          <div className="flex gap-12 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
            {[...Array(2)].flatMap(() => ["ZAP Imóveis", "OLX", "VivaReal", "ImovelWeb", "Meta", "WhatsApp Business"]).map((n, i) => (
              <span key={i} className="text-[#94A3B8] font-bold text-sm tracking-wide">{n}</span>
            ))}
          </div>
        </div>
        <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ── S3: Soluções Grid ────────────────────────────────────────── */}
      <section id="solucoes" ref={solucoesRef} className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]" data-ab-test="solucoes-heading" data-variant={variant}>
              {isB
                ? <>De 1 foto para <span className="text-[#002B5B]">campanha completa</span> em minutos</>
                : <>Oferecemos tudo o que você precisa para <span className="text-[#002B5B]">vender mais imóveis</span></>
              }
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m) => (
              <motion.div key={m.title} variants={fadeUp}>
                <Link to={m.href} className={`block bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all ${!m.available ? "opacity-80" : ""}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-12 h-12 rounded-xl ${m.accent} flex items-center justify-center text-2xl`}>{m.emoji}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${m.available ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                      {m.available ? "Disponível" : "Em breve"}
                    </span>
                  </div>
                  <h3 className="text-[#0A1628] font-bold text-base mb-1">{m.title}</h3>
                  <p className="text-[#6B7280] text-sm mb-3">{m.desc}</p>
                  <span className="text-[#002B5B] text-sm font-semibold inline-flex items-center gap-1">
                    {m.available ? "Ver planos" : "Entrar na lista"} <ArrowRight size={13} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S4: Feature Tabs ─────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]" data-ab-test="features-heading" data-variant={variant}>
              {isB
                ? <>Cada módulo projetado para <span className="text-[#002B5B]">gerar resultado</span></>
                : <>Conheça cada módulo em <span className="text-[#002B5B]">detalhe</span></>
              }
            </motion.h2>
          </Reveal>
          <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {tabs.map((t) => (
              <button type="button" key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === t.id ? "border-[#002B5B] text-[#002B5B] font-semibold" : "border-transparent text-[#6B7280] hover:text-[#374151]"}`}
              >{t.emoji} {t.label}</button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-2xl border border-[#E5E7EB] p-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-[#0A1628]">{tab.title}</h3>
                <p className="text-[#6B7280] text-[15px]">{tab.sub}</p>
                <ul className="flex flex-col gap-2.5 mt-1">
                  {tab.benefits.map((b) => <li key={b} className="flex items-start gap-2.5 text-sm text-[#374151]"><Check size={15} className="text-[#002B5B] shrink-0 mt-0.5" />{b}</li>)}
                </ul>
                <Link to={tab.href} className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors w-fit mt-2">
                  {tab.cta} <ArrowRight size={15} />
                </Link>
              </div>
              <div className={`rounded-xl ${tab.accent} border border-[#E5E7EB] p-6 min-h-[260px] flex flex-col justify-center`}>
                {tab.mockup}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── S5: Metrics ──────────────────────────────────────────────── */}
      <section ref={metricsRef} className="py-16 px-6 bg-white border-y border-[#F0F0F0]">
        <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center" data-ab-test="metrics" data-variant={variant}>
          {(isB ? [
            { end: 500, suffix: "+", label: "corretores ativos no Brasil" },
            { end: 10, suffix: "h", label: "economizadas por semana" },
            { end: 40, suffix: "%", label: "mais cliques nos anúncios" },
            { end: 4.8, suffix: "", label: "nota de satisfação (5.0)" },
          ] : [
            { end: 500, suffix: "+", label: "corretores usando a NexoImob" },
            { end: 1200, suffix: "+", label: "horas/mês economizadas" },
            { end: 3, suffix: "×", label: "aumento no alcance digital" },
            { end: 98, suffix: "%", label: "satisfação dos clientes" },
          ]).map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <CountUp end={m.end} suffix={m.suffix} className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002B5B] leading-none" />
              <span className="text-[#6B7280] text-xs">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── S6: Feature cards alternados ──────────────────────────────── */}
      {[
        { badge: "🎨 Módulo Criativos", title: "Crie posts profissionais sem saber design", desc: "Templates exclusivos para corretor. IA ajusta cores, texto e estilo da sua marca.", bullets: ["50 a 150 artes por mês", "Copy automática pela IA", "6 formatos profissionais", "Download ou publica direto"], href: "/criativos", cta: "Experimente agora", reverse: false, bg: "bg-white", accent: "from-[#EEF2FF] to-[#F8FAFF]", visual: <div className="grid grid-cols-3 gap-2">{["Dark Premium","IA Express","Black Gold","Captação","Clássico","Top"].map(s=><div key={s} className="aspect-square rounded-lg bg-gradient-to-br from-[#EEF2FF] to-white border border-[#E5E7EB] flex items-center justify-center"><span className="text-[8px] text-[#6B7280] text-center leading-tight">{s}</span></div>)}</div> },
        { badge: "🎬 Módulo Vídeos", title: "Transforme fotos em Reels cinematográficos", desc: "Ken Burns automático, trilha sonora e texto overlay. Pronto para o Instagram.", bullets: ["5 a 20 vídeos por mês", "Ken Burns + crossfade", "6 trilhas royalty-free", "Formato 9:16 para Reels"], href: "/videos", cta: "Experimente agora", reverse: true, bg: "bg-[#F8FAFF]", accent: "from-[#FFF7E0] to-[#F8FAFF]", visual: <div className="flex flex-col gap-3"><div className="aspect-video rounded-lg bg-gradient-to-br from-[#FFF7E0] to-white border border-[#E5E7EB] flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-[#002B5B] border-y-[5px] border-y-transparent ml-0.5" /></div></div><div className="h-2 rounded-full bg-[#E5E7EB]"><div className="h-2 rounded-full bg-[#002B5B] w-2/3" /></div></div> },
        { badge: "🏠 Site + Portais", title: "Seu site imobiliário com SEO por IA", desc: "Portfólio online profissional integrado com todos os portais de imóveis.", bullets: ["SEO automático por imóvel", "Integração ZAP, OLX, VivaReal", "10 modelos profissionais", "Formulário com WhatsApp"], href: "/site-imobiliario", cta: "Acessar agora", reverse: false, bg: "bg-white", accent: "from-[#F0FDF4] to-[#F8FAFF]", visual: <SiteThemeMiniGrid /> },
        { badge: "🤝 CRM Imobiliário", title: "Organize leads e feche mais negócios", desc: "Pipeline visual de vendas com histórico completo de cada lead.", bullets: ["Pipeline Kanban visual", "Distribuição automática de leads", "Automação de follow-up", "Relatórios de conversão"], href: "/crm-imobiliario", cta: "Acessar CRM", reverse: true, bg: "bg-[#F8FAFF]", accent: "from-[#F0F9FF] to-[#F8FAFF]", visual: <div className="flex gap-2">{["Novos","Negociação","Fechados"].map(c=><div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-white"><div className="text-[8px] font-bold text-[#6B7280] mb-1.5 text-center">{c}</div>{[1,2].map(i=><div key={i} className="h-5 rounded bg-[#F8FAFF] border border-[#E5E7EB] mb-1" />)}</div>)}</div> },
      ].map((block, idx) => (
        <section key={idx} className={`py-20 px-6 ${block.bg}`}>
          <div className="container mx-auto max-w-5xl">
            <Reveal className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${block.reverse ? "" : ""}`}>
              <motion.div variants={fadeUp} className={block.reverse ? "lg:order-2" : ""}>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB] mb-4">{block.badge}</span>
                <h3 className="text-2xl font-bold text-[#0A1628] mb-3">{block.title}</h3>
                <p className="text-[#6B7280] text-sm mb-5">{block.desc}</p>
                <ul className="flex flex-col gap-2 mb-5">{block.bullets.map(b => <li key={b} className="flex items-start gap-2 text-sm text-[#374151]"><Check size={14} className="text-[#002B5B] shrink-0 mt-0.5" />{b}</li>)}</ul>
                <Link to={block.href} className="inline-flex items-center gap-1.5 text-[#002B5B] font-semibold text-sm hover:underline">{block.cta} <ArrowRight size={14} /></Link>
              </motion.div>
              <motion.div variants={fadeUp} className={`rounded-xl bg-gradient-to-br ${block.accent} border border-[#E5E7EB] p-6 min-h-[240px] flex flex-col justify-center ${block.reverse ? "lg:order-1" : ""}`}>
                {block.visual}
              </motion.div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ── S6b: Galeria de Temas de Site ─────────────────────────────── */}
      <ThemeGallerySection />

      {/* ── S7: Diferenciais ─────────────────────────────────────────── */}
      <section ref={differentialsRef} className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Por que escolher a <span className="text-[#002B5B]">NexoImob AI?</span></motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { icon: <Zap size={20} />, title: "Automação Inteligente", desc: "IA especializada no mercado imobiliário brasileiro. Não é genérica." },
              { icon: <Target size={20} />, title: "Foco em Resultados Imobiliários", desc: "Cada módulo desenhado para gerar mais leads e fechar mais vendas." },
              { icon: <Link2 size={20} />, title: "Integrado ao Seu Fluxo", desc: "WhatsApp, Instagram, portais de imóveis — tudo conectado em um lugar." },
              { icon: <Award size={20} />, title: "Feito para o Corretor Brasileiro", desc: "Português nativo, suporte WhatsApp, preços acessíveis." },
            ].map((d) => (
              <motion.div key={d.title} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 flex flex-col gap-3 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#002B5B]">{d.icon}</div>
                <h3 className="text-[15px] font-bold text-[#0A1628]">{d.title}</h3>
                <p className="text-[13px] text-[#6B7280]">{d.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S8: Depoimentos ──────────────────────────────────────────── */}
      <section ref={testimonialsRef} className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]" data-ab-test="testimonials-heading" data-variant={variant}>{isB ? <>Resultados reais de quem já usa a <span className="text-[#002B5B]">NexoImob</span></> : <>Corretores que já usam a <span className="text-[#002B5B]">NexoImob</span></>}</motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(isB ? [
              { initials: "BA", bg: "bg-[#EEF2FF] text-[#3B5BDB]", quote: "Eu gerava criativos manualmente no Canva — levava 30 minutos por imóvel. Com a NexoImob, são 3 cliques e pronto. Gerei 60 criativos em 1 semana. Aumentei 40% em cliques no anúncio e fechei 3 imóveis em 2 semanas.", name: "Bruno A.", city: "São Paulo, SP", role: "Corretor de Alto Padrão", metric: "40% mais cliques · 3 vendas em 2 semanas" },
              { initials: "CT", bg: "bg-[#FFF7E0] text-[#B8860B]", quote: "Trabalho com imóveis de litoral — são muitos para postar. Antes, postava 3 imóveis/semana. Hoje posto 15. A IA entende o estilo praia, usa cores e composição certas. Meus followers subiram 200% em 2 meses. Vendi 8 imóveis mês passado.", name: "Camila T.", city: "Salvador, BA", role: "Agente — Imóveis de Praia", metric: "15 posts/semana · 200% followers · 8 vendas/mês" },
              { initials: "LM", bg: "bg-[#ECFDF5] text-[#059669]", quote: "Comecei sem saber nada de design ou marketing. A NexoImob foi minha virada. Nos 3 primeiros meses na imobiliária, vendas medíocres. No 4º mês com a plataforma, 2 vendas. No 5º, 4 vendas. Meus seniors ficaram impressionados.", name: "Lucas M.", city: "Belo Horizonte, MG", role: "Novo Corretor", metric: "4 vendas no mês 5 · ROI 300% em 3 meses" },
            ] : [
              { initials: "AL", bg: "bg-[#EEF2FF] text-[#3B5BDB]", quote: "Em 30 segundos tenho um post profissional. Antes passava horas no Canva tentando fazer algo decente.", name: "André L.", city: "Salvador, BA", role: undefined as string | undefined, metric: undefined as string | undefined },
              { initials: "MG", bg: "bg-[#FFF7E0] text-[#B8860B]", quote: "Os Reels automáticos dobraram meu alcance no Instagram. Meus clientes ficaram impressionados.", name: "Manoel G.", city: "Sorocaba, SP", role: undefined, metric: undefined },
              { initials: "RF", bg: "bg-[#ECFDF5] text-[#059669]", quote: "Minha imobiliária tem identidade visual consistente em todos os posts. Sem depender de designer.", name: "Rosangela F.", city: "São Caetano do Sul, SP", role: undefined, metric: undefined },
            ]).map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 flex flex-col gap-5">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                <p className="text-[#374151] text-sm italic leading-relaxed">"{t.quote}"</p>
                {t.metric && <p className="text-[#002B5B] text-xs font-bold">{t.metric}</p>}
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-sm font-bold`}>{t.initials}</div>
                  <div>
                    <div className="text-[#0A1628] text-sm font-semibold">{t.name}</div>
                    <div className="text-[#6B7280] text-xs">{t.role ? `${t.role} · ${t.city}` : t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S9: Planos preview ───────────────────────────────────────── */}
      <section ref={pricingRef} className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]" data-ab-test="pricing-heading" data-variant={variant}>
              {isB
                ? <>Comece com <span className="text-[#002B5B]">R$97/mês</span> — cancele quando quiser</>
                : <>Planos para todos os <span className="text-[#002B5B]">tamanhos de negócio</span></>
              }
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">
              {isB
                ? "Sem fidelidade, sem multa. Teste o módulo que precisar e evolua conforme seus resultados"
                : "Comece pelos módulos que precisar e adicione mais conforme crescer"
              }
            </motion.p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {(isB ? [
              { emoji: "🎨", title: "Criativos", plans: "Starter R$97 · Básico R$197 · PRO R$397", sub: "50 a 150 artes/mês — economize 15h/semana vs Canva", href: "/criativos#planos", accent: "bg-[#EEF2FF]" },
              { emoji: "🎬", title: "Vídeos", plans: "Starter R$97 · Básico R$197 · PRO R$397", sub: "5 a 20 Reels/mês — 3× mais alcance que foto estática", href: "/videos#planos", accent: "bg-[#FFF7E0]" },
            ] : [
              { emoji: "🎨", title: "Criativos", plans: "Starter R$97 · Básico R$197 · PRO R$397", sub: undefined as string | undefined, href: "/criativos#planos", accent: "bg-[#EEF2FF]" },
              { emoji: "🎬", title: "Vídeos", plans: "Starter R$97 · Básico R$197 · PRO R$397", sub: undefined, href: "/videos#planos", accent: "bg-[#FFF7E0]" },
            ]).map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <Link to={p.href} onClick={() => funnel.clickCTA("pricing_card", { module: p.title, variant })} className="block bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-12 h-12 rounded-xl ${p.accent} flex items-center justify-center text-2xl`}>{p.emoji}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Disponível</span>
                  </div>
                  <h3 className="text-[#0A1628] font-bold text-lg mb-1">{p.title}</h3>
                  <p className="text-[#6B7280] text-sm mb-1">{p.plans}</p>
                  {p.sub && <p className="text-[#002B5B] text-xs font-medium mb-2">{p.sub}</p>}
                  <span className="text-[#002B5B] text-sm font-semibold inline-flex items-center gap-1">{isB ? "Escolher plano" : "Ver planos"} <ArrowRight size={13} /></span>
                </Link>
              </motion.div>
            ))}
          </Reveal>
          <div className="text-center mt-8">
            <Link to="/precos" className="inline-flex items-center gap-2 text-[#002B5B] font-semibold text-sm hover:underline">
              Ver todos os planos e preços <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── S12: CTA Final ───────────────────────────────────────────── */}
      <section ref={ctaFinalRef} className="py-20 px-6 bg-[#002B5B] relative overflow-hidden" data-ab-test="cta-final" data-variant={variant}>
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {isB
                ? "Comece grátis. Sem cartão. Sem compromisso."
                : "Facilite seu trabalho e venda mais imóveis"
              }
            </h2>
            <p className="text-white/70 text-base max-w-lg">
              {isB
                ? "500+ corretores já economizam 10h/semana com a NexoImob AI. Teste 7 dias grátis — se não gostar, reembolso total sem perguntas."
                : "Junte-se a centenas de corretores que já economizam horas por semana com a NexoImob AI."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link to="/criativos" onClick={() => funnel.clickCTA("cta_final_primary", { variant })} className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px] transition-colors">
                {isB ? "Testar Grátis — 50 Créditos" : "Comece com Criativos"} <ArrowRight size={15} />
              </Link>
              <Link to="/videos" onClick={() => funnel.clickCTA("cta_final_secondary", { variant })} className="inline-flex items-center gap-2 bg-transparent text-white font-bold text-sm px-6 py-3 rounded-[10px] border-[1.5px] border-white/30 hover:border-white/60 transition-colors">
                {isB ? "Ver Depoimentos" : "Comece com Vídeos"} <ArrowRight size={15} />
              </Link>
            </div>
            {isB && <p className="text-white/40 text-xs mt-2">Reembolso total em 7 dias se não gostar</p>}
          </motion.div>
        </div>
      </section>

      {/* ── S13: FAQ ─────────────────────────────────────────────────── */}
      <section ref={faqRef} className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Perguntas frequentes</motion.h2></Reveal>
          {(isB ? [
            { q: "Preciso de cartão de crédito para começar?", a: "Não. Teste grátis com 50 créditos. Pague só se achar que vale a pena." },
            { q: "As imagens parecem fake ou editadas?", a: "Não. Usamos IA de restauração fotográfica, não geração artificial. Sua foto original fica profissional, sem artefatos. O resultado parece produção de agência." },
            { q: "Demora muito para processar?", a: "Criativos ficam prontos em 3-5 segundos. Vídeos em 30-60 segundos. Tudo assíncrono — você pode continuar trabalhando enquanto processa." },
            { q: "Posso usar as imagens no OLX, ZAP e redes sociais?", a: "Sim. Você é o dono do conteúdo gerado. Use em qualquer lugar, sem restrição de direitos." },
            { q: "E se eu não gostar?", a: "Reembolso total em 7 dias, sem perguntas. Zero risco para você. Cancele pelo painel ou por e-mail." },
            { q: "Funciona para imóveis de qualquer tipo?", a: "Sim. Residencial, comercial, litoral, alto padrão, lançamentos e rural. A IA se adapta ao estilo do imóvel automaticamente." },
          ] : [
            { q: "Como funciona a NexoImob AI?", a: "Você escolhe o módulo (Criativos, Vídeos, etc.), envia seus materiais e a IA gera conteúdo profissional automaticamente. Tudo pelo navegador, sem instalar nada." },
            { q: "Quais são as formas de pagamento?", a: "Aceitamos cartão de crédito e PIX via Kiwify. O acesso é liberado imediatamente após a confirmação do pagamento." },
            { q: "Posso cancelar a qualquer momento?", a: "Sim, sem fidelidade ou multa. Cancele quando quiser pelo painel ou por e-mail." },
            { q: "O conteúdo gerado é exclusivo para mim?", a: "Sim, 100%. Cada criativo ou vídeo é gerado sob medida para seu imóvel e sua marca. Sem marca d'água." },
            { q: "Tem suporte disponível?", a: "Sim! Suporte via WhatsApp em horário comercial. Respondemos em até 2 horas." },
            { q: "Como funciona a integração com portais?", a: "O módulo Site+Portais gera feeds XML automáticos compatíveis com ZAP, OLX, VivaReal e ImovelWeb." },
          ]).map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <PopupLeadCapture />
    </div>
  );
};

export default Index;
