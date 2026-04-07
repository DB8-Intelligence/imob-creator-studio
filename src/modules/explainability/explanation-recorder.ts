/**
 * explanation-recorder.ts — Persiste ExplanationRecord no Supabase
 *
 * Ponto central de gravação. Todos os domínios chamam recordExplanation()
 * que salva explanation + trust signal + narrativas em paralelo.
 *
 * Nunca bloqueia o fluxo principal — erros de gravação são silenciados com warn.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  ExplanationRecord,
  ExplanationDomain,
  TrustSignal,
  DecisionExplanation,
  PolicyExplanation,
  ExecutionExplanation,
  ActionTrace,
  AuditNarrative,
  AuditAudience,
} from "./types";
import { buildNarratives } from "./narrative-builder";

// ─── Record Input ────────────────────────────────────────────────────────────

export interface RecordExplanationInput {
  tenantId: string;
  domain: ExplanationDomain;
  referenceId: string;
  referenceType: string;
  summary: string;
  trust: TrustSignal;
  decision?: DecisionExplanation;
  policy?: PolicyExplanation;
  execution?: ExecutionExplanation;
  traces?: ActionTrace[];
  /** Audiences para gerar narrativas automaticamente */
  audiences?: AuditAudience[];
  /** TTL em dias (default: 90) */
  ttlDays?: number;
}

// ─── Record ──────────────────────────────────────────────────────────────────

/**
 * Grava uma explicação completa no Supabase.
 * Retorna o ID do registro criado, ou null se falhou.
 */
export async function recordExplanation(
  input: RecordExplanationInput
): Promise<string | null> {
  const expiresAt = input.ttlDays
    ? new Date(Date.now() + input.ttlDays * 86_400_000).toISOString()
    : new Date(Date.now() + 90 * 86_400_000).toISOString(); // 90 dias default

  try {
    // 1. Insert explanation
    const { data: expRow, error: expErr } = await supabase
      .from("bookagent_explanations")
      .insert({
        tenant_id: input.tenantId,
        domain: input.domain,
        reference_id: input.referenceId,
        reference_type: input.referenceType,
        summary: input.summary,
        trust_signal: input.trust as unknown as Record<string, unknown>,
        decision_data: input.decision ? (input.decision as unknown as Record<string, unknown>) : null,
        policy_data: input.policy ? (input.policy as unknown as Record<string, unknown>) : null,
        execution_data: input.execution ? (input.execution as unknown as Record<string, unknown>) : null,
        traces: (input.traces ?? []) as unknown as Record<string, unknown>[],
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (expErr || !expRow) {
      console.warn("[explainability] Failed to record explanation:", expErr?.message);
      return null;
    }

    const explanationId = expRow.id as string;

    // 2. Insert trust signal (denormalized for fast queries)
    const trustPromise = supabase
      .from("bookagent_trust_signals")
      .insert({
        tenant_id: input.tenantId,
        reference_id: input.referenceId,
        reference_type: input.referenceType,
        confidence_score: input.trust.confidence.score,
        confidence_level: input.trust.confidence.level,
        risk_score: input.trust.risk.score,
        risk_level: input.trust.risk.level,
        policy_compliant: input.trust.policyCompliant,
        fallback_used: input.trust.fallbackUsed,
        recovery_triggered: input.trust.recoveryTriggered,
        human_review_needed: input.trust.humanReviewNeeded,
        governance_status: input.trust.governanceStatus,
        factors: {
          confidence_factors: input.trust.confidence.factors,
          risk_factors: input.trust.risk.factors,
        },
      });

    // 3. Generate and insert narratives
    const audiences = input.audiences ?? ["customer", "admin"];
    const narratives = buildNarratives({
      explanationId,
      domain: input.domain,
      summary: input.summary,
      trust: input.trust,
      decision: input.decision,
      policy: input.policy,
      execution: input.execution,
      audiences: audiences as AuditAudience[],
    });

    const narrativePromise = narratives.length > 0
      ? supabase.from("bookagent_audit_narratives").insert(
          narratives.map((n) => ({
            explanation_id: explanationId,
            audience: n.audience,
            title: n.title,
            narrative: n.narrative,
            highlights: n.highlights,
            severity: n.severity,
          }))
        )
      : Promise.resolve({ error: null });

    // Fire trust + narratives in parallel, don't block
    await Promise.allSettled([trustPromise, narrativePromise]);

    return explanationId;
  } catch (err) {
    console.warn("[explainability] Unexpected error recording explanation:", err);
    return null;
  }
}

// ─── Query ───────────────────────────────────────────────────────────────────

/** Busca explicação por reference */
export async function getExplanation(
  referenceId: string,
  referenceType: string
): Promise<ExplanationRecord | null> {
  const { data, error } = await supabase
    .from("bookagent_explanations")
    .select("*")
    .eq("reference_id", referenceId)
    .eq("reference_type", referenceType)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    domain: data.domain as ExplanationDomain,
    referenceId: data.reference_id,
    referenceType: data.reference_type,
    summary: data.summary,
    trust: data.trust_signal as unknown as TrustSignal,
    decision: data.decision_data as unknown as DecisionExplanation | undefined,
    policy: data.policy_data as unknown as PolicyExplanation | undefined,
    execution: data.execution_data as unknown as ExecutionExplanation | undefined,
    traces: (data.traces ?? []) as unknown as ActionTrace[],
    createdAt: data.created_at,
    expiresAt: data.expires_at ?? undefined,
  };
}

/** Busca explicação por ID */
export async function getExplanationById(id: string): Promise<ExplanationRecord | null> {
  const { data, error } = await supabase
    .from("bookagent_explanations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    domain: data.domain as ExplanationDomain,
    referenceId: data.reference_id,
    referenceType: data.reference_type,
    summary: data.summary,
    trust: data.trust_signal as unknown as TrustSignal,
    decision: data.decision_data as unknown as DecisionExplanation | undefined,
    policy: data.policy_data as unknown as PolicyExplanation | undefined,
    execution: data.execution_data as unknown as ExecutionExplanation | undefined,
    traces: (data.traces ?? []) as unknown as ActionTrace[],
    createdAt: data.created_at,
    expiresAt: data.expires_at ?? undefined,
  };
}

/** Lista explicações de um tenant com filtros */
export async function listExplanations(params: {
  tenantId: string;
  domain?: ExplanationDomain;
  limit?: number;
  offset?: number;
}): Promise<ExplanationRecord[]> {
  let query = supabase
    .from("bookagent_explanations")
    .select("*")
    .eq("tenant_id", params.tenantId)
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 20);

  if (params.domain) query = query.eq("domain", params.domain);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit ?? 20) - 1);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    domain: row.domain as ExplanationDomain,
    referenceId: row.reference_id,
    referenceType: row.reference_type,
    summary: row.summary,
    trust: row.trust_signal as unknown as TrustSignal,
    decision: row.decision_data as unknown as DecisionExplanation | undefined,
    policy: row.policy_data as unknown as PolicyExplanation | undefined,
    execution: row.execution_data as unknown as ExecutionExplanation | undefined,
    traces: (row.traces ?? []) as unknown as ActionTrace[],
    createdAt: row.created_at,
    expiresAt: row.expires_at ?? undefined,
  }));
}

/** Busca trust signals com risco alto+ */
export async function getHighRiskSignals(params: {
  tenantId: string;
  minRiskLevel?: "medium" | "high" | "critical";
  limit?: number;
}): Promise<Array<{ referenceId: string; referenceType: string; riskLevel: string; riskScore: number; createdAt: string }>> {
  const levels = params.minRiskLevel === "critical"
    ? ["critical"]
    : params.minRiskLevel === "high"
      ? ["critical", "high"]
      : ["critical", "high", "medium"];

  const { data, error } = await supabase
    .from("bookagent_trust_signals")
    .select("reference_id, reference_type, risk_level, risk_score, created_at")
    .eq("tenant_id", params.tenantId)
    .in("risk_level", levels)
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 20);

  if (error || !data) return [];

  return data.map((row) => ({
    referenceId: row.reference_id,
    referenceType: row.reference_type,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    createdAt: row.created_at,
  }));
}
