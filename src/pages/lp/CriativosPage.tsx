/**
 * /criativos — Landing page pública: ImobCreator Criativos
 * Checkout via Kiwify. Sem auth gate.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Image } from "lucide-react";
import { PricingCard } from "@/components/public/PricingCard";
import { FAQItem } from "@/components/public/FAQItem";
import { SectionHeader } from "@/components/public/SectionHeader";
import { ProofBadge } from "@/components/public/ProofBadge";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Kiwify checkout links ──────────────────────────────────────────────────
const CHECKOUT = {
  starter: "https://pay.kiwify.com.br/UjBaKio",
  basico:  "https://pay.kiwify.com.br/gCd9MsZ",
  pro:     "https://pay.kiwify.com.br/2ofOTll",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  { num: "01", emoji: "📸", title: "Envie a foto do imóvel", desc: "Arraste ou cole a URL. Qualquer formato, direto do celular." },
  { num: "02", emoji: "🤖", title: "IA cria o criativo", desc: "Escolhe template, estilo e cores da sua marca automaticamente." },
  { num: "03", emoji: "⬇️", title: "Baixe ou publique", desc: "Download, WhatsApp ou direto no Instagram. Pronto em segundos." },
];

const creativeStyles = [
  "Dark Premium",
  "IA Express",
  "Imobiliário Top",
  "Clássico Elegante",
  "Black Gold Tower",
  "Captação Express",
];

const audiences = [
  { emoji: "👤", title: "Corretor solo", desc: "Não depende mais de designer." },
  { emoji: "🏢", title: "Imobiliária", desc: "Padroniza a identidade visual do time." },
  { emoji: "📱", title: "Social Media", desc: "Entrega conteúdo imobiliário em escala." },
];

const plans = [
  {
    name: "Starter", price: "R$97", features: [
      "50 criativos/mês", "Formatos Feed + Story", "Download direto", "Programa de afiliados",
    ], url: CHECKOUT.starter,
  },
  {
    name: "Básico", price: "R$197", highlighted: true, badge: "Mais popular", features: [
      "100 criativos/mês", "Feed + Story + Reel", "Publicação IG + FB", "Programa de afiliados",
    ], url: CHECKOUT.basico,
  },
  {
    name: "PRO", price: "R$397", features: [
      "150 criativos/mês", "Todos os formatos", "Publicação IG + FB", "Programa de afiliados",
    ], url: CHECKOUT.pro,
  },
];

const faqs = [
  { q: "Preciso saber editar?", a: "Não, tudo é automático. Envie a foto e a IA faz todo o trabalho de design, copy e composição." },
  { q: "Funciona para qual tipo de imóvel?", a: "Todos — apartamentos, casas, terrenos, salas comerciais, galpões. A IA adapta o estilo automaticamente." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele a qualquer momento pelo painel ou por e-mail." },
  { q: "Tem período de teste?", a: "Sim, 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do valor." },
];

// ─── Animation variants ─────────────────────────────────────────────────────

const containerV = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};
const itemV = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CriativosPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#010101] text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[rgba(1,1,1,0.92)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img src="/images/logo-header.png" alt="ImobCreator AI" className="h-9 w-auto" />
          </Link>
          <a
            href="#planos"
            className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            Começar Agora
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] pt-28 pb-20 flex items-center overflow-hidden">
        {/* Video background */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none"
          src="/videos/hero-bg.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010101] via-transparent to-[#010101] pointer-events-none" />
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[640px] h-[420px] bg-[rgba(212,175,55,0.07)] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={containerV}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6"
          >
            <motion.div variants={itemV}>
              <ProofBadge variant="gold" icon={<Image className="w-3.5 h-3.5" />}>
                IA para Criativos Imobiliarios
              </ProofBadge>
            </motion.div>

            <motion.h1 variants={itemV} className="font-['Syne',sans-serif] font-bold text-[clamp(2.2rem,5.5vw,4.25rem)] leading-[1.08] tracking-tight">
              Crie posts de<br />
              imoveis com IA<br />
              <span className="text-[#FFD700]">em 30 segundos.</span>
            </motion.h1>

            <motion.p variants={itemV} className="font-['DM_Sans',sans-serif] text-[rgba(255,255,255,0.6)] text-lg sm:text-xl max-w-2xl">
              Templates exclusivos para corretor. Sem designer, sem Canva, sem demora.
            </motion.p>

            <motion.div variants={itemV} className="flex flex-col items-center gap-3">
              <a
                href="#planos"
                className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold text-base px-7 py-3.5 rounded-full transition-colors"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div variants={itemV} className="flex flex-wrap items-center justify-center gap-8 pt-4">
              {[
                { value: "50 artes/mes", label: "no plano starter" },
                { value: "6 formatos", label: "automaticos" },
                { value: "100%", label: "automatico" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold text-[#FFD700] font-['Syne',sans-serif] leading-none">{s.value}</span>
                  <span className="text-[rgba(255,255,255,0.45)] text-xs">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#010101] to-transparent pointer-events-none" />
      </section>

      {/* ── Como Funciona ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            badge={<ProofBadge variant="cyan">Simples assim</ProofBadge>}
            title={<>Como funciona em <span className="text-[#FFD700]">3 passos</span></>}
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <motion.div
                key={s.num}
                variants={fadeUpVariants}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 flex flex-col items-center text-center gap-4"
              >
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <h3 className="text-white font-semibold text-base mb-1.5">{s.title}</h3>
                  <p className="text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Estilos de Criativos ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#010101]">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            badge={<ProofBadge variant="gold">Galeria de estilos</ProofBadge>}
            title={<>6 estilos profissionais <span className="text-[#FFD700]">prontos para usar</span></>}
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {creativeStyles.map((style) => (
              <motion.div
                key={style}
                variants={fadeUpVariants}
                whileHover={{ y: -4, borderColor: "rgba(255,215,0,0.3)" }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(0,43,91,0.08)] p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[140px] transition-colors"
              >
                <h3 className="text-white font-semibold text-sm">{style}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FFD700] bg-[rgba(255,215,0,0.1)] px-3 py-1 rounded-full">
                  Disponivel
                </span>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Para Quem É ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            badge={<ProofBadge variant="cyan">Para quem e</ProofBadge>}
            title={<>Feito para profissionais <span className="text-[#FFD700]">do mercado imobiliario</span></>}
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <motion.div
                key={a.title}
                variants={fadeUpVariants}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 flex flex-col items-center text-center gap-3"
              >
                <span className="text-4xl">{a.emoji}</span>
                <h3 className="text-white font-semibold text-base">{a.title}</h3>
                <p className="text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{a.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Planos ─────────────────────────────────────────────────────── */}
      <section id="planos" className="py-20 px-6 bg-[#010101] scroll-mt-20">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            badge={<ProofBadge variant="gold">Planos</ProofBadge>}
            title={<>Escolha o plano ideal <span className="text-[#FFD700]">para voce</span></>}
            subtitle="Todos com 7 dias de garantia. Cancele quando quiser."
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((p) => (
              <PricingCard
                key={p.name}
                plan={p.name}
                price={p.price}
                features={p.features}
                cta={`Assinar ${p.name}`}
                onCta={() => window.open(p.url, "_blank")}
                highlighted={p.highlighted}
                badge={p.badge}
              />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="container mx-auto max-w-3xl">
          <SectionHeader
            badge={<ProofBadge variant="cyan">FAQ</ProofBadge>}
            title="Duvidas frequentes"
            className="mb-10"
          />
          <StaggerChildren className="flex flex-col gap-3">
            {faqs.map((f) => (
              <motion.div key={f.q} variants={fadeUpVariants}>
                <FAQItem question={f.q} answer={f.a} />
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#002B5B] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[rgba(255,215,0,0.08)] rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <h2 className="font-['Syne',sans-serif] font-bold text-3xl md:text-4xl leading-tight mb-6">
              Pronto para criar 50 artes<br />profissionais por mes?
            </h2>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold text-base px-7 py-3.5 rounded-full transition-colors"
            >
              Ver Planos
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-[rgba(255,255,255,0.06)] bg-[#010101]">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[rgba(255,255,255,0.35)] text-xs">
          <span>&copy; 2026 ImobCreator AI. Todos os direitos reservados.</span>
          <div className="flex gap-5">
            <Link to="/termos" className="hover:text-[#FFD700] transition-colors">Termos de Uso</Link>
            <Link to="/termos" className="hover:text-[#FFD700] transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
