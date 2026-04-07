/**
 * types.ts — Trust, Explanation & Audit Surfaces (PART 97)
 *
 * Conceitos centrais:
 *
 * ExplanationRecord    — registro imutável de por quê algo aconteceu
 * TrustSignal          — indicador de confiança do sistema num resultado
 * ConfidenceIndicator  — nível numérico de certeza (0-1) + justificativa
 * RiskIndicator        — nível de risco detectado + mitigação aplicada
 * ActionTrace          — rastreio completo de uma ação (inputs → output)
 * AuditSurface         — superfície consumível por dashboard/admin/copilot
 * AuditNarrative       — resumo em linguagem natural de um evento auditável
 * DecisionExplanation  — explicação estruturada de uma decisão do sistema
 * PolicyExplanation    — explicação de por quê uma policy foi aplicada
 * ExecutionExplanation — explicação de como uma execução (job/pipeline) ocorreu
 */

// ─── Enums & Unions ──────────────────────────────────────────────────────────

/** Domínio do evento que está sendo explicado */
export type ExplanationDomain =
  | "decision"
  | "policy"
  | "campaign"
  | "publication"
  | "execution"
  | "recovery"
  | "copilot"
  | "billing"
  | "override";

/** Nível de confiança qualitativo */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

/** Nível de risco qualitativo */
export type RiskLevel = "critical" | "high" | "medium" | "low" | "none";

/** Quem consome a superfície */
export type AuditAudience = "customer" | "admin" | "copilot" | "support";

/** Resultado qualitativo de uma ação */
export type ActionOutcome = "success" | "partial" | "failure" | "skipped" | "pending";

// ─── Core: Confidence & Risk ─────────────────────────────────────────────────

export interface ConfidenceIndicator {
  score: number;           // 0.0 – 1.0
  level: ConfidenceLevel;
  factors: string[];       // ["template_match_high", "image_quality_ok"]
}

export interface RiskIndicator {
  score: number;           // 0.0 – 1.0
  level: RiskLevel;
  factors: string[];       // ["no_fallback_available", "rate_limit_close"]
  mitigation?: string;     // ação de mitigação aplicada (se houver)
}

// ─── Trust Signal ────────────────────────────────────────────────────────────

export interface TrustSignal {
  confidence: ConfidenceIndicator;
  risk: RiskIndicator;
  policyCompliant: boolean;
  fallbackUsed: boolean;
  recoveryTriggered: boolean;
  humanReviewNeeded: boolean;
  governanceStatus: "compliant" | "warning" | "violation";
}

// ─── Action Trace ────────────────────────────────────────────────────────────

export interface ActionTrace {
  actionId: string;
  actionType: string;          // "render_creative", "publish_instagram", etc.
  triggeredBy: string;         // "user", "scheduler", "copilot", "recovery"
  inputs: Record<string, unknown>;
  constraints: string[];       // policies/regras que foram checadas
  outcome: ActionOutcome;
  outputSummary?: string;
  durationMs?: number;
  timestamp: string;           // ISO 8601
}

// ─── Decision Explanation ────────────────────────────────────────────────────

export interface DecisionExplanation {
  decisionId: string;
  decisionType: string;        // "template_selection", "engine_routing", etc.
  context: Record<string, unknown>;
  inputsSummary: string;       // "Imagem de fachada luxo, texto com urgência"
  rationale: string;           // "Template dark_premium selecionado por luxury_level=ultra"
  alternativesRejected: Array<{
    option: string;
    reason: string;
  }>;
  chosenOption: string;
  confidence: ConfidenceIndicator;
  timestamp: string;
}

// ─── Policy Explanation ──────────────────────────────────────────────────────

export interface PolicyExplanation {
  policyId: string;
  policyName: string;          // "publish_rate_limit", "content_quality_gate"
  trigger: string;             // o que ativou a policy
  evaluation: "allowed" | "blocked" | "warning";
  reason: string;              // "Limite de 30 publicações/mês atingido"
  inputsChecked: Record<string, unknown>;
  thresholds?: Record<string, number | string>;
  overridable: boolean;
  overriddenBy?: string;       // user_id se houve override
  timestamp: string;
}

// ─── Execution Explanation ───────────────────────────────────────────────────

export interface ExecutionExplanation {
  jobId: string;
  jobType: string;             // "creative_pipeline", "video_compose", etc.
  steps: Array<{
    stepName: string;
    status: ActionOutcome;
    durationMs?: number;
    detail?: string;
  }>;
  totalDurationMs: number;
  retryCount: number;
  fallbackUsed: boolean;
  recoveryActions: string[];
  finalStatus: ActionOutcome;
  outputUrl?: string;
  timestamp: string;
}

// ─── Explanation Record (registro principal) ─────────────────────────────────

export interface ExplanationRecord {
  id: string;
  tenantId: string;
  domain: ExplanationDomain;
  referenceId: string;         // ID do objeto sendo explicado (job_id, decision_id, etc.)
  referenceType: string;       // "creative_job", "publication", "campaign", etc.
  summary: string;             // resumo em 1 frase
  trust: TrustSignal;
  decision?: DecisionExplanation;
  policy?: PolicyExplanation;
  execution?: ExecutionExplanation;
  traces: ActionTrace[];
  createdAt: string;
  expiresAt?: string;          // TTL para limpeza
}

// ─── Audit Narrative ─────────────────────────────────────────────────────────

export interface AuditNarrative {
  id: string;
  explanationId: string;
  audience: AuditAudience;
  title: string;               // "Criativo gerado com sucesso"
  narrative: string;           // texto em linguagem natural
  highlights: string[];        // pontos-chave ["Template: Dark Premium", "Confiança: 92%"]
  severity: "info" | "warning" | "error" | "success";
  timestamp: string;
}

// ─── Audit Surface (pacote consumível) ───────────────────────────────────────

export interface AuditSurface {
  explanation: ExplanationRecord;
  narratives: AuditNarrative[];
  relatedExplanations?: Array<{
    id: string;
    domain: ExplanationDomain;
    summary: string;
  }>;
}

// ─── DB Row types (matching Supabase schema) ─────────────────────────────────

export interface ExplanationRow {
  id: string;
  tenant_id: string;
  domain: ExplanationDomain;
  reference_id: string;
  reference_type: string;
  summary: string;
  trust_signal: TrustSignal;
  decision_data: DecisionExplanation | null;
  policy_data: PolicyExplanation | null;
  execution_data: ExecutionExplanation | null;
  traces: ActionTrace[];
  created_at: string;
  expires_at: string | null;
}

export interface TrustSignalRow {
  id: string;
  tenant_id: string;
  reference_id: string;
  reference_type: string;
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  risk_score: number;
  risk_level: RiskLevel;
  policy_compliant: boolean;
  fallback_used: boolean;
  recovery_triggered: boolean;
  human_review_needed: boolean;
  governance_status: string;
  factors: Record<string, unknown>;
  created_at: string;
}

export interface AuditNarrativeRow {
  id: string;
  explanation_id: string;
  audience: AuditAudience;
  title: string;
  narrative: string;
  highlights: string[];
  severity: string;
  created_at: string;
}
