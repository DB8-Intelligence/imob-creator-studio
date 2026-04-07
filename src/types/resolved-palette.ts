/**
 * resolved-palette.ts — Paleta de cores resolvida (Creative Engine)
 *
 * O ColorResolver decide a paleta final com base na prioridade:
 *   1. Tem logo cadastrada → usar cores da marca (UserBrandProfile.cores_marca)
 *   2. Não tem logo → usar cores extraídas da imagem (ImageAnalysis.cores_imagem)
 *
 * A paleta resolvida alimenta todas as variáveis de cor nos templates Shotstack.
 * Ref: references/color-resolver.md
 */

export type PaletteSource = "marca" | "imagem";

export interface ResolvedPalette {
  /** Cor primária (marca ou accent da imagem) */
  primaria: string;

  /** Cor secundária (marca ou secundária da imagem) */
  secundaria: string;

  /** Cor de fundo para overlays */
  fundo: string;

  /** Cor de texto principal (geralmente #FFFFFF) */
  texto: string;

  /** Cor de texto corpo (com opacidade, ex: rgba(235,220,195,0.85)) */
  texto_corpo: string;

  /** Overlay base (intensidade do color-resolver) */
  overlay_rgba: string;

  /** Overlay 40% (intensidade * 0.50) */
  overlay_rgba_40: string;

  /** Overlay 60% (intensidade * 0.75) */
  overlay_rgba_60: string;

  /** Overlay 95% (intensidade + 0.15, cap 0.97) */
  overlay_rgba_95: string;

  /** Cor de acento (= primária) */
  accent: string;

  /** Acento com alpha 40% */
  accent_40: string;

  /** Acento com alpha 12% */
  accent_12: string;

  /** Acento com alpha 8% */
  accent_08: string;

  /** Fonte da paleta: marca do usuário ou imagem enviada */
  fonte: PaletteSource;

  /** CSS gradient lateral para overlay */
  css_overlay_lateral: string;

  /** CSS gradient inferior para overlay */
  css_overlay_inferior: string;
}
