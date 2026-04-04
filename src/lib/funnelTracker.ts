/**
 * funnelTracker.ts — Funnel conversion data + drop-off analysis.
 * Queries user_events (via funnel_metrics_personal view) and
 * onboarding_progress to build full funnel picture.
 *
 * Used by FunnelDashboardPage and useOnboardingProgress.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Funnel stage definitions (ordered) ───────────────────────────────────────

export interface FunnelStage {
  key:         string;
  label:       string;
  description: string;
  eventType:   string;         // matches user_events.event_type
  isCoreStep:  boolean;        // counts toward "activation"
  color:       string;         // CSS var or color string
}

export const FUNNEL_STAGES: FunnelStage[] = [
  {
    key:         "signup",
    label:       "Cadastro",
    description: "Usuário criou a conta",
    eventType:   "signup",
    isCoreStep:  true,
    color:       "var(--ds-cyan)",
  },
  {
    key:         "first_login",
    label:       "Primeiro Login",
    description: "Usuário acessou o dashboard",
    eventType:   "dashboard_viewed",
    isCoreStep:  true,
    color:       "#60C8FF",
  },
  {
    key:         "first_creative",
    label:       "Primeiro Criativo",
    description: "Gerou ao menos 1 criativo",
    eventType:   "creative_generated",
    isCoreStep:  true,
    color:       "#C4B5FD",
  },
  {
    key:         "trial_start",
    label:       "Trial Ativo",
    description: "Consumiu créditos / iniciou trial",
    eventType:   "trial_start",
    isCoreStep:  false,
    color:       "var(--ds-gold)",
  },
  {
    key:         "paid_conversion",
    label:       "Conversão Paga",
    description: "Realizou pagamento",
    eventType:   "paid_conversion",
    isCoreStep:  false,
    color:       "#34D399",
  },
];

// ── Personal funnel data (per current user) ───────────────────────────────────

export interface PersonalFunnelData {
  signup_at:          string | null;
  first_login_at:     string | null;
  first_creative_at:  string | null;
  trial_start_at:     string | null;
  paid_at:            string | null;
  total_creatives:    number;
  upgrade_views:      number;
}

export async function getPersonalFunnelData(userId: string): Promise<PersonalFunnelData | null> {
  const { data, error } = await supabase
    .from("funnel_metrics_personal")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle() as { data: PersonalFunnelData | null; error: unknown };

  if (error) return null;
  return data;
}

// ── Funnel stage counts (from user's own events — for personal analytics) ─────

export interface FunnelStageCount {
  key:        string;
  label:      string;
  count:      number;     // 0 = not reached, ≥1 = reached
  reachedAt:  string | null;
  color:      string;
}

export function mapFunnelData(data: PersonalFunnelData | null): FunnelStageCount[] {
  if (!data) return FUNNEL_STAGES.map((s) => ({ key: s.key, label: s.label, count: 0, reachedAt: null, color: s.color }));

  return [
    { key: "signup",         label: "Cadastro",          count: data.signup_at          ? 1 : 0, reachedAt: data.signup_at,         color: "var(--ds-cyan)" },
    { key: "first_login",    label: "Primeiro Login",    count: data.first_login_at     ? 1 : 0, reachedAt: data.first_login_at,    color: "#60C8FF" },
    { key: "first_creative", label: "Primeiro Criativo", count: data.total_creatives,             reachedAt: data.first_creative_at, color: "#C4B5FD" },
    { key: "trial_start",    label: "Trial Ativo",       count: data.trial_start_at     ? 1 : 0, reachedAt: data.trial_start_at,    color: "var(--ds-gold)" },
    { key: "paid_conversion",label: "Plano Pago",        count: data.paid_at            ? 1 : 0, reachedAt: data.paid_at,           color: "#34D399" },
  ];
}

// ── Time-to-activation helpers ─────────────────────────────────────────────────

export function minutesBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60)   return `${minutes}min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

// ── Funnel optimization suggestions ───────────────────────────────────────────

export interface FunnelSuggestion {
  stage:       string;
  title:       string;
  description: string;
  priority:    "high" | "medium" | "low";
  action:      string;
  actionPath?: string;
}

export function getFunnelSuggestions(data: PersonalFunnelData | null): FunnelSuggestion[] {
  const suggestions: FunnelSuggestion[] = [];
  if (!data) return suggestions;

  if (!data.first_creative_at) {
    suggestions.push({
      stage:       "first_creative",
      title:       "Ativação pendente",
      description: "Você ainda não gerou nenhum criativo. Esse é o maior gargalo de ativação — resolva agora.",
      priority:    "high",
      action:      "Criar meu primeiro criativo",
      actionPath:  "/create",
    });
  }

  if (data.total_creatives > 0 && data.total_creatives < 3 && !data.trial_start_at) {
    suggestions.push({
      stage:       "trial_start",
      title:       "Engajamento baixo",
      description: `Você gerou ${data.total_creatives} criativo${data.total_creatives > 1 ? "s" : ""}. Crie mais 3 para experimentar o produto completo.`,
      priority:    "medium",
      action:      "Gerar mais criativos",
      actionPath:  "/create",
    });
  }

  if (data.upgrade_views > 2 && !data.paid_at) {
    suggestions.push({
      stage:       "paid_conversion",
      title:       "Intenção de compra alta",
      description: `Você visualizou os planos ${data.upgrade_views}x sem converter. Verifique se tem alguma dúvida — o suporte pode ajudar.`,
      priority:    "high",
      action:      "Ver planos e preços",
      actionPath:  "/planos",
    });
  }

  if (!data.paid_at && data.total_creatives >= 5) {
    suggestions.push({
      stage:       "paid_conversion",
      title:       "Produto validado — falta o plano",
      description: "Você já usou o produto o suficiente para saber o valor. Faça upgrade para desbloquear mais créditos e recursos avançados.",
      priority:    "high",
      action:      "Fazer upgrade agora",
      actionPath:  "/planos",
    });
  }

  return suggestions;
}
