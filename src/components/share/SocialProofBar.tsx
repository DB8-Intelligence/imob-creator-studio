/**
 * SocialProofBar — Bloc 4
 * Animated strip: "X conteúdos hoje · Y usuários ativos · Z imóveis"
 * Used on landing page, ICP pages, and dashboard.
 */
import { Sparkles, Users, Building2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { usePlatformStats } from "@/hooks/usePlatformStats";

interface SocialProofBarProps {
  variant?: "landing" | "dashboard"; // landing = full-width section, dashboard = compact pill
  className?: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

// ── Stat item ─────────────────────────────────────────────────────────────────

interface StatItemProps {
  icon:  React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-[var(--ds-cyan)]">{icon}</span>
      <span className="font-semibold text-[var(--ds-fg)]">{value}</span>
      <span className="text-[var(--ds-fg-muted)]">{label}</span>
    </span>
  );
}

// ── Separator ─────────────────────────────────────────────────────────────────

function Sep() {
  return <span className="text-[var(--ds-border-2)] select-none">·</span>;
}

// ─── Landing variant ──────────────────────────────────────────────────────────

function LandingBar({ stats, loading }: { stats: ReturnType<typeof usePlatformStats>["stats"]; loading: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-4 section-px bg-[var(--ds-surface)] border-y border-[var(--ds-border)]"
    >
      <div
        className={`section-container flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
      >
        <StatItem icon={<Sparkles className="w-3.5 h-3.5" />} value={formatNumber(stats.creativesToday)}       label="conteúdos gerados hoje" />
        <Sep />
        <StatItem icon={<Users      className="w-3.5 h-3.5" />} value={formatNumber(stats.activeUsersToday)}   label="profissionais ativos" />
        <Sep />
        <StatItem icon={<Building2  className="w-3.5 h-3.5" />} value={formatNumber(stats.propertiesProcessed)} label="imóveis processados" />
        <Sep />
        <StatItem icon={<ImageIcon  className="w-3.5 h-3.5" />} value={formatNumber(stats.creativesTotal)}     label="criativos gerados no total" />
      </div>
    </motion.section>
  );
}

// ── Dashboard variant (compact pill) ─────────────────────────────────────────

function DashboardBar({ stats, loading }: { stats: ReturnType<typeof usePlatformStats>["stats"]; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: loading ? 0 : 1, y: loading ? 6 : 0 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] text-xs"
    >
      <StatItem icon={<Sparkles className="w-3 h-3" />} value={formatNumber(stats.creativesToday)} label="hoje" />
      <Sep />
      <StatItem icon={<Users className="w-3 h-3" />} value={formatNumber(stats.activeUsersToday)} label="ativos" />
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SocialProofBar({ variant = "landing", className = "" }: SocialProofBarProps) {
  const { stats, loading } = usePlatformStats();

  return (
    <div className={className}>
      {variant === "landing"
        ? <LandingBar  stats={stats} loading={loading} />
        : <DashboardBar stats={stats} loading={loading} />
      }
    </div>
  );
}
