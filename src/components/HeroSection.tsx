import { ArrowRight, Play, Video, Sofa, MapPin, Sparkles, Image, PenTool, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatMotion, StaggerChildren, fadeUpVariants } from "./public/Animations";

const services = [
  { icon: Image,    label: "Criativos com IA",      color: "bg-[rgba(212,175,55,0.12)]",   textColor: "text-[var(--ds-gold-light)]" },
  { icon: Video,    label: "Vídeos Cinemáticos",    color: "bg-[rgba(0,178,255,0.1)]",     textColor: "text-[#60C8FF]" },
  { icon: Sofa,     label: "Mobiliar Ambientes",    color: "bg-[rgba(52,211,153,0.1)]",    textColor: "text-[#6EE7B7]" },
  { icon: MapPin,   label: "Demarcar Terrenos",     color: "bg-[rgba(251,113,133,0.1)]",   textColor: "text-[#FCA5A5]" },
  { icon: PenTool,  label: "Render de Esboços",     color: "bg-[rgba(167,139,250,0.1)]",   textColor: "text-[#C4B5FD]" },
  { icon: Sparkles, label: "Reformar Imóveis",      color: "bg-[rgba(0,242,255,0.1)]",     textColor: "text-[var(--ds-cyan)]" },
];

const stats = [
  { value: "< 5 min", label: "para gerar criativo e vídeo" },
  { value: "8 serviços", label: "de IA imobiliária integrados" },
  { value: "100% IA", label: "Gemini + Veo 3.1" },
  { value: "4 planos", label: "do starter ao premium" },
];

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen pt-24 overflow-hidden bg-hero bg-ds">
      {/* grid */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* glows */}
      <FloatMotion duration={8} className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-[rgba(212,175,55,0.07)] blur-[100px]" />
      </FloatMotion>
      <div className="absolute bottom-1/4 -left-20 w-[350px] h-[350px] bg-[rgba(0,242,255,0.04)] rounded-full blur-[90px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center pb-24"
      >
        {/* Badge */}
        <motion.div variants={fadeUpVariants} className="mb-7">
          <span className="badge-pill badge-gold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <span className="text-emerald-400 font-semibold">Novo</span>
            Plataforma completa de IA para o mercado imobiliário
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUpVariants} className="ds-h1 max-w-5xl mb-6">
          Transforme imóveis em{" "}
          <span className="text-gold">conteúdo que vende</span>{" "}com IA
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUpVariants} className="ds-body text-lg sm:text-xl max-w-3xl mb-10">
          Gere vídeos cinemáticos, mobilie ambientes, crie artes profissionais, demarque terrenos e muito mais —
          tudo em uma única plataforma com Gemini e Veo 3.1.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <Link to="/auth" className="btn-primary">
            Começar agora
            <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="#como-funciona" className="btn-secondary flex items-center gap-2.5">
            <Play className="w-4 h-4" />
            Ver demonstração
          </a>
        </motion.div>

        {/* Service pills */}
        <motion.div variants={fadeUpVariants} className="flex flex-wrap items-center justify-center gap-2.5 mb-16">
          {services.map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -2, scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full glass cursor-default"
            >
              <span className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-3.5 h-3.5 ${s.textColor}`} />
              </span>
              <span className="text-sm text-[var(--ds-fg-muted)] font-medium">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUpVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="glass glass-hover rounded-2xl p-5 flex flex-col gap-1"
            >
              <p className="text-2xl sm:text-3xl font-bold text-[var(--ds-fg)] font-display">{stat.value}</p>
              <p className="text-xs sm:text-sm text-[var(--ds-fg-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </StaggerChildren>

        {/* trust micro-line */}
        <motion.div variants={fadeUpVariants} className="mt-10 flex items-center gap-2 text-[var(--ds-fg-subtle)] text-xs">
          <Zap size={13} className="text-[var(--ds-gold-dim)]" />
          Sem cartão de crédito · Cancele a qualquer momento · Suporte em português
        </motion.div>
      </motion.div>

      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--ds-bg)] to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
