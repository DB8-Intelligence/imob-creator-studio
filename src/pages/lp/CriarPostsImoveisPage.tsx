/**
 * /lp/criar-posts-imoveis
 * Campaign LP — "Crie posts de imóveis com IA em minutos."
 * Target: Meta Ads / Google Ads — cold + warm traffic
 */
import { useEffect } from "react";
import { Image, Upload, Sparkles, CheckCircle2, Clock, Star, Zap, Palette, AlignLeft } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LpLayout, LpHero, LpCtaStrip } from "@/components/public/LpLayout";
import { ProofBadge } from "@/components/public/ProofBadge";
import { SectionHeader } from "@/components/public/SectionHeader";
import { FeatureCard } from "@/components/public/FeatureCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    icon: <Upload className="w-5 h-5" />,
    title: "Envie a foto",
    desc: "Qualquer foto do imóvel, tirada do celular. Sem edição prévia.",
    accent: "from-[var(--ds-gold)] to-[var(--ds-gold-light)]",
  },
  {
    num: "02",
    icon: <Sparkles className="w-5 h-5" />,
    title: "A IA cria o post",
    desc: "Arte profissional, copy persuasiva, variações e formatos — em menos de 2 minutos.",
    accent: "from-[#0096CC] to-[var(--ds-cyan)]",
  },
  {
    num: "03",
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Baixe e publique",
    desc: "Formato ideal para feed, stories e reels. Pronto para Instagram, Facebook e WhatsApp.",
    accent: "from-[#059669] to-[#34D399]",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Image className="w-5 h-5" />,
    title: "Artes para feed e stories",
    description: "Posts quadrados, verticais e paisagem. A IA adapta a composição para cada formato automaticamente.",
    highlight: true,
    badge: "Mais usado",
  },
  {
    icon: <AlignLeft className="w-5 h-5" />,
    title: "Copy inclusa no criativo",
    description: "Headline, descrição e CTA gerados pela IA junto com o visual. Você não precisa escrever nada.",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "Sua identidade visual",
    description: "Configure logo, paleta e fontes uma vez. Todo criativo gerado já sai no padrão da sua marca.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Múltiplas variações",
    description: "A IA gera 3 a 5 versões diferentes por criativo. Teste qual performa melhor para o seu público.",
  },
];

// ─── Social proof ─────────────────────────────────────────────────────────────

const stats = [
  { value: "< 2 min", label: "para gerar um post completo" },
  { value: "50+", label: "posts por mês no plano básico" },
  { value: "8 estilos", label: "de arte imobiliária disponíveis" },
];

const testimonials = [
  {
    quote: "Antes eu passava 2 horas pedindo arte e esperando designer. Hoje gero o post na hora. Meu Instagram ficou profissional de verdade.",
    author: "Mariana Souza",
    role: "Corretora Autônoma · CRECI-SP",
    rating: 5,
  },
  {
    quote: "Gero posts para todos os imóveis da carteira toda semana. Em 30 minutos tenho conteúdo para o mês inteiro. Isso mudou minha operação.",
    author: "Carlos Mendonça",
    role: "Diretor Comercial · Imobiliária Prime",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "Preciso ter Photoshop ou Canva?", a: "Não. A plataforma gera o design completo com IA. Você só precisa enviar a foto do imóvel e escolher o estilo." },
  { q: "Qual a qualidade das imagens geradas?", a: "As artes são geradas em alta resolução, adequadas para impressão e publicação digital em qualquer rede social." },
  { q: "Posso usar minha logo e cores da marca?", a: "Sim. O brand kit permite configurar identidade visual completa. Todo post gerado já sai com sua marca." },
  { q: "Funciona para qualquer tipo de imóvel?", a: "Sim — apartamentos, casas, terrenos, galpões, salas comerciais. A IA adapta o estilo ao tipo de imóvel automaticamente." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CriarPostsImoveisPage() {
  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

  return (
    <LpLayout ctaLabel="Criar meu primeiro post">
      {/* ── Hero ── */}
      <LpHero
        badge={
          <ProofBadge variant="gold" icon={<Image className="w-3.5 h-3.5" />}>
            Criativo Imobiliário com IA
          </ProofBadge>
        }
        headline={
          <>
            Crie posts de imóveis com IA{" "}
            <span className="text-gold">em minutos.</span>
          </>
        }
        description="Sem designer. Sem Canva. Sem espera. Envie a foto do imóvel e receba arte profissional, copy persuasiva e variações prontas para publicar — tudo gerado por IA em menos de 2 minutos."
        ctaLabel="Criar meu primeiro post — grátis"
        trust="Sem cartão de crédito · Cancele quando quiser"
        stats={stats}
      />

      {/* ── How it works ── */}
      <section className="section-py section-px bg-section-dark">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="cyan">Simples assim</ProofBadge>}
            title={<>Do upload ao post publicado em <span className="text-gold">3 passos</span></>}
            subtitle="Nenhuma habilidade técnica necessária."
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
                <div className="w-10 h-10 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--ds-gold-light)]">
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

      {/* ── Mid-page CTA ── */}
      <LpCtaStrip
        text="Pronto para criar seu primeiro post profissional?"
        ctaLabel="Começar agora — grátis"
        variant="gold"
      />

      {/* ── Features ── */}
      <section className="section-py section-px bg-section-ocean">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="gold">O que está incluído</ProofBadge>}
            title={<>Tudo que você precisa para <span className="text-gold">postar todos os dias</span></>}
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
            badge={<ProofBadge variant="gold">Quem já usa</ProofBadge>}
            title={<>Corretores que <span className="text-gold">pararam de pagar designer</span></>}
            className="mb-12"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {testimonials.map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
          </StaggerChildren>

          {/* star strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
            title="Respondendo suas dúvidas"
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[rgba(212,175,55,0.06)] rounded-full blur-[100px] pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="glass glass-gold rounded-3xl p-10 lg:p-14 max-w-2xl mx-auto text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent" />
            <div className="mb-4">
              <ProofBadge variant="gold" icon={<Clock className="w-3.5 h-3.5" />}>
                Primeiro post em menos de 2 minutos
              </ProofBadge>
            </div>
            <h2 className="ds-h2 text-3xl mb-4">
              Pare de pagar designer.<br />
              <span className="text-gold">Comece agora.</span>
            </h2>
            <p className="ds-body mb-8 max-w-md mx-auto">
              Crie seus primeiros posts de imóveis com IA hoje mesmo. Sem cartão de crédito, sem contrato, sem complicação.
            </p>
            <Link to="/auth" className="btn-primary text-base">
              Criar minha conta grátis
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
