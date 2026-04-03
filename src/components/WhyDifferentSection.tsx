import { Brain, Building2, CheckCircle2, Workflow, Shield, Zap, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "./public/SectionHeader";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";
import { ProofBadge } from "./public/ProofBadge";

interface Differentiator {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const differentiators: Differentiator[] = [
  {
    icon: Building2,
    title: "Feito para o mercado imobiliário",
    description: "Todos os serviços são especializados em imóveis: decoração, vídeos, terrenos, reformas e artes com copy otimizada.",
    iconBg: "bg-[rgba(212,175,55,0.12)]",
    iconColor: "text-[var(--ds-gold-light)]",
  },
  {
    icon: Brain,
    title: "IA de ponta: Gemini + Veo 3.1",
    description: "Usamos os modelos mais avançados do Google para gerar imagens, vídeos e edições com qualidade profissional.",
    iconBg: "bg-[rgba(0,178,255,0.1)]",
    iconColor: "text-[#60C8FF]",
  },
  {
    icon: Zap,
    title: "8 serviços em 1 plataforma",
    description: "Criativos, vídeos, staging, reforma, render, terreno vazio, demarcação e upscale — tudo integrado.",
    iconBg: "bg-[rgba(52,211,153,0.1)]",
    iconColor: "text-[#6EE7B7]",
  },
  {
    icon: CheckCircle2,
    title: "Brand kit + aprovação",
    description: "Padronize marca por cliente e revise tudo antes de publicar com uma operação segura e profissional.",
    iconBg: "bg-[rgba(167,139,250,0.1)]",
    iconColor: "text-[#C4B5FD]",
  },
  {
    icon: Workflow,
    title: "Dashboard + automação",
    description: "Produção no painel com biblioteca, eventos operacionais e automação via n8n integrada.",
    iconBg: "bg-[rgba(251,113,133,0.1)]",
    iconColor: "text-[#FCA5A5]",
  },
  {
    icon: Shield,
    title: "Controle por planos",
    description: "Sistema de créditos e features por plano. Cada operação consome créditos proporcionais à complexidade.",
    iconBg: "bg-[rgba(0,242,255,0.1)]",
    iconColor: "text-[var(--ds-cyan)]",
  },
];

const WhyDifferentSection = () => {
  return (
    <section className="section-py section-px bg-section-ocean relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="cyan">Por que somos diferentes</ProofBadge>}
          title={<>Mais que um gerador visual:{" "}<span className="text-gold">uma operação criativa completa</span></>}
          subtitle="Enquanto geradores genéricos vendem rapidez, o DB8 Intelligence combina IA de ponta com especialização imobiliária."
          className="mb-14"
        />

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {differentiators.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUpVariants}
              whileHover={{ y: -4, transition: { duration: 0.22 } }}
              className="glass glass-hover rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <h3 className="text-[var(--ds-fg)] font-semibold text-base mb-1.5">{item.title}</h3>
                <p className="ds-body text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
