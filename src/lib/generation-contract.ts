/**
 * generation-contract.ts
 *
 * Contrato padrão de geração do ImobCreator AI.
 *
 * Todos os fluxos de geração (gerar post, virtual staging, upscale,
 * sketch-render, empty-lot, vídeo, etc.) usam este contrato único.
 * O campo `generation_type` é o discriminante de roteamento no n8n.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Frontend  →  generate-dispatch  →  n8n Router  →  edge function   │
 * │                      ↓                                              │
 * │              generation_jobs (pending)                              │
 * │                                           ↓                         │
 * │                              generation_jobs (done) + generated_assets│
 * │                                           ↓                         │
 * │  Frontend  ←  Supabase Realtime subscription                       │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { AIEngineId } from "@/lib/creative-catalog";
import type { UseCaseId } from "@/lib/ai-engines";

// ─── Discriminantes ──────────────────────────────────────────────────────────

/**
 * generation_type — chave de roteamento principal.
 * Mapeia diretamente para caminhos no n8n Router.
 */
export type GenerationType =
  | "gerar_post"          // post feed (1:1 ou 4:5)
  | "gerar_story"         // story / reels cover (9:16)
  | "gerar_banner"        // banner tráfego pago
  | "gerar_arte_premium"  // editorial / luxo
  | "virtual_staging"     // mobiliar ambiente vazio
  | "upscale"             // melhorar resolução
  | "sketch_render"       // render de esboço / terreno
  | "empty_lot"           // lote vazio com render 3D
  | "generate_art"        // arte decorativa / lifestyle
  | "image_to_video"      // foto → vídeo com movimento
  | "video_compose"       // múltiplas fotos → vídeo
  | "gerar_descricao";    // texto / legenda (sem imagem)

/** Status do job de geração */
export type GenerationStatus =
  | "pending"     // criado, aguardando processamento
  | "processing"  // n8n/engine em execução
  | "done"        // concluído com sucesso
  | "error";      // falhou — ver error_message

/**
 * callback_mode — como o resultado é entregue ao frontend.
 * "sync"  → generate-dispatch aguarda o resultado antes de responder (≤30s)
 * "async" → retorna job_id imediatamente; frontend assina via Realtime
 */
export type CallbackMode = "sync" | "async";

// ─── Request ─────────────────────────────────────────────────────────────────

/** Campos de branding enviados junto ao payload */
export interface GenerationBranding {
  brand_id?:        string;
  name?:            string;
  primary_color?:   string;
  secondary_color?: string;
  logo_url?:        string | null;
  slogan?:          string;
}

/**
 * GenerationRequest — payload padrão enviado pelo frontend para
 * generate-dispatch (e repassado ao n8n Router).
 *
 * Todos os campos são opcionais exceto generation_type e engine_id.
 * Campos não aplicáveis ao tipo de geração são ignorados silenciosamente.
 */
export interface GenerationRequest {
  // ── Identidade ──────────────────────────────────────────────────────
  workspace_id?:    string;
  user_id?:         string;   // preenchido server-side a partir do JWT
  from_studio?:     boolean;  // indica origem via Studio flow

  // ── Roteamento ──────────────────────────────────────────────────────
  generation_type:  GenerationType;
  engine_id:        AIEngineId;
  use_case_id?:     UseCaseId;

  // ── Contexto de template ────────────────────────────────────────────
  template_id?:     string;
  template_name?:   string;

  // ── Conteúdo ────────────────────────────────────────────────────────
  prompt_base?:     string;   // base do prompt fornecida pelo template
  style?:           string;   // luxury | modern | minimal | corporate | popular
  aspect_ratio?:    string;   // "1:1" | "4:5" | "9:16" | "16:9" | "3:2"
  visual_style?:    string;   // campo livre de estilo visual

  editable_fields?: {         // campos editáveis pelo usuário
    titulo?:     string;
    subtitulo?:  string;
    cta?:        string;
    conceito?:   string;      // texto livre / briefing
    canal?:      string;
    tipo?:       string;
    quantidade?: number;
    [key: string]: unknown;
  };

  // ── Imagens de entrada ──────────────────────────────────────────────
  image_urls?:      string[];   // URLs de imagens de entrada (staging, upscale, etc.)
  property_id?:     string;     // ID do imóvel relacionado (opcional)

  // ── Branding ────────────────────────────────────────────────────────
  branding?:        GenerationBranding;

  // ── Controle de execução ────────────────────────────────────────────
  callback_mode?:   CallbackMode;  // padrão: "async"
  callback_url?:    string;        // webhook externo opcional (n8n → URL do app)
  credit_cost?:     number;        // quantidade de créditos a debitar
}

// ─── Response ─────────────────────────────────────────────────────────────────

/**
 * GenerationResponse — retorno padrão de generate-dispatch.
 *
 * Em modo "sync": resultado final incluindo result_url.
 * Em modo "async": job_id + status "pending" (frontend assina via Realtime).
 */
export interface GenerationResponse {
  // ── Identificação ───────────────────────────────────────────────────
  job_id:           string;
  status:           GenerationStatus;

  // ── Resultado ───────────────────────────────────────────────────────
  result_url?:      string;    // URL pública da imagem/vídeo gerado (principal)
  preview_url?:     string;    // thumb menor (quando disponível)
  result_urls?:     string[];  // múltiplos resultados (ex.: 3 variações)

  // ── Contexto devolvido ──────────────────────────────────────────────
  template_id?:     string;
  engine_id?:       AIEngineId;
  generation_type?: GenerationType;

  // ── Metadados ───────────────────────────────────────────────────────
  metadata?:        Record<string, unknown>;
  credits_consumed?: number;

  // ── Erro ────────────────────────────────────────────────────────────
  error_message?:   string;
}

// ─── Callback do n8n → generate-callback ────────────────────────────────────

/**
 * N8nGenerationCallback — payload que o n8n envia para
 * a edge function `generation-callback` ao concluir processamento.
 */
export interface N8nGenerationCallback {
  job_id:            string;
  status:            GenerationStatus;
  result_url?:       string;
  preview_url?:      string;
  result_urls?:      string[];
  engine_id?:        AIEngineId;
  generation_type?:  GenerationType;
  metadata?:         Record<string, unknown>;
  error_message?:    string;
  n8n_execution_id?: string;
}

// ─── Mapeamento generation_type → edge function ───────────────────────────────

/**
 * GENERATION_TYPE_TO_FUNCTION
 *
 * Usado pelo generate-dispatch (modo sync) e pelo n8n Router
 * para saber qual edge function chamar.
 */
export const GENERATION_TYPE_TO_FUNCTION: Record<GenerationType, string> = {
  gerar_post:         "gerar-criativo",
  gerar_story:        "gerar-criativo",
  gerar_banner:       "gerar-criativo",
  gerar_arte_premium: "generate-art",
  virtual_staging:    "virtual-staging",
  upscale:            "generate-art",
  sketch_render:      "gerar-criativo",
  empty_lot:          "gerar-criativo",
  generate_art:       "generate-art",
  image_to_video:     "image-to-video",
  video_compose:      "compose-video",
  gerar_descricao:    "generate-caption",
};

// ─── Mapeamento UseCaseId → GenerationType ────────────────────────────────────

export const USE_CASE_TO_GENERATION_TYPE: Record<string, GenerationType> = {
  gerar_post:           "gerar_post",
  gerar_story:          "gerar_story",
  gerar_banner:         "gerar_banner",
  gerar_arte_premium:   "gerar_arte_premium",
  mobiliar_ambiente:    "virtual_staging",
  melhorar_imagem:      "upscale",
  render_espaco:        "sketch_render",
  transformar_em_video: "image_to_video",
  gerar_reels_cover:    "gerar_story",
  gerar_descricao:      "gerar_descricao",
};
