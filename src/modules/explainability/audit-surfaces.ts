/**
 * audit-surfaces.ts — Monta AuditSurface consumíveis por dashboard/admin/copilot
 *
 * Uma AuditSurface é o pacote completo que um consumidor recebe:
 * explanation + narrativas filtradas por audience + relacionados.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  AuditSurface,
  AuditAudience,
  AuditNarrative,
  ExplanationRecord,
  ExplanationDomain,
} from "./types";
import { getExplanation, getExplanationById } from "./explanation-recorder";

// ─── Build Surface by Reference ──────────────────────────────────────────────

/**
 * Monta AuditSurface completa para um reference (job, publication, campaign, etc.)
 * filtrada pela audience especificada.
 */
export async function buildAuditSurface(params: {
  referenceId: string;
  referenceType: string;
  audience: AuditAudience;
}): Promise<AuditSurface | null> {
  const explanation = await getExplanation(params.referenceId, params.referenceType);
  if (!explanation) return null;

  const narratives = await getNarratives(explanation.id, params.audience);
  const related = await getRelatedExplanations(explanation.tenantId, explanation.id, 5);

  return { explanation, narratives, relatedExplanations: related };
}

/**
 * Monta AuditSurface a partir de um explanation ID.
 */
export async function buildAuditSurfaceById(params: {
  explanationId: string;
  audience: AuditAudience;
}): Promise<AuditSurface | null> {
  const explanation = await getExplanationById(params.explanationId);
  if (!explanation) return null;

  const narratives = await getNarratives(explanation.id, params.audience);
  const related = await getRelatedExplanations(explanation.tenantId, explanation.id, 5);

  return { explanation, narratives, relatedExplanations: related };
}

// ─── Tenant Overview ─────────────────────────────────────────────────────────

export interface TenantTrustOverview {
  tenantId: string;
  totalExplanations: number;
  riskBreakdown: Record<string, number>;
  governanceBreakdown: Record<string, number>;
  recentHighRisk: Array<{
    referenceId: string;
    referenceType: string;
    riskLevel: string;
    summary: string;
    createdAt: string;
  }>;
  humanReviewPending: number;
}

/**
 * Gera overview de trust para um tenant (consumido por admin e copilot).
 */
export async function buildTenantTrustOverview(tenantId: string): Promise<TenantTrustOverview> {
  const overview: TenantTrustOverview = {
    tenantId,
    totalExplanations: 0,
    riskBreakdown: { none: 0, low: 0, medium: 0, high: 0, critical: 0 },
    governanceBreakdown: { compliant: 0, warning: 0, violation: 0 },
    recentHighRisk: [],
    humanReviewPending: 0,
  };

  // Count by risk level
  const { data: trustData } = await supabase
    .from("bookagent_trust_signals")
    .select("risk_level, human_review_needed, governance_status, reference_id, reference_type, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (!trustData) return overview;

  overview.totalExplanations = trustData.length;

  for (const row of trustData) {
    const rl = row.risk_level as string;
    const gs = row.governance_status as string;
    if (rl in overview.riskBreakdown) overview.riskBreakdown[rl]++;
    if (gs in overview.governanceBreakdown) overview.governanceBreakdown[gs]++;
    if (row.human_review_needed) overview.humanReviewPending++;
  }

  // Recent high risk
  const highRiskRows = trustData
    .filter((r) => r.risk_level === "high" || r.risk_level === "critical")
    .slice(0, 5);

  for (const row of highRiskRows) {
    // Get summary from explanation
    const { data: expRow } = await supabase
      .from("bookagent_explanations")
      .select("summary")
      .eq("reference_id", row.reference_id)
      .eq("reference_type", row.reference_type)
      .limit(1)
      .single();

    overview.recentHighRisk.push({
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      riskLevel: row.risk_level,
      summary: expRow?.summary ?? "",
      createdAt: row.created_at,
    });
  }

  return overview;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getNarratives(explanationId: string, audience: AuditAudience): Promise<AuditNarrative[]> {
  const { data, error } = await supabase
    .from("bookagent_audit_narratives")
    .select("*")
    .eq("explanation_id", explanationId)
    .eq("audience", audience)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    explanationId: row.explanation_id,
    audience: row.audience as AuditAudience,
    title: row.title,
    narrative: row.narrative,
    highlights: (row.highlights ?? []) as string[],
    severity: row.severity as AuditNarrative["severity"],
    timestamp: row.created_at,
  }));
}

async function getRelatedExplanations(
  tenantId: string,
  currentId: string,
  limit: number
): Promise<Array<{ id: string; domain: ExplanationDomain; summary: string }>> {
  const { data } = await supabase
    .from("bookagent_explanations")
    .select("id, domain, summary")
    .eq("tenant_id", tenantId)
    .neq("id", currentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];
  return data.map((r) => ({ id: r.id, domain: r.domain as ExplanationDomain, summary: r.summary }));
}
