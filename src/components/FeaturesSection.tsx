import { Video, Image, Sofa, Hammer, PenTool, MapPin, Building2, ZoomIn, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "./public/SectionHeader";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";
import { ProofBadge } from "./public/ProofBadge";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  tag?: string;
}

const features: Feature[] = [
  {
    icon: Image,
    title: "Criativos com IA",
    description: "Gere posts, stories e artes profissionais a partir de fotos ou ideias. Copy, design e variações em um clique.",
    iconBg: "bg-[rgba(212,175,55,0.12)]",
    iconColor: "text-[var(--ds-gold-light)]",
  },
  {
    icon: Video,
    title: "Vídeos Cinematográficos",
    description: "Transforme fotos em vídeos com movimento de câmera, zoom e pan. 5 estilos: cinematic, luxury, drone, walkthrough e moderno.",
    iconBg: "bg-[rgba(0,178,255,0.1)]",
    iconColor: "text-[#60C8FF]",
    tag: "Veo 3.1",
  },
  {
    icon: Sofa,
    title: "Mobiliar Ambientes",
    description: "Decore ambientes vazios com 7 estilos profissionais. IA preenche o espaço com mobília realista instantaneamente.",
    iconBg: "bg-[rgba(52,211,153,0.1)]",
    iconColor: "text-[#6EE7B7]",
    tag: "Novo",
  },
  {
    icon: Hammer,
    title: "Reformar e Valorizar",
    description: "Visualize como ficaria um imóvel reformado antes de investir. 5 estilos de renovação para impressionar clientes.",
    iconBg: "bg-[rgba(251,113,133,0.1)]",
    iconColor: "text-[#FCA5A5]",
    tag: "Novo",
  },
  {
    icon: PenTool,
    title: "Render de Esboços",
    description: "Transforme esboços e plantas baixas em renders fotorealistas. Do rascunho ao visual profissional em segundos.",
    iconBg: "bg-[rgba(167,139,250,0.1)]",
    iconColor: "text-[#C4B5FD]",
    tag: "Novo",
  },
  {
    icon: Building2,
    title: "Terreno Vazio",
    description: "Envie foto de um terreno e visualize como ficaria com construção: residencial, comercial, condomínio, galpão ou misto.",
    iconBg: "bg-[rgba(0,242,255,0.1)]",
    iconColor: "text-[var(--ds-cyan)]",
    tag: "Novo",
  },
  {
    icon: MapPin,
    title: "Demarcar Terrenos",
    description: "Gere demarcações visuais, medidas estimadas, divisão de lotes e até visualização 3D do terreno com IA.",
    iconBg: "bg-[rgba(251,113,133,0.1)]",
    iconColor: "text-[#FCA5A5]",
    tag: "Novo",
  },
  {
    icon: ZoomIn,
    title: "Upscale de Imagem",
    description: "Melhore a qualidade de fotos de imóveis: resolução, iluminação, cores e nitidez — sem alterar o conteúdo.",
    iconBg: "bg-[rgba(56,189,248,0.1)]",
    iconColor: "text-[#7DD3FC]",
  },
];

const FeaturesSection = () => {
  return (
    <section id="criativos" className="section-py section-px bg-section-dark relative overflow-hidden">
      {/* subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[rgba(212,175,55,0.04)] rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative">
        <SectionHeader
          badge={
            <ProofBadge variant="gold" icon={<span className="w-1.5 h-1.5 bg-[var(--ds-gold)] rounded-full" />}>
              8 Serviços de IA Integrados
            </ProofBadge>
          }
          title={
            <>Tudo que o mercado imobiliário precisa,{" "}<span className="text-gold">em uma plataforma</span></>
          }
          subtitle="Da criação de artes à geração de vídeos, do staging virtual à demarcação de terrenos — todos os serviços conectados por IA."
          className="mb-16"
        />

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUpVariants}
              whileHover={{ y: -4, transition: { duration: 0.22 } }}
              className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group"
            >
              {feature.tag && (
                <span className="absolute top-4 right-4 badge-pill badge-gold text-[10px] uppercase tracking-wide">
                  {feature.tag}
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[var(--ds-fg)] font-semibold text-base leading-snug">{feature.title}</h3>
                <p className="ds-body text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default FeaturesSection;
