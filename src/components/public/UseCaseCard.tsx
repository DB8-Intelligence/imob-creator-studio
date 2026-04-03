import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUpVariants } from "./Animations";

interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  tags?: string[];
  href?: string;
  className?: string;
}

export function UseCaseCard({ icon, title, description, tags, href, className = "" }: UseCaseCardProps) {
  const Tag = href ? motion.a : motion.div;

  return (
    <Tag
      variants={fadeUpVariants}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      {...(href ? { href } : {})}
      className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-4 group cursor-default ${href ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="w-11 h-11 rounded-xl bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--ds-gold-light)] shrink-0">
        {icon}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-[var(--ds-fg)] font-semibold text-base leading-snug flex items-center justify-between gap-2">
          {title}
          {href && (
            <ArrowRight size={15} className="text-[var(--ds-fg-subtle)] group-hover:text-[var(--ds-gold)] group-hover:translate-x-1 transition-all" />
          )}
        </h3>
        <p className="ds-body text-sm">{description}</p>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((t) => (
            <span key={t} className="badge-pill text-xs">{t}</span>
          ))}
        </div>
      )}
    </Tag>
  );
}
