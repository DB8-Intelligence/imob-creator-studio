import { useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Minus, Zap, Target, Link2, Award, ChevronRight } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { funnel } from "@/lib/funnel";
import { useABVariant } from "@/hooks/useABVariant";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ThemeGallerySection from "@/components/site/ThemeGallerySection";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PopupLeadCapture } from "@/components/ui/PopupLeadCapture";
import { tabsA, tabsB, modulesA, modulesB } from "@/data/landingData";

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
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors hover:bg-[#F8FAFF] px-2 rounded-lg">
        <span className="text-[#0A1628] font-bold text-[15px]">{q}</span>
        <span className="shrink-0 text-[#6B7280]">{open ? <Minus size={16} /> : <Plus size={16} />}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="pb-5 px-2 text-[#6B7280] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

// ─── Componentes Específicos Kenlo-Style ─────────────────────────────────────

const PillMenu = () => {
  return (
    <div className="sticky top-[80px] z-40 flex justify-center py-4 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-md border border-[#E5E7EB] shadow-sm rounded-full px-6 py-2 flex items-center gap-6 pointer-events-auto transition-shadow hover:shadow-md">
        <a href="#solucoes" className="text-sm font-semibold text-[#002B5B] hover:text-[#FFD700] transition-colors">Produtos</a>
        <a href="#diferenciais" className="text-sm font-semibold text-[#0A1628] hover:text-[#FFD700] transition-colors">Diferenciais</a>
        <a href="#testimonials" className="text-sm font-semibold text-[#0A1628] hover:text-[#FFD700] transition-colors">Resultados</a>
        <a href="#pricing" className="text-sm font-semibold text-[#0A1628] hover:text-[#FFD700] transition-colors">Planos</a>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Se o user já está logado (ex: voltou do callback Google), manda pro dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const [activeTab, setActiveTab] = useState("criativos");
  const variant = useABVariant();
  const isB = variant === "b";
  const modules = isB ? modulesB : modulesA;
  const tabs = isB ? tabsB : tabsA;
  const tab = tabs.find((t) => t.id === activeTab)!;

  const solucoesRef = useSectionTracker("solucoes", variant);
  const featuresRef = useSectionTracker("features", variant);
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

  return (
    <div className="min-h-screen bg-white font-sans text-[#0A1628]">
      <AnnouncementBanner />
      <Header />
      <HeroSection />
      
      {/* Menu Pílula Flutuante (Kenlo Style) */}
      <PillMenu />

      {/* ── Trust Strip ──────────────────────────────────────────────── */}
      <section className="bg-[#EEF2FF] border-y border-[#D6E0F9] py-8 px-6 overflow-hidden">
        <div className="container mx-auto max-w-5xl text-center mb-5">
          <h2 className="text-[#002B5B] text-xl font-bold">Autoridade e Presença onde importa</h2>
          <p className="text-[#3B5BDB] text-sm mt-1">Conectado com o ecossistema imobiliário</p>
        </div>
        <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
          <div className="flex gap-16 animate-[scroll_20s_linear_infinite] whitespace-nowrap justify-center mt-4">
            {[...Array(2)].flatMap(() => ["ZAP Imóveis", "OLX", "VivaReal", "ImovelWeb", "Meta Ads", "WhatsApp API"]).map((n, i) => (
              <span key={i} className="text-[#002B5B]/60 font-bold text-lg tracking-widest">{n}</span>
            ))}
          </div>
        </div>
        <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </section>

      {/* ── Soluções / Features Vertical Interativas (Kenlo Style) ────── */}
      <section id="solucoes" ref={featuresRef} className="py-24 px-6 bg-white scroll-mt-24">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-16 flex flex-col items-center gap-3">
             <span className="inline-block py-1 px-3 rounded-full bg-[#FFF7E0] text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-2">Ecossistema Completo</span>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,4vw,3rem)] font-extrabold text-[#002B5B] max-w-3xl leading-tight">
              A resposta para os desafios de quem vende imóveis todos os dias.
            </motion.h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Esquerda: Lista de Módulos (Menu Vertical) */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`
                    w-full text-left p-5 rounded-xl border-l-[4px] transition-all duration-300
                    ${activeTab === t.id 
                      ? "border-[#FFD700] bg-[#F8FAFF] shadow-sm transform translate-x-2" 
                      : "border-transparent bg-white hover:bg-[#F3F4F6] text-[#6B7280]"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${activeTab === t.id ? t.accent : 'bg-transparent filter grayscale'}`}>
                      {t.emoji}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${activeTab === t.id ? "text-[#002B5B]" : "text-[#6B7280]"}`}>
                        {t.label}
                      </h3>
                      {activeTab === t.id && (
                        <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-sm text-[#4B5563] mt-2 pr-4 leading-relaxed">
                          {t.title}
                        </motion.p>
                      )}
                    </div>
                    {activeTab === t.id && <ChevronRight className="ml-auto text-[#002B5B]" size={20} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Direita: Window Mockup Showcasing Feature */}
            <div className="lg:col-span-7 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden h-full flex flex-col"
                >
                  {/* Mac OS Window Header */}
                  <div className="bg-[#F8FAFF] px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span className="text-xs font-semibold text-[#9CA3AF] ml-4 flex-1 text-center pr-8">NexoImob Platform</span>
                  </div>
                  
                  {/* Window Body (Mockup content) */}
                  <div className={`flex-1 p-8 ${tab.accent} relative overflow-hidden min-h-[400px]`}>
                     {tab.mockup}
                  </div>

                  {/* Feature Checklist Bottom */}
                  <div className="bg-white p-6 border-t border-[#E5E7EB]">
                    <div className="flex flex-wrap gap-4 mb-6">
                       {tab.benefits.map((b) => (
                        <div key={b} className="flex items-center gap-2 w-full sm:w-[calc(50%-8px)]">
                          <div className="w-5 h-5 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                             <Check size={12} className="text-[#059669]" />
                          </div>
                          <span className="text-sm font-medium text-[#374151]">{b}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={tab.href} className="w-full flex items-center justify-center gap-2 bg-[#002B5B] hover:bg-[#001d3d] text-white font-bold text-sm px-6 py-3.5 rounded-lg transition-transform hover:-translate-y-0.5">
                      {tab.cta} <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>


      {/* ── S6b: Galeria de Temas de Site ─────────────────────────────── */}
      <ThemeGallerySection />

      {/* ── Diferenciais (Cards com Ícones Estilo Kenlo) ────────────── */}
      <section ref={differentialsRef} id="diferenciais" className="py-24 px-6 bg-[#F8FAFF]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-[#EEF2FF] text-[#3B5BDB] text-xs font-bold uppercase tracking-wider mb-2">Por que nós?</span>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,3.5vw,2.75rem)] font-extrabold text-[#002B5B] leading-tight">
              Feito por quem entende de <span className="text-[#FFD700]">Mercado Imobiliário</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Zap size={24} />, title: "Automação Inteligente", desc: "IA treinada no linguajar e nas dores do mercado imobiliário brasileiro. Zero configurações complexas." },
              { icon: <Target size={24} />, title: "Foco em Conversão", desc: "Todas as interfaces e copies são desenhadas com um único objetivo: transformar visitantes em leads." },
              { icon: <Link2 size={24} />, title: "Ecossistema Integrado", desc: "Do WhatsApp ao CRM, passando pelo Instagram e portais. Tudo conversa entre si." },
              { icon: <Award size={24} />, title: "Suporte Especializado", desc: "Não fale com robôs genéricos. Nosso time entende o dia a dia da roleta e do plantão." },
            ].map((d) => (
              <motion.div key={d.title} variants={fadeUp} className="bg-white rounded-2xl border border-[#E5E7EB] p-8 flex flex-col gap-4 hover:border-[#FFD700] hover:shadow-[0_8px_30px_rgba(0,43,91,0.06)] transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#002B5B] to-[#1E4D8C] flex items-center justify-center text-[#FFD700] shadow-lg">{d.icon}</div>
                <h3 className="text-xl font-bold text-[#0A1628]">{d.title}</h3>
                <p className="text-[15px] text-[#6B7280] leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Depoimentos (Prova Social) ───────────────────────────────── */}
      <section ref={testimonialsRef} id="testimonials" className="py-24 px-6 bg-white border-t border-[#F0F0F0]">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-[#FFF7E0] text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-2">Quem usa, vende mais</span>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,3.5vw,2.75rem)] font-extrabold text-[#002B5B]">
              Histórias reais de <span className="text-[#FFD700]">sucesso</span>
            </motion.h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(isB ? [
              { initials: "BA", bg: "bg-[#002B5B] text-white", quote: "Substituí meu designer freelancer e o Canva de uma vez. Agora a IA gera no padrão da minha marca e os leads no WhatsApp explodiram.", name: "Bruno A.", city: "São Paulo, SP", role: "Corretor Alto Padrão", metric: "40% mais cliques" },
              { initials: "CT", bg: "bg-[#FFD700] text-[#002B5B]", quote: "O CRM integrado com os portais e o site próprio me deram uma visão de dono que eu nunca tive. Fechei 4 vendas a mais no semestre.", name: "Camila T.", city: "Balneário Camboriú, SC", role: "Especialista Praia", metric: "4 vendas a mais no semestre" },
              { initials: "LM", bg: "bg-[#EEF2FF] text-[#002B5B]", quote: "O atendimento de Leads 24/7 salvou minha saúde mental. A IA atende, qualifica e já me larga o lead quentinho com a agenda feita.", name: "Lucas M.", city: "Belo Horizonte, MG", role: "Imobiliária Regional", metric: "Agendamentos automáticos" },
            ] : [
              { initials: "AL", bg: "bg-[#002B5B] text-white", quote: "Em 30 segundos tenho um post profissional. Antes passava horas no Canva tentando fazer algo decente.", name: "André L.", city: "Salvador, BA", role: undefined as string | undefined, metric: undefined as string | undefined },
              { initials: "MG", bg: "bg-[#FFD700] text-[#002B5B]", quote: "Os Reels automáticos dobraram meu alcance no Instagram. Meus clientes ficaram impressionados.", name: "Manoel G.", city: "Sorocaba, SP", role: undefined, metric: undefined },
              { initials: "RF", bg: "bg-[#EEF2FF] text-[#002B5B]", quote: "Minha imobiliária tem identidade visual consistente em todos os posts. Sem depender de designer.", name: "Rosangela F.", city: "São Caetano do Sul, SP", role: undefined, metric: undefined },
            ]).map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-[#F8FAFF] rounded-2xl p-8 flex flex-col gap-6 relative">
                 {/* Aspas decorativas absolutas */}
                 <div className="absolute top-6 right-6 text-[#D6E0F9] opacity-50 font-serif text-6xl leading-none">"</div>
                <div className="flex gap-1 relative z-10">{[...Array(5)].map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                <p className="text-[#374151] text-base leading-relaxed relative z-10 font-medium">"{t.quote}"</p>
                {t.metric && <p className="text-[#002B5B] text-sm font-bold bg-white px-3 py-1.5 rounded-md inline-block w-fit box-border border border-[#EEF2FF]">{t.metric}</p>}
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[#E5E7EB]">
                  <div className={`w-12 h-12 rounded-full ${t.bg} flex items-center justify-center text-lg font-bold shadow-sm`}>{t.initials}</div>
                  <div>
                    <div className="text-[#0A1628] text-base font-bold">{t.name}</div>
                    <div className="text-[#6B7280] text-xs font-semibold">{t.role ? `${t.role} · ${t.city}` : t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Produtos (preços reais, link pras LPs) ─────────────────────── */}
      <section ref={pricingRef} id="pricing" className="py-24 px-6 bg-[#002B5B] text-white">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="text-center mb-16 flex flex-col items-center gap-3">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FFD700]/30">Nossos produtos</span>
            <motion.h2 variants={fadeUp} className="text-[clamp(2rem,3.5vw,2.75rem)] font-extrabold leading-tight">
              Contrate só o que precisa. <span className="text-[#FFD700]">Combine como quiser.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-base max-w-2xl mt-2">
              Cada produto é independente. Tudo integrado no mesmo dashboard. Sem fidelidade.
            </motion.p>
          </Reveal>

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              { id: "site",       icon: "🏠", name: "Site Imobiliário",        tagline: "Site + CRM + Portais",          from: "R$ 147", unit: "/mês",     href: "/site-imobiliario",   featured: true },
              { id: "secretaria", icon: "🤖", name: "Secretária Virtual 24h",  tagline: "IA atende com sua voz",         from: "R$ 51,40", unit: "/mês · 12x", href: "/secretaria-virtual", featured: false },
              { id: "criativos",  icon: "🎨", name: "Criativos com IA",         tagline: "Posts, stories e reels",        from: "R$ 97",   unit: "/mês",     href: "/criativos",          featured: false },
              { id: "videos",     icon: "🎬", name: "Vídeos com IA",            tagline: "Reels das suas fotos",          from: "R$ 97",   unit: "/mês",     href: "/videos",             featured: false },
              { id: "social",     icon: "📣", name: "Social Autopilot",         tagline: "Publica IG + FB no automático", from: "R$ 29,90", unit: "/perfil",  href: "/publicacao-social",  featured: false },
            ].map((p) => (
              <motion.div
                key={p.id}
                variants={fadeUp}
                className={`relative rounded-2xl p-6 flex flex-col h-full transition-all ${
                  p.featured
                    ? "bg-white text-[#0A1628] shadow-2xl lg:-translate-y-2 ring-2 ring-[#FFD700]"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#002B5B] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Mais popular
                  </span>
                )}
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className={`text-lg font-bold ${p.featured ? "text-[#002B5B]" : "text-white"}`}>{p.name}</h3>
                <p className={`text-sm mt-0.5 ${p.featured ? "text-[#6B7280]" : "text-white/60"}`}>{p.tagline}</p>

                <div className="mt-5 mb-5">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${p.featured ? "text-[#9CA3AF]" : "text-white/50"}`}>A partir de</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-extrabold ${p.featured ? "text-[#002B5B]" : "text-white"}`}>{p.from}</span>
                    <span className={`text-xs ${p.featured ? "text-[#6B7280]" : "text-white/60"}`}>{p.unit}</span>
                  </div>
                </div>

                <Link
                  to={p.href}
                  onClick={() => funnel.clickCTA(`product_card_${p.id}`, { variant })}
                  className={`w-full text-center text-sm font-bold py-2.5 rounded-lg mt-auto transition-all ${
                    p.featured
                      ? "bg-[#002B5B] hover:bg-[#001d3d] text-white"
                      : "bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B]"
                  }`}
                >
                  Ver planos →
                </Link>
              </motion.div>
            ))}
          </Reveal>

          <Reveal className="text-center mt-12">
            <motion.div variants={fadeUp}>
              <Link to="/precos" className="inline-flex items-center gap-2 text-white/80 hover:text-[#FFD700] text-sm font-semibold transition-colors">
                Ver comparativo completo <ArrowRight size={14} />
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>


      {/* ── CTA Final de Peso ────────────────────────────────────────── */}
      <section ref={ctaFinalRef} className="py-24 px-6 bg-white relative overflow-hidden" data-ab-test="cta-final" data-variant={variant}>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale:0.95 }} whileInView={{ opacity: 1, scale:1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-6 bg-[#F8FAFF] rounded-[2rem] p-12 border-2 border-[#EEF2FF] shadow-[0_20px_60px_-15px_rgba(0,43,91,0.08)]">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#002B5B] leading-tight">
               Pronto para digitalizar seus negócios<br/>em nível <span className="text-[#FFD700] underline decoration-4 underline-offset-4">Premium</span>?
            </h2>
            <p className="text-[#6B7280] text-lg max-w-2xl mt-2 mb-4">
              Junte-se à nova era de corretores que geram valor através da inteligência artificial e foque apenas em fechar negócio.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link to="/criativos" onClick={() => funnel.clickCTA("cta_final_primary", { variant })} className="inline-flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#002B5B] font-bold text-base px-8 py-4 rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(255,215,0,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(255,215,0,0.8)] hover:-translate-y-1 w-full sm:w-auto">
                {isB ? "Testar a Plataforma Gratuitamente" : "Acessar Sistema Agora"} <ArrowRight size={18} />
              </Link>
              <button type="button" className="inline-flex items-center justify-center gap-2 bg-white text-[#002B5B] font-bold text-base px-8 py-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#002B5B] transition-all w-full sm:w-auto">
                Ver demonstração <Zap size={18} className="text-[#FFD700]"/>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section ref={faqRef} className="py-24 px-6 bg-white border-t border-[#F0F0F0]">
        <div className="container mx-auto max-w-3xl">
          <Reveal className="text-center mb-16"><motion.h2 variants={fadeUp} className="text-[clamp(2rem,3.5vw,2.75rem)] font-extrabold text-[#0A1628]">Dúvidas Frequentes</motion.h2></Reveal>
          {(isB ? [
            { q: "Preciso de cartão de crédito para começar?", a: "Não. Teste grátis com 50 créditos. Pague só se achar que vale a pena." },
            { q: "Demora muito para criar os materiais?", a: "Criativos profissionais saem em 3 a 5 segundos. Vídeos em menos de 1 minuto." },
            { q: "Posso usar as imagens nos portais Imobiliários e redes sociais?", a: "Sim, 100%. Você detém todos os direitos das mídias. As integrações exportam diretamente para Zap, VivaReal e afins." },
          ] : [
            { q: "Como funciona a automação da NexoImob AI?", a: "Nós parametrizamos seus imóveis no CRM. A Inteligência artificial interpreta a linguagem e gera copies, imagens e vídeos prontos pro feed com base no seu portfólio." },
            { q: "Terei um site exclusivo?", a: "Sim, atrelado ao seu domínio (ex: seunomeimoveis.com.br). O site é seu 24/7 sem necessidade de hospedagem." },
            { q: "Tem onboarding para minha equipe?", a: "Oferecemos calls especializadas nos planos Business e Enterprise para garantir rápida adoção pela equipe comercial." },
          ]).map((f) => <Accordion key={f.q} {...f} />)}
        </div>
      </section>

      <Footer />
      {/* Botões Flutuantes Mantidos para Leads e WhatsApp */}
      <WhatsAppButton />
      <PopupLeadCapture />
    </div>
  );
};

export default Index;
