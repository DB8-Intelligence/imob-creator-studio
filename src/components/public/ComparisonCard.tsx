import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { fadeUpVariants } from "./Animations";

interface ComparisonRow {
  feature: string;
  ours: boolean | string;
  theirs: boolean | string;
}

interface ComparisonCardProps {
  ourLabel?: string;
  theirLabel?: string;
  rows: ComparisonRow[];
  className?: string;
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={16} className="text-[var(--ds-gold-light)]" />
    ) : (
      <X size={16} className="text-[var(--ds-fg-subtle)]" />
    );
  }
  return <span className="text-[var(--ds-fg)] text-sm">{value}</span>;
}

export function ComparisonCard({ ourLabel = "ImobCreator", theirLabel = "Concorrentes", rows, className = "" }: ComparisonCardProps) {
  return (
    <motion.div variants={fadeUpVariants} className={`glass rounded-2xl overflow-hidden ${className}`}>
      {/* header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 border-b border-[var(--ds-border)] bg-[rgba(255,255,255,0.02)]">
        <span className="text-[var(--ds-fg-muted)] text-xs uppercase tracking-widest font-semibold">Recurso</span>
        <span className="text-[var(--ds-gold-light)] text-xs font-bold w-24 text-center">{ourLabel}</span>
        <span className="text-[var(--ds-fg-muted)] text-xs font-medium w-24 text-center">{theirLabel}</span>
      </div>

      {/* rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3.5 items-center
            ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.015)]"}
            border-b border-[var(--ds-border)] last:border-0`}
        >
          <span className="text-[var(--ds-fg)] text-sm">{row.feature}</span>
          <span className="w-24 flex justify-center"><Cell value={row.ours} /></span>
          <span className="w-24 flex justify-center"><Cell value={row.theirs} /></span>
        </div>
      ))}
    </motion.div>
  );
}
