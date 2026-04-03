import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { useRef, useEffect, ReactNode } from "react";

// ── Shared variants ──────────────────────────────────────────────────────────

export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeInVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

export const scaleInVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const slideRightVariants: Variants = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// ── useScrollReveal hook ─────────────────────────────────────────────────────

export function useScrollReveal(threshold = 0.15) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return { ref, controls };
}

// ── FadeIn ───────────────────────────────────────────────────────────────────

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: RevealProps) {
  const { ref, controls } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── SlideUp ──────────────────────────────────────────────────────────────────

export function SlideUp({ children, delay = 0, className }: RevealProps) {
  const { ref, controls } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeUpVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── ScaleIn ──────────────────────────────────────────────────────────────────

export function ScaleIn({ children, delay = 0, className }: RevealProps) {
  const { ref, controls } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={scaleInVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerChildren ──────────────────────────────────────────────────────────

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerChildren({ children, className, stagger = 0.1, delay = 0.05 }: StaggerProps) {
  const { ref, controls } = useScrollReveal();
  const containerVariants: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── FloatMotion — gentle infinite float ─────────────────────────────────────

export function FloatMotion({ children, className, duration = 6 }: { children: ReactNode; className?: string; duration?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

// ── HoverLift — card hover lift ──────────────────────────────────────────────

export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
