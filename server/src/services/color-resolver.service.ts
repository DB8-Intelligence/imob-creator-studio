/**
 * color-resolver.service.ts — Resolução de paleta de cores
 *
 * Prioridade:
 *   1. user_profile.logo_url && cores_marca?.primaria → usar marca
 *   2. Senão → usar cores extraídas da imagem (ImageAnalysis.cores_imagem)
 */
import type { UserBrandProfile, ImageAnalysis, ResolvedPalette } from './types.js';

export function resolveColors(
  userProfile: UserBrandProfile,
  imageAnalysis: ImageAnalysis
): ResolvedPalette {
  const temMarca = !!(userProfile.logo_url && userProfile.cores_marca?.primaria);

  let primaria: string;
  let secundaria: string;
  let fundo: string;
  let fonte: 'marca' | 'imagem';

  if (temMarca) {
    primaria = userProfile.cores_marca!.primaria;
    secundaria = userProfile.cores_marca!.secundaria || darken(primaria, 0.6);
    fundo = harmonizeFundo(primaria, imageAnalysis.imovel.luminosidade);
    fonte = 'marca';
  } else {
    primaria = imageAnalysis.cores_imagem.accent_sugerido;
    secundaria = imageAnalysis.cores_imagem.secundaria;
    fundo = imageAnalysis.cores_imagem.fundo_sugerido;
    fonte = 'imagem';
  }

  const fundoRgb = hexToRgb(fundo);
  const intensity = imageAnalysis.cores_imagem.overlay_intensidade;

  return {
    primaria,
    secundaria,
    fundo,
    texto: '#FFFFFF',
    texto_corpo: 'rgba(235,220,195,0.85)',
    overlay_rgba: `rgba(${fundoRgb},${intensity})`,
    overlay_rgba_40: `rgba(${fundoRgb},${(intensity * 0.50).toFixed(2)})`,
    overlay_rgba_60: `rgba(${fundoRgb},${(intensity * 0.75).toFixed(2)})`,
    overlay_rgba_95: `rgba(${fundoRgb},${Math.min(intensity + 0.15, 0.97).toFixed(2)})`,
    accent: primaria,
    accent_40: hexWithAlpha(primaria, 0.40),
    accent_12: hexWithAlpha(primaria, 0.12),
    accent_08: hexWithAlpha(primaria, 0.08),
    fonte,
    css_overlay_lateral: imageAnalysis.cores_imagem.overlay_css_lateral,
    css_overlay_inferior: imageAnalysis.cores_imagem.overlay_css_inferior,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function hexWithAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)},${alpha})`;
}

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  let r = parseInt(h.slice(0, 2), 16) / 255;
  let g = parseInt(h.slice(2, 4), 16) / 255;
  let b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const lig = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lig * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function harmonizeFundo(corMarca: string, luminosidade: string): string {
  const [h, s] = hexToHsl(corMarca);
  if (luminosidade === 'clara') return hslToHex(h, Math.min(s, 40), 8);
  if (luminosidade === 'media') return hslToHex(h, Math.min(s, 35), 12);
  return hslToHex(h, Math.min(s, 30), 10);
}

function darken(hex: string, factor: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.round(l * factor));
}
