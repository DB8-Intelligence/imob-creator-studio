import { ReactNode } from "react";
import { motion } from "framer-motion";
import { StaggerChildren, fadeUpVariants } from "./Animations";

interface CTABannerProps {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  className?: string;
}

export function CTABanner({ badge, title, subtitle, primaryCta, secondaryCta, className = "" }: CTABannerProps) {
  return (
    <section className={`section-py section-px relative overflow-hidden ${className}`}>
      {/* glows */}
      <div className="glow-gold w-[600px] h-[600px] -top-[200px] left-1/2 -translate-x-1/2" />
      <div className="glow-cyan w-[400px] h-[400px] -bottom-[100px] right-1/4" />

      <div className="section-container relative z-10">
        {/* glass card */}
        <StaggerChildren className="glass glass-gold rounded-3xl p-10 lg:p-16 flex flex-col items-center text-center gap-6 relative overflow-hidden">
          {/* top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent opacity-50" />

          {badge && (
            <motion.div variants={fadeUpVariants}>{badge}</motion.div>
          )}

          <motion.h2 variants={fadeUpVariants} className="ds-h2 max-w-2xl">
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p variants={fadeUpVariants} className="ds-body text-lg max-w-xl">
              {subtitle}
            </motion.p>
          )}

          {(primaryCta || secondaryCta) && (
            <motion.div variants={fadeUpVariants} className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {primaryCta}
              {secondaryCta}
            </motion.div>
          )}
        </StaggerChildren>
      </div>
    </section>
  );
}
