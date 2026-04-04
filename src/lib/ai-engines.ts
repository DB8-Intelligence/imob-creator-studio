/**
 * ai-engines.ts
 *
 * Definição de todos os motores de IA disponíveis no ImobCreator AI.
 * Mapeia casos de uso (linguagem do usuário) → provider/engine técnico.
 *
 * Princípio: o usuário escolhe O QUE quer fazer.
 *            o sistema decide qual engine usar.
 */

import type { AIEngineId } from "@/lib/creative-catalog";
import type { PlanTier } from "@/lib/plan-rules";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EngineCapability =
  | "image_generate"   // gera imagem do zero a partir de texto
  | "image_edit"       // edita/transforma imagem existente
  | "caption"          // gera texto/legenda
  | "video_generate"   // gera vídeo a partir de imagens
  | "upscale"          // melhora resolução de imagem
  | "staging";         // mobiliar ambientes

export type UseCaseId =
  | "gerar_post"
  | "gerar_story"
  | "gerar_banner"
  | "gerar_arte_premium"
  | "gerar_descricao"
  | "mobiliar_ambiente"
  | "transformar_em_video"
  | "melhorar_imagem"
  | "render_espaco"
  | "gerar_reels_cover";

export interface AIEngineDefinition {
  id:              AIEngineId;
  label:           string;
  provider:        "google" | "openai" | "internal";
  model:           string;
  capability:      EngineCapability;
  edge_function:   string;              // nome da Supabase Edge Function
  description:     string;
  strengths:       string[];
  plan_required:   PlanTier;
  credit_cost:     number;
  status:          "active" | "beta" | "coming_soon";
  badge?:          string;
}

export interface UseCaseDefinition {
  id:          UseCaseId;
  label:       string;
  description: string;
  icon:        string;               // emoji
  engines:     AIEngineId[];         // engines suportados, em ordem de preferência
  default_engine: AIEngineId;
  category:    "criar" | "transformar" | "melhorar" | "escrever";
}

// ─── Engines disponíveis ──────────────────────────────────────────────────────

export const AI_ENGINES: Record<AIEngineId, AIEngineDefinition> = {

  gemini_image: {
    id:            "gemini_image",
    label:         "Gemini Image",
    provider:      "google",
    model:         "gemini-2.0-flash-exp",
    capability:    "image_generate",
    edge_function: "gerar-criativo",
    description:   "Motor Google Gemini para geração de imagens fotorrealistas",
    strengths:     ["fotorrealismo", "ambientes externos", "imóveis populares"],
    plan_required: "starter",
    credit_cost:   1,
    status:        "active",
  },

  openai_image: {
    id:            "openai_image",
    label:         "OpenAI Image",
    provider:      "openai",
    model:         "dall-e-3",
    capability:    "image_generate",
    edge_function: "gerar-criativo",
    description:   "DALL-E 3 para imagens artísticas e criativos de alta qualidade",
    strengths:     ["arte premium", "luxo", "editorial", "estética sofisticada"],
    plan_required: "starter",
    credit_cost:   1,
    status:        "active",
  },

  art_generator: {
    id:            "art_generator",
    label:         "Art Generator",
    provider:      "openai",
    model:         "dall-e-3",
    capability:    "image_generate",
    edge_function: "generate-art",
    description:   "Geração de arte premium com foco em estética editorial e luxo",
    strengths:     ["arte premium", "editorial", "composição artística"],
    plan_required: "standard",
    credit_cost:   2,
    status:        "active",
    badge:         "Premium",
  },

  virtual_staging: {
    id:            "virtual_staging",
    label:         "Virtual Staging",
    provider:      "google",
    model:         "gemini-2.0-flash-exp",
    capability:    "staging",
    edge_function: "virtual-staging",
    description:   "Mobilia ambientes vazios com IA — residencial e comercial",
    strengths:     ["mobiliar ambientes", "decoração", "staging virtual"],
    plan_required: "standard",
    credit_cost:   2,
    status:        "active",
    badge:         "Exclusivo",
  },

  caption_generator: {
    id:            "caption_generator",
    label:         "Caption Generator",
    provider:      "openai",
    model:         "gpt-4o",
    capability:    "caption",
    edge_function: "generate-caption",
    description:   "Gera legendas, descrições e textos de venda para imóveis",
    strengths:     ["copywriting imobiliário", "SEO", "legendas para redes sociais"],
    plan_required: "starter",
    credit_cost:   0,
    status:        "active",
  },

  video_generator: {
    id:            "video_generator",
    label:         "Video Generator",
    provider:      "internal",
    model:         "veo-3.0",
    capability:    "video_generate",
    edge_function: "generate-video",
    description:   "Gera vídeos cinematográficos a partir de fotos do imóvel",
    strengths:     ["vídeo imobiliário", "tour virtual", "reels"],
    plan_required: "standard",
    credit_cost:   5,
    status:        "active",
    badge:         "Novo",
  },

  image_to_video: {
    id:            "image_to_video",
    label:         "Image to Video",
    provider:      "google",
    model:         "veo-3.0-generate-preview",
    capability:    "video_generate",
    edge_function: "image-to-video",
    description:   "Transforma fotos estáticas em vídeos com movimento de câmera",
    strengths:     ["transformação foto→vídeo", "movimento de câmera", "reels cover"],
    plan_required: "standard",
    credit_cost:   3,
    status:        "active",
    badge:         "Novo",
  },

  upscale: {
    id:            "upscale",
    label:         "Image Upscale",
    provider:      "internal",
    model:         "real-esrgan",
    capability:    "upscale",
    edge_function: "generate-art",
    description:   "Melhora resolução de imagens em até 4x mantendo qualidade",
    strengths:     ["aumento de resolução", "nitidez", "qualidade para impressão"],
    plan_required: "starter",
    credit_cost:   1,
    status:        "active",
  },
};

// ─── Casos de uso (linguagem do usuário) ──────────────────────────────────────

export const USE_CASES: Record<UseCaseId, UseCaseDefinition> = {

  gerar_post: {
    id:             "gerar_post",
    label:          "Gerar post",
    description:    "Crie um post para feed do Instagram ou Facebook",
    icon:           "📸",
    engines:        ["openai_image", "gemini_image"],
    default_engine: "openai_image",
    category:       "criar",
  },

  gerar_story: {
    id:             "gerar_story",
    label:          "Gerar story",
    description:    "Crie um story ou reels cover vertical",
    icon:           "📱",
    engines:        ["openai_image", "gemini_image"],
    default_engine: "openai_image",
    category:       "criar",
  },

  gerar_banner: {
    id:             "gerar_banner",
    label:          "Gerar banner de anúncio",
    description:    "Crie banners para tráfego pago Meta e Google",
    icon:           "🎯",
    engines:        ["openai_image", "gemini_image"],
    default_engine: "openai_image",
    category:       "criar",
  },

  gerar_arte_premium: {
    id:             "gerar_arte_premium",
    label:          "Gerar arte premium",
    description:    "Criativo editorial para imóveis de alto padrão",
    icon:           "✨",
    engines:        ["art_generator", "openai_image"],
    default_engine: "art_generator",
    category:       "criar",
  },

  gerar_descricao: {
    id:             "gerar_descricao",
    label:          "Gerar descrição / legenda",
    description:    "Texto persuasivo para anúncio ou post do imóvel",
    icon:           "✍️",
    engines:        ["caption_generator"],
    default_engine: "caption_generator",
    category:       "escrever",
  },

  mobiliar_ambiente: {
    id:             "mobiliar_ambiente",
    label:          "Mobiliar ambiente",
    description:    "Coloque móveis em ambientes vazios com IA",
    icon:           "🛋️",
    engines:        ["virtual_staging"],
    default_engine: "virtual_staging",
    category:       "transformar",
  },

  transformar_em_video: {
    id:             "transformar_em_video",
    label:          "Transformar foto em vídeo",
    description:    "Anime uma foto do imóvel com movimento de câmera",
    icon:           "🎬",
    engines:        ["image_to_video", "video_generator"],
    default_engine: "image_to_video",
    category:       "transformar",
  },

  melhorar_imagem: {
    id:             "melhorar_imagem",
    label:          "Melhorar qualidade da imagem",
    description:    "Aumente a resolução e nitidez da foto do imóvel",
    icon:           "🔍",
    engines:        ["upscale"],
    default_engine: "upscale",
    category:       "melhorar",
  },

  render_espaco: {
    id:             "render_espaco",
    label:          "Render de esboço / terreno",
    description:    "Visualize projetos e terrenos com render de IA",
    icon:           "🏗️",
    engines:        ["gemini_image", "openai_image"],
    default_engine: "gemini_image",
    category:       "transformar",
  },

  gerar_reels_cover: {
    id:             "gerar_reels_cover",
    label:          "Gerar capa de reels",
    description:    "Crie a capa perfeita para seus reels imobiliários",
    icon:           "🎥",
    engines:        ["image_to_video", "openai_image"],
    default_engine: "image_to_video",
    category:       "criar",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const USE_CASE_CATEGORIES = {
  criar:      "Criar do zero",
  transformar:"Transformar imagem",
  melhorar:   "Melhorar qualidade",
  escrever:   "Escrever texto",
} as const;

export function getUseCasesByCategory(cat: keyof typeof USE_CASE_CATEGORIES) {
  return Object.values(USE_CASES).filter((uc) => uc.category === cat);
}

export function getEngineForUseCase(useCaseId: UseCaseId): AIEngineDefinition {
  const uc = USE_CASES[useCaseId];
  return AI_ENGINES[uc.default_engine];
}

/** Rota interna correspondente a cada use case */
export const USE_CASE_ROUTES: Partial<Record<UseCaseId, string>> = {
  gerar_post:           "/create/ideia",
  gerar_story:          "/create/ideia",
  gerar_banner:         "/create/ideia",
  gerar_arte_premium:   "/create/ideia",
  gerar_descricao:      "/create/ideia",
  mobiliar_ambiente:    "/virtual-staging",
  transformar_em_video: "/video-creator",
  melhorar_imagem:      "/upscale",
  render_espaco:        "/sketch-render",
  gerar_reels_cover:    "/video-creator",
};
