import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUpVariants } from "./Animations";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ quote, author, role, company, avatar, rating = 5, className = "" }: TestimonialCardProps) {
  return (
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-4 ${className}`}
    >
      {/* stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={13} className="fill-[var(--ds-gold)] text-[var(--ds-gold)]" />
        ))}
      </div>

      {/* quote */}
      <p className="ds-body text-sm leading-relaxed flex-1">"{quote}"</p>

      {/* author */}
      <div className="flex items-center gap-3 pt-1 border-t border-[var(--ds-border)]">
        {avatar ? (
          <img src={avatar} alt={author} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[rgba(212,175,55,0.15)] flex items-center justify-center text-[var(--ds-gold-light)] font-bold text-sm">
            {author[0]}
          </div>
        )}
        <div>
          <div className="text-[var(--ds-fg)] text-sm font-semibold leading-none">{author}</div>
          <div className="text-[var(--ds-fg-muted)] text-xs mt-0.5">
            {role}{company ? ` · ${company}` : ""}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
