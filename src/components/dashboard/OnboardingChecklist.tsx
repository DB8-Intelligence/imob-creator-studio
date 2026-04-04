/**
 * OnboardingChecklist — Dynamic activation checklist.
 * Replaces the static version. Reads from useOnboardingProgress.
 * Auto-hides when the user is fully activated OR has dismissed it.
 */
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingProgress, ONBOARDING_STEPS } from "@/hooks/useOnboardingProgress";
import type { OnboardingStepKey } from "@/hooks/useOnboardingProgress";

const OnboardingChecklist = () => {
  const { stepsDone, dismissed, isActivated, pct, loading, dismiss } = useOnboardingProgress();

  // Hide when dismissed or fully activated (all core steps done)
  if (dismissed || (isActivated && pct === 100)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <p className="text-sm font-medium text-accent">Ative sua operação</p>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {isActivated ? "Operação ativada!" : `${pct}% concluído`}
            </h2>
            {!isActivated && (
              <p className="text-sm text-muted-foreground mt-1">
                Complete os passos abaixo para desbloquear o fluxo completo de produção.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            title="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-accent"
          />
        </div>

        {/* Steps */}
        <div className="space-y-2.5">
          {ONBOARDING_STEPS.map((step, index) => {
            const done = stepsDone.has(step.key as OnboardingStepKey);
            return (
              <Link
                key={step.key}
                to={done ? "#" : step.actionPath}
                className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-all ${
                  done
                    ? "border-accent/20 bg-accent/5 opacity-70"
                    : "border-border/60 bg-card hover:border-accent/40 hover:shadow-sm"
                }`}
                onClick={(e) => done && e.preventDefault()}
              >
                <div className="flex items-start gap-3">
                  {loading ? (
                    <div className="w-5 h-5 rounded-full bg-muted animate-pulse mt-0.5" />
                  ) : done ? (
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Passo {index + 1}
                      {step.isCoreStep && <span className="ml-1 text-accent">• essencial</span>}
                    </p>
                    <h3 className={`font-semibold text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </h3>
                    {!done && (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
                {!done && <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingChecklist;
