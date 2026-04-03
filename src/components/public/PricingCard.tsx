import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUpVariants } from "./Animations";

interface PricingCardProps {
  plan: string;
  price: ReactNode;
  period?: string;
  description?: string;
  features: string[];
  cta: string;
  onCta?: () => void;
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export function PricingCard({
  plan,
  price,
  period = "/mês",
  description,
  features,
  cta,
  onCta,
  highlighted = false,
  badge,
  className = "",
}: PricingCardProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`relative flex flex-col rounded-2xl p-7 gap-6 overflow-hidden
        ${highlighted ? "glass-gold border border-[rgba(212,175,55,0.3)]" : "glass"} ${className}`}
    >
      {/* top gold line for highlighted */}
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ds-gold)] to-transparent" />
      )}

      {badge && (
        <div className="absolute top-4 right-4">
          <span className="badge-pill badge-gold text-xs">{badge}</span>
        </div>
      )}

      {/* header */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--ds-fg-muted)] text-xs font-semibold uppercase tracking-widest">
          {plan}
        </span>
        <div className="flex items-end gap-1 mt-1">
          <span className={`font-display text-4xl font-bold leading-none ${highlighted ? "text-gold" : "text-[var(--ds-fg)]"}`}>
            {price}
          </span>
          {period && (
            <span className="text-[var(--ds-fg-muted)] text-sm mb-1">{period}</span>
          )}
        </div>
        {description && (
          <p className="ds-body text-sm mt-1">{description}</p>
        )}
      </div>

      {/* divider */}
      <div className="ds-divider" />

      {/* features */}
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--ds-fg-muted)]">
            <Check
              size={15}
              className={`shrink-0 mt-0.5 ${highlighted ? "text-[var(--ds-gold-light)]" : "text-[var(--ds-cyan)]"}`}
            />
            {feat}
          </li>
        ))}
      </ul>

      {/* cta */}
      <button
        onClick={onCta}
        className={highlighted ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}
      >
        {cta}
      </button>
    </motion.div>
  );
}
