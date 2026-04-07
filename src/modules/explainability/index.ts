/**
 * Explainability module — barrel export (PART 97)
 *
 * Trust, Explanation & Audit Surfaces do BookAgent Intelligence Engine.
 *
 * Camadas:
 *   types          — DTOs e interfaces
 *   trust-builder  — composição de TrustSignal, ConfidenceIndicator, RiskIndicator
 *   explainers     — explicações por domínio (decision, policy, execution, etc.)
 *   narrative-builder — narrativas por audience (customer, admin, copilot, support)
 *   explanation-recorder — persistência no Supabase + queries
 *   audit-surfaces — pacotes consumíveis por dashboard/admin/copilot
 */

// Types
export type {
  ExplanationDomain,
  ConfidenceLevel,
  RiskLevel,
  AuditAudience,
  ActionOutcome,
  ConfidenceIndicator,
  RiskIndicator,
  TrustSignal,
  ActionTrace,
  DecisionExplanation,
  PolicyExplanation,
  ExecutionExplanation,
  ExplanationRecord,
  AuditNarrative,
  AuditSurface,
  ExplanationRow,
  TrustSignalRow,
  AuditNarrativeRow,
} from "./types";

// Trust builder
export {
  buildConfidence,
  buildRisk,
  buildTrustSignal,
} from "./trust-builder";
export type {
  ConfidenceInput,
  RiskInput,
  TrustInput,
} from "./trust-builder";

// Explainers
export {
  explainDecision,
  explainPolicy,
  explainExecution,
  buildTrace,
  explainControlPoint,
  explainTemplateDecision,
  explainPublicationBlock,
  explainOverride,
  explainRecovery,
} from "./explainers";
export type {
  DecisionInput,
  PolicyInput,
  ExecutionInput,
  ExecutionStepInput,
  TraceInput,
} from "./explainers";

// Narrative builder
export { buildNarratives } from "./narrative-builder";
export type { NarrativeInput } from "./narrative-builder";

// Explanation recorder (persistence)
export {
  recordExplanation,
  getExplanation,
  getExplanationById,
  listExplanations,
  getHighRiskSignals,
} from "./explanation-recorder";
export type { RecordExplanationInput } from "./explanation-recorder";

// Audit surfaces
export {
  buildAuditSurface,
  buildAuditSurfaceById,
  buildTenantTrustOverview,
} from "./audit-surfaces";
export type { TenantTrustOverview } from "./audit-surfaces";
