/**
 * types.ts — Re-export dos tipos usados pelos serviços backend.
 * Cópia local para evitar import de path aliases do frontend (@/).
 * Mantém sincronizado com src/types/*.ts do frontend.
 */

// ── UserBrandProfile ─────────────────────────────────────────────────────────

export interface CoresMarca {
  primaria: string;
  secundaria: string;
  neutra: string;
  fundo_preferido: string;
  estilo_detectado?: string;
}

export interface UserBrandProfile {
  id: string;
  user_id: string;
  nome_corretor: string;
  nome_imobiliaria?: string;
  creci?: string;
  whatsapp: string;
  instagram?: string;
  cidade_atuacao: string;
  nicho: 'residencial' | 'comercial' | 'luxo' | 'lancamentos' | 'rural';
  publico_alvo: 'jovens' | 'familias' | 'investidores' | 'alto_padrao' | 'geral';
  tom_comunicacao: 'formal' | 'sofisticado' | 'amigavel' | 'urgente' | 'aspiracional';
  logo_url?: string;
  cores_marca?: CoresMarca;
  estilo_marca?: string;
  foto_corretor_url?: string;
  onboarding_completo: boolean;
  created_at: string;
  updated_at: string;
}

// ── ImageAnalysis ────────────────────────────────────────────────────────────

export interface ImageAnalysis {
  imovel: {
    tipo: string;
    ambiente: 'interno' | 'externo' | 'aereo' | 'fachada' | 'area_comum';
    tem_pessoa: boolean;
    posicao_focal: 'esquerda' | 'centro' | 'direita' | 'full';
    luminosidade: 'escura' | 'media' | 'clara';
    contraste: 'alto' | 'medio' | 'baixo';
    zona_livre_texto: string;
    qualidade_foto: 'alta' | 'media' | 'baixa';
    angulo: string;
  };
  cores_imagem: {
    dominante: string;
    secundaria: string;
    terciaria: string;
    fundo_sugerido: string;
    accent_sugerido: string;
    overlay_intensidade: number;
    overlay_css_lateral: string;
    overlay_css_inferior: string;
  };
  copy: {
    titulo_linha1: string;
    titulo_linha2: string;
    titulo_completo: string;
    subtitulo: string;
    conceito_campanha: string;
    cta_texto: string;
    badge_texto: string;
    script_elegante: string;
    mood: string;
    copy_instagram: string;
    copy_story: string;
    copy_whatsapp: string;
  };
  composicao: {
    layout_recomendado: string;
    estilo_overlay: string;
    saturacao_foto: string;
    ajuste_brilho: number;
    ajuste_contraste: number;
    posicao_foto_background: string;
  };
  prompt_flux: {
    descricao_cena: string;
    estilo_fotografico: string;
    iluminacao: string;
    elementos_preservar: string;
  };
}

// ── ResolvedPalette ──────────────────────────────────────────────────────────

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

// ── PipelineVars ─────────────────────────────────────────────────────────────

export interface PipelineVars {
  imagem_url: string;
  logo_url: string;
  formato: string;
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

// ── JobStatus ────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'pending' | 'validating' | 'processing_image'
  | 'generating_copy' | 'composing' | 'rendering' | 'done' | 'error';

// ── TemplateDecision ─────────────────────────────────────────────────────────

export interface TemplateDecision {
  image_type: string;
  campaign_goal: string;
  luxury_level: 'standard' | 'premium' | 'ultra';
  composition_type: string;
  recommended_templates: string[];
  recommended_style: string;
  recommended_copy_mode: 'ia' | 'manual';
  recommended_pipeline: Record<string, unknown>;
  decision_reason: string;
}

export const FORMATO_DIMENSOES: Record<string, { largura: number; altura: number }> = {
  post:     { largura: 1080, altura: 1350 },
  story:    { largura: 1080, altura: 1920 },
  reels:    { largura: 1080, altura: 1920 },
  quadrado: { largura: 1080, altura: 1080 },
  paisagem: { largura: 1920, altura: 1080 },
};
