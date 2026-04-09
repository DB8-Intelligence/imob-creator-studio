/**
 * /videos — Landing page pública: ImobCreator Vídeos
 * Checkout via Kiwify. Sem auth gate.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Video } from "lucide-react";
import { PricingCard } from "@/components/public/PricingCard";
import { FAQItem } from "@/components/public/FAQItem";
import { SectionHeader } from "@/components/public/SectionHeader";
import { ProofBadge } from "@/components/public/ProofBadge";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Kiwify checkout links ──────────────────────────────────────────────────
const CHECKOUT = {
  starter: "https://kiwify.app/kMcnV7a",
  basico:  "https://pay.kiwify.com.br/iJ5cYCJ",
  pro:     "https://pay.kiwify.com.br/rJ4B7Op",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  { num: "01", emoji: "📸", title: "Envie as fotos do imóvel", desc: "Mínimo 3, máximo 20 fotos. Direto do celular ou da galeria." },
  { num: "02", emoji: "🎬", title: "IA monta o vídeo", desc: "Ken Burns, crossfade, trilha sonora e texto overlay automáticos." },
  { num: "03", emoji: "📤", title: "Publique no Instagram", desc: "Reels 9:16 prontos para publicar. Baixe ou envie direto." },
];

const videoStyles = [
  { name: "Slideshow Clássico", duration: "15–30s", best: "Apresentação rápida de imóvel para feed e stories." },
  { name: "Tour de Ambientes", duration: "30–60s", best: "Percurso imersivo pelos cômodos, ideal para Reels." },
  { name: "Highlight Reel", duration: "15–90s", best: "Destaque dos melhores ângulos com transições dinâmicas." },
];

const audiences = [
  { emoji: "👤", title: "Corretor solo", desc: "Reels sem saber editar." },
  { emoji: "🏗️", title: "Lançamentos", desc: "Vídeos de tour para novos empreendimentos." },
  { emoji: "🌄", title: "Terrenos", desc: "Mostre o terreno com profissionalismo." },
];

const plans = [
  {
    name: "Starter", price: "R$97", features: [
      "5 vídeos/mês", "Duração até 30s", "3 moods de música", "Download direto",
    ], url: CHECKOUT.starter,
  },
  {
    name: "Básico", price: "R$197", highlighted: true, badge: "Mais popular", features: [
      "10 vídeos/mês", "Duração até 60s", "6 moods de música", "Publicação IG Reels",
    ], url: CHECKOUT.basico,
  },
  {
    name: "PRO", price: "R$397", features: [
      "20 vídeos/mês", "Duração até 90s", "6 moods de música", "Publicação IG Reels",
    ], url: CHECKOUT.pro,
  },
];

const faqs = [
  { q: "Qual formato de saída?", a: "MP4 em 9:16, otimizado para Reels do Instagram, TikTok e Stories." },
  { q: "Preciso enviar quantas fotos?", a: "Mínimo 3, máximo 20. Quanto mais fotos, mais completo fica o vídeo." },
  { q: "O vídeo tem marca d'água?", a: "Não. O vídeo é 100% seu, sem marca d'água ou watermark." },
  { q: "Posso usar música?", a: "Sim, 6 moods de trilha sonora royalty-free incluídos. Escolha o clima ideal." },
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

export default function VideosPage() {
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
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none"
          src="/videos/hero-bg.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010101] via-transparent to-[#010101] pointer-events-none" />
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[640px] h-[420px] bg-[rgba(0,43,91,0.12)] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={containerV}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6"
          >
            <motion.div variants={itemV}>
              <ProofBadge variant="gold" icon={<Video className="w-3.5 h-3.5" />}>
                Videos Imobiliarios com IA
              </ProofBadge>
            </motion.div>

            <motion.h1 variants={itemV} className="font-['Syne',sans-serif] font-bold text-[clamp(2.2rem,5.5vw,4.25rem)] leading-[1.08] tracking-tight">
              Transforme fotos<br />
              em Reels<br />
              <span className="text-[#FFD700]">profissionais.</span>
            </motion.h1>

            <motion.p variants={itemV} className="font-['DM_Sans',sans-serif] text-[rgba(255,255,255,0.6)] text-lg sm:text-xl max-w-2xl">
              Ken Burns, trilha sonora e texto overlay. Pronto para o Instagram em minutos.
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
                { value: "5 videos/mes", label: "no plano starter" },
                { value: "9:16", label: "formato Reels" },
                { value: "Ken Burns", label: "automatico" },
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
            title={<>De fotos a Reel em <span className="text-[#FFD700]">3 passos</span></>}
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

      {/* ── Estilos de Vídeo ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#010101]">
        <div className="container mx-auto max-w-5xl">
          <SectionHeader
            badge={<ProofBadge variant="gold">Estilos de video</ProofBadge>}
            title={<>3 estilos cinematicos <span className="text-[#FFD700]">para cada necessidade</span></>}
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoStyles.map((vs) => (
              <motion.div
                key={vs.name}
                variants={fadeUpVariants}
                whileHover={{ y: -4, borderColor: "rgba(255,215,0,0.3)" }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(0,43,91,0.08)] p-7 flex flex-col gap-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-base">{vs.name}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FFD700] bg-[rgba(255,215,0,0.1)] px-3 py-1 rounded-full">
                    {vs.duration}
                  </span>
                </div>
                <p className="text-[rgba(255,255,255,0.5)] text-sm font-['DM_Sans',sans-serif]">{vs.best}</p>
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
            title={<>Videos profissionais <span className="text-[#FFD700]">para cada perfil</span></>}
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
            title={<>Escolha o plano ideal <span className="text-[#FFD700]">para seus videos</span></>}
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
              Pronto para transformar fotos<br />em Reels profissionais?
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
