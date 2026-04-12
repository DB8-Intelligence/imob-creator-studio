import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FloatMotion } from "./Animations";

interface StatItem {
  value: string;
  label: string;
}

interface IcpHeroProps {
  badge: ReactNode;
  headline: ReactNode;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  stats?: StatItem[];
  /** Optional right-side visual slot */
  visual?: ReactNode;
}

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function IcpHero({
  badge,
  headline,
  description,
  ctaLabel = "Começar gratuitamente",
  ctaHref = "/auth",
  stats,
  visual,
}: IcpHeroProps) {
  return (
    <section className="relative min-h-[92vh] pt-28 pb-20 overflow-hidden bg-hero bg-ds">
      {/* grid + glows */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <FloatMotion duration={9} className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-[rgba(212,175,55,0.06)] blur-[100px]" />
      </FloatMotion>
      <div className="absolute bottom-1/3 -right-16 w-[300px] h-[300px] bg-[rgba(0,242,255,0.04)] rounded-full blur-[80px] pointer-events-none" />

      <div className="section-container relative">
        <div className={`grid ${visual ? "grid-cols-1 lg:grid-cols-2 gap-16 items-center" : "grid-cols-1 max-w-3xl mx-auto text-center"}`}>
          {/* Copy side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex flex-col ${visual ? "gap-6" : "gap-6 items-center"}`}
          >
            <motion.div variants={itemVariants}>{badge}</motion.div>

            <motion.h1 variants={itemVariants} className="ds-h1 text-[clamp(2.25rem,5vw,4rem)]">
              {headline}
            </motion.h1>

            <motion.p variants={itemVariants} className="ds-body text-lg leading-relaxed max-w-xl">
              {description}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Link to={ctaHref} className="btn-primary">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://wa.me/5571999733883?text=Olá!+Tenho+interesse+no+NexoImob+AI"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com especialista
              </a>
            </motion.div>

            {stats && stats.length > 0 && (
              <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-2">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span className="text-2xl font-bold text-gold font-display leading-none">{s.value}</span>
                    <span className="text-[var(--ds-fg-muted)] text-xs">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Optional visual */}
          {visual && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {visual}
            </motion.div>
          )}
        </div>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--ds-bg)] to-transparent pointer-events-none" />
    </section>
  );
}
