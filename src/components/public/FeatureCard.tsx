import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "./Animations";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  highlight?: boolean;
  className?: string;
}

export function FeatureCard({ icon, title, description, badge, highlight = false, className = "" }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group ${highlight ? "glass-gold" : ""} ${className}`}
    >
      {/* subtle top-line accent */}
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent opacity-60" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className={`p-2.5 rounded-xl ${highlight ? "bg-[rgba(212,175,55,0.12)]" : "bg-[rgba(255,255,255,0.06)]"} shrink-0`}>
          <span className={highlight ? "text-[var(--ds-gold-light)]" : "text-[var(--ds-fg-muted)]"}>
            {icon}
          </span>
        </div>
        {badge && (
          <span className={`badge-pill text-xs ${highlight ? "badge-gold" : ""}`}>{badge}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-[var(--ds-fg)] font-semibold text-base leading-snug">{title}</h3>
        <p className="ds-body text-sm">{description}</p>
      </div>
    </motion.div>
  );
}
