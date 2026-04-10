import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, Zap, Target, Smartphone, Trophy, Plus, Minus } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";

// ─── Animation helpers ───────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── CountUp ─────────────────────────────────────────────────────────────────

function CountUp({ end, suffix = "", prefix = "", duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-[#FFD700] font-['Syne',sans-serif] leading-none">
      {prefix}{count.toLocaleString("pt-BR")}{suffix}
    </span>
  );
}

// ─── Accordion FAQ ───────────────────────────────────────────────────────────

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-white font-semibold text-sm leading-snug">{question}</span>
        <span className="shrink-0 text-[rgba(255,255,255,0.5)]">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Tabs data ───────────────────────────────────────────────────────

interface ProductTab {
  id: string;
  emoji: string;
  label: string;
  title: string;
  subtitle: string;
  benefits: string[];
  cta: string;
  href: string;
  gradient: string;
}

const productTabs: ProductTab[] = [
  {
    id: "criativos", emoji: "🎨", label: "Criativos",
    title: "50 artes/mês geradas por IA",
    subtitle: "Posts para Instagram, Facebook e WhatsApp. Sua marca aplicada automaticamente em todos os criativos.",
    benefits: [
      "6 estilos profissionais exclusivos",
      "Copy e headline gerados pela IA",
      "Identidade visual aplicada automaticamente",
      "Download ou publicação direta",
    ],
    cta: "Ver planos de Criativos",
    href: "/criativos",
    gradient: "from-[rgba(255,215,0,0.12)] to-[rgba(0,43,91,0.15)]",
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "Reels profissionais em minutos",
    subtitle: "Envie fotos do imóvel e receba um vídeo cinematográfico com Ken Burns, trilha e texto overlay.",
    benefits: [
      "Ken Burns automático com crossfade",
      "6 moods de trilha sonora royalty-free",
      "Texto overlay com dados do imóvel",
      "Formato 9:16 otimizado para Reels",
    ],
    cta: "Ver planos de Vídeos",
    href: "/videos",
    gradient: "from-[rgba(0,150,204,0.12)] to-[rgba(0,43,91,0.15)]",
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Site imobiliário com SEO automático",
    subtitle: "Seu portfólio online profissional com domínio próprio, integrado com portais de imóveis.",
    benefits: [
      "Template responsivo e otimizado",
      "SEO automático para cada imóvel",
      "Integração com portais (ZAP, OLX)",
      "Formulário de contato com WhatsApp",
    ],
    cta: "Em breve",
    href: "#",
    gradient: "from-[rgba(110,231,183,0.1)] to-[rgba(0,43,91,0.12)]",
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Organize seus leads e feche mais",
    subtitle: "Pipeline visual de vendas com histórico completo de cada lead, do primeiro contato ao fechamento.",
    benefits: [
      "Pipeline Kanban de vendas",
      "Histórico completo de interações",
      "Automação de follow-up",
      "Relatórios de conversão",
    ],
    cta: "Em breve",
    href: "#",
    gradient: "from-[rgba(252,165,165,0.1)] to-[rgba(0,43,91,0.12)]",
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Receba imóveis e publique automaticamente",
    subtitle: "O parceiro envia fotos pelo WhatsApp, a IA cria o criativo e publica. Zero trabalho manual.",
    benefits: [
      "Recepção automática via WhatsApp",
      "IA analisa e gera criativos",
      "Publicação automática no Instagram",
      "Notificação ao corretor quando pronto",
    ],
    cta: "Em breve",
    href: "#",
    gradient: "from-[rgba(37,211,102,0.1)] to-[rgba(0,43,91,0.12)]",
  },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ bg, id, children, className = "" }: { bg: string; id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 px-6 ${bg} ${className}`}>
      <div className="container mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionTitle({ badge, title, subtitle }: { badge?: ReactNode; title: ReactNode; subtitle?: string }) {
  return (
    <Reveal className="flex flex-col items-center text-center gap-4 mb-14 max-w-2xl mx-auto">
      {badge && <motion.div variants={fadeUp}>{badge}</motion.div>}
      <motion.h2 variants={fadeUp} className="font-['Syne',sans-serif] font-bold text-[clamp(1.8rem,4vw,2.75rem)] leading-tight text-white">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="text-[rgba(255,255,255,0.5)] text-lg font-['DM_Sans',sans-serif]">
          {subtitle}
        </motion.p>
      )}
    </Reveal>
  );
}

function Badge({ children, color = "gold" }: { children: ReactNode; color?: "gold" | "cyan" }) {
  const cls = color === "gold"
    ? "bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.2)]"
    : "bg-[rgba(0,242,255,0.08)] text-[#00F2FF] border-[rgba(0,242,255,0.2)]";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const Index = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("criativos");

  useEffect(() => {
    captureAttribution();
    captureLastTouch();
    const dismissed = localStorage.getItem("imob_banner_dismissed");
    if (!dismissed) setBannerVisible(true);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    localStorage.setItem("imob_banner_dismissed", "1");
  }, []);

  const currentTab = productTabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen" style={{ background: "#010101" }}>
      {/* ── S0: Banner de urgência ─────────────────────────────────────── */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FFD700] text-[#002B5B] overflow-hidden relative z-[60]"
          >
            <div className="container mx-auto px-6 h-11 flex items-center justify-center gap-2 text-sm font-medium font-['DM_Sans',sans-serif]">
              <span className="hidden sm:inline">🚀 Lançamento especial — Primeiros 100 corretores com 30% OFF ·</span>
              <span className="sm:hidden">🚀 30% OFF para primeiros 100 ·</span>
              <Link to="/criativos#planos" className="font-bold underline underline-offset-2 hover:no-underline">
                Garantir desconto →
              </Link>
              <button
                type="button"
                onClick={dismissBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[rgba(0,43,91,0.1)] rounded transition-colors"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── S1: Header + Hero (existentes) ─────────────────────────────── */}
      <Header />
      <HeroSection />

      {/* ── S2: Checklist de confiança ─────────────────────────────────── */}
      <section className="bg-[#0A0A0A] py-8 px-6 border-y border-[rgba(255,255,255,0.04)]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              "Sem contrato de fidelidade",
              "Acesso imediato após pagamento",
              "Suporte via WhatsApp",
              "7 dias de garantia",
            ].map((text) => (
              <motion.div key={text} variants={fadeUp} className="flex items-center gap-2.5">
                <Check size={15} className="text-[#FFD700] shrink-0" />
                <span className="text-[rgba(255,255,255,0.6)] text-[13px] font-['DM_Sans',sans-serif]">{text}</span>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S3: Tabs de produtos ───────────────────────────────────────── */}
      <Section bg="bg-[#010101]">
        <SectionTitle
          badge={<Badge>Plataforma completa</Badge>}
          title={<>Tudo que você precisa em <span className="text-[#FFD700]">um só lugar</span></>}
        />

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
          {productTabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[rgba(255,215,0,0.1)] text-[#FFD700] border border-[rgba(255,215,0,0.25)]"
                  : "text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)] border border-transparent"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: info */}
            <div className="flex flex-col gap-5">
              <h3 className="font-['Syne',sans-serif] font-bold text-2xl md:text-3xl text-white leading-tight">
                {currentTab.title}
              </h3>
              <p className="text-[rgba(255,255,255,0.5)] text-base font-['DM_Sans',sans-serif]">
                {currentTab.subtitle}
              </p>
              <ul className="flex flex-col gap-3">
                {currentTab.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.6)]">
                    <Check size={15} className="text-[#FFD700] shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              {currentTab.href !== "#" ? (
                <Link
                  to={currentTab.href}
                  className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold text-sm px-6 py-3 rounded-full transition-colors w-fit mt-2"
                >
                  {currentTab.cta}
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.35)] font-semibold text-sm px-6 py-3 rounded-full w-fit mt-2 cursor-default">
                  {currentTab.cta}
                </span>
              )}
            </div>

            {/* Right: visual mockup */}
            <div className={`rounded-2xl bg-gradient-to-br ${currentTab.gradient} border border-[rgba(255,255,255,0.06)] p-8 min-h-[300px] flex flex-col items-center justify-center gap-4`}>
              <span className="text-6xl">{currentTab.emoji}</span>
              <span className="text-white/60 text-sm font-['DM_Sans',sans-serif] text-center">{currentTab.title}</span>
              {/* Decorative elements */}
              <div className="flex gap-3 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-20 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]" />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Section>

      {/* ── S4: Métricas sociais ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0A0A0A] border-y border-[rgba(255,255,255,0.04)]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { end: 500, suffix: "+", label: "corretores usando o ImobCreator" },
              { end: 1200, suffix: "+", label: "horas economizadas por mês" },
              { end: 3, suffix: "x", label: "mais alcance nos imóveis publicados" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <CountUp end={m.end} suffix={m.suffix} />
                <span className="text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: Feature cards detalhados ───────────────────────────────── */}
      <Section bg="bg-[#010101]">
        {/* Card Criativos */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-20">
          <motion.div variants={fadeUp} className="order-2 lg:order-1 rounded-2xl bg-gradient-to-br from-[rgba(255,215,0,0.08)] to-[rgba(0,43,91,0.1)] border border-[rgba(255,255,255,0.06)] p-8 min-h-[320px] flex flex-col items-center justify-center gap-4">
            <div className="grid grid-cols-3 gap-3">
              {["Dark Premium", "IA Express", "Black Gold", "Captação", "Clássico", "Top"].map((s) => (
                <div key={s} className="w-20 h-24 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  <span className="text-[10px] text-white/30 text-center leading-tight">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="order-1 lg:order-2 flex flex-col gap-5">
            <Badge>🎨 Módulo Criativos</Badge>
            <h3 className="font-['Syne',sans-serif] font-bold text-2xl md:text-3xl text-white leading-tight">
              Crie posts profissionais sem saber design
            </h3>
            <p className="text-[rgba(255,255,255,0.5)] text-base font-['DM_Sans',sans-serif]">
              Templates exclusivos para corretor imobiliário. IA ajusta cores, texto e estilo da sua marca automaticamente.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "50 a 150 artes por mês com IA",
                "Copy e headline gerados automaticamente",
                "Identidade visual aplicada em todos os posts",
                "Download ou publicação direta no Instagram",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.6)]">
                  <Check size={15} className="text-[#FFD700] shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/criativos" className="inline-flex items-center gap-2 text-[#FFD700] font-semibold text-sm hover:underline w-fit mt-1">
              Ver planos de Criativos <ArrowRight size={15} />
            </Link>
          </motion.div>
        </Reveal>

        {/* Card Vídeos */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <Badge>🎬 Módulo Vídeos</Badge>
            <h3 className="font-['Syne',sans-serif] font-bold text-2xl md:text-3xl text-white leading-tight">
              Transforme fotos em Reels cinematográficos
            </h3>
            <p className="text-[rgba(255,255,255,0.5)] text-base font-['DM_Sans',sans-serif]">
              Ken Burns automático, trilha sonora e texto overlay. Pronto para postar no Instagram em minutos.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "5 a 20 vídeos por mês com IA",
                "Ken Burns + crossfade cinematográfico",
                "Trilha sonora royalty-free inclusa",
                "Formato 9:16 otimizado para Reels",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[rgba(255,255,255,0.6)]">
                  <Check size={15} className="text-[#FFD700] shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/videos" className="inline-flex items-center gap-2 text-[#FFD700] font-semibold text-sm hover:underline w-fit mt-1">
              Ver planos de Vídeos <ArrowRight size={15} />
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-br from-[rgba(0,150,204,0.08)] to-[rgba(0,43,91,0.1)] border border-[rgba(255,255,255,0.06)] p-8 min-h-[320px] flex flex-col items-center justify-center gap-4">
            {/* Timeline mockup */}
            <div className="w-full max-w-[280px] flex flex-col gap-3">
              {[80, 100, 60].map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] shrink-0" />
                  <div className={`h-2 rounded-full bg-[rgba(255,255,255,0.06)] ${w === 100 ? "w-full" : w === 80 ? "w-4/5" : "w-3/5"}`} />
                </div>
              ))}
            </div>
            <span className="text-white/30 text-xs mt-2">Timeline de edição automática</span>
          </motion.div>
        </Reveal>
      </Section>

      {/* ── S6: Por que ImobCreator ────────────────────────────────────── */}
      <Section bg="bg-[#0A0A0A]">
        <SectionTitle
          badge={<Badge color="cyan">Diferenciais</Badge>}
          title={<>Por que escolher o <span className="text-[#FFD700]">ImobCreator?</span></>}
        />
        <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {([
            {
              icon: <Zap size={20} className="text-[#FFD700]" />,
              title: "IA Especializada em Imóveis",
              desc: "Não é uma IA genérica. Foi treinada especificamente para o mercado imobiliário brasileiro.",
            },
            {
              icon: <Target size={20} className="text-[#FFD700]" />,
              title: "Tudo em Um Só Lugar",
              desc: "Criativos, vídeos, site, CRM e WhatsApp integrados. Sem precisar de 5 ferramentas diferentes.",
            },
            {
              icon: <Smartphone size={20} className="text-[#FFD700]" />,
              title: "WhatsApp → Post Automático",
              desc: "Parceiro envia foto pelo WhatsApp, a IA cria o post e publica no Instagram. Zero trabalho manual.",
            },
            {
              icon: <Trophy size={20} className="text-[#FFD700]" />,
              title: "Feito para o Corretor Brasileiro",
              desc: "Interface em português, suporte via WhatsApp e preços acessíveis para o mercado nacional.",
            },
          ] as const).map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,215,0,0.1)] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-white font-semibold text-base">{item.title}</h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{item.desc}</p>
            </motion.div>
          ))}
        </Reveal>
      </Section>

      {/* ── S7: Depoimentos ────────────────────────────────────────────── */}
      <Section bg="bg-[#010101]">
        <SectionTitle
          badge={<Badge>Quem já usa</Badge>}
          title={<>Corretores que já usam o <span className="text-[#FFD700]">ImobCreator</span></>}
        />
        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            {
              initials: "AC", color: "bg-[rgba(255,215,0,0.15)] text-[#FFD700]",
              quote: "Em 30 segundos tenho um post profissional do imóvel. Antes eu passava horas no Canva.",
              name: "Ana C.", city: "Salvador, BA",
            },
            {
              initials: "CM", color: "bg-[rgba(0,150,204,0.15)] text-[#60C8FF]",
              quote: "Os Reels gerados automaticamente dobraram meu alcance no Instagram em duas semanas.",
              name: "Carlos M.", city: "São Paulo, SP",
            },
            {
              initials: "FR", color: "bg-[rgba(110,231,183,0.15)] text-[#6EE7B7]",
              quote: "Minha imobiliária tem identidade visual consistente em todos os posts. Sem depender de designer.",
              name: "Fernanda R.", city: "Fortaleza, CE",
            },
          ].map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 flex flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-[rgba(255,255,255,0.4)] text-xs">{t.city}</div>
                </div>
              </div>
              <p className="text-[rgba(255,255,255,0.6)] text-sm font-['DM_Sans',sans-serif] italic leading-relaxed">
                "{t.quote}"
              </p>
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </Reveal>
      </Section>

      {/* ── S8: CTA Final ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[rgba(255,215,0,0.06)] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="font-['Syne',sans-serif] font-bold text-3xl md:text-4xl text-white leading-tight">
              Pronto para automatizar seu<br />marketing imobiliário?
            </h2>
            <p className="text-[rgba(255,255,255,0.6)] text-lg font-['DM_Sans',sans-serif] max-w-xl">
              Junte-se a centenas de corretores que já economizam horas por semana com o ImobCreator AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link
                to="/criativos"
                className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold text-sm px-6 py-3.5 rounded-full transition-colors"
              >
                Começar com Criativos
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/videos"
                className="inline-flex items-center gap-2 bg-transparent hover:bg-[rgba(255,255,255,0.06)] text-white font-semibold text-sm px-6 py-3.5 rounded-full border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] transition-colors"
              >
                Começar com Vídeos
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── S9: FAQ ────────────────────────────────────────────────────── */}
      <Section bg="bg-[#0A0A0A]">
        <SectionTitle
          badge={<Badge color="cyan">FAQ</Badge>}
          title="Respondendo suas dúvidas"
        />
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {[
            { q: "Preciso saber design ou editar vídeos?", a: "Não. A IA faz tudo automaticamente — desde a composição visual até a copy persuasiva. Você só envia a foto do imóvel." },
            { q: "Funciona para qual segmento imobiliário?", a: "Todos — residencial, comercial, litoral, rural, lançamentos e terrenos. A IA adapta o estilo ao tipo de imóvel." },
            { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade ou multa. Cancele a qualquer momento pelo painel ou por e-mail." },
            { q: "Os criativos têm marca d'água?", a: "Não. Todos os criativos e vídeos gerados são 100% seus, sem marca d'água ou watermark." },
            { q: "Como funciona a garantia de 7 dias?", a: "Se não gostar do produto nos primeiros 7 dias, devolvemos 100% do valor. Sem perguntas, sem burocracia." },
          ].map((f) => (
            <Accordion key={f.q} question={f.q} answer={f.a} />
          ))}
        </div>
      </Section>

      {/* ── Footer existente ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default Index;
