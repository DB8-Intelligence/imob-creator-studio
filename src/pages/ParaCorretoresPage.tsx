import { useEffect } from "react";
import { Clock, Image, Video, Sofa, Sparkles, CheckCircle2, UserCheck, TrendingUp, Smartphone, Upload } from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { motion } from "framer-motion";
import { IcpPageShell } from "@/components/public/IcpPageShell";
import { IcpHero } from "@/components/public/IcpHero";
import { SectionHeader } from "@/components/public/SectionHeader";
import { ProofBadge } from "@/components/public/ProofBadge";
import { FeatureCard } from "@/components/public/FeatureCard";
import { UseCaseCard } from "@/components/public/UseCaseCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { CTABanner } from "@/components/public/CTABanner";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";

// ─── Pain points ─────────────────────────────────────────────────────────────

const pains = [
  {
    icon: Clock,
    title: "Horas perdidas por semana",
    description:
      "Você passa horas buscando designer, esperando entrega, pedindo ajuste e ainda assim o resultado não representa sua marca do jeito que deveria.",
  },
  {
    icon: AlertTriangle,
    title: "Dependência cara de terceiros",
    description:
      "Freelancers e agências cobram caro por peça. Para corretores autônomos, o custo de marketing muitas vezes supera o retorno.",
  },
  {
    icon: Smartphone,
    title: "Presença digital inconsistente",
    description:
      "Sem conteúdo regular, o algoritmo te pune. Você perde visibilidade exatamente quando mais precisaria de leads entrando.",
  },
  {
    icon: TrendingUp,
    title: "Concorrentes parecem mais profissionais",
    description:
      "O cliente não sabe que seu atendimento é melhor se o feed do concorrente parece mais profissional do que o seu.",
  },
];

// ─── Benefits ────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: <Image className="w-5 h-5" />,
    title: "Artes e posts em 2 minutos",
    description: "Suba a foto do imóvel, escolha o estilo e receba o criativo pronto para publicar — copy, design e variações incluídos.",
    badge: "Mais usado",
    highlight: true,
  },
  {
    icon: <Video className="w-5 h-5" />,
    title: "Vídeos cinemáticos automáticos",
    description: "Fotos viram vídeos com movimento de câmera profissional. Cinematic, luxury, drone, walkthrough — 5 estilos diferentes.",
  },
  {
    icon: <Sofa className="w-5 h-5" />,
    title: "Staging virtual de ambientes",
    description: "Apresente o imóvel mobilado sem gastar com fotografia de interiores. A IA decora o ambiente instantaneamente.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "8 serviços num único painel",
    description: "Criativos, vídeos, staging, renders, terrenos, demarcação e upscale — tudo em um só lugar, sem trocar de ferramenta.",
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: "Sua marca, do seu jeito",
    description: "Configure seu brand kit uma única vez: logo, cores, fontes. Cada criativo gerado já respeita sua identidade.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Sem designer, sem espera",
    description: "Você controla o processo inteiro. Gera, revisa e publica — tudo em minutos, sem depender de ninguém.",
  },
];

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  { number: "01", icon: <Upload className="w-5 h-5" />, title: "Envie a foto do imóvel", desc: "JPEG ou PNG direto do celular. A IA já identifica o tipo de ambiente automaticamente." },
  { number: "02", icon: <Sparkles className="w-5 h-5" />, title: "Escolha o serviço", desc: "Arte para post, vídeo cinemático, staging, render ou demarcação. Um clique e a IA trabalha." },
  { number: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Baixe e publique", desc: "Resultado em menos de 5 minutos. Faça download e poste direto nas suas redes sociais." },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Antes eu passava horas pedindo arte para o designer e esperando legenda. Agora o post sai em minutos direto pelo dashboard. Economizei pelo menos 6 horas por semana.",
    author: "Mariana Souza",
    role: "Corretora Autônoma · CRECI-SP",
    rating: 5,
  },
  {
    quote: "Não precisei mais de designer. Meu Instagram ficou profissional em menos de uma semana. Os clientes começaram a me elogiar pela qualidade do conteúdo.",
    author: "Rafael Costa",
    role: "Corretor Independente · CRECI-RJ",
    rating: 5,
  },
  {
    quote: "O staging virtual foi o que mais me surpreendeu. Mostrar o apartamento decorado antes da visita aumentou muito minha taxa de agendamento.",
    author: "Paula Mendes",
    role: "Corretora Autônoma · CRECI-MG",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "Preciso ter conhecimento técnico para usar?", a: "Não. A plataforma foi pensada para quem não tem equipe técnica. Se você consegue fazer upload de uma foto, você consegue usar o DB8 Intelligence." },
  { q: "Funciona para corretor sem equipe?", a: "Foi feito exatamente para isso. O plano Starter cobre todas as necessidades de um corretor autônomo com até 500 créditos mensais." },
  { q: "Posso usar minha logo e minhas cores?", a: "Sim. O brand kit permite configurar logo, paleta e fontes. Todos os criativos gerados já saem com a sua identidade." },
  { q: "Quanto custa por criativo?", a: "A partir de R$ 97/mês você tem 500 créditos. Cada criativo consome cerca de 10 créditos — ou seja, mais de 50 artes por mês no plano básico." },
  { q: "O plano Starter é suficiente para começar?", a: "Para a maioria dos corretores autônomos, sim. Se o volume crescer, o upgrade é imediato e proporcional ao período restante." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem burocracia. Os créditos não utilizados permanecem na conta mesmo após o cancelamento." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const ParaCorretoresPage = () => {
  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

  return (
  <IcpPageShell>
    {/* ── Hero ── */}
    <IcpHero
      badge={
        <ProofBadge variant="gold" icon={<UserCheck className="w-3.5 h-3.5" />}>
          Para Corretores Autônomos
        </ProofBadge>
      }
      headline={
        <>
          Crie conteúdo imobiliário profissional em{" "}
          <span className="text-gold">minutos, sem depender de ninguém.</span>
        </>
      }
      description="Chega de esperar designer, pagar caro por arte e postar de forma inconsistente. Com o DB8 Intelligence, você gera vídeos, artes e staging virtual direto do seu celular — em menos de 5 minutos por imóvel."
      ctaLabel="Criar meu primeiro criativo"
      stats={[
        { value: "< 5 min", label: "por criativo" },
        { value: "R$ 0", label: "de designer" },
        { value: "8 serviços", label: "de IA incluídos" },
      ]}
    />

    {/* ── Pain Points ── */}
    <section className="section-py section-px bg-section-dark relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">A realidade do corretor autônomo</ProofBadge>}
          title={<>Você reconhece alguma dessas <span className="text-gold">situações?</span></>}
          subtitle="Não é falta de esforço. É falta da ferramenta certa."
          className="mb-14"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {pains.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUpVariants}
              className="glass glass-hover rounded-2xl p-6 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(251,113,133,0.1)] flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-[#FCA5A5]" />
              </div>
              <div>
                <h3 className="text-[var(--ds-fg)] font-semibold text-sm mb-1">{p.title}</h3>
                <p className="ds-body text-sm">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── Benefits ── */}
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">O que você ganha</ProofBadge>}
          title={<>Tudo que você precisa, <span className="text-gold">sem depender de equipe</span></>}
          subtitle="Uma plataforma feita para o corretor que trabalha sozinho e quer resultado profissional."
          className="mb-14"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <FeatureCard key={b.title} {...b} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── How it works ── */}
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">Como funciona</ProofBadge>}
          title={<>Do upload ao post em <span className="text-gold">3 passos</span></>}
          subtitle="Sem curva de aprendizado. Sem tutorial. Só resultado."
          className="mb-14"
        />
        <StaggerChildren className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s) => (
            <motion.div
              key={s.number}
              variants={fadeUpVariants}
              whileHover={{ y: -4 }}
              className="glass glass-hover rounded-2xl p-7 flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--ds-gold)] to-[var(--ds-gold-light)] flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-black">{s.number}</span>
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

    {/* ── Testimonials ── */}
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Depoimentos</ProofBadge>}
          title={<>Corretores que pararam de <span className="text-gold">depender de designer</span></>}
          className="mb-12"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <TestimonialCard key={t.author} {...t} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── FAQ ── */}
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">FAQ</ProofBadge>}
          title="Dúvidas frequentes"
          subtitle="Tudo que corretores autônomos costumam perguntar antes de começar."
          className="mb-12"
        />
        <StaggerChildren className="max-w-3xl mx-auto flex flex-col gap-3">
          {faqs.map((f) => (
            <motion.div key={f.q} variants={fadeUpVariants}>
              <FAQItem question={f.q} answer={f.a} />
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── CTA ── */}
    <CTABanner
      badge={<ProofBadge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>Sem cartão de crédito</ProofBadge>}
      title={<>Pare de perder tempo. <span className="text-gold">Comece a produzir agora.</span></>}
      subtitle="Crie seu primeiro criativo em menos de 5 minutos. Sem designer. Sem complicação."
      primaryCta={
        <Link to="/auth" className="btn-primary group">
          Criar conta grátis
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      }
    />
  </IcpPageShell>
  );
};

export default ParaCorretoresPage;
