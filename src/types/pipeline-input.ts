/**
 * pipeline-input.ts — Input do pipeline de criação de criativos (Creative Engine)
 *
 * Representa tudo que o pipeline recebe para gerar um conjunto de criativos
 * (post + story + reels) a partir de uma imagem + texto do usuário.
 */
import type { UserBrandProfile } from "./user-brand-profile";
import type { CreativeFormato } from "./template-config";

/**
 * PipelineInput — payload enviado para iniciar a geração de criativos.
 *
 * Fluxo:
 *   PipelineInput → analyzeCreative (Claude Vision) → ImageAnalysis
 *   ImageAnalysis → resolveColors → ResolvedPalette
 *   ResolvedPalette + ImageAnalysis + UserBrandProfile → buildVars → PipelineVars
 *   PipelineVars + TemplateConfig → buildShotstackJson → Shotstack render
 *   Shotstack render → PipelineOutput
 */
export interface PipelineInput {
  /** ID do usuário (auth.uid) */
  user_id: string;

  /** ID do workspace */
  workspace_id?: string;

  /** URL pública da imagem do imóvel (já uploaded no Supabase Storage) */
  imagem_url: string;

  /** Base64 da imagem (alternativa ao URL, para evitar round-trip) */
  imagem_base64?: string;

  /** Texto bruto do usuário descrevendo o imóvel/oferta */
  texto_bruto: string;

  /** ID do template a usar (ex: "dark_premium") */
  template_id: string;

  /** Formatos a gerar (padrão: post + story + reels — 3 arquivos) */
  formatos: CreativeFormato[];

  /** Perfil de marca do usuário (carregado do banco) */
  user_profile: UserBrandProfile;

  /** Forçar modelo Claude (padrão: claude-sonnet-4-6) */
  model_override?: "claude-sonnet-4-6" | "claude-haiku-4-5";

  /** Metadados adicionais (ex: origem, campaign_id) */
  metadata?: Record<string, unknown>;
}

// ─── PipelineVars — objeto final com todas as variáveis resolvidas ──────────

/**
 * PipelineVars — objeto montado pelo variable-resolver.
 * Cada {{chave}} nos templates Shotstack corresponde a um campo aqui.
 * Alimenta interpolateDeep() para gerar o JSON final de render.
 */
export interface PipelineVars {
  // ── Imagem e formato ────────────────────────────────────────────────
  imagem_url: string;
  logo_url: string;
  formato: CreativeFormato;
  largura: number;
  altura: number;

  // ── Imóvel ──────────────────────────────────────────────────────────
  tipo_imovel: string;
  ambiente: string;
  posicao_focal: string;
  posicao_foto_background: string;

  // ── Copy ────────────────────────────────────────────────────────────
  titulo_linha1: string;
  titulo_linha2: string;
  titulo_completo: string;
  subtitulo: string;
  conceito_campanha: string;
  cta_texto: string;
  badge_texto: string;
  script_elegante: string;
  copy_instagram: string;

  // ── Cores resolvidas ────────────────────────────────────────────────
  cor_primaria: string;
  cor_secundaria: string;
  cor_fundo: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  cor_accent: string;
  cor_accent_40: string;
  cor_accent_12: string;
  overlay_css_lateral: string;
  overlay_css_inferior: string;

  // ── Marca ───────────────────────────────────────────────────────────
  nome_corretor: string;
  creci?: string;
  whatsapp: string;

  // ── Composição ──────────────────────────────────────────────────────
  layout_recomendado: string;
  saturacao_foto: string;
}

// ─── Dimensões por formato ──────────────────────────────────────────────────

export const FORMATO_DIMENSOES: Record<CreativeFormato, { largura: number; altura: number }> = {
  post:  { largura: 1080, altura: 1350 },
  story: { largura: 1080, altura: 1920 },
  reels: { largura: 1080, altura: 1920 },
};
