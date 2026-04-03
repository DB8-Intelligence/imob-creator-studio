import { Upload, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "./public/SectionHeader";
import { StaggerChildren, fadeUpVariants } from "./public/Animations";
import { ProofBadge } from "./public/ProofBadge";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Envie a imagem ou a ideia",
    description: "Suba fotos do imóvel, esboço do terreno, ou comece com um conceito simples. A plataforma aceita qualquer ponto de partida.",
    iconBg: "bg-[rgba(212,175,55,0.12)]",
    iconColor: "text-[var(--ds-gold-light)]",
    numBg: "from-[var(--ds-gold)] to-[var(--ds-gold-light)]",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "A IA gera o resultado",
    description: "Escolha o serviço — vídeo, staging, render, demarcação — e a IA entrega o resultado profissional em segundos.",
    iconBg: "bg-[rgba(0,242,255,0.1)]",
    iconColor: "text-[var(--ds-cyan)]",
    numBg: "from-[#0096CC] to-[var(--ds-cyan)]",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Baixe, publique ou refine",
    description: "Faça download, compare antes/depois, organize na biblioteca e publique direto nas redes sociais.",
    iconBg: "bg-[rgba(52,211,153,0.1)]",
    iconColor: "text-[#6EE7B7]",
    numBg: "from-[#059669] to-[#34D399]",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="section-py section-px bg-section-ocean relative overflow-hidden">
      <div className="section-container">
        <SectionHeader
          badge={<ProofBadge variant="default">Como funciona</ProofBadge>}
          title={<>Do upload ao resultado em{" "}<span className="text-gold">três passos</span></>}
          subtitle="Simples como deve ser. Envie, escolha o serviço e pronto."
          className="mb-16"
        />

        <div className="relative max-w-5xl mx-auto">
          {/* connecting line desktop */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-[var(--ds-border-2)] to-transparent" />

          <StaggerChildren className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <motion.div
                  variants={fadeUpVariants}
                  whileHover={{ y: -4, transition: { duration: 0.22 } }}
                  className="glass glass-hover rounded-2xl p-8 flex flex-col items-center text-center gap-5 h-full"
                >
                  {/* number badge */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.numBg} flex items-center justify-center shadow-lg shrink-0`}>
                    <span className="text-xl font-bold text-black">{step.number}</span>
                  </div>

                  {/* icon */}
                  <div className={`w-11 h-11 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-[var(--ds-fg)] font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="ds-body text-sm">{step.description}</p>
                  </div>
                </motion.div>

                {/* arrow between cards */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-[3.25rem] -right-4 w-8 h-8 items-center justify-center text-[var(--ds-border-2)] z-10">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
