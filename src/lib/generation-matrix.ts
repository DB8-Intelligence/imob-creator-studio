/**
 * generation-matrix.ts
 *
 * Matriz oficial de geração do ImobCreator AI.
 * Fonte única de verdade para o mapeamento completo:
 *
 *   use_case → generation_type → engine → edge_function → input → output → categoria
 *
 * Consumida por:
 *   - StudioPage (filtrar use cases por template)
 *   - AIEnginePicker (mostrar badges de resultado)
 *   - generate-dispatch (validação de roteamento)
 *   - Documentação e onboarding
 *
 * DEV-15: Consolidação dos motores, prompts e modelos de geração
 */

import type { AIEngineId } from "@/lib/creative-catalog";
import type { UseCaseId } from "@/lib/ai-engines";
import type { GenerationType } from "@/lib/generation-contract";
import type { PlanTier } from "@/lib/plan-rules";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type InputType =
  | "text_only"      // apenas campos de texto
  | "image_required" // precisa de pelo menos 1 imagem
  | "image_optional" // imagem melhora resultado mas não obrigatória
  | "multi_image";   // precisa de múltiplas imagens (vídeo, compose)

export type OutputType =
  | "static_image"   // imagem estática (post, banner, story)
  | "video"          // vídeo com movimento
  | "text"           // texto gerado (legenda, descrição)
  | "enhanced_image";// imagem melhorada (upscale, staging)

export type EngineReadiness =
  | "production"     // estável, testada, em uso
  | "beta"           // funcional mas em avaliação
  | "coming_soon"    // planejada, não habilitada
  | "deprecated";    // será removida

export interface GenerationMatrixEntry {
  use_case_id:       UseCaseId;
  generation_type:   GenerationType;
  engine_id:         AIEngineId;
  edge_function:     string;
  input_type:        InputType;
  output_type:       OutputType;
  category:          "criar" | "transformar" | "melhorar" | "escrever";
  visual_categories: string[];      // categorias do catálogo que usam esse fluxo
  plan_required:     PlanTier;
  credit_cost:       number;
  readiness:         EngineReadiness;
  avg_time_seconds:  number;        // tempo médio de geração
  description_user:  string;        // o que o usuário vê
  description_tech:  string;        // o que o dev precisa saber
}

// ─── Matriz oficial ──────────────────────────────────────────────────────────

export const GENERATION_MATRIX: GenerationMatrixEntry[] = [

  // ── CRIAR ──────────────────────────────────────────────────────────────────

  {
    use_case_id:      "gerar_post",
    generation_type:  "gerar_post",
    engine_id:        "openai_image",
    edge_function:    "gerar-criativo",
    input_type:       "image_optional",
    output_type:      "static_image",
    category:         "criar",
    visual_categories: ["feed", "popular", "institucional"],
    plan_required:    "starter",
    credit_cost:      1,
    readiness:        "production",
    avg_time_seconds: 15,
    description_user: "Cria um post pronto para Instagram ou Facebook a partir do template",
    description_tech: "DALL-E 3 via gerar-criativo. Aceita prompt_base + editable_fields. Output: 1 imagem.",
  },
  {
    use_case_id:      "gerar_story",
    generation_type:  "gerar_story",
    engine_id:        "openai_image",
    edge_function:    "gerar-criativo",
    input_type:       "image_optional",
    output_type:      "static_image",
    category:         "criar",
    visual_categories: ["story"],
    plan_required:    "starter",
    credit_cost:      1,
    readiness:        "production",
    avg_time_seconds: 15,
    description_user: "Cria um story vertical (9:16) para Instagram",
    description_tech: "DALL-E 3 via gerar-criativo. Mesmo pipeline de gerar_post com aspect_ratio 9:16.",
  },
  {
    use_case_id:      "gerar_banner",
    generation_type:  "gerar_banner",
    engine_id:        "openai_image",
    edge_function:    "gerar-criativo",
    input_type:       "image_optional",
    output_type:      "static_image",
    category:         "criar",
    visual_categories: ["banner"],
    plan_required:    "starter",
    credit_cost:      1,
    readiness:        "production",
    avg_time_seconds: 15,
    description_user: "Cria banner para anúncios no Meta ou Google",
    description_tech: "DALL-E 3 via gerar-criativo. Aspect ratio varia (1:1, 9:16, 16:9, 1.91:1).",
  },
  {
    use_case_id:      "gerar_arte_premium",
    generation_type:  "gerar_arte_premium",
    engine_id:        "art_generator",
    edge_function:    "generate-art",
    input_type:       "image_optional",
    output_type:      "static_image",
    category:         "criar",
    visual_categories: ["luxo"],
    plan_required:    "standard",
    credit_cost:      2,
    readiness:        "production",
    avg_time_seconds: 20,
    description_user: "Arte premium editorial para imóveis de alto padrão",
    description_tech: "Gemini 2.0 Flash via generate-art. Foco em composição artística e estética editorial.",
  },
  {
    use_case_id:      "gerar_reels_cover",
    generation_type:  "gerar_story",
    engine_id:        "image_to_video",
    edge_function:    "image-to-video",
    input_type:       "image_required",
    output_type:      "video",
    category:         "criar",
    visual_categories: ["reels"],
    plan_required:    "standard",
    credit_cost:      3,
    readiness:        "production",
    avg_time_seconds: 45,
    description_user: "Gera uma capa animada para reels a partir de uma foto",
    description_tech: "Veo 3.0 preview via image-to-video. Input: 1 imagem. Output: vídeo curto 9:16.",
  },

  // ── ESCREVER ───────────────────────────────────────────────────────────────

  {
    use_case_id:      "gerar_descricao",
    generation_type:  "gerar_descricao",
    engine_id:        "caption_generator",
    edge_function:    "generate-caption",
    input_type:       "text_only",
    output_type:      "text",
    category:         "escrever",
    visual_categories: [],
    plan_required:    "starter",
    credit_cost:      0,
    readiness:        "production",
    avg_time_seconds: 8,
    description_user: "Gera legenda, descrição ou texto de venda para o imóvel",
    description_tech: "GPT-4o via generate-caption. Input: título + conceito. Output: texto formatado.",
  },

  // ── TRANSFORMAR ────────────────────────────────────────────────────────────

  {
    use_case_id:      "mobiliar_ambiente",
    generation_type:  "image_restoration",
    engine_id:        "image_restoration",
    edge_function:    "image-restoration",
    input_type:       "image_required",
    output_type:      "enhanced_image",
    category:         "transformar",
    visual_categories: [],
    plan_required:    "standard",
    credit_cost:      2,
    readiness:        "production",
    avg_time_seconds: 25,
    description_user: "Coloca móveis em ambientes vazios com IA",
    description_tech: "Gemini 2.0 Flash via image-restoration. Input: foto do ambiente. Output: imagem mobiliada.",
  },
  {
    use_case_id:      "transformar_em_video",
    generation_type:  "image_to_video",
    engine_id:        "image_to_video",
    edge_function:    "image-to-video",
    input_type:       "image_required",
    output_type:      "video",
    category:         "transformar",
    visual_categories: [],
    plan_required:    "standard",
    credit_cost:      3,
    readiness:        "production",
    avg_time_seconds: 45,
    description_user: "Transforma uma foto do imóvel em vídeo com movimento de câmera",
    description_tech: "Veo 3.0 preview via image-to-video. Input: 1 imagem. Output: vídeo 4-6s.",
  },
  {
    use_case_id:      "render_espaco",
    generation_type:  "sketch_render",
    engine_id:        "gemini_image",
    edge_function:    "gerar-criativo",
    input_type:       "image_required",
    output_type:      "enhanced_image",
    category:         "transformar",
    visual_categories: [],
    plan_required:    "standard",
    credit_cost:      2,
    readiness:        "beta",
    avg_time_seconds: 20,
    description_user: "Render de esboço ou terreno vazio com IA",
    description_tech: "Gemini 2.0 Flash via gerar-criativo. Input: foto/sketch do espaço. Output: render.",
  },

  // ── MELHORAR ───────────────────────────────────────────────────────────────

  {
    use_case_id:      "melhorar_imagem",
    generation_type:  "upscale",
    engine_id:        "upscale",
    edge_function:    "generate-art",
    input_type:       "image_required",
    output_type:      "enhanced_image",
    category:         "melhorar",
    visual_categories: [],
    plan_required:    "starter",
    credit_cost:      1,
    readiness:        "production",
    avg_time_seconds: 12,
    description_user: "Aumenta a resolução e nitidez da foto do imóvel",
    description_tech: "Real-ESRGAN via generate-art. Input: imagem. Output: imagem 4x maior.",
  },
];

// ─── Engines futuros (roadmap) ──────────────────────────────────────────────

export interface FutureEngine {
  id:           string;
  label:        string;
  capability:   string;
  status:       EngineReadiness;
  dependency:   string;
  estimated_release: string;
}

export const ENGINE_ROADMAP: FutureEngine[] = [
  {
    id:           "flux_pro",
    label:        "Flux Pro (Black Forest Labs)",
    capability:   "image_generate",
    status:       "coming_soon",
    dependency:   "API access + provider adapter",
    estimated_release: "Q3 2026",
  },
  {
    id:           "video_compose_v2",
    label:        "Video Compose V2 (multi-scene)",
    capability:   "video_generate",
    status:       "beta",
    dependency:   "generate-video-v2 edge function (deployed)",
    estimated_release: "Q2 2026",
  },
  {
    id:           "renovate_property",
    label:        "Renovação de Imóvel",
    capability:   "image_edit",
    status:       "coming_soon",
    dependency:   "Adapter de edição + novo edge function",
    estimated_release: "Q3 2026",
  },
  {
    id:           "land_marking_3d",
    label:        "Marcação de Terreno 3D",
    capability:   "image_generate",
    status:       "coming_soon",
    dependency:   "Integração com modelo 3D + Gemini",
    estimated_release: "Q4 2026",
  },
  {
    id:           "carousel_generator",
    label:        "Gerador de Carrossel",
    capability:   "multi_image_generate",
    status:       "coming_soon",
    dependency:   "Loop de geração + composição final",
    estimated_release: "Q3 2026",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna a entrada da matriz para um use_case_id */
export function getMatrixEntry(useCaseId: UseCaseId): GenerationMatrixEntry | undefined {
  return GENERATION_MATRIX.find((e) => e.use_case_id === useCaseId);
}

/** Retorna todas as entradas por categoria */
export function getMatrixByCategory(cat: GenerationMatrixEntry["category"]): GenerationMatrixEntry[] {
  return GENERATION_MATRIX.filter((e) => e.category === cat);
}

/** Retorna use cases compatíveis com um template (por visual_categories ou general) */
export function getUseCasesForTemplate(templateCategory: string): GenerationMatrixEntry[] {
  return GENERATION_MATRIX.filter(
    (e) =>
      e.visual_categories.length === 0 || // universal (staging, upscale, video, text)
      e.visual_categories.includes(templateCategory)
  );
}

/** Retorna use cases que são production-ready */
export function getProductionUseCases(): GenerationMatrixEntry[] {
  return GENERATION_MATRIX.filter((e) => e.readiness === "production");
}

/** Label legível para o tipo de output */
export const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  static_image:   "Imagem",
  video:          "Vídeo",
  text:           "Texto",
  enhanced_image: "Imagem melhorada",
};

/** Label legível para o tipo de input */
export const INPUT_TYPE_LABELS: Record<InputType, string> = {
  text_only:      "Apenas texto",
  image_required: "Foto obrigatória",
  image_optional: "Foto opcional",
  multi_image:    "Múltiplas fotos",
};

/** Ícone por tipo de output */
export const OUTPUT_TYPE_ICONS: Record<OutputType, string> = {
  static_image:   "🖼️",
  video:          "🎬",
  text:           "✍️",
  enhanced_image: "✨",
};
