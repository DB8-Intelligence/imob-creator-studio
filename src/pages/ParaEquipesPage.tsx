import { useEffect } from "react";
import {
  Users, Zap, RefreshCw, LayoutDashboard, GitMerge, CheckCircle2,
  Sparkles, ArrowRight, Upload, ShieldCheck, Target, TrendingUp,
} from "lucide-react";
import { captureAttribution, captureLastTouch } from "@/services/analytics/utmCapture";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IcpPageShell } from "@/components/public/IcpPageShell";
import { IcpHero } from "@/components/public/IcpHero";
import { SectionHeader } from "@/components/public/SectionHeader";
import { ProofBadge } from "@/components/public/ProofBadge";
import { FeatureCard } from "@/components/public/FeatureCard";
import { UseCaseCard } from "@/components/public/UseCaseCard";
import { MetricCard } from "@/components/public/MetricCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { CTABanner } from "@/components/public/CTABanner";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Pain points ─────────────────────────────────────────────────────────────

const pains = [
  {
    icon: RefreshCw,
    title: "Retrabalho constante",
    description: "Conteúdo enviado errado, fora do padrão ou sem revisão. O gestor passa horas corrigindo o que poderia ter saído certo na primeira vez.",
  },
  {
    icon: GitMerge,
    title: "Desalinhamento entre membros",
    description: "Cada pessoa usa um estilo diferente, uma ferramenta diferente. O resultado é um portfólio inconsistente que prejudica a percepção da marca.",
  },
  {
    icon: Target,
    title: "Onboarding lento e caro",
    description: "Novo membro entra no time e leva semanas para entender as ferramentas, os padrões e o fluxo. Produtividade zero no começo.",
  },
  {
    icon: LayoutDashboard,
    title: "Sem visibilidade do que foi produzido",
    description: "O gestor não sabe quantos criativos foram gerados, por quem, em qual status. Sem rastreabilidade, o controle de qualidade falha.",
  },
];

// ─── Benefits ─────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Templates e brand kit compartilhados",
    description: "Uma única fonte da verdade para todos. Qualquer membro do time gera conteúdo no padrão da marca — sem checar com o gestor a cada peça.",
    highlight: true,
    badge: "Chave",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Fluxo de aprovação centralizado",
    description: "Tudo que o time produz entra no inbox de aprovação. O gestor revisa e libera em segundos. Sem e-mail, sem WhatsApp, sem confusão.",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: "Dashboard de produtividade",
    description: "Veja quem produziu o quê, quantos créditos foram consumidos e qual é o status de cada operação — em tempo real.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Onboarding em minutos",
    description: "Novo membro se cadastra, acessa o brand kit e já produz no padrão correto desde o primeiro dia. Sem curva de aprendizado longa.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Multi-usuário sem conflito",
    description: "Cada usuário tem seu espaço, seu histórico e seu saldo. A operação do time não se mistura, mas o gestor enxerga tudo.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Escale sem contratar",
    description: "Dobre o volume de conteúdo sem dobrar a equipe. A IA absorve o trabalho operacional para que o time foque no que realmente importa.",
  },
];

// ─── Metrics ─────────────────────────────────────────────────────────────────

const metrics = [
  { value: "5 min", label: "para onboarding de um novo membro", variant: "gold" as const },
  { value: "–70%", label: "de retrabalho por erros de padrão", variant: "cyan" as const },
  { value: "2x", label: "de conteúdo produzido com o mesmo time", variant: "default" as const },
  { value: "100%", label: "de rastreabilidade de operações", variant: "default" as const },
];

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  { number: "01", icon: <Users className="w-5 h-5" />, title: "Configure o time", desc: "Crie o espaço de trabalho, defina o brand kit e convide os membros. Setup completo em menos de 30 minutos." },
  { number: "02", icon: <Upload className="w-5 h-5" />, title: "Membros produzem com IA", desc: "Cada membro acessa o painel, enviam fotos dos imóveis e a IA gera criativos e vídeos já no padrão da marca." },
  { number: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Gestor aprova e publica", desc: "Inbox centralizado. O gestor revisa, aprova e libera. Rastreabilidade completa de quem fez o quê." },
];

// ─── Use cases ────────────────────────────────────────────────────────────────

const useCases = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Time de atendimento",
    description: "Corretores do time geram conteúdo para cada imóvel da carteira sem precisar de aprovação prévia para cada peça — só para a publicação final.",
    tags: ["Criativos", "Vídeos", "Staging"],
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Time de marketing interno",
    description: "O time de marketing define o brand kit e aprova tudo que vai para o ar. A IA faz o trabalho operacional, o time faz o trabalho estratégico.",
    tags: ["Brand Kit", "Aprovação", "Analytics"],
  },
  {
    icon: <GitMerge className="w-5 h-5" />,
    title: "Rede de franquias",
    description: "Franqueados geram conteúdo padronizado com a marca da rede. O franqueador controla a qualidade sem revisar peça por peça.",
    tags: ["Multi-usuário", "Padronização", "Controle"],
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Implementamos o DB8 em 5 corretores e em 2 semanas triplicamos o volume de conteúdo. O inbox de aprovação mudou nossa operação — zero retrabalho.",
    author: "Thiago Rodrigues",
    role: "Coordenador de Marketing · Grupo Imóveis SP",
    rating: 5,
  },
  {
    quote: "O onboarding de novos corretores caiu de 2 semanas para 1 dia. Eles entram, configuram o brand kit e já estão produzindo no padrão. Isso é ganho real.",
    author: "Camila Freitas",
    role: "Gerente Operacional · Rede Prime Imóveis",
    rating: 5,
  },
  {
    quote: "O dashboard de operações me dá visibilidade total. Sei exatamente quantas peças foram geradas, por quem e com qual custo. Controle que eu nunca tive antes.",
    author: "Eduardo Santos",
    role: "Diretor de Operações · ImovGroup BR",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "Qual o mínimo de membros para usar o plano de equipe?", a: "A partir de 2 usuários simultâneos já existe um plano adequado. O plano Plus suporta até 5 usuários e o Premium é ilimitado." },
  { q: "Como funciona o controle de créditos por membro?", a: "O gestor define o saldo disponível para cada usuário. O dashboard mostra o consumo em tempo real por pessoa e por tipo de operação." },
  { q: "É possível ter aprovação em dois níveis?", a: "Atualmente o fluxo tem um nível de aprovação (gestor principal). Aprovação em múltiplos níveis está no roadmap e será implementada nos próximos meses." },
  { q: "Como garantir que todos usem o mesmo padrão?", a: "O brand kit compartilhado é a fonte única da verdade. Quando configurado, todos os criativos gerados pelo time saem com logo, cores e fontes definidos pelo gestor." },
  { q: "Quanto tempo leva para integrar um novo membro?", a: "Em média 5 a 15 minutos. O membro se cadastra, acessa o brand kit e o guia rápido já o prepara para produzir no padrão do primeiro acesso." },
  { q: "O histórico de operações fica disponível por quanto tempo?", a: "O histórico é permanente. Todo criativo gerado, aprovado ou rejeitado fica registrado no dashboard com data, usuário e tipo de operação." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const ParaEquipesPage = () => {
  useEffect(() => {
    captureAttribution();
    captureLastTouch();
  }, []);

  return (
  <IcpPageShell>
    {/* ── Hero ── */}
    <IcpHero
      badge={
        <ProofBadge variant="cyan" icon={<Users className="w-3.5 h-3.5" />}>
          Para Times Comerciais
        </ProofBadge>
      }
      headline={
        <>
          Transforme seu time em uma{" "}
          <span className="text-gold">máquina de produção de conteúdo.</span>
        </>
      }
      description="Chega de retrabalho, desalinhamento e conteúdo inconsistente. Com o DB8 Intelligence, seu time inteiro produz no mesmo padrão — com brand kit centralizado, fluxo de aprovação integrado e rastreabilidade completa."
      ctaLabel="Começar com minha equipe"
      stats={[
        { value: "5 min", label: "para onboarding" },
        { value: "–70%", label: "de retrabalho" },
        { value: "2x", label: "mais conteúdo" },
      ]}
    />

    {/* ── Pain Points ── */}
    <section className="section-py section-px bg-section-dark relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">O problema do time sem sistema</ProofBadge>}
          title={<>Quanto custa o <span className="text-gold">desalinhamento da equipe?</span></>}
          subtitle="Cada hora de retrabalho é uma venda que não aconteceu."
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
          badge={<ProofBadge variant="gold">A solução</ProofBadge>}
          title={<>Um sistema que o time inteiro <span className="text-gold">usa sem depender do gestor</span></>}
          subtitle="Padrão, escala e controle — sem microgerenciamento."
          className="mb-14"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <FeatureCard key={b.title} {...b} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── Metrics ── */}
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">Impacto mensurável</ProofBadge>}
          title={<>O que times ganham <span className="text-gold">com o DB8 Intelligence</span></>}
          className="mb-12"
        />
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {metrics.map((m) => (
            <MetricCard key={m.label} value={m.value} label={m.label} variant={m.variant} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── How it works ── */}
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">Como funciona</ProofBadge>}
          title={<>Configure, produza e controle <span className="text-gold">em 3 passos</span></>}
          subtitle="Seu time produzindo no padrão desde o primeiro dia."
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

    {/* ── Use Cases ── */}
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Casos de uso</ProofBadge>}
          title={<>Como diferentes times <span className="text-gold">usam o DB8</span></>}
          className="mb-12"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {useCases.map((u) => (
            <UseCaseCard key={u.title} {...u} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── Testimonials ── */}
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Depoimentos</ProofBadge>}
          title={<>Times que <span className="text-gold">pararam de improvisar</span></>}
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
          subtitle="O que gestores e líderes de time costumam perguntar."
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
      badge={<ProofBadge variant="cyan" icon={<Sparkles className="w-3.5 h-3.5" />}>Para times de 2 a 50+ pessoas</ProofBadge>}
      title={<>Seu time produzindo no padrão <span className="text-gold">desde o primeiro dia.</span></>}
      subtitle="Sem contrato longo. Sem custo de implementação. Sem necessidade de equipe técnica."
      primaryCta={
        <Link to="/auth" className="btn-primary group">
          Começar com meu time
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      }
    />
  </IcpPageShell>
  );
};

export default ParaEquipesPage;
