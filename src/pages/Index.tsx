import { useEffect, useState, useRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus, Zap, Target, Link2, Award } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
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

// ─── Tabs data ───────────────────────────────────────────────────────────────

const tabs = [
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
    cta: "Entrar na lista", href: "/site-imobiliario", accent: "bg-[#F0FDF4]",
    mockup: (
      <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="h-6 bg-[#F1F5F9] flex items-center gap-1.5 px-3"><div className="w-2 h-2 rounded-full bg-[#E5E7EB]" /><div className="w-2 h-2 rounded-full bg-[#E5E7EB]" /><div className="w-2 h-2 rounded-full bg-[#E5E7EB]" /></div>
        <div className="p-4 bg-gradient-to-b from-[#F0FDF4] to-white space-y-2"><div className="h-3 w-1/2 bg-[#E5E7EB] rounded" /><div className="h-2 w-3/4 bg-[#E5E7EB] rounded" /><div className="grid grid-cols-3 gap-2 mt-3">{[1,2,3].map(i=><div key={i} className="aspect-square rounded bg-[#E5E7EB]" />)}</div></div>
      </div>
    ),
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Organize leads e feche mais negócios", sub: "Pipeline visual com histórico completo de cada lead.",
    benefits: ["Pipeline Kanban de vendas", "Histórico de interações", "Automação de follow-up", "Relatórios de conversão"],
    cta: "Entrar na lista", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]",
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
    cta: "Entrar na lista", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]",
    mockup: (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F0FDF4] p-4 space-y-2">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#25D366]" /><div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#374151] border border-[#E5E7EB]">📸 Novas fotos do apto 302</div></div>
        <div className="flex gap-2 justify-end"><div className="bg-[#DCF8C6] rounded-lg px-3 py-2 text-[10px] text-[#374151]">✅ Post gerado e publicado!</div></div>
      </div>
    ),
  },
];

const modules = [
  { emoji: "🎨", title: "Criativos", desc: "Posts e artes profissionais com IA", href: "/criativos", accent: "bg-[#EEF2FF]", available: true },
  { emoji: "🎬", title: "Vídeos", desc: "Fotos viram Reels cinematográficos", href: "/videos", accent: "bg-[#FFF7E0]", available: true },
  { emoji: "🏠", title: "Site + Portais", desc: "Site com SEO e integração portais", href: "/site-imobiliario", accent: "bg-[#F0FDF4]", available: false },
  { emoji: "🤝", title: "CRM", desc: "Organize leads e feche mais", href: "/crm-imobiliario", accent: "bg-[#F0F9FF]", available: false },
  { emoji: "📱", title: "WhatsApp", desc: "Foto no WA → Post no IG", href: "/whatsapp-imobiliario", accent: "bg-[#FFF0F5]", available: false },
  { emoji: "📣", title: "Publicação Social", desc: "Agende e publique IG + FB", href: "/publicacao-social", accent: "bg-[#FFFBEB]", available: false },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const Index = () => {
  const [activeTab, setActiveTab] = useState("criativos");

  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

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
      <section id="solucoes" className="py-20 px-6 bg-white scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-14 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Oferecemos tudo o que você precisa para <span className="text-[#002B5B]">vender mais imóveis</span>
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
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Conheça cada módulo em <span className="text-[#002B5B]">detalhe</span>
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
      <section className="py-16 px-6 bg-white border-y border-[#F0F0F0]">
        <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { end: 500, suffix: "+", label: "corretores usando a NexoImob" },
            { end: 1200, suffix: "+", label: "horas/mês economizadas" },
            { end: 3, suffix: "×", label: "aumento no alcance digital" },
            { end: 98, suffix: "%", label: "satisfação dos clientes" },
          ].map((m) => (
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
        { badge: "🏠 Site + Portais", title: "Seu site imobiliário com SEO por IA", desc: "Portfólio online profissional integrado com todos os portais de imóveis.", bullets: ["SEO automático por imóvel", "Integração ZAP, OLX, VivaReal", "Template responsivo", "Formulário com WhatsApp"], href: "/site-imobiliario", cta: "Entrar na lista", reverse: false, bg: "bg-white", accent: "from-[#F0FDF4] to-[#F8FAFF]", visual: <div className="rounded-lg border border-[#E5E7EB] overflow-hidden"><div className="h-5 bg-[#F1F5F9] flex items-center gap-1 px-2">{[1,2,3].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />)}</div><div className="p-3 space-y-2"><div className="h-2.5 w-1/2 bg-[#E5E7EB] rounded" /><div className="grid grid-cols-3 gap-1.5 mt-2">{[1,2,3].map(i=><div key={i} className="aspect-square rounded bg-gradient-to-br from-[#F0FDF4] to-[#E5E7EB]" />)}</div></div></div> },
        { badge: "🤝 CRM Imobiliário", title: "Organize leads e feche mais negócios", desc: "Pipeline visual de vendas com histórico completo de cada lead.", bullets: ["Pipeline Kanban visual", "Distribuição automática de leads", "Automação de follow-up", "Relatórios de conversão"], href: "/crm-imobiliario", cta: "Entrar na lista", reverse: true, bg: "bg-[#F8FAFF]", accent: "from-[#F0F9FF] to-[#F8FAFF]", visual: <div className="flex gap-2">{["Novos","Negociação","Fechados"].map(c=><div key={c} className="flex-1 rounded-lg border border-[#E5E7EB] p-2 bg-white"><div className="text-[8px] font-bold text-[#6B7280] mb-1.5 text-center">{c}</div>{[1,2].map(i=><div key={i} className="h-5 rounded bg-[#F8FAFF] border border-[#E5E7EB] mb-1" />)}</div>)}</div> },
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

      {/* ── S7: Diferenciais ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
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
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Corretores que já usam a <span className="text-[#002B5B]">NexoImob</span></motion.h2></Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { initials: "AL", bg: "bg-[#EEF2FF] text-[#3B5BDB]", quote: "Em 30 segundos tenho um post profissional. Antes passava horas no Canva tentando fazer algo decente.", name: "André L.", city: "Salvador, BA" },
              { initials: "MG", bg: "bg-[#FFF7E0] text-[#B8860B]", quote: "Os Reels automáticos dobraram meu alcance no Instagram. Meus clientes ficaram impressionados.", name: "Manoel G.", city: "Sorocaba, SP" },
              { initials: "RF", bg: "bg-[#ECFDF5] text-[#059669]", quote: "Minha imobiliária tem identidade visual consistente em todos os posts. Sem depender de designer.", name: "Rosangela F.", city: "São Caetano do Sul, SP" },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 flex flex-col gap-5">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                <p className="text-[#374151] text-sm italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-sm font-bold`}>{t.initials}</div>
                  <div><div className="text-[#0A1628] text-sm font-semibold">{t.name}</div><div className="text-[#6B7280] text-xs">{t.city}</div></div>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S9: Planos preview ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Planos para todos os <span className="text-[#002B5B]">tamanhos de negócio</span></motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">Comece pelos módulos que precisar e adicione mais conforme crescer</motion.p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { emoji: "🎨", title: "Criativos", plans: "Starter R$97 · Básico R$197 · PRO R$397", href: "/criativos#planos", accent: "bg-[#EEF2FF]" },
              { emoji: "🎬", title: "Vídeos", plans: "Starter R$97 · Básico R$197 · PRO R$397", href: "/videos#planos", accent: "bg-[#FFF7E0]" },
            ].map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <Link to={p.href} className="block bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-6 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-12 h-12 rounded-xl ${p.accent} flex items-center justify-center text-2xl`}>{p.emoji}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">Disponível</span>
                  </div>
                  <h3 className="text-[#0A1628] font-bold text-lg mb-1">{p.title}</h3>
                  <p className="text-[#6B7280] text-sm mb-3">{p.plans}</p>
                  <span className="text-[#002B5B] text-sm font-semibold inline-flex items-center gap-1">Ver planos <ArrowRight size={13} /></span>
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
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Facilite seu trabalho e venda mais imóveis</h2>
            <p className="text-white/70 text-base max-w-lg">Junte-se a centenas de corretores que já economizam horas por semana com a NexoImob AI.</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px] transition-colors">Comece com Criativos <ArrowRight size={15} /></Link>
              <Link to="/videos" className="inline-flex items-center gap-2 bg-transparent text-white font-bold text-sm px-6 py-3 rounded-[10px] border-[1.5px] border-white/30 hover:border-white/60 transition-colors">Comece com Vídeos <ArrowRight size={15} /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── S13: FAQ ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10"><motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Perguntas frequentes</motion.h2></Reveal>
          {[
            { q: "Como funciona a NexoImob AI?", a: "Você escolhe o módulo (Criativos, Vídeos, etc.), envia seus materiais e a IA gera conteúdo profissional automaticamente. Tudo pelo navegador, sem instalar nada." },
            { q: "Quais são as formas de pagamento?", a: "Aceitamos cartão de crédito e PIX via Kiwify. O acesso é liberado imediatamente após a confirmação do pagamento." },
            { q: "Posso cancelar a qualquer momento?", a: "Sim, sem fidelidade ou multa. Cancele quando quiser pelo painel ou por e-mail." },
            { q: "O conteúdo gerado é exclusivo para mim?", a: "Sim, 100%. Cada criativo ou vídeo é gerado sob medida para seu imóvel e sua marca. Sem marca d'água." },
            { q: "Tem suporte disponível?", a: "Sim! Suporte via WhatsApp em horário comercial. Respondemos em até 2 horas." },
            { q: "Como funciona a integração com portais?", a: "O módulo Site+Portais (em breve) gera feeds XML automáticos compatíveis com ZAP, OLX, VivaReal e ImovelWeb." },
          ].map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
      <PopupLeadCapture />
    </div>
  );
};

export default Index;
