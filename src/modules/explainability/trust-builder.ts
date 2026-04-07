/**
 * trust-builder.ts — Constrói TrustSignal a partir de dados do sistema
 *
 * Funções puras que analisam contexto de execução e produzem
 * indicadores de confiança e risco sem dependência de LLM.
 */

import type {
  TrustSignal,
  ConfidenceIndicator,
  RiskIndicator,
  ConfidenceLevel,
  RiskLevel,
} from "./types";

// ─── Confidence Builder ──────────────────────────────────────────────────────

export interface ConfidenceInput {
  /** O motor/template encontrou match forte? */
  matchStrength?: "strong" | "moderate" | "weak";
  /** A imagem foi analisada com sucesso pela Vision? */
  imageAnalyzed?: boolean;
  /** O copy foi gerado pela IA ou é manual? */
  copySource?: "ai" | "manual" | "template_default";
  /** Existem dados de marca do usuário? */
  hasBrandProfile?: boolean;
  /** Fatores customizados adicionais */
  customFactors?: string[];
}

export function buildConfidence(input: ConfidenceInput): ConfidenceIndicator {
  const factors: string[] = [];
  let score = 0.5; // base

  if (input.matchStrength === "strong") {
    score += 0.25;
    factors.push("template_match_strong");
  } else if (input.matchStrength === "moderate") {
    score += 0.1;
    factors.push("template_match_moderate");
  } else if (input.matchStrength === "weak") {
    score -= 0.1;
    factors.push("template_match_weak");
  }

  if (input.imageAnalyzed) {
    score += 0.1;
    factors.push("image_analyzed_ok");
  } else if (input.imageAnalyzed === false) {
    score -= 0.15;
    factors.push("image_analysis_failed");
  }

  if (input.copySource === "ai") {
    score += 0.05;
    factors.push("copy_ai_generated");
  } else if (input.copySource === "manual") {
    factors.push("copy_manual");
  }

  if (input.hasBrandProfile) {
    score += 0.1;
    factors.push("brand_profile_available");
  }

  if (input.customFactors) {
    factors.push(...input.customFactors);
  }

  score = Math.max(0, Math.min(1, score));
  const level = scoreToConfidenceLevel(score);

  return { score: Math.round(score * 100) / 100, level, factors };
}

function scoreToConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.75) return "high";
  if (score >= 0.5)  return "medium";
  if (score >= 0.25) return "low";
  return "unknown";
}

// ─── Risk Builder ────────────────────────────────────────────────────────────

export interface RiskInput {
  /** Houve fallback de algum serviço? */
  fallbackUsed?: boolean;
  /** Recovery/retry foi necessário? */
  recoveryTriggered?: boolean;
  /** Rate limit próximo de ser atingido? */
  rateLimitClose?: boolean;
  /** Créditos próximos de acabar? */
  creditsLow?: boolean;
  /** Alguma policy foi violada? */
  policyViolation?: boolean;
  /** API externa retornou erro antes de sucesso? */
  externalApiRetried?: boolean;
  /** Mitigação aplicada (se houver) */
  mitigation?: string;
  /** Fatores customizados */
  customFactors?: string[];
}

export function buildRisk(input: RiskInput): RiskIndicator {
  const factors: string[] = [];
  let score = 0; // base = sem risco

  if (input.policyViolation) {
    score += 0.4;
    factors.push("policy_violation");
  }

  if (input.fallbackUsed) {
    score += 0.15;
    factors.push("fallback_used");
  }

  if (input.recoveryTriggered) {
    score += 0.15;
    factors.push("recovery_triggered");
  }

  if (input.rateLimitClose) {
    score += 0.1;
    factors.push("rate_limit_close");
  }

  if (input.creditsLow) {
    score += 0.1;
    factors.push("credits_low");
  }

  if (input.externalApiRetried) {
    score += 0.1;
    factors.push("external_api_retried");
  }

  if (input.customFactors) {
    factors.push(...input.customFactors);
  }

  score = Math.max(0, Math.min(1, score));
  const level = scoreToRiskLevel(score);

  return {
    score: Math.round(score * 100) / 100,
    level,
    factors,
    mitigation: input.mitigation,
  };
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 0.7) return "critical";
  if (score >= 0.5) return "high";
  if (score >= 0.3) return "medium";
  if (score >= 0.1) return "low";
  return "none";
}

// ─── Trust Signal Composer ───────────────────────────────────────────────────

export interface TrustInput {
  confidence: ConfidenceInput;
  risk: RiskInput;
  policyCompliant?: boolean;
  humanReviewNeeded?: boolean;
}

export function buildTrustSignal(input: TrustInput): TrustSignal {
  const confidence = buildConfidence(input.confidence);
  const risk = buildRisk(input.risk);

  const policyCompliant = input.policyCompliant ?? !input.risk.policyViolation;
  const fallbackUsed = input.risk.fallbackUsed ?? false;
  const recoveryTriggered = input.risk.recoveryTriggered ?? false;
  const humanReviewNeeded = input.humanReviewNeeded ?? risk.level === "critical";

  let governanceStatus: TrustSignal["governanceStatus"] = "compliant";
  if (!policyCompliant) governanceStatus = "violation";
  else if (risk.level === "high" || risk.level === "critical") governanceStatus = "warning";

  return {
    confidence,
    risk,
    policyCompliant,
    fallbackUsed,
    recoveryTriggered,
    humanReviewNeeded,
    governanceStatus,
  };
}
