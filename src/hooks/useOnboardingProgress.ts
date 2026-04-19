/**
 * useOnboardingProgress — per-user activation checklist state.
 *
 * Steps (Sprint 9 — product-aligned):
 *   account_created       → always done (user is logged in)
 *   whatsapp_connected    → user_whatsapp_instances.status = 'connected'
 *   secretaria_configured → user_whatsapp_instances.ai_enabled = true
 *   property_uploaded     → properties.count() > 0
 *   first_ai_reply        → whatsapp_sent_messages.count() > 0 (IA respondeu ≥1 lead)
 *
 * Backward compat: legacy keys (creative_generated, brand_kit_created, content_shared)
 * ainda são aceitos no steps_done persistido mas não aparecem mais na UI.
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
  | "whatsapp_connected"
  | "secretaria_configured"
  | "property_uploaded"
  | "first_ai_reply"
  // legacy (aceita no storage, não renderiza)
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
    key:         "whatsapp_connected",
    label:       "Conecte seu WhatsApp",
    description: "Vincule seu número via QR Code para a Secretária Virtual atender 24h.",
    actionLabel: "Conectar WhatsApp",
    actionPath:  "/dashboard/whatsapp",
    isCoreStep:  true,
  },
  {
    key:         "secretaria_configured",
    label:       "Configure a Secretária IA",
    description: "Dê nome, tom de voz e instruções para sua IA atender como você fala.",
    actionLabel: "Configurar IA",
    actionPath:  "/dashboard/whatsapp/ai-config",
    isCoreStep:  true,
  },
  {
    key:         "property_uploaded",
    label:       "Cadastre seu primeiro imóvel",
    description: "A IA só recomenda imóveis do seu portfólio. Use 'Completar com IA' para agilizar.",
    actionLabel: "Adicionar imóvel",
    actionPath:  "/imoveis/upload",
    isCoreStep:  false,
  },
  {
    key:         "first_ai_reply",
    label:       "IA atendeu seu primeiro lead",
    description: "Quando um cliente mandar mensagem, a IA responde e você vê aqui.",
    actionLabel: "Ver conversas",
    actionPath:  "/dashboard/whatsapp/inbox",
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

        // 2 — Infer steps do fluxo atual (Secretária Virtual + WhatsApp + imóveis)
        const [instRes, propRes, sentRes] = await Promise.all([
          supabase
            .from("user_whatsapp_instances")
            .select("status, ai_enabled")
            .eq("user_id", user!.id)
            .maybeSingle(),
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("whatsapp_sent_messages")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id),
        ]);

        const inferred = new Set<OnboardingStepKey>(["account_created"]);
        if (instRes.data?.status === "connected") inferred.add("whatsapp_connected");
        if (instRes.data?.ai_enabled)             inferred.add("secretaria_configured");
        if ((propRes.count ?? 0) > 0)             inferred.add("property_uploaded");
        if ((sentRes.count ?? 0) > 0)             inferred.add("first_ai_reply");

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
  // Conta apenas steps que ainda aparecem na UI (ignora legacy no storage)
  const currentKeys = new Set(ONBOARDING_STEPS.map((s) => s.key));
  const doneInCurrent = Array.from(stepsDone).filter((k) => currentKeys.has(k));
  const pct = Math.round((doneInCurrent.length / ONBOARDING_STEPS.length) * 100);

  // Show wizard if: user exists, not dismissed, no wizard started, and no first output was generated yet
  const showWizard = Boolean(user) && !dismissed && !wizardStartedAt && stepsDone.size <= 1 && !loading;

  return {
    stepsDone, dismissed, activatedAt, isActivated, pct, loading,
    showWizard, wizardStartedAt, firstGenerationAt,
    markStep, dismiss, completeWizard, refresh,
  };
}
