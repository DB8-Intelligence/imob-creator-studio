import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "./Animations";

interface MetricCardProps {
  value: ReactNode;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  variant?: "gold" | "cyan" | "default";
  className?: string;
}

const accentClass = {
  gold:    "text-gold",
  cyan:    "text-cyan-grad",
  default: "text-white",
};

export function MetricCard({ value, label, sublabel, icon, variant = "default", className = "" }: MetricCardProps) {
  return (
    <motion.div variants={fadeUpVariants} className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-2 ${className}`}>
      {icon && (
        <div className="mb-1 text-[var(--ds-gold)] opacity-80">{icon}</div>
      )}
      <div className={`font-display text-4xl font-bold leading-none ${accentClass[variant]}`}>
        {value}
      </div>
      <div className="text-[var(--ds-fg)] font-semibold text-sm leading-tight">{label}</div>
      {sublabel && (
        <div className="text-[var(--ds-fg-muted)] text-xs">{sublabel}</div>
      )}
    </motion.div>
  );
}
