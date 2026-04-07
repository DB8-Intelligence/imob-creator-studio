/**
 * explainers.ts — Funções que produzem explicações estruturadas por domínio
 *
 * Cada explainer transforma dados do sistema em uma explicação compreensível
 * sem depender de LLM — usa templates e lógica determinística.
 */

import type {
  DecisionExplanation,
  PolicyExplanation,
  ExecutionExplanation,
  ActionTrace,
  ActionOutcome,
  ConfidenceIndicator,
} from "./types";
import { buildConfidence, type ConfidenceInput } from "./trust-builder";

// ─── Decision Explainer ──────────────────────────────────────────────────────

export interface DecisionInput {
  decisionId: string;
  decisionType: string;
  context: Record<string, unknown>;
  inputsSummary: string;
  chosenOption: string;
  rationale: string;
  alternativesRejected?: Array<{ option: string; reason: string }>;
  confidence?: ConfidenceInput;
}

export function explainDecision(input: DecisionInput): DecisionExplanation {
  const confidence = buildConfidence(input.confidence ?? {});

  return {
    decisionId: input.decisionId,
    decisionType: input.decisionType,
    context: input.context,
    inputsSummary: input.inputsSummary,
    rationale: input.rationale,
    alternativesRejected: input.alternativesRejected ?? [],
    chosenOption: input.chosenOption,
    confidence,
    timestamp: new Date().toISOString(),
  };
}

// ─── Policy Explainer ────────────────────────────────────────────────────────

export interface PolicyInput {
  policyId: string;
  policyName: string;
  trigger: string;
  evaluation: "allowed" | "blocked" | "warning";
  reason: string;
  inputsChecked: Record<string, unknown>;
  thresholds?: Record<string, number | string>;
  overridable?: boolean;
  overriddenBy?: string;
}

export function explainPolicy(input: PolicyInput): PolicyExplanation {
  return {
    policyId: input.policyId,
    policyName: input.policyName,
    trigger: input.trigger,
    evaluation: input.evaluation,
    reason: input.reason,
    inputsChecked: input.inputsChecked,
    thresholds: input.thresholds,
    overridable: input.overridable ?? false,
    overriddenBy: input.overriddenBy,
    timestamp: new Date().toISOString(),
  };
}

// ─── Execution Explainer ─────────────────────────────────────────────────────

export interface ExecutionStepInput {
  stepName: string;
  status: ActionOutcome;
  durationMs?: number;
  detail?: string;
}

export interface ExecutionInput {
  jobId: string;
  jobType: string;
  steps: ExecutionStepInput[];
  retryCount?: number;
  fallbackUsed?: boolean;
  recoveryActions?: string[];
  outputUrl?: string;
}

export function explainExecution(input: ExecutionInput): ExecutionExplanation {
  const totalDurationMs = input.steps.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);
  const hasFailure = input.steps.some((s) => s.status === "failure");
  const allSuccess = input.steps.every((s) => s.status === "success" || s.status === "skipped");

  let finalStatus: ActionOutcome = "success";
  if (hasFailure) finalStatus = "failure";
  else if (!allSuccess) finalStatus = "partial";

  return {
    jobId: input.jobId,
    jobType: input.jobType,
    steps: input.steps,
    totalDurationMs,
    retryCount: input.retryCount ?? 0,
    fallbackUsed: input.fallbackUsed ?? false,
    recoveryActions: input.recoveryActions ?? [],
    finalStatus,
    outputUrl: input.outputUrl,
    timestamp: new Date().toISOString(),
  };
}

// ─── Action Trace Builder ────────────────────────────────────────────────────

export interface TraceInput {
  actionId: string;
  actionType: string;
  triggeredBy: string;
  inputs: Record<string, unknown>;
  constraints?: string[];
  outcome: ActionOutcome;
  outputSummary?: string;
  durationMs?: number;
}

export function buildTrace(input: TraceInput): ActionTrace {
  return {
    actionId: input.actionId,
    actionType: input.actionType,
    triggeredBy: input.triggeredBy,
    inputs: input.inputs,
    constraints: input.constraints ?? [],
    outcome: input.outcome,
    outputSummary: input.outputSummary,
    durationMs: input.durationMs,
    timestamp: new Date().toISOString(),
  };
}

// ─── Convenience: explain from ControlPointResult ────────────────────────────

export function explainControlPoint(params: {
  policyName: string;
  trigger: string;
  result: { allowed: boolean; reason?: string; code?: string; requiredPlan?: string };
  inputsChecked: Record<string, unknown>;
}): PolicyExplanation {
  return explainPolicy({
    policyId: `control_point_${params.policyName}`,
    policyName: params.policyName,
    trigger: params.trigger,
    evaluation: params.result.allowed ? "allowed" : "blocked",
    reason: params.result.reason ?? (params.result.allowed ? "Permitido pela policy" : "Bloqueado pela policy"),
    inputsChecked: params.inputsChecked,
    overridable: false,
  });
}

// ─── Convenience: explain template decision ──────────────────────────────────

export function explainTemplateDecision(params: {
  decisionId: string;
  imageType: string;
  campaignGoal: string;
  luxuryLevel: string;
  chosenTemplate: string;
  reason: string;
  rejectedTemplates?: Array<{ option: string; reason: string }>;
  confidence?: ConfidenceInput;
}): DecisionExplanation {
  return explainDecision({
    decisionId: params.decisionId,
    decisionType: "template_selection",
    context: {
      image_type: params.imageType,
      campaign_goal: params.campaignGoal,
      luxury_level: params.luxuryLevel,
    },
    inputsSummary: `Imagem: ${params.imageType}, Objetivo: ${params.campaignGoal}, Luxo: ${params.luxuryLevel}`,
    chosenOption: params.chosenTemplate,
    rationale: params.reason,
    alternativesRejected: params.rejectedTemplates,
    confidence: params.confidence,
  });
}

// ─── Convenience: explain publication block ──────────────────────────────────

export function explainPublicationBlock(params: {
  publicationId: string;
  channel: string;
  reason: string;
  monthlyCount: number;
  limit: number;
  plan: string;
}): PolicyExplanation {
  return explainPolicy({
    policyId: `pub_limit_${params.channel}`,
    policyName: "publication_rate_limit",
    trigger: `Tentativa de publicação no canal ${params.channel}`,
    evaluation: "blocked",
    reason: params.reason,
    inputsChecked: {
      channel: params.channel,
      publications_this_month: params.monthlyCount,
      plan: params.plan,
    },
    thresholds: { max_publications_per_month: params.limit },
    overridable: false,
  });
}

// ─── Convenience: explain human override ─────────────────────────────────────

export function explainOverride(params: {
  originalPolicyId: string;
  originalEvaluation: "blocked" | "warning";
  overriddenBy: string;
  overrideReason: string;
}): PolicyExplanation {
  return explainPolicy({
    policyId: params.originalPolicyId,
    policyName: `override_${params.originalPolicyId}`,
    trigger: `Override humano por ${params.overriddenBy}`,
    evaluation: "allowed",
    reason: `Policy original: ${params.originalEvaluation}. Override: ${params.overrideReason}`,
    inputsChecked: { overridden_by: params.overriddenBy },
    overridable: true,
    overriddenBy: params.overriddenBy,
  });
}

// ─── Convenience: explain recovery ───────────────────────────────────────────

export function explainRecovery(params: {
  jobId: string;
  failedStep: string;
  recoveryAction: string;
  retryCount: number;
  finalOutcome: ActionOutcome;
}): ExecutionExplanation {
  return explainExecution({
    jobId: params.jobId,
    jobType: "recovery",
    steps: [
      { stepName: params.failedStep, status: "failure", detail: "Falha original" },
      { stepName: params.recoveryAction, status: params.finalOutcome, detail: `Retry #${params.retryCount}` },
    ],
    retryCount: params.retryCount,
    fallbackUsed: false,
    recoveryActions: [params.recoveryAction],
  });
}
