/**
 * useOnboardingProgress — per-user activation checklist state.
 *
 * Steps:
 *   account_created      → always done (user is logged in)
 *   property_uploaded    → inferred from user_events (any 'creative_generated' or properties count)
 *   creative_generated   → inferred from user_events
 *   brand_kit_created    → inferred from user_events
 *   content_shared       → inferred from user_events ('first_share')
 *
 * Persisted in onboarding_progress.steps_done via upsert.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/services/analytics/eventTracker";

// ── Step definitions ──────────────────────────────────────────────────────────

export type OnboardingStepKey =
  | "account_created"
  | "property_uploaded"
  | "creative_generated"
  | "brand_kit_created"
  | "content_shared";

export interface OnboardingStep {
  key:         OnboardingStepKey;
  label:       string;
  description: string;
  actionLabel: string;
  actionPath:  string;
  isCoreStep:  boolean;    // counts toward "activated" threshold
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key:         "account_created",
    label:       "Conta criada",
    description: "Bem-vindo! Sua conta está ativa.",
    actionLabel: "Ver dashboard",
    actionPath:  "/dashboard",
    isCoreStep:  true,
  },
  {
    key:         "property_uploaded",
    label:       "Envie seu primeiro imóvel",
    description: "Suba fotos de um imóvel para gerar criativos com IA.",
    actionLabel: "Enviar imóvel",
    actionPath:  "/upload",
    isCoreStep:  true,
  },
  {
    key:         "creative_generated",
    label:       "Gere seu primeiro criativo",
    description: "Crie um post, story ou carrossel profissional em minutos.",
    actionLabel: "Criar criativo",
    actionPath:  "/create",
    isCoreStep:  true,
  },
  {
    key:         "brand_kit_created",
    label:       "Configure seu Brand Kit",
    description: "Defina logo, cores e identidade visual da sua marca.",
    actionLabel: "Configurar marca",
    actionPath:  "/brand-templates",
    isCoreStep:  false,
  },
  {
    key:         "content_shared",
    label:       "Compartilhe um criativo",
    description: "Publique ou compartilhe seu primeiro conteúdo criado.",
    actionLabel: "Ir para Biblioteca",
    actionPath:  "/library",
    isCoreStep:  false,
  },
];

const CORE_STEPS = ONBOARDING_STEPS.filter((s) => s.isCoreStep).map((s) => s.key);

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseOnboardingProgressResult {
  stepsDone:          Set<OnboardingStepKey>;
  dismissed:          boolean;
  activatedAt:        string | null;
  isActivated:        boolean;
  pct:                number;         // 0–100 based on all steps
  loading:            boolean;
  showWizard:         boolean;        // true if user hasn't started onboarding yet
  wizardStartedAt:    string | null;
  firstGenerationAt:  string | null;
  markStep:           (key: OnboardingStepKey) => Promise<void>;
  dismiss:            () => Promise<void>;
  completeWizard:     () => Promise<void>;
  refresh:            () => void;
}

export function useOnboardingProgress(): UseOnboardingProgressResult {
  const { user }              = useAuth();
  const [stepsDone, setStepsDone] = useState<Set<OnboardingStepKey>>(new Set(["account_created"]));
  const [dismissed, setDismissed] = useState(false);
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [wizardStartedAt, setWizardStartedAt] = useState<string | null>(null);
  const [firstGenerationAt, setFirstGenerationAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rev, setRev]         = useState(0);

  const refresh = useCallback(() => setRev((r) => r + 1), []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        // 1 — Fetch stored progress
        const { data: stored } = await supabase
          .from("onboarding_progress")
          .select("steps_done, dismissed, activated_at, wizard_started_at, first_generation_at, current_step")
          .eq("user_id", user!.id)
          .maybeSingle();

        // 2 — Infer steps from user_events
        const { data: events } = await supabase
          .from("user_events")
          .select("event_type")
          .eq("user_id", user!.id)
          .in("event_type", ["creative_generated", "brand_kit_created", "first_share"]);

        const inferred = new Set<OnboardingStepKey>(["account_created"]);
        if (events?.some((e) => e.event_type === "creative_generated")) {
          inferred.add("creative_generated");
          inferred.add("property_uploaded"); // can't generate without uploading
        }
        if (events?.some((e) => e.event_type === "brand_kit_created")) inferred.add("brand_kit_created");
        if (events?.some((e) => e.event_type === "first_share"))        inferred.add("content_shared");

        // 3 — Merge stored + inferred
        const storedSet = new Set<OnboardingStepKey>(
          ((stored?.steps_done ?? []) as OnboardingStepKey[])
        );
        const merged = new Set<OnboardingStepKey>([...storedSet, ...inferred]);

        if (!cancelled) {
          setStepsDone(merged);
          setDismissed(stored?.dismissed ?? false);
          setActivatedAt(stored?.activated_at ?? null);
          setWizardStartedAt(stored?.wizard_started_at ?? null);
          setFirstGenerationAt(stored?.first_generation_at ?? null);
        }

        // 4 — If all core steps done and not yet marked activated, update
        const coreAllDone = CORE_STEPS.every((k) => merged.has(k as OnboardingStepKey));
        if (coreAllDone && !stored?.activated_at) {
          await supabase.from("onboarding_progress").upsert({
            user_id:      user!.id,
            steps_done:   Array.from(merged),
            activated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
      } catch {
        // silently ignore — non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [user, rev]);

  const markStep = useCallback(async (key: OnboardingStepKey) => {
    if (!user || stepsDone.has(key)) return;
    const next = new Set(stepsDone);
    next.add(key);
    setStepsDone(next);

    const coreAllDone = CORE_STEPS.every((k) => next.has(k as OnboardingStepKey));
    await supabase.from("onboarding_progress").upsert({
      user_id:      user.id,
      steps_done:   Array.from(next),
      activated_at: coreAllDone ? new Date().toISOString() : null,
    }, { onConflict: "user_id" });

    trackEvent(user.id, "onboarding_step_completed", { metadata: { step: key } });
  }, [user, stepsDone]);

  const dismiss = useCallback(async () => {
    if (!user) return;
    setDismissed(true);
    await supabase.from("onboarding_progress").upsert({
      user_id:   user.id,
      dismissed: true,
      steps_done: Array.from(stepsDone),
    }, { onConflict: "user_id" });
    if (user) trackEvent(user.id, "welcome_dismissed");
  }, [user, stepsDone]);

  const completeWizard = useCallback(async () => {
    if (!user) return;
    setDismissed(true);
    const now = new Date().toISOString();
    await supabase.from("onboarding_progress").upsert({
      user_id:      user.id,
      dismissed:    true,
      steps_done:   Array.from(stepsDone),
      activated_at: CORE_STEPS.every((k) => stepsDone.has(k as OnboardingStepKey)) ? now : null,
    }, { onConflict: "user_id" });
    trackEvent(user.id, "onboarding_step_completed", { metadata: { step: "wizard_completed" } });
  }, [user, stepsDone]);

  const isActivated = CORE_STEPS.every((k) => stepsDone.has(k as OnboardingStepKey));
  const pct         = Math.round((stepsDone.size / ONBOARDING_STEPS.length) * 100);

  // Show wizard if: user exists, not dismissed, no wizard started, and only account_created is done
  const showWizard = Boolean(user) && !dismissed && !wizardStartedAt && stepsDone.size <= 1 && !loading;

  return {
    stepsDone, dismissed, activatedAt, isActivated, pct, loading,
    showWizard, wizardStartedAt, firstGenerationAt,
    markStep, dismiss, completeWizard, refresh,
  };
}
