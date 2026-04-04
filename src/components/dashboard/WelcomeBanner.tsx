/**
 * WelcomeBanner — shown to new users on their first dashboard visit.
 * Disappears after the user dismisses or completes all core onboarding steps.
 */
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

const QUICK_ACTIONS = [
  { label: "Enviar imóvel",       path: "/upload",          accent: "cyan"   },
  { label: "Criar criativo",      path: "/create",          accent: "gold"   },
  { label: "Ver templates",       path: "/templates",       accent: "purple" },
] as const;

const accentMap = {
  cyan:   "bg-[rgba(0,242,255,0.08)]  text-[var(--ds-cyan)]  border-[rgba(0,242,255,0.2)]",
  gold:   "bg-[rgba(212,175,55,0.08)] text-[var(--ds-gold)]  border-[rgba(212,175,55,0.2)]",
  purple: "bg-[rgba(167,139,250,0.08)]text-[#C4B5FD]         border-[rgba(167,139,250,0.2)]",
};

export function WelcomeBanner() {
  const { profile }                       = useAuth();
  const { isActivated, dismissed, dismiss } = useOnboardingProgress();

  // Hide when user is activated or has already dismissed
  if (isActivated || dismissed) return null;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1,  y: 0   }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden border border-[var(--ds-border)] bg-gradient-to-br from-[rgba(0,242,255,0.04)] via-[var(--ds-surface)] to-[rgba(212,175,55,0.04)] p-6"
      >
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[rgba(0,242,255,0.05)] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[rgba(0,242,255,0.1)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[var(--ds-cyan)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ds-fg)]">
                  Bem-vindo, {firstName}!
                </p>
                <p className="text-xs text-[var(--ds-fg-muted)]">
                  Vamos criar seu primeiro conteúdo imobiliário com IA.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="text-[var(--ds-fg-subtle)] hover:text-[var(--ds-fg-muted)] transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-90 ${accentMap[a.accent]}`}
              >
                {a.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
