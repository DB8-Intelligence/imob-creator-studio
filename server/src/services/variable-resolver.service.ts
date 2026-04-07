/**
 * variable-resolver.service.ts — Monta PipelineVars a partir da análise + cores + profile
 */
import type { ImageAnalysis, ResolvedPalette, UserBrandProfile, PipelineVars } from './types.js';
import { FORMATO_DIMENSOES } from './types.js';

export function buildVars(
  analise: ImageAnalysis,
  cores: ResolvedPalette,
  userProfile: UserBrandProfile,
  imagem_url: string,
  formato: string
): PipelineVars {
  const dim = FORMATO_DIMENSOES[formato] ?? FORMATO_DIMENSOES.post;

  return {
    imagem_url,
    logo_url: userProfile.logo_url || '',
    formato,
    ...dim,

    tipo_imovel: analise.imovel.tipo,
    posicao_foto_background: analise.composicao.posicao_foto_background,

    titulo_linha1: analise.copy.titulo_linha1,
    titulo_linha2: analise.copy.titulo_linha2,
    titulo_completo: analise.copy.titulo_completo,
    subtitulo: analise.copy.subtitulo,
    conceito_campanha: analise.copy.conceito_campanha,
    cta_texto: analise.copy.cta_texto,
    badge_texto: analise.copy.badge_texto,
    script_elegante: analise.copy.script_elegante,
    copy_instagram: analise.copy.copy_instagram,
    copy_story: analise.copy.copy_story,
    copy_whatsapp: analise.copy.copy_whatsapp,

    cor_primaria: cores.primaria,
    cor_secundaria: cores.secundaria,
    cor_fundo: cores.fundo,
    cor_accent: cores.accent,
    cor_accent_40: cores.accent_40,
    cor_accent_12: cores.accent_12,
    cor_accent_08: cores.accent_08,
    overlay_rgba: cores.overlay_rgba,
    overlay_rgba_40: cores.overlay_rgba_40,
    overlay_rgba_60: cores.overlay_rgba_60,
    overlay_rgba_95: cores.overlay_rgba_95,
    overlay_css_lateral: cores.css_overlay_lateral,
    overlay_css_inferior: cores.css_overlay_inferior,
    cor_texto_corpo: cores.texto_corpo,

    nome_corretor: userProfile.nome_corretor,
    creci: userProfile.creci,
    whatsapp: userProfile.whatsapp,

    layout_recomendado: analise.composicao.layout_recomendado,
  };
}

/** Interpola {{variavel}} em strings */
export function interpolate(template: string, vars: PipelineVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = (vars as unknown as Record<string, unknown>)[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

/** Interpola recursivamente em objetos/arrays */
export function interpolateDeep(obj: unknown, vars: PipelineVars): unknown {
  if (typeof obj === 'string') return interpolate(obj, vars);
  if (Array.isArray(obj)) return obj.map((item) => interpolateDeep(item, vars));
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = interpolateDeep((obj as Record<string, unknown>)[key], vars);
    }
    return result;
  }
  return obj;
}
