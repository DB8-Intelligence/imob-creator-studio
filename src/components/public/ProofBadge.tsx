import { ReactNode } from "react";

type Variant = "default" | "gold" | "cyan" | "green";

const variantClass: Record<Variant, string> = {
  default: "badge-pill",
  gold:    "badge-pill badge-gold",
  cyan:    "badge-pill badge-cyan",
  green:   "badge-pill badge-green",
};

interface ProofBadgeProps {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

export function ProofBadge({ children, variant = "default", icon, className = "" }: ProofBadgeProps) {
  return (
    <span className={`${variantClass[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
