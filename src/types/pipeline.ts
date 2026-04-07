/**
 * pipeline.ts — Tipos do pipeline de geração (Creative Engine)
 *
 * ResolvedPalette, PipelineVars, JobStatus, CreativeJobInput.
 */
import type { CopyGerado } from './image-analysis';

export interface ResolvedPalette {
  primaria: string;
  secundaria: string;
  fundo: string;
  texto: string;
  texto_corpo: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  accent: string;
  accent_40: string;
  accent_12: string;
  accent_08: string;
  fonte: 'marca' | 'imagem';
  css_overlay_lateral: string;
  css_overlay_inferior: string;
}

export interface PipelineVars {
  imagem_url: string;
  logo_url: string;
  formato: 'post' | 'story' | 'reels' | 'quadrado' | 'paisagem';
  largura: number;
  altura: number;
  tipo_imovel: string;
  posicao_foto_background: string;
  titulo_linha1: string;
  titulo_linha2: string;
  titulo_completo: string;
  subtitulo: string;
  conceito_campanha: string;
  cta_texto: string;
  badge_texto: string;
  script_elegante: string;
  copy_instagram: string;
  copy_story: string;
  copy_whatsapp: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_fundo: string;
  cor_accent: string;
  cor_accent_40: string;
  cor_accent_12: string;
  cor_accent_08: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  overlay_css_lateral: string;
  overlay_css_inferior: string;
  cor_texto_corpo: string;
  nome_corretor: string;
  creci?: string;
  whatsapp: string;
  layout_recomendado: string;
}

export type JobStatus =
  | 'pending' | 'validating' | 'processing_image'
  | 'generating_copy' | 'composing' | 'rendering' | 'done' | 'error';

export interface CreativeJobInput {
  mode: 'form' | 'assistant';
  template_id?: string;
  formats: string[];
  variation_count: 1 | 5;
  image_count: 1 | 2 | 3;
  input_images: string[];
  logo_url?: string;
  use_brand_identity: boolean;
  style_id?: string;
  user_description: string;
  generated_copy?: Partial<CopyGerado>;
  manual_copy?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export const FORMATO_DIMENSOES: Record<string, { largura: number; altura: number }> = {
  post:     { largura: 1080, altura: 1350 },
  story:    { largura: 1080, altura: 1920 },
  reels:    { largura: 1080, altura: 1920 },
  quadrado: { largura: 1080, altura: 1080 },
  paisagem: { largura: 1920, altura: 1080 },
};
