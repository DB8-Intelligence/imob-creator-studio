/**
 * creative-job.ts — Tipos do frontend para o sistema dual de criação (Formulário + Assistente IA)
 *
 * Alinhado com a tabela creative_jobs (PROMPT-1-FOUNDATION, migration 003).
 * Ambos os modos convergem para a mesma engine de geração.
 */

// ─── Job ─────────────────────────────────────────────────────────────────────

export type CreativeJobMode = "form" | "assistant";

export type CreativeJobStatus =
  | "pending"
  | "validating"
  | "processing_image"
  | "generating_copy"
  | "composing"
  | "rendering"
  | "done"
  | "error";

export type CreativeFormat = "quadrado" | "feed" | "stories" | "paisagem";

export const FORMAT_TO_RATIO: Record<CreativeFormat, string> = {
  quadrado: "1:1",
  feed: "4:5",
  stories: "9:16",
  paisagem: "16:9",
};

export const FORMAT_LABELS: Record<CreativeFormat, string> = {
  quadrado: "Quadrado",
  feed: "Feed",
  stories: "Stories",
  paisagem: "Paisagem",
};

export interface CopyData {
  titulo: string;
  subtitulo?: string;
  cta?: string;
  descricao?: string;
  hashtags?: string;
}

/** Payload enviado pelo frontend para criar um creative job */
export interface CreativeJobInput {
  mode: CreativeJobMode;
  template_id: string;
  formats: CreativeFormat[];
  variation_count: 1 | 5;
  image_count: 1 | 2 | 3;
  input_images: string[];
  logo_url: string | null;
  use_brand_identity: boolean;
  style_id: string | null;
  user_description: string;
  generated_copy: CopyData | null;
  manual_copy: CopyData | null;
  metadata?: Record<string, unknown>;
}

/** Row da tabela creative_jobs no Supabase (alinhado com migration 003_creative_jobs_v2) */
export interface CreativeJob {
  id: string;
  user_id: string;
  mode: CreativeJobMode;
  template_id: string | null;
  style_id: string | null;
  status: CreativeJobStatus;
  progress: number;
  formats: string[];
  variation_count: number;
  image_count: number;
  input_images: unknown[];        // JSONB array
  logo_url: string | null;
  use_brand_identity: boolean;
  user_description: string | null;
  generated_copy: Record<string, unknown>;
  manual_copy: Record<string, unknown>;
  analise_resultado: Record<string, unknown>;
  vars_resolvidas: Record<string, unknown>;
  auto_selected_template_id: string | null;
  auto_selected_style_id: string | null;
  auto_selected_pipeline: Record<string, unknown>;
  decision_reason: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Status Labels (para ProcessingScreen) ───────────────────────────────────

export const STATUS_LABELS: Record<CreativeJobStatus, string> = {
  pending: "Na fila",
  validating: "Validando entrada",
  processing_image: "Processando imagem",
  generating_copy: "Gerando textos",
  composing: "Preparando composição",
  rendering: "Renderizando criativo",
  done: "Concluído",
  error: "Erro",
};

export const STATUS_PROGRESS: Record<CreativeJobStatus, number> = {
  pending: 5,
  validating: 15,
  processing_image: 30,
  generating_copy: 50,
  composing: 65,
  rendering: 80,
  done: 100,
  error: 0,
};

// ─── Assistente IA — State Machine ───────────────────────────────────────────

export type AssistantStep =
  | "welcome"
  | "upload"
  | "theme"
  | "description"
  | "copy"
  | "confirm"
  | "generating"
  | "done";

export const ASSISTANT_STEPS: AssistantStep[] = [
  "welcome", "upload", "theme", "description", "copy", "confirm", "generating", "done",
];

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  chips?: { label: string; value: string }[];
  preview?: {
    type: "copy" | "image" | "summary";
    data: Record<string, unknown>;
  };
  timestamp: number;
}
