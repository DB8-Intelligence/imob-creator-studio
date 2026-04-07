/**
 * pipeline-output.ts — Output do pipeline de criação de criativos (Creative Engine)
 *
 * Resultado final da geração: URLs dos criativos renderizados + metadados.
 * Armazenado na tabela generated_creatives.
 */
import type { CreativeFormato } from "./template-config";

// ─── Status do Job ──────────────────────────────────────────────────────────

export type CreativeEngineJobStatus =
  | "pending"
  | "analyzing"
  | "generating"
  | "rendering"
  | "completed"
  | "failed";

// ─── Criativo Gerado (por formato) ─────────────────────────────────────────

export interface GeneratedCreative {
  /** UUID do criativo gerado */
  id: string;

  /** FK para creative_jobs */
  job_id: string;

  /** FK para auth.users */
  user_id: string;

  /** Formato: post | story | reels */
  formato: CreativeFormato;

  /** ID do render no Shotstack */
  shotstack_render_id?: string;

  /** URL pública do criativo renderizado (JPG/PNG) */
  output_url?: string;

  /** URL da thumbnail (menor) */
  thumbnail_url?: string;

  /** Legenda pronta para Instagram */
  copy_instagram?: string;

  /** Status do render individual */
  status: "rendering" | "completed" | "failed";

  created_at: string;
}

// ─── Pipeline Output (job completo) ─────────────────────────────────────────

/**
 * PipelineOutput — resultado completo de um job de geração.
 *
 * Um job gera até 3 criativos (post + story + reels) em paralelo.
 * O pipeline retorna este objeto ao concluir todos os renders.
 */
export interface PipelineOutput {
  /** UUID do job */
  job_id: string;

  /** Status do job */
  status: CreativeEngineJobStatus;

  /** ID do template usado */
  template_id: string;

  /** Criativos gerados (1 por formato) */
  creatives: GeneratedCreative[];

  /** Copy para Instagram (do formato post, compartilhado) */
  copy_instagram?: string;

  /** Análise completa feita pelo Claude (para debug/auditoria) */
  analise_resultado?: Record<string, unknown>;

  /** Variáveis resolvidas (para debug/auditoria) */
  vars_resolvidas?: Record<string, unknown>;

  /** Mensagem de erro (se status === "failed") */
  error_message?: string;

  /** Tempo total de processamento em ms */
  processing_time_ms?: number;

  /** Créditos consumidos */
  credits_consumed?: number;

  created_at: string;
  completed_at?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extrai a URL do criativo por formato */
export function getCreativeUrl(
  output: PipelineOutput,
  formato: CreativeFormato
): string | null {
  const creative = output.creatives.find((c) => c.formato === formato);
  return creative?.output_url ?? null;
}

/** Verifica se todos os criativos do job foram renderizados */
export function isJobComplete(output: PipelineOutput): boolean {
  return (
    output.status === "completed" &&
    output.creatives.length > 0 &&
    output.creatives.every((c) => c.status === "completed")
  );
}

/** Verifica se algum criativo falhou */
export function hasJobErrors(output: PipelineOutput): boolean {
  return (
    output.status === "failed" ||
    output.creatives.some((c) => c.status === "failed")
  );
}
