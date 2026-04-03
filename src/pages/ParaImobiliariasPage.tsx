import {
  Building2, Users, BarChart3, ShieldCheck, Workflow, Layers, Upload,
  Sparkles, CheckCircle2, ArrowRight, AlertTriangle, Clock, Puzzle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IcpPageShell } from "@/components/public/IcpPageShell";
import { IcpHero } from "@/components/public/IcpHero";
import { SectionHeader } from "@/components/public/SectionHeader";
import { ProofBadge } from "@/components/public/ProofBadge";
import { FeatureCard } from "@/components/public/FeatureCard";
import { MetricCard } from "@/components/public/MetricCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQItem } from "@/components/public/FAQItem";
import { CTABanner } from "@/components/public/CTABanner";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ─── Pain points ─────────────────────────────────────────────────────────────

const pains = [
  {
    icon: Layers,
    title: "Cada corretor com um estilo diferente",
    description: "Sem padronização, a identidade visual da imobiliária se fragmenta. O cliente percebe — e isso prejudica a autoridade da marca.",
  },
  {
    icon: Clock,
    title: "50+ imóveis por mês, sem ferramenta de escala",
    description: "Gerar conteúdo manualmente para um portfólio grande é inviável. O time gasta horas editando quando deveria estar vendendo.",
  },
  {
    icon: AlertTriangle,
    title: "Retrabalho e aprovação descentralizada",
    description: "Sem fluxo de aprovação, peças saem erradas, fora do padrão ou sem revisão — gerando retrabalho caro e constrangimentos.",
  },
  {
    icon: Puzzle,
    title: "Muitas ferramentas desconectadas",
    description: "Canva, CapCut, ChatGPT, Designer… o time pula entre plataformas e perde tempo aprendendo e gerenciando o que foi produzido onde.",
  },
];

// ─── Benefits ─────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Brand kits por corretor ou cliente",
    description: "Configure logo, cores e fontes para cada corretor ou carteira de clientes. Todo conteúdo sai padronizado, sem esforço manual.",
    highlight: true,
    badge: "Exclusivo",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Volume sem overhead",
    description: "Gere conteúdo para dezenas de imóveis por dia. A IA não cansa, não falta e não cobra por peça adicional.",
  },
  {
    icon: <Workflow className="w-5 h-5" />,
    title: "Fluxo de aprovação integrado",
    description: "O gestor revisa e aprova antes da publicação. Inbox de operações centralizado, rastreável e auditável.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Múltiplos usuários simultâneos",
    description: "Planos para equipes com 2, 5 ou mais usuários. Cada membro acessa seu espaço, sem conflito de conteúdo.",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Dashboard de operações",
    description: "Veja o histórico completo de criativos gerados, créditos consumidos e status de aprovação — por corretor ou por imóvel.",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Tudo em uma única plataforma",
    description: "Sem Canva, sem CapCut, sem agência terceirizada. Da arte ao vídeo, tudo integrado e padronizado no mesmo painel.",
  },
];

// ─── Operational gains ─────────────────────────────────────────────────────────

const gains = [
  { value: "80%", label: "redução no tempo de produção de conteúdo", variant: "gold" as const },
  { value: "3x", label: "mais imóveis publicados por semana", variant: "cyan" as const },
  { value: "0 erros", label: "de brand quando todos usam o mesmo brand kit", variant: "default" as const },
  { value: "100%", label: "rastreabilidade de quem produziu o quê", variant: "default" as const },
];

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  { number: "01", icon: <Building2 className="w-5 h-5" />, title: "Configure a operação", desc: "Crie brand kits por corretor, defina planos e convide o time. Setup completo em menos de 30 minutos." },
  { number: "02", icon: <Upload className="w-5 h-5" />, title: "Equipe produz com IA", desc: "Cada corretor acessa o painel, envia fotos dos seus imóveis e a IA gera criativos e vídeos já no padrão da marca." },
  { number: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Gestor aprova e publica", desc: "Tudo passa pelo inbox de aprovação antes de sair. Você controla a qualidade sem revisar manualmente linha por linha." },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Implementamos o DB8 Intelligence na nossa operação e triplicamos o volume de posts sem contratar mais ninguém. Os vídeos cinematográficos impressionam os clientes.",
    author: "Carlos Mendonça",
    role: "Diretor Comercial · Imobiliária Prime",
    rating: 5,
  },
  {
    quote: "A padronização da marca foi o maior ganho. Antes cada corretor fazia do seu jeito. Hoje o feed da imobiliária tem identidade consistente — e isso gerou mais credibilidade.",
    author: "Fernanda Lima",
    role: "Gerente de Marketing · Rede Imovest",
    rating: 5,
  },
  {
    quote: "Em um mês geramos conteúdo para mais de 200 imóveis. Sem agência, sem designer freelancer, sem retrabalho. O gestor só aprova o que a IA entrega.",
    author: "Ricardo Alves",
    role: "CEO · Grupo RealState BR",
    rating: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  { q: "Quantos usuários posso ter na minha imobiliária?", a: "Depende do plano. O plano Plus suporta até 5 usuários simultâneos e o Premium não tem limitação de equipe." },
  { q: "Posso criar brand kits diferentes para cada corretor?", a: "Sim. Cada usuário pode ter um brand kit com logo, cores e fontes específicos. Útil para imobiliárias que gerenciam múltiplas carteiras." },
  { q: "Como funciona o fluxo de aprovação?", a: "Tudo que a equipe gera entra no inbox do gestor. Ele revisa, aprova ou solicita ajustes antes de qualquer publicação." },
  { q: "Tem integração com sistemas de CRM imobiliário?", a: "A integração direta com CRMs está no roadmap. Hoje a automação via n8n já permite conectar com diversas plataformas externas." },
  { q: "É possível controlar o consumo de créditos por corretor?", a: "Sim. O dashboard de operações mostra o consumo detalhado por usuário, por tipo de operação e por período." },
  { q: "Como faço o onboarding da minha equipe?", a: "O setup básico é feito em menos de 30 minutos. Disponibilizamos material de treinamento e suporte via WhatsApp para a equipe." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const ParaImobiliariasPage = () => (
  <IcpPageShell>
    {/* ── Hero ── */}
    <IcpHero
      badge={
        <ProofBadge variant="gold" icon={<Building2 className="w-3.5 h-3.5" />}>
          Para Imobiliárias
        </ProofBadge>
      }
      headline={
        <>
          Padronize e escale o marketing da sua imobiliária{" "}
          <span className="text-gold">com IA.</span>
        </>
      }
      description="Enquanto sua equipe gasta horas em ferramentas desconectadas, a concorrência já produz 3x mais conteúdo com mais consistência. O DB8 Intelligence centraliza tudo: brand kits, aprovação, volume e rastreabilidade — em um único painel."
      ctaLabel="Solicitar demonstração"
      stats={[
        { value: "3x", label: "mais volume de conteúdo" },
        { value: "80%", label: "menos tempo de produção" },
        { value: "Zero", label: "erros de brand" },
      ]}
    />

    {/* ── Pain Points ── */}
    <section className="section-py section-px bg-section-dark relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">O problema real</ProofBadge>}
          title={<>Por que a maioria das imobiliárias <span className="text-gold">não escala o marketing?</span></>}
          subtitle="Não é falta de imóveis. É falta de sistema."
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
          badge={<ProofBadge variant="gold">Solução</ProofBadge>}
          title={<>Uma operação de marketing <span className="text-gold">profissional e escalável</span></>}
          subtitle="Do brand kit à aprovação final — tudo centralizado, rastreável e padronizado."
          className="mb-14"
        />
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <FeatureCard key={b.title} {...b} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── Operational Gains ── */}
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">Resultados operacionais</ProofBadge>}
          title={<>O que imobiliárias ganham <span className="text-gold">nos primeiros 30 dias</span></>}
          className="mb-12"
        />
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {gains.map((g) => (
            <MetricCard key={g.label} value={g.value} label={g.label} variant={g.variant} />
          ))}
        </StaggerChildren>
      </div>
    </section>

    {/* ── How it works ── */}
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">Como funciona</ProofBadge>}
          title={<>Configure, produza e aprove <span className="text-gold">em 3 passos</span></>}
          subtitle="Implementação em menos de 30 minutos. Resultados no mesmo dia."
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
    <section className="section-py section-px bg-section-dark">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="gold">Cases</ProofBadge>}
          title={<>Imobiliárias que <span className="text-gold">escalaram com o DB8</span></>}
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
    <section className="section-py section-px bg-section-ocean">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">FAQ</ProofBadge>}
          title="Perguntas frequentes"
          subtitle="O que gestores e diretores de imobiliárias costumam perguntar antes de implementar."
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
      badge={<ProofBadge variant="gold" icon={<Sparkles className="w-3.5 h-3.5" />}>Implementação em 30 minutos</ProofBadge>}
      title={<>Sua imobiliária produzindo mais em <span className="text-gold">menos de uma semana.</span></>}
      subtitle="Sem contrato de longo prazo. Sem custo de implementação. Sem necessidade de equipe técnica."
      primaryCta={
        <Link to="/auth" className="btn-primary group">
          Solicitar demonstração
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      }
    />
  </IcpPageShell>
);

export default ParaImobiliariasPage;
