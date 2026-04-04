/**
 * /dashboard/funnel — Personal funnel + activation analytics.
 * Shows the user their own conversion journey, where they are,
 * time-to-activation, and concrete suggestions to move forward.
 */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Clock, Zap, ArrowRight, CheckCircle2, Circle, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/services/analytics/eventTracker";
import {
  getPersonalFunnelData, mapFunnelData, getFunnelSuggestions,
  minutesBetween, formatMinutes, FUNNEL_STAGES,
} from "@/lib/funnelTracker";
import { useOnboardingProgress, ONBOARDING_STEPS } from "@/hooks/useOnboardingProgress";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ── Funnel bar ────────────────────────────────────────────────────────────────

function FunnelBar({ label, reached, color, pct, reachedAt }: {
  label:     string;
  reached:   boolean;
  color:     string;
  pct:       number;
  reachedAt: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={reached ? "font-semibold text-[var(--ds-fg)]" : "text-[var(--ds-fg-muted)]"}>{label}</span>
        {reached
          ? <span className="text-emerald-400 font-medium">✓ concluído</span>
          : <span className="text-[var(--ds-fg-subtle)]">pendente</span>}
      </div>
      <div className="w-full h-2 bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: reached ? "100%" : `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: reached ? color : "rgba(255,255,255,0.12)" }}
        />
      </div>
      {reachedAt && (
        <p className="text-[10px] text-[var(--ds-fg-subtle)]">
          {new Date(reachedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      )}
    </div>
  );
}

// ── Suggestion card ───────────────────────────────────────────────────────────

function SuggestionCard({ title, description, priority, actionLabel, actionPath }: {
  title:       string;
  description: string;
  priority:    "high" | "medium" | "low";
  actionLabel: string;
  actionPath?: string;
}) {
  const priColors = {
    high:   "border-red-500/20   bg-red-500/5   text-red-400",
    medium: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    low:    "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)]",
  };
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${priColors[priority]}`}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--ds-fg)]">{title}</p>
        <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{description}</p>
      </div>
      {actionPath && (
        <Link
          to={actionPath}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[var(--ds-cyan)] hover:underline"
        >
          {actionLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon:   React.ElementType;
  label:  string;
  value:  string | number;
  sub?:   string;
  accent: string;
}) {
  return (
    <motion.div variants={fadeUpVariants} className="glass rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4`} style={{ background: `${accent}14` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-xl font-bold text-[var(--ds-fg)]">{value}</p>
      <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FunnelDashboardPage() {
  const { user } = useAuth();
  const { stepsDone, pct: onbPct, isActivated } = useOnboardingProgress();

  const { data: funnelData, isLoading } = useQuery({
    queryKey: ["personal-funnel", user?.id],
    queryFn:  () => getPersonalFunnelData(user!.id),
    enabled:  !!user,
  });

  useEffect(() => {
    if (user) trackEvent(user.id, "funnel_viewed");
  }, [user]);

  const stages      = mapFunnelData(funnelData ?? null);
  const suggestions = getFunnelSuggestions(funnelData ?? null);
  const reachedCount = stages.filter((s) => s.count > 0).length;

  // Time-to-first-creative
  const ttfc = minutesBetween(funnelData?.signup_at ?? null, funnelData?.first_creative_at ?? null);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--ds-bg)] section-px py-10">
        <div className="section-container max-w-3xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--ds-cyan)]" />
              <h1 className="text-xl font-bold text-[var(--ds-fg)]">Jornada de Ativação</h1>
            </div>
            <p className="text-[var(--ds-fg-muted)] text-sm">
              Acompanhe sua progressão no funil — do cadastro à conversão.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-20 text-[var(--ds-fg-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando dados...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8">

              {/* KPI row */}
              <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Zap}
                  label="Etapas concluídas"
                  value={`${reachedCount}/${FUNNEL_STAGES.length}`}
                  accent="var(--ds-cyan)"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Onboarding"
                  value={`${onbPct}%`}
                  sub={isActivated ? "ativado!" : "em progresso"}
                  accent={isActivated ? "#34D399" : "var(--ds-gold)"}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Criativos gerados"
                  value={funnelData?.total_creatives ?? 0}
                  accent="#C4B5FD"
                />
                <StatCard
                  icon={Clock}
                  label="Tempo até 1º criativo"
                  value={ttfc !== null ? formatMinutes(ttfc) : "—"}
                  sub={ttfc !== null ? "desde o cadastro" : "nenhum criativo ainda"}
                  accent="var(--ds-gold)"
                />
              </StaggerChildren>

              {/* Funnel stages */}
              <div className="glass rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-5">
                  Funil de conversão
                </p>
                <div className="flex flex-col gap-4">
                  {stages.map((s, i) => {
                    // Visual fill based on position in funnel
                    const basePct = ((stages.length - i) / stages.length) * 100;
                    return (
                      <FunnelBar
                        key={s.key}
                        label={s.label}
                        reached={s.count > 0}
                        color={s.color}
                        pct={basePct}
                        reachedAt={s.reachedAt}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Onboarding checklist mini */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">
                    Checklist de ativação
                  </p>
                  <span className="text-xs text-[var(--ds-fg-muted)]">{onbPct}% completo</span>
                </div>
                <div className="flex flex-col gap-2">
                  {ONBOARDING_STEPS.map((step) => {
                    const done = stepsDone.has(step.key);
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          : <Circle className="w-4 h-4 text-[var(--ds-fg-subtle)] shrink-0" />
                        }
                        <span className={`text-sm flex-1 ${done ? "line-through text-[var(--ds-fg-muted)]" : "text-[var(--ds-fg)]"}`}>
                          {step.label}
                        </span>
                        {!done && (
                          <Link
                            to={step.actionPath}
                            className="text-xs text-[var(--ds-cyan)] hover:underline shrink-0"
                          >
                            Ir →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-3">
                    Oportunidades de otimização
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <SuggestionCard
                        key={s.stage + s.title}
                        title={s.title}
                        description={s.description}
                        priority={s.priority}
                        actionLabel={s.action}
                        actionPath={s.actionPath}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All done state */}
              {suggestions.length === 0 && reachedCount === FUNNEL_STAGES.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="font-semibold text-[var(--ds-fg)] mb-1">Funil completo!</p>
                  <p className="text-sm text-[var(--ds-fg-muted)]">
                    Você completou todas as etapas do funil de conversão. Continue gerando conteúdo e indicando a plataforma para novos corretores.
                  </p>
                  <Link to="/referral" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[var(--ds-gold)] hover:underline">
                    Programa de Indicações <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}

            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
