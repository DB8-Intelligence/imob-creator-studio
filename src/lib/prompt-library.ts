/**
 * prompt-library.ts
 *
 * Biblioteca centralizada de prompts base do ImobCreator AI.
 *
 * Separada do catálogo de templates para permitir:
 *   - Atualizar prompts sem tocar na UI
 *   - A/B testing de variações
 *   - Reutilizar prompts entre templates
 *   - Escalar para novos templates sem duplicar prompts
 *
 * Estrutura: PromptDefinition → category + style + base + modifiers
 *
 * DEV-15: Consolidação dos motores, prompts e modelos de geração
 */

import type { CreativeCategory, VisualStyle, AspectRatio } from "@/lib/creative-catalog";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PromptDefinition {
  id:            string;
  category:      CreativeCategory;
  visual_style:  VisualStyle;
  aspect_ratio:  AspectRatio;
  base:          string;            // prompt base enviado ao engine
  style_suffix:  string;            // sufixo de estilo (adicionado ao final)
  negative?:     string;            // negative prompt (quando suportado)
  variables:     string[];          // campos editáveis que entram no prompt
  version:       number;            // para versionamento de A/B test
}

// ─── Sufixos de estilo (reutilizáveis) ──────────────────────────────────────

export const STYLE_SUFFIXES: Record<VisualStyle, string> = {
  luxury:    "dark elegant background, gold accents, premium aesthetic, editorial typography, high-end luxury brand identity",
  modern:    "clean minimal layout, contemporary typography, bright natural lighting, professional modern design",
  minimal:   "maximum white space, subtle accent colors, refined understated aesthetic, elegant simplicity",
  corporate: "professional trust-building layout, corporate blue tones, authoritative brand identity, clean hierarchy",
  popular:   "vibrant energetic colors, bold friendly typography, accessible approachable design, high visual impact",
  editorial: "magazine-quality composition, serif typography, architectural photography treatment, editorial spread aesthetic",
  dark:      "dramatic black background, cinematic lighting, high contrast, moody atmospheric aesthetic, film noir elegance",
};

// ─── Sufixos de formato ─────────────────────────────────────────────────────

export const RATIO_SUFFIXES: Record<AspectRatio, string> = {
  "1:1":    "square format, Instagram feed optimized",
  "4:5":    "4:5 portrait format, Instagram feed optimized",
  "9:16":   "vertical 9:16 format, mobile-first, stories/reels optimized",
  "16:9":   "horizontal 16:9 format, landscape, banner/hero optimized",
  "1.91:1": "wide horizontal 1.91:1, Google Display banner format",
};

// ─── Bases por tipo de peça ─────────────────────────────────────────────────

export const CATEGORY_PROMPT_BASES: Record<CreativeCategory, string> = {
  feed:          "Real estate marketing post, property showcase, social media optimized",
  story:         "Instagram story real estate creative, full-bleed vertical design, swipe-up CTA area",
  reels:         "Reels cover frame, cinematic vertical composition, first-frame hook design",
  banner:        "Paid advertising creative, real estate, bold headline, clear CTA button, high click-through design",
  landing:       "Landing page hero section, full-width composition, lead capture CTA, conversion-focused",
  luxo:          "Ultra-luxury real estate creative, premium property marketing, aspirational lifestyle",
  popular:       "Brazilian popular market real estate, friendly accessible design, financing highlight, family-oriented",
  institucional: "Real estate professional branding, corporate identity, trust and authority",
};

// ─── Biblioteca de prompts ──────────────────────────────────────────────────

export const PROMPT_LIBRARY: PromptDefinition[] = [

  // ── FEED ──────────────────────────────────────────────────────────────────

  {
    id: "feed-luxury",
    category: "feed",
    visual_style: "luxury",
    aspect_ratio: "1:1",
    base: "Luxury real estate marketing post, dark elegant background, gold accents, premium property photography, editorial typography, high-end aesthetic",
    style_suffix: STYLE_SUFFIXES.luxury,
    negative: "low quality, blurry, watermark, text errors, deformed, ugly, amateur",
    variables: ["titulo", "detalhes", "preco", "cta"],
    version: 1,
  },
  {
    id: "feed-modern",
    category: "feed",
    visual_style: "modern",
    aspect_ratio: "1:1",
    base: "Modern clean real estate Instagram post, minimal layout, white space, contemporary typography, professional real estate photography",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "detalhes", "localizacao", "cta"],
    version: 1,
  },
  {
    id: "feed-corporate",
    category: "feed",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    base: "Real estate lead capture post, professional agent branding, clean corporate layout, trust-building visual, Brazilian market style, property acquisition campaign",
    style_suffix: STYLE_SUFFIXES.corporate,
    variables: ["titulo", "descricao", "localizacao", "cta"],
    version: 1,
  },
  {
    id: "feed-editorial",
    category: "feed",
    visual_style: "editorial",
    aspect_ratio: "4:5",
    base: "Editorial minimal real estate post, white space, elegant serif font, architectural photography, magazine aesthetic",
    style_suffix: STYLE_SUFFIXES.editorial,
    variables: ["titulo", "detalhes"],
    version: 1,
  },

  // ── POPULAR ───────────────────────────────────────────────────────────────

  {
    id: "popular-oferta",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    base: "High-energy real estate deal post, bold orange and red colors, price highlight, urgency-driven layout, Brazilian popular market style, strong CTA",
    style_suffix: STYLE_SUFFIXES.popular,
    variables: ["titulo", "preco", "detalhes", "cta"],
    version: 1,
  },
  {
    id: "popular-mcmv",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    base: "Brazilian affordable housing real estate post, friendly family-oriented design, green colors, financing highlight, approachable typography, popular market aesthetic",
    style_suffix: STYLE_SUFFIXES.popular,
    variables: ["titulo", "preco", "detalhes", "localizacao", "cta"],
    version: 1,
  },
  {
    id: "popular-lancamento",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    base: "Brazilian neighborhood real estate launch post, bright friendly colors, community-focused design, property exterior photography, accessible pricing highlight",
    style_suffix: STYLE_SUFFIXES.popular,
    variables: ["titulo", "detalhes", "localizacao", "preco", "cta"],
    version: 1,
  },

  // ── STORY ─────────────────────────────────────────────────────────────────

  {
    id: "story-luxury",
    category: "story",
    visual_style: "luxury",
    aspect_ratio: "9:16",
    base: "Luxury real estate Instagram story, full bleed property photo, elegant overlay, gold typography, strong CTA button, premium aesthetic",
    style_suffix: STYLE_SUFFIXES.luxury,
    variables: ["titulo", "detalhes", "cta"],
    version: 1,
  },
  {
    id: "story-modern",
    category: "story",
    visual_style: "modern",
    aspect_ratio: "9:16",
    base: "Modern real estate virtual tour story, room showcase, navigation arrows overlay, contemporary design, Instagram stories format",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "detalhes", "localizacao", "cta"],
    version: 1,
  },
  {
    id: "story-urgencia",
    category: "story",
    visual_style: "popular",
    aspect_ratio: "9:16",
    base: "Urgent real estate story, bold red/orange gradient, countdown or scarcity elements, property photo, bold typography, strong swipe-up CTA",
    style_suffix: STYLE_SUFFIXES.popular,
    variables: ["titulo", "preco", "detalhes", "cta"],
    version: 1,
  },

  // ── REELS ─────────────────────────────────────────────────────────────────

  {
    id: "reels-luxury",
    category: "reels",
    visual_style: "luxury",
    aspect_ratio: "9:16",
    base: "Luxury real estate reels cover, cinematic vertical frame, dramatic lighting, premium property exterior/interior, elegant typography overlay",
    style_suffix: STYLE_SUFFIXES.luxury,
    variables: ["titulo", "detalhes"],
    version: 1,
  },
  {
    id: "reels-modern",
    category: "reels",
    visual_style: "modern",
    aspect_ratio: "9:16",
    base: "Modern real estate reels cover, contemporary vertical composition, urban property, bold modern typography, Instagram reels first frame",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "detalhes", "cta"],
    version: 1,
  },

  // ── BANNER ────────────────────────────────────────────────────────────────

  {
    id: "banner-meta-feed",
    category: "banner",
    visual_style: "modern",
    aspect_ratio: "1:1",
    base: "Facebook/Instagram paid ad creative, real estate, bold headline, property photo, clear CTA button, professional ad layout, high click-through design",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "detalhes", "preco", "cta"],
    version: 1,
  },
  {
    id: "banner-meta-story",
    category: "banner",
    visual_style: "modern",
    aspect_ratio: "9:16",
    base: "Vertical social media paid ad, real estate, full-bleed property image, bold headline, strong CTA, story/reels format, high-converting design",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "preco", "cta"],
    version: 1,
  },
  {
    id: "banner-google",
    category: "banner",
    visual_style: "corporate",
    aspect_ratio: "16:9",
    base: "Google Display ad banner, real estate, horizontal format, clean professional layout, property image, headline and CTA, trustworthy brand design",
    style_suffix: STYLE_SUFFIXES.corporate,
    variables: ["titulo", "cta"],
    version: 1,
  },

  // ── LANDING ───────────────────────────────────────────────────────────────

  {
    id: "landing-luxury",
    category: "landing",
    visual_style: "luxury",
    aspect_ratio: "16:9",
    base: "Luxury real estate landing page hero section, full-width property photography, dark elegant overlay, premium headline typography, lead capture CTA",
    style_suffix: STYLE_SUFFIXES.luxury,
    variables: ["titulo", "descricao", "cta"],
    version: 1,
  },
  {
    id: "landing-modern",
    category: "landing",
    visual_style: "modern",
    aspect_ratio: "16:9",
    base: "Modern real estate landing page hero, contemporary property photography, clean layout, conversion-focused design, compelling headline, strong CTA",
    style_suffix: STYLE_SUFFIXES.modern,
    variables: ["titulo", "detalhes", "descricao", "cta"],
    version: 1,
  },

  // ── LUXO ──────────────────────────────────────────────────────────────────

  {
    id: "luxo-editorial",
    category: "luxo",
    visual_style: "editorial",
    aspect_ratio: "1:1",
    base: "Ultra-luxury real estate editorial post, magazine-quality composition, architectural photography, dark moody aesthetic, gold metallic accents, editorial serif typography, award-winning design",
    style_suffix: STYLE_SUFFIXES.editorial,
    variables: ["titulo", "descricao", "estilo_visual"],
    version: 1,
  },
  {
    id: "luxo-dark-cinema",
    category: "luxo",
    visual_style: "dark",
    aspect_ratio: "1:1",
    base: "Cinematic dark luxury real estate post, dramatic black background, moody property photography, golden hour or dramatic lighting, film noir real estate aesthetic, high contrast",
    style_suffix: STYLE_SUFFIXES.dark,
    variables: ["titulo", "detalhes", "preco"],
    version: 1,
  },

  // ── INSTITUCIONAL ─────────────────────────────────────────────────────────

  {
    id: "institucional-corretor",
    category: "institucional",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    base: "Professional Brazilian real estate agent profile post, clean corporate design, trust-building layout, agent headshot placeholder, CRECI credential display, authoritative brand identity",
    style_suffix: STYLE_SUFFIXES.corporate,
    variables: ["nome", "creci", "cta"],
    version: 1,
  },
  {
    id: "institucional-imobiliaria",
    category: "institucional",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    base: "Real estate agency institutional post, professional corporate design, brand identity showcase, trust and authority visual elements, clean modern layout",
    style_suffix: STYLE_SUFFIXES.corporate,
    variables: ["titulo", "descricao", "cta"],
    version: 1,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Busca prompt por ID */
export function getPrompt(id: string): PromptDefinition | undefined {
  return PROMPT_LIBRARY.find((p) => p.id === id);
}

/** Busca prompts por categoria */
export function getPromptsByCategory(cat: CreativeCategory): PromptDefinition[] {
  return PROMPT_LIBRARY.filter((p) => p.category === cat);
}

/** Busca prompts por estilo visual */
export function getPromptsByStyle(style: VisualStyle): PromptDefinition[] {
  return PROMPT_LIBRARY.filter((p) => p.visual_style === style);
}

/**
 * Monta o prompt final para envio ao engine.
 * Combina: base + estilo + formato + campos do usuário.
 */
export function buildFinalPrompt(
  promptDef: PromptDefinition,
  userFields?: Record<string, string>,
): string {
  let prompt = promptDef.base;

  // Adicionar campos do usuário ao prompt
  if (userFields) {
    const fieldParts: string[] = [];
    if (userFields.titulo)      fieldParts.push(`property: "${userFields.titulo}"`);
    if (userFields.detalhes)    fieldParts.push(`details: ${userFields.detalhes}`);
    if (userFields.preco)       fieldParts.push(`price: ${userFields.preco}`);
    if (userFields.localizacao) fieldParts.push(`location: ${userFields.localizacao}`);
    if (userFields.cta)         fieldParts.push(`CTA: "${userFields.cta}"`);
    if (userFields.conceito)    fieldParts.push(`concept: ${userFields.conceito}`);

    if (fieldParts.length > 0) {
      prompt += `, ${fieldParts.join(", ")}`;
    }
  }

  // Adicionar sufixo de ratio
  prompt += `, ${RATIO_SUFFIXES[promptDef.aspect_ratio]}`;

  return prompt;
}

/**
 * Retorna o prompt_id correspondente a um template do catálogo.
 * Convenção: category + "-" + visual_style (ex: "feed-luxury")
 */
export function getPromptIdForTemplate(
  category: CreativeCategory,
  visualStyle: VisualStyle,
): string | undefined {
  const id = `${category}-${visualStyle}`;
  const found = PROMPT_LIBRARY.find((p) => p.id === id);
  return found?.id;
}
