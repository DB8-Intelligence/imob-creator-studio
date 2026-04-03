/**
 * /lp/automacao-imobiliaria
 * Campaign LP — "Automatize sua divulgação imobiliária com IA."
 * Target: Meta Ads / Google Ads — scale-focused brokers and agencies
 */
import {
  Workflow, BarChart3, RefreshCw, ShieldCheck, Zap, Clock, Star,
  Upload, Sparkles, CheckCircle2, ArrowRight, GitMerge, Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LpLayout, LpHero, LpCtaStrip } from "@/components/public/LpLayout";
import { ProofBadge } from "@/components/public/ProofBadge";
import { SectionHeader } from "@/components/public/SectionHeader";
import { FeatureCard } from "@/components/public/FeatureCard";
import { MetricCard } from "@/components/public/MetricCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Problem vs solution ──────────────────────────────────────────────────────

const before = [
  "Horas por semana criando conteúdo manualmente",
  "Posts inconsistentes — fora de padrão ou atrasados",
  "Conteúdo depende do humor e tempo disponível",
  "Time desperdiça energia em tarefas repetitivas",
];

const after = [
  "IA gera conteúdo profissional em minutos",
  "Padrão visual consistente em todos os canais",
  "Produção contínua — independente de disponibilidade",
  "Time foca em vender, não em criar arte",
];

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    icon: <Upload className="w-5 h-5" />,
    title: "Envie os imóveis",
    desc: "Fotos, descrições e informações básicas. A IA identifica o tipo e adapta o conteúdo automaticamente.",
    accent: "from-[var(--ds-gold)] to-[var(--ds-gold-light)]",
  },
  {
    num: "02",
    icon: <Sparkles className="w-5 h-5" />,
    title: "IA produz tudo",
    desc: "Posts, vídeos, stories, legendas e variações. 8 serviços de IA trabalhando em paralelo para você.",
    accent: "from-[#0096CC] to-[var(--ds-cyan)]",
  },
  {
    num: "03",
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Aprove e publique",
    desc: "Revise no inbox, aprove e publique. Rastreabilidade completa de tudo que foi produzido.",
    accent: "from-[#059669] to-[#34D399]",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Workflow className="w-5 h-5" />,
    title: "Fluxo automatizado de conteúdo",
    description: "Do upload à publicação, cada etapa tem um passo definido. Sem e-mail, sem WhatsApp, sem improviso.",
    highlight: true,
    badge: "Core",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Dashboard de operações",
    description: "Visibilidade total da produção: o que foi gerado, por quem, em qual status e quanto custa em créditos.",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Cadência de conteúdo consistente",
    description: "Produza conteúdo para semanas inteiras em uma única sessão. Mantenha o feed ativo sem esforço diário.",
  },
  {
    icon: <GitMerge className="w-5 h-5" />,
    title: "Integração via n8n",
    description: "Conecte com CRMs, WhatsApp, planilhas e sistemas legados. Automação avançada para operações maiores.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Brand kit centralizado",
    description: "Todo conteúdo gerado respeita a identidade visual da marca. Consistência em todos os canais automaticamente.",
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Sem retrabalho",
    description: "Aprovação antes da publicação elimina erros, fora de padrão e retrabalho — para qualquer tamanho de operação.",
  },
];

// ─── Metrics ─────────────────────────────────────────────────────────────────

const metrics = [
  { value: "80%", label: "menos tempo em produção de conteúdo", variant: "gold" as const },
  { value: "3x",  label: "mais imóveis publicados por semana",  variant: "cyan" as const },
  { value: "0",   label: "erros de brand com brand kit ativo",  variant: "default" as const },
  { value: "∞",   label: "escalabilidade — sem contratar",      variant: "default" as const },
];

// ─── Hero stats ───────────────────────────────────────────────────────────────

const heroStats = [
  { value: "80%", label: "menos tempo produzindo" },
  { value: "3x",  label: "mais conteúdo publicado" },
  { value: "8 serviços", label: "de IA integrados" },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Implementamos o DB8 na nossa operação e triplicamos o volume de posts sem contratar mais ninguém. O fluxo de aprovação eliminou 100% do retrabalho.",
    author: "Carlos Mendonça",
    role: "Diretor Comercial · Imobiliária Prime",
    rating: 5,
  },
  {
    quote: "Em um mês geramos conteúdo para mais de 200 imóveis. Sem agência. O gestor só aprova o que a IA entrega. Isso é automação de verdade.",
    author: "Ricardo Alves",
    role: "CEO · Grupo RealState BR",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "O que exatamente é automatizado?", a: "A geração de conteúdo (artes, vídeos, legendas, variações) e o fluxo de aprovação são completamente automatizados. A publicação final ainda passa por revisão humana — o que garante qualidade." },
  { q: "Preciso de equipe técnica para implementar?", a: "Não. O setup básico é feito em menos de 30 minutos sem nenhum conhecimento técnico. Para integrações avançadas via n8n, disponibilizamos suporte." },
  { q: "Funciona para imobiliária com muitos corretores?", a: "Sim. O sistema foi pensado para escala. Cada corretor acessa seu espaço, o gestor aprova tudo centralizadamente, e o brand kit garante consistência." },
  { q: "Posso testar antes de assinar?", a: "Sim. O plano gratuito permite criar os primeiros criativos sem cartão de crédito. Você vê o resultado antes de assinar qualquer coisa." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutomacaoImobiliariaPage() {
  return (
    <LpLayout ctaLabel="Automatizar minha operação">
      {/* ── Hero ── */}
      <LpHero
        badge={
          <ProofBadge variant="gold" icon={<Workflow className="w-3.5 h-3.5" />}>
            Automação Imobiliária com IA
          </ProofBadge>
        }
        headline={
          <>
            Automatize sua divulgação imobiliária{" "}
            <span className="text-gold">com IA.</span>
          </>
        }
        description="Pare de desperdiçar horas em tarefas repetitivas. O DB8 Intelligence automatiza a produção de posts, vídeos e legendas — mantendo consistência, escala e padrão visual em todos os seus canais, todos os dias."
        ctaLabel="Começar a automatizar — grátis"
        trust="Sem cartão de crédito · Cancele quando quiser"
        stats={heroStats}
      />

      {/* ── Before / After ── */}
      <section className="section-py section-px bg-section-dark">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="default">Antes e depois</ProofBadge>}
            title={<>O que muda quando você <span className="text-gold">para de improvisar</span></>}
            className="mb-14"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-7"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
                <span className="text-[#FCA5A5] font-semibold text-sm uppercase tracking-wide">Sem automação</span>
              </div>
              <ul className="flex flex-col gap-3">
                {before.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-[var(--ds-fg-muted)]">
                    <span className="mt-1 w-4 h-4 rounded-full bg-[rgba(251,113,133,0.15)] flex items-center justify-center shrink-0 text-[#FCA5A5] text-[10px] font-bold">✕</span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass glass-gold rounded-2xl p-7 border border-[rgba(212,175,55,0.25)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent opacity-60" />
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--ds-gold-light)]" />
                <span className="text-[var(--ds-gold-light)] font-semibold text-sm uppercase tracking-wide">Com DB8 Intelligence</span>
              </div>
              <ul className="flex flex-col gap-3">
                {after.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-[var(--ds-fg)]">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 text-[var(--ds-gold-light)] shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mid CTA ── */}
      <LpCtaStrip
        text="Chega de improvisar. Comece a automatizar hoje."
        ctaLabel="Começar agora — grátis"
        variant="gold"
      />

      {/* ── How it works ── */}
      <section className="section-py section-px bg-section-ocean">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="cyan">Como funciona</ProofBadge>}
            title={<>Automação em <span className="text-gold">3 etapas simples</span></>}
            subtitle="Configure uma vez. Produza para sempre."
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

      {/* ── Metrics ── */}
      <section className="section-py section-px bg-section-dark">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="gold">Impacto real</ProofBadge>}
            title={<>O que a automação <span className="text-gold">entrega na prática</span></>}
            className="mb-12"
          />
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {metrics.map((m) => (
              <MetricCard key={m.label} value={m.value} label={m.label} variant={m.variant} />
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-py section-px bg-section-ocean">
        <div className="section-container">
          <SectionHeader
            badge={<ProofBadge variant="gold">O que está incluído</ProofBadge>}
            title={<>Tudo que você precisa para <span className="text-gold">escalar a divulgação</span></>}
            className="mb-14"
          />
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            badge={<ProofBadge variant="gold">Cases reais</ProofBadge>}
            title={<>Operações que <span className="text-gold">escalaram com automação</span></>}
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
            title="Dúvidas sobre automação"
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[rgba(212,175,55,0.05)] rounded-full blur-[100px] pointer-events-none" />
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
              <ProofBadge variant="gold" icon={<Zap className="w-3.5 h-3.5" />}>
                Configure em 30 minutos · Resultado no mesmo dia
              </ProofBadge>
            </div>
            <h2 className="ds-h2 text-3xl mb-4">
              Sua divulgação no piloto automático.<br />
              <span className="text-gold">Comece hoje.</span>
            </h2>
            <p className="ds-body mb-8 max-w-md mx-auto">
              Sem contrato. Sem equipe técnica. Sem custo de implementação. Basta criar sua conta e começar a produzir.
            </p>
            <Link to="/auth" className="btn-primary text-base">
              Automatizar minha operação
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
