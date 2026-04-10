import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, Zap, Target, Smartphone, Trophy, Plus, Minus } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

// ─── CountUp ─────────────────────────────────────────────────────────────────

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const steps = 50;
    const inc = end / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 30);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

// ─── Accordion ───────────────────────────────────────────────────────────────

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="text-[#0A1628] font-semibold text-[15px] leading-snug">{q}</span>
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
    title: "50 artes/mês geradas por IA",
    sub: "Posts para Instagram, Facebook e WhatsApp. Sua marca aplicada automaticamente.",
    benefits: ["6 estilos profissionais exclusivos", "Copy e headline gerados pela IA", "Identidade visual aplicada automaticamente", "Download ou publicação direta"],
    cta: "Ver planos de Criativos", href: "/criativos", accent: "bg-[#EEF2FF]",
  },
  {
    id: "videos", emoji: "🎬", label: "Vídeos",
    title: "Reels profissionais em minutos",
    sub: "Envie fotos do imóvel e receba um vídeo cinematográfico com Ken Burns, trilha e texto overlay.",
    benefits: ["Ken Burns automático com crossfade", "6 moods de trilha royalty-free", "Texto overlay com dados do imóvel", "Formato 9:16 para Reels"],
    cta: "Ver planos de Vídeos", href: "/videos", accent: "bg-[#FFF7E0]",
  },
  {
    id: "site", emoji: "🏠", label: "Site+Portais",
    title: "Site imobiliário com SEO automático",
    sub: "Seu portfólio online com domínio próprio, integrado com portais de imóveis.",
    benefits: ["Template responsivo otimizado", "SEO automático por imóvel", "Integração ZAP, OLX, VivaReal", "Formulário com WhatsApp"],
    cta: "Saber mais", href: "/site-imobiliario", accent: "bg-[#ECFDF5]",
  },
  {
    id: "crm", emoji: "🤝", label: "CRM",
    title: "Organize leads e feche mais negócios",
    sub: "Pipeline visual com histórico completo de cada lead, do contato ao fechamento.",
    benefits: ["Pipeline Kanban de vendas", "Histórico de interações", "Automação de follow-up", "Relatórios de conversão"],
    cta: "Saber mais", href: "/crm-imobiliario", accent: "bg-[#FEF2F2]",
  },
  {
    id: "whatsapp", emoji: "📱", label: "WhatsApp",
    title: "Foto no WA → post no Instagram",
    sub: "O parceiro envia fotos pelo WhatsApp, a IA cria o criativo e publica. Zero trabalho manual.",
    benefits: ["Recepção automática via WA", "IA analisa e gera criativos", "Publicação automática no IG", "Notificação ao corretor"],
    cta: "Saber mais", href: "/whatsapp-imobiliario", accent: "bg-[#F0FFF4]",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const Index = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("criativos");

  useEffect(() => {
    captureAttribution();
    captureLastTouch();
    if (!localStorage.getItem("banner_closed")) setBannerVisible(true);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    localStorage.setItem("banner_closed", "1");
  }, []);

  const tab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white">
      {/* ── S0: Announcement Banner ──────────────────────────────────── */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-[#002B5B] text-white overflow-hidden relative z-[60]">
            <div className="container mx-auto px-6 h-11 flex items-center justify-center gap-2 text-sm font-medium">
              <span className="hidden sm:inline">🚀 Lançamento especial — Primeiros 100 corretores com 30% OFF ·</span>
              <span className="sm:hidden">🚀 30% OFF primeiros 100 ·</span>
              <Link to="/criativos#planos" className="font-bold text-[#FFD700] underline underline-offset-2 hover:no-underline">Garantir desconto →</Link>
              <button type="button" onClick={dismissBanner} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors" aria-label="Fechar"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* ── S2: Hero ─────────────────────────────────────────────────── */}
      <section className="pt-28 md:pt-36 pb-20 bg-gradient-to-b from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Reveal className="flex flex-col items-center gap-6">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D7F5] text-[#3B5BDB]">
                ✦ Plataforma de IA para o mercado imobiliário
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-[#0A1628] leading-[1.1] tracking-tight">
              Marketing imobiliário{"\n"}automatizado com IA
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base md:text-lg max-w-lg">
              Crie posts, vídeos e publique no Instagram automaticamente. Sem designer, sem Canva, sem perder tempo.
            </motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:flex md:flex-row gap-x-6 gap-y-2 mt-2">
              {["Sem contrato de fidelidade", "Acesso imediato", "Suporte via WhatsApp", "7 dias de garantia"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#002B5B] flex items-center justify-center shrink-0"><Check size={11} className="text-white" /></span>
                  <span className="text-[#374151] text-[13px]">{t}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-6 py-3 rounded-[10px] transition-colors">
                Começar com Criativos <ArrowRight size={15} />
              </Link>
              <Link to="/videos" className="inline-flex items-center gap-2 bg-white hover:bg-[#F8FAFF] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px] border-[1.5px] border-[#CBD5E1] transition-colors">
                Começar com Vídeos <ArrowRight size={15} />
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── S3: Stats strip ──────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] border-y border-[#F0F0F0] py-6 px-6">
        <div className="container mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-y-4 divide-x divide-[#E5E7EB]">
          {[
            { end: 500, suffix: "+", label: "corretores ativos" },
            { end: 30, suffix: "s", label: "por criativo" },
            { end: 3, suffix: "×", label: "mais alcance" },
            { end: 100, suffix: "%", label: "automático" },
          ].map((m, i) => (
            <div key={m.label} className={`flex flex-col items-center gap-0.5 px-6 ${i === 0 ? "md:pl-0" : ""}`}>
              <span className="text-[28px] font-extrabold text-[#002B5B] leading-none"><CountUp end={m.end} suffix={m.suffix} /></span>
              <span className="text-[#6B7280] text-xs">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── S4: Product tabs ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628] leading-tight">
              Tudo que você precisa em <span className="text-[#002B5B]">um só lugar</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] text-base">Automatize seu marketing imobiliário do início ao fim</motion.p>
          </Reveal>

          <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {tabs.map((t) => (
              <button type="button" key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.id ? "border-[#002B5B] text-[#002B5B] font-semibold" : "border-transparent text-[#6B7280] hover:text-[#374151]"
                }`}
              >{t.emoji} {t.label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-2xl border border-[#E5E7EB] p-8"
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-[#0A1628]">{tab.title}</h3>
                <p className="text-[#6B7280] text-[15px]">{tab.sub}</p>
                <ul className="flex flex-col gap-2.5 mt-1">
                  {tab.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <Check size={15} className="text-[#002B5B] shrink-0 mt-0.5" />{b}
                    </li>
                  ))}
                </ul>
                <Link to={tab.href} className="inline-flex items-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold text-sm px-5 py-2.5 rounded-[10px] transition-colors w-fit mt-2">
                  {tab.cta} <ArrowRight size={15} />
                </Link>
              </div>
              <div className={`rounded-xl ${tab.accent} border border-[#E5E7EB] p-8 min-h-[260px] flex flex-col items-center justify-center gap-3`}>
                <span className="text-5xl">{tab.emoji}</span>
                <span className="text-[#6B7280] text-sm text-center">{tab.title}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── S5: Feature cards ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              emoji: "🎨", accent: "bg-[#EEF2FF]", badge: "Disponível", title: "Crie posts sem saber design",
              desc: "Templates exclusivos para corretor imobiliário. IA ajusta cores, texto e estilo da sua marca.",
              bullets: ["50 a 150 artes por mês", "Copy automática pela IA", "6 formatos profissionais", "Download ou publica direto"],
              href: "/criativos", cta: "Ver planos →",
            },
            {
              emoji: "🎬", accent: "bg-[#FFF7E0]", badge: "Disponível", title: "Reels profissionais em minutos",
              desc: "Ken Burns automático, trilha sonora e texto overlay. Pronto para o Instagram.",
              bullets: ["5 a 20 vídeos por mês", "Ken Burns + crossfade", "6 trilhas royalty-free", "Formato 9:16 para Reels"],
              href: "/videos", cta: "Ver planos →",
            },
          ].map((c) => (
            <Reveal key={c.title}>
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-8 flex flex-col gap-5 hover:border-[#002B5B] hover:shadow-[0_4px_20px_rgba(0,43,91,0.08)] transition-all">
                <div className="flex items-center gap-3">
                  <span className={`w-12 h-12 rounded-xl ${c.accent} flex items-center justify-center text-2xl`}>{c.emoji}</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#ECFDF5] text-[#059669]">{c.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0A1628]">{c.title}</h3>
                <p className="text-[#6B7280] text-sm">{c.desc}</p>
                <ul className="flex flex-col gap-2">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[#374151]"><Check size={14} className="text-[#002B5B] shrink-0 mt-0.5" />{b}</li>
                  ))}
                </ul>
                <Link to={c.href} className="inline-flex items-center gap-1.5 text-[#002B5B] font-semibold text-sm hover:underline w-fit">{c.cta}</Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── S6: Diferenciais ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Por que escolher o <span className="text-[#002B5B]">ImobCreator AI?</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { icon: <Zap size={20} />, title: "IA especializada em imóveis", desc: "Não é IA genérica. Criada para o mercado imobiliário brasileiro." },
              { icon: <Target size={20} />, title: "Tudo em um só lugar", desc: "Criativos, vídeos, site, CRM e WhatsApp integrados." },
              { icon: <Smartphone size={20} />, title: "WhatsApp → Post automático", desc: "Parceiro manda foto, a IA publica no Instagram. Zero esforço." },
              { icon: <Trophy size={20} />, title: "Feito para o corretor brasileiro", desc: "Português, suporte WhatsApp e preços acessíveis." },
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

      {/* ── S7: Depoimentos ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-12 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">
              Corretores que já usam o <span className="text-[#002B5B]">ImobCreator</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { initials: "AC", bg: "bg-[#EEF2FF] text-[#3B5BDB]", quote: "Em 30 segundos tenho um post profissional. Antes passava horas no Canva.", name: "Ana C.", city: "Salvador, BA" },
              { initials: "CM", bg: "bg-[#FFF7E0] text-[#B8860B]", quote: "Os Reels automáticos dobraram meu alcance no Instagram em duas semanas.", name: "Carlos M.", city: "São Paulo, SP" },
              { initials: "FR", bg: "bg-[#ECFDF5] text-[#059669]", quote: "Minha imobiliária tem identidade visual consistente em todos os posts.", name: "Fernanda R.", city: "Fortaleza, CE" },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white rounded-2xl border-[1.5px] border-[#E5E7EB] p-7 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-sm font-bold`}>{t.initials}</div>
                  <div>
                    <div className="text-[#0A1628] text-sm font-semibold">{t.name}</div>
                    <div className="text-[#6B7280] text-xs">{t.city}</div>
                  </div>
                </div>
                <p className="text-[#374151] text-sm italic leading-relaxed">"{t.quote}"</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── S8: CTA Final ────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Pronto para automatizar seu marketing imobiliário?</h2>
            <p className="text-white/70 text-base max-w-lg">Junte-se a centenas de corretores que já economizam horas por semana com o ImobCreator AI.</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link to="/criativos" className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-sm px-6 py-3 rounded-[10px] transition-colors">
                Começar com Criativos <ArrowRight size={15} />
              </Link>
              <Link to="/videos" className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white font-bold text-sm px-6 py-3 rounded-[10px] border-[1.5px] border-white/30 hover:border-white/60 transition-colors">
                Começar com Vídeos <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── S9: FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-2xl">
          <Reveal className="text-center mb-10 flex flex-col items-center gap-3">
            <motion.h2 variants={fadeUp} className="text-[clamp(1.6rem,3.5vw,2.25rem)] font-extrabold text-[#0A1628]">Respondendo suas dúvidas</motion.h2>
          </Reveal>
          <div className="flex flex-col">
            {[
              { q: "Preciso saber design ou editar vídeos?", a: "Não. A IA faz tudo automaticamente — desde a composição visual até a copy persuasiva. Você só envia a foto." },
              { q: "Funciona para qual segmento imobiliário?", a: "Todos — residencial, comercial, litoral, rural, lançamentos e terrenos." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade ou multa. Cancele a qualquer momento." },
              { q: "Os criativos têm marca d'água?", a: "Não. Todos os criativos e vídeos são 100% seus." },
              { q: "Como funciona a garantia de 7 dias?", a: "Se não gostar nos primeiros 7 dias, devolvemos 100% do valor. Sem burocracia." },
            ].map((f) => <Accordion key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
