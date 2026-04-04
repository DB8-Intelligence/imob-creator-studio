/**
 * /lp/video-imobiliario
 * Campaign LP — "Transforme imóveis em vídeos profissionais automaticamente."
 * Target: Meta Ads / Google Ads — reels / vídeo marketing audience
 */
import { useEffect } from "react";
import {
  Video, Upload, Sparkles, CheckCircle2, Play, Film, Smartphone,
  TrendingUp, Star, Clock, ArrowRight,
} from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LpLayout, LpHero, LpCtaStrip } from "@/components/public/LpLayout";
import { ProofBadge } from "@/components/public/ProofBadge";
import { SectionHeader } from "@/components/public/SectionHeader";
import { FeatureCard } from "@/components/public/FeatureCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Video styles ─────────────────────────────────────────────────────────────

const videoStyles = [
  { label: "Cinematic",    color: "text-[var(--ds-gold-light)]",   bg: "bg-[rgba(212,175,55,0.1)]"  },
  { label: "Luxury",       color: "text-[#C4B5FD]",               bg: "bg-[rgba(167,139,250,0.1)]" },
  { label: "Drone",        color: "text-[var(--ds-cyan)]",         bg: "bg-[rgba(0,242,255,0.1)]"   },
  { label: "Walkthrough",  color: "text-[#6EE7B7]",               bg: "bg-[rgba(52,211,153,0.1)]"  },
  { label: "Moderno",      color: "text-[#60C8FF]",               bg: "bg-[rgba(0,178,255,0.1)]"   },
];

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    icon: <Upload className="w-5 h-5" />,
    title: "Envie as fotos",
    desc: "De 3 a 20 fotos do imóvel. A IA organiza automaticamente a sequência de cenas.",
    accent: "from-[var(--ds-gold)] to-[var(--ds-gold-light)]",
  },
  {
    num: "02",
    icon: <Film className="w-5 h-5" />,
    title: "Escolha o estilo",
    desc: "Cinematic, Luxury, Drone, Walkthrough ou Moderno. Cada estilo tem movimento de câmera diferente.",
    accent: "from-[#0096CC] to-[var(--ds-cyan)]",
  },
  {
    num: "03",
    icon: <Play className="w-5 h-5" />,
    title: "Vídeo pronto em minutos",
    desc: "Vídeo em HD com trilha, cortes e transições profissionais. Pronto para Reels, TikTok e YouTube.",
    accent: "from-[#059669] to-[#34D399]",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Film className="w-5 h-5" />,
    title: "5 estilos cinemáticos",
    description: "Cada estilo tem movimento de câmera, transição e ritmo únicos. Do luxury ao moderno — para qualquer tipo de imóvel.",
    highlight: true,
    badge: "Veo 3.1",
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "Formato ideal para reels",
    description: "Exporta em 9:16 para stories/reels e 16:9 para feed e YouTube. Sem precisar recortar ou ajustar.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Vídeos que vendem",
    description: "Movimento de câmera e trilha sonora criam senso de urgência e desejo. Mais engajamento, mais visitas ao imóvel.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "IA Gemini + Veo 3.1",
    description: "O motor mais avançado do Google para geração de vídeo. Qualidade de produção profissional sem equipe.",
  },
];

// ─── Proof stats ──────────────────────────────────────────────────────────────

const stats = [
  { value: "< 5 min", label: "para gerar o vídeo" },
  { value: "5 estilos", label: "cinemáticos" },
  { value: "HD+",     label: "resolução de saída" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Meus reels de imóveis passaram a ter 3x mais visualizações depois que comecei a usar os vídeos cinemáticos. Os clientes perguntam quem faz minha produção.",
    author: "Ana Paula Ferreira",
    role: "Gerente de Marketing · RE/MAX Regional",
    rating: 5,
  },
  {
    quote: "Mostrar o apartamento em vídeo antes da visita presencial aumentou minha taxa de agendamento em 40%. O impacto visual é impressionante.",
    author: "Rafael Costa",
    role: "Corretor Independente · CRECI-RJ",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "Quantas fotos preciso para gerar um vídeo?", a: "O mínimo é 3 fotos. Para vídeos mais longos e impactantes, recomendamos entre 10 e 20 fotos do imóvel." },
  { q: "Quanto tempo leva para gerar o vídeo?", a: "Em média 2 a 5 minutos, dependendo da quantidade de fotos e do estilo escolhido." },
  { q: "O vídeo tem trilha sonora?", a: "Sim. Cada estilo inclui trilha sonora adequada ao mood — do luxuoso ao dinâmico. Você também pode silenciar." },
  { q: "Posso adicionar legenda ou logo ao vídeo?", a: "Sim. O brand kit insere sua logo e informações de contato automaticamente no vídeo gerado." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VideoImobiliarioPage() {
  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

  return (
    <LpLayout ctaLabel="Criar meu primeiro vídeo">
      {/* ── Hero ── */}
      <LpHero
        badge={
          <ProofBadge variant="cyan" icon={<Video className="w-3.5 h-3.5" />}>
            Vídeo Imobiliário com IA · Veo 3.1
          </ProofBadge>
        }
        headline={
          <>
            Transforme imóveis em vídeos profissionais{" "}
            <span className="text-gold">automaticamente.</span>
          </>
        }
        description="Envie fotos do imóvel, escolha o estilo — cinematic, luxury, drone, walkthrough ou moderno — e receba um vídeo profissional em menos de 5 minutos. Pronto para Reels, TikTok e YouTube."
        ctaLabel="Criar meu primeiro vídeo — grátis"
        trust="Sem cartão de crédito · Resultado em menos de 5 minutos"
        stats={stats}
      />

      {/* ── Video styles strip ── */}
      <section className="py-8 section-px bg-[var(--ds-surface)] border-y border-[var(--ds-border)]">
        <div className="section-container">
          <p className="text-center text-[var(--ds-fg-muted)] text-sm mb-5 font-medium">5 estilos cinemáticos disponíveis</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {videoStyles.map((s) => (
              <span key={s.label} className={`badge-pill ${s.bg.replace("bg-", "").includes("gold") ? "badge-gold" : ""}`} style={{ borderColor: "var(--ds-border-2)" }}>
                <span className={`w-2 h-2 rounded-full bg-current ${s.color}`} />
                <span className={s.color}>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section-py section-px bg-section-dark">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="cyan">Como funciona</ProofBadge>}
            title={<>Fotos para vídeo profissional em <span className="text-gold">3 passos</span></>}
            subtitle="Zero edição. Zero equipe de produção. Zero espera."
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((s) => (
              <motion.div
                key={s.num}
                variants={fadeUpVariants}
                whileHover={{ y: -4 }}
                className="glass glass-hover rounded-2xl p-7 flex flex-col items-center text-center gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.accent} flex items-center justify-center shadow-lg`}>
                  <span className="text-lg font-bold text-black">{s.num}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,242,255,0.08)] flex items-center justify-center text-[var(--ds-cyan)]">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-[var(--ds-fg)] font-semibold text-base mb-1.5">{s.title}</h3>
                  <p className="ds-body text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Mid CTA ── */}
      <LpCtaStrip
        text="Já imaginou seu próximo reel pronto em 5 minutos?"
        ctaLabel="Criar meu vídeo agora"
        variant="gold"
      />

      {/* ── Features ── */}
      <section className="section-py section-px bg-section-ocean">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="gold">Por que usar</ProofBadge>}
            title={<>Vídeos que se <span className="text-gold">pagam em uma visita</span></>}
            subtitle="Imóveis com vídeo cinemático geram mais engajamento e mais visitas presenciais."
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-py section-px bg-section-dark">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="gold">Resultados reais</ProofBadge>}
            title={<>Quem já usa, <span className="text-gold">não volta ao estático</span></>}
            className="mb-12"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {testimonials.map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
          </StaggerChildren>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-10 text-[var(--ds-fg-muted)] text-sm"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[var(--ds-gold)] text-[var(--ds-gold)]" />
            ))}
            <span>Avaliação 5 estrelas por corretores em todo o Brasil</span>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-py section-px bg-section-ocean">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="cyan">FAQ</ProofBadge>}
            title="Dúvidas sobre os vídeos"
            className="mb-10"
          />
          <StaggerChildren className="max-w-2xl mx-auto flex flex-col gap-3">
            {faqs.map((f) => (
              <motion.div key={f.q} variants={fadeUpVariants}>
                <FAQItem question={f.q} answer={f.a} />
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section-py section-px bg-section-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[rgba(0,242,255,0.04)] rounded-full blur-[100px] pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="glass rounded-3xl p-10 lg:p-14 max-w-2xl mx-auto text-center relative overflow-hidden border border-[rgba(0,242,255,0.15)]"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-cyan)] to-transparent opacity-60" />
            <div className="mb-4">
              <ProofBadge variant="cyan" icon={<Clock className="w-3.5 h-3.5" />}>
                Primeiro vídeo em menos de 5 minutos
              </ProofBadge>
            </div>
            <h2 className="ds-h2 text-3xl mb-4">
              Seus imóveis merecem<br />
              <span className="text-gold">vídeo cinematográfico.</span>
            </h2>
            <p className="ds-body mb-8 max-w-md mx-auto">
              Comece hoje. Sem produtora, sem editor, sem espera. O DB8 Intelligence transforma suas fotos em vídeos profissionais.
            </p>
            <Link to="/auth" className="btn-primary text-base">
              Criar meu primeiro vídeo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[var(--ds-fg-subtle)] text-xs mt-4">
              Sem cartão de crédito · Cancele quando quiser · Suporte em português
            </p>
          </motion.div>
        </div>
      </section>
    </LpLayout>
  );
}
