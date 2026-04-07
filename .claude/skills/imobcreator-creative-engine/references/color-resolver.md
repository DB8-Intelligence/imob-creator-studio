# Color Resolver — Lógica de Resolução de Paleta

## Prioridade de Cores

```
PRIORIDADE 1: Usuário tem logo cadastrada
  → Usar cores extraídas da logo (UserBrandProfile.cores_marca)
  → Overlay usa fundo_sugerido harmonizado com a cor primária da marca

PRIORIDADE 2: Usuário não tem logo
  → Usar cores extraídas da imagem enviada (ImageAnalysis.cores_imagem)
  → Overlay usa fundo_sugerido extraído diretamente da imagem
```

## Implementação

```typescript
// src/services/pipeline/color-resolver.service.ts

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
    // PRIORIDADE 1: cores da marca
    primaria   = userProfile.cores_marca.primaria;
    secundaria = userProfile.cores_marca.secundaria || darken(primaria, 0.6);
    fundo      = harmonizeFundo(primaria, imageAnalysis.luminosidade);
    fonte      = 'marca';
  } else {
    // PRIORIDADE 2: cores da imagem
    primaria   = imageAnalysis.cores_imagem.accent_sugerido;
    secundaria = imageAnalysis.cores_imagem.secundaria;
    fundo      = imageAnalysis.cores_imagem.fundo_sugerido;
    fonte      = 'imagem';
  }

  const fundoRgb = hexToRgb(fundo);
  const intensity = imageAnalysis.cores_imagem.overlay_intensidade;

  return {
    primaria,
    secundaria,
    fundo,
    texto: '#FFFFFF',
    texto_corpo: `rgba(235,220,195,0.85)`,
    overlay_rgba:    `rgba(${fundoRgb},${intensity})`,
    overlay_rgba_40: `rgba(${fundoRgb},${(intensity * 0.50).toFixed(2)})`,
    overlay_rgba_60: `rgba(${fundoRgb},${(intensity * 0.75).toFixed(2)})`,
    overlay_rgba_95: `rgba(${fundoRgb},${Math.min(intensity + 0.15, 0.97).toFixed(2)})`,
    accent:     primaria,
    accent_40:  hexWithAlpha(primaria, 0.40),
    accent_12:  hexWithAlpha(primaria, 0.12),
    accent_08:  hexWithAlpha(primaria, 0.08),
    fonte,
    css_overlay_lateral:  imageAnalysis.cores_imagem.overlay_css_lateral,
    css_overlay_inferior: imageAnalysis.cores_imagem.overlay_css_inferior,
  };
}

// Harmoniza a cor de fundo com a cor primária da marca
function harmonizeFundo(corMarca: string, luminosidade: string): string {
  const [h, s] = hexToHsl(corMarca);
  // Mantém o matiz da marca, escurece para virar fundo
  if (luminosidade === 'clara') return hslToHex(h, Math.min(s, 40), 8);
  if (luminosidade === 'media') return hslToHex(h, Math.min(s, 35), 12);
  return hslToHex(h, Math.min(s, 30), 10);
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

function hexWithAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)},${alpha})`;
}

function darken(hex: string, factor: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, l * factor);
}
```

## Regras de Contraste (WCAG AA)

O resolver deve garantir contraste mínimo 4.5:1 entre texto e fundo:

```typescript
function ensureContrast(textColor: string, bgColor: string): string {
  const ratio = getContrastRatio(textColor, bgColor);
  if (ratio >= 4.5) return textColor;
  // Se não passa, usar branco ou preto dependendo do fundo
  return getLuminance(bgColor) > 0.5 ? '#1A1A1A' : '#FFFFFF';
}
```

## Mapeamento de variáveis nos templates Shotstack

Cada `{{variavel}}` no template JSON é substituída assim:

```
{{cor_primaria}}         → resolvedPalette.primaria
{{cor_secundaria}}       → resolvedPalette.secundaria
{{cor_fundo}}            → resolvedPalette.fundo
{{overlay_rgba}}         → resolvedPalette.overlay_rgba
{{overlay_rgba_40}}      → resolvedPalette.overlay_rgba_40
{{overlay_rgba_60}}      → resolvedPalette.overlay_rgba_60
{{overlay_rgba_95}}      → resolvedPalette.overlay_rgba_95
{{cor_accent}}           → resolvedPalette.accent
{{cor_accent_40}}        → resolvedPalette.accent_40
{{cor_accent_12}}        → resolvedPalette.accent_12
{{overlay_css_lateral}}  → resolvedPalette.css_overlay_lateral
{{overlay_css_inferior}} → resolvedPalette.css_overlay_inferior
```
