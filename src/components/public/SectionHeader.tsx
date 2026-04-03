import { ReactNode } from "react";
import { SlideUp, StaggerChildren, fadeUpVariants } from "./Animations";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  maxWidth?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center",
  maxWidth = "max-w-2xl",
  className = "",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <StaggerChildren className={`flex flex-col gap-4 ${alignClass} ${align === "center" ? "mx-auto" : ""} ${maxWidth} ${className}`}>
      {badge && (
        <motion.div variants={fadeUpVariants}>
          {badge}
        </motion.div>
      )}
      <motion.h2 variants={fadeUpVariants} className="ds-h2">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUpVariants} className="ds-body text-lg">
          {subtitle}
        </motion.p>
      )}
    </StaggerChildren>
  );
}
