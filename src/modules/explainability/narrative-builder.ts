/**
 * narrative-builder.ts — Gera narrativas em linguagem natural por audience
 *
 * Cada audience recebe uma narrativa adaptada ao seu nível de detalhe:
 * - customer: simples, focado em resultado e confiança
 * - admin: detalhado, inclui policy e riscos
 * - copilot: técnico, inclui alternativas e traces
 * - support: diagnóstico, inclui tudo para troubleshooting
 */

import type {
  ExplanationDomain,
  TrustSignal,
  DecisionExplanation,
  PolicyExplanation,
  ExecutionExplanation,
  AuditAudience,
  AuditNarrative,
} from "./types";

// ─── Input ───────────────────────────────────────────────────────────────────

export interface NarrativeInput {
  explanationId: string;
  domain: ExplanationDomain;
  summary: string;
  trust: TrustSignal;
  decision?: DecisionExplanation;
  policy?: PolicyExplanation;
  execution?: ExecutionExplanation;
  audiences: AuditAudience[];
}

// ─── Builder ─────────────────────────────────────────────────────────────────

export function buildNarratives(input: NarrativeInput): Omit<AuditNarrative, "id" | "timestamp">[] {
  const results: Omit<AuditNarrative, "id" | "timestamp">[] = [];

  for (const audience of input.audiences) {
    const narrative = buildForAudience(input, audience);
    if (narrative) results.push(narrative);
  }

  return results;
}

function buildForAudience(
  input: NarrativeInput,
  audience: AuditAudience
): Omit<AuditNarrative, "id" | "timestamp"> | null {
  switch (audience) {
    case "customer":  return buildCustomerNarrative(input);
    case "admin":     return buildAdminNarrative(input);
    case "copilot":   return buildCopilotNarrative(input);
    case "support":   return buildSupportNarrative(input);
    default:          return null;
  }
}

// ─── Customer Narrative ──────────────────────────────────────────────────────

function buildCustomerNarrative(input: NarrativeInput): Omit<AuditNarrative, "id" | "timestamp"> {
  const highlights: string[] = [];
  const parts: string[] = [];

  // Resultado principal
  parts.push(input.summary);

  // Confiança (simplificado)
  const confLabel = { high: "Alta", medium: "Media", low: "Baixa", unknown: "" }[input.trust.confidence.level];
  if (confLabel) highlights.push(`Confianca: ${confLabel}`);

  // Decision (simplificado)
  if (input.decision) {
    highlights.push(`Opcao: ${input.decision.chosenOption}`);
  }

  // Policy (só se bloqueou)
  if (input.policy?.evaluation === "blocked") {
    parts.push(`Acao bloqueada: ${input.policy.reason}`);
    highlights.push("Acao bloqueada por politica");
  }

  // Execution (status final)
  if (input.execution) {
    const statusLabel = {
      success: "Concluido com sucesso",
      partial: "Concluido parcialmente",
      failure: "Falhou",
      skipped: "Ignorado",
      pending: "Em andamento",
    }[input.execution.finalStatus];
    highlights.push(statusLabel);
  }

  const severity = deriveSeverity(input);

  return {
    explanationId: input.explanationId,
    audience: "customer",
    title: domainTitle(input.domain),
    narrative: parts.join(" "),
    highlights,
    severity,
  };
}

// ─── Admin Narrative ─────────────────────────────────────────────────────────

function buildAdminNarrative(input: NarrativeInput): Omit<AuditNarrative, "id" | "timestamp"> {
  const highlights: string[] = [];
  const parts: string[] = [];

  parts.push(input.summary);

  // Trust details
  highlights.push(`Confianca: ${(input.trust.confidence.score * 100).toFixed(0)}%`);
  highlights.push(`Risco: ${input.trust.risk.level}`);
  highlights.push(`Governanca: ${input.trust.governanceStatus}`);

  if (input.trust.fallbackUsed) highlights.push("Fallback acionado");
  if (input.trust.recoveryTriggered) highlights.push("Recovery acionado");
  if (input.trust.humanReviewNeeded) highlights.push("Requer revisao humana");

  // Decision
  if (input.decision) {
    parts.push(`Decisao: ${input.decision.rationale}`);
    if (input.decision.alternativesRejected.length > 0) {
      const rejected = input.decision.alternativesRejected.map((a) => a.option).join(", ");
      parts.push(`Alternativas rejeitadas: ${rejected}`);
    }
  }

  // Policy
  if (input.policy) {
    parts.push(`Policy "${input.policy.policyName}": ${input.policy.evaluation} — ${input.policy.reason}`);
    if (input.policy.overriddenBy) {
      parts.push(`Override por: ${input.policy.overriddenBy}`);
    }
  }

  // Execution
  if (input.execution) {
    parts.push(`Execucao: ${input.execution.steps.length} etapas, ${input.execution.totalDurationMs}ms, ${input.execution.retryCount} retries`);
  }

  return {
    explanationId: input.explanationId,
    audience: "admin",
    title: `[Admin] ${domainTitle(input.domain)}`,
    narrative: parts.join("\n"),
    highlights,
    severity: deriveSeverity(input),
  };
}

// ─── Copilot Narrative ───────────────────────────────────────────────────────

function buildCopilotNarrative(input: NarrativeInput): Omit<AuditNarrative, "id" | "timestamp"> {
  const highlights: string[] = [];
  const parts: string[] = [];

  parts.push(`[${input.domain.toUpperCase()}] ${input.summary}`);

  // Full trust breakdown
  highlights.push(`confidence=${input.trust.confidence.score} (${input.trust.confidence.factors.join(", ")})`);
  highlights.push(`risk=${input.trust.risk.score} (${input.trust.risk.factors.join(", ")})`);

  // Decision with full context
  if (input.decision) {
    parts.push(`Decision(${input.decision.decisionType}): chose "${input.decision.chosenOption}"`);
    parts.push(`Rationale: ${input.decision.rationale}`);
    parts.push(`Context: ${JSON.stringify(input.decision.context)}`);
    for (const alt of input.decision.alternativesRejected) {
      parts.push(`  Rejected "${alt.option}": ${alt.reason}`);
    }
  }

  // Policy with thresholds
  if (input.policy) {
    parts.push(`Policy(${input.policy.policyName}): ${input.policy.evaluation}`);
    if (input.policy.thresholds) {
      parts.push(`Thresholds: ${JSON.stringify(input.policy.thresholds)}`);
    }
    parts.push(`Inputs: ${JSON.stringify(input.policy.inputsChecked)}`);
  }

  // Execution step-by-step
  if (input.execution) {
    for (const step of input.execution.steps) {
      parts.push(`  Step "${step.stepName}": ${step.status}${step.durationMs ? ` (${step.durationMs}ms)` : ""}${step.detail ? ` — ${step.detail}` : ""}`);
    }
  }

  return {
    explanationId: input.explanationId,
    audience: "copilot",
    title: `[Copilot] ${input.domain}/${input.explanationId}`,
    narrative: parts.join("\n"),
    highlights,
    severity: deriveSeverity(input),
  };
}

// ─── Support Narrative ───────────────────────────────────────────────────────

function buildSupportNarrative(input: NarrativeInput): Omit<AuditNarrative, "id" | "timestamp"> {
  // Support gets everything admin gets + explicit diagnostic markers
  const admin = buildAdminNarrative(input);
  const diagnosticParts: string[] = [admin.narrative];

  if (input.trust.risk.level !== "none") {
    diagnosticParts.push(`\n--- DIAGNOSTICO ---`);
    diagnosticParts.push(`Risk factors: ${input.trust.risk.factors.join(", ")}`);
    if (input.trust.risk.mitigation) {
      diagnosticParts.push(`Mitigacao aplicada: ${input.trust.risk.mitigation}`);
    }
  }

  if (input.execution?.recoveryActions.length) {
    diagnosticParts.push(`Recovery actions: ${input.execution.recoveryActions.join(", ")}`);
  }

  return {
    ...admin,
    audience: "support",
    title: `[Suporte] ${domainTitle(input.domain)}`,
    narrative: diagnosticParts.join("\n"),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DOMAIN_TITLES: Record<ExplanationDomain, string> = {
  decision:    "Decisao do sistema",
  policy:      "Politica aplicada",
  campaign:    "Campanha executada",
  publication: "Publicacao",
  execution:   "Execucao de pipeline",
  recovery:    "Recuperacao automatica",
  copilot:     "Recomendacao do copilot",
  billing:     "Evento de billing",
  override:    "Override manual",
};

function domainTitle(domain: ExplanationDomain): string {
  return DOMAIN_TITLES[domain] ?? domain;
}

function deriveSeverity(input: NarrativeInput): "info" | "warning" | "error" | "success" {
  if (input.policy?.evaluation === "blocked") return "error";
  if (input.trust.risk.level === "critical" || input.trust.risk.level === "high") return "warning";
  if (input.execution?.finalStatus === "failure") return "error";
  if (input.execution?.finalStatus === "success") return "success";
  return "info";
}
