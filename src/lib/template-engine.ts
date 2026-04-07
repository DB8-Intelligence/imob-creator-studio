/**
 * template-engine.ts — Motor de templates para criação de criativos
 *
 * Cada template define regras de layout, copy, branding e composição.
 * Usado pelo pipeline invisível para montar o payload final de geração.
 *
 * Estende o creative-catalog.ts (fonte de templates visuais) com
 * regras de composição e renderização.
 */
import {
  CREATIVE_CATALOG,
  type CatalogTemplate,
  type CreativeCategory,
  type VisualStyle,
} from "@/lib/creative-catalog";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type CompositionEngine = "shotstack" | "dalle" | "gemini" | "puppeteer";
export type RestyleEngine = "gemini_restyle" | "dalle_variation" | "none";

export interface LayoutRule {
  /** Posição do overlay de texto: bottom, left-panel, full-overlay */
  text_position: "bottom" | "left_panel" | "full_overlay" | "top";
  /** Opacidade do overlay (0–1) */
  overlay_opacity: number;
  /** Cor do overlay */
  overlay_color: string;
  /** Posição do logo */
  logo_position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  /** Posição do badge (EXCLUSIVO, NOVO, etc.) */
  badge_position: "topLeft" | "topRight" | "none";
  /** Posição do CTA */
  cta_position: "bottomRight" | "bottomLeft" | "center" | "none";
}

export interface CopyRule {
  /** Número máximo de caracteres no título */
  max_title_chars: number;
  /** Incluir subtítulo */
  has_subtitle: boolean;
  /** Incluir CTA */
  has_cta: boolean;
  /** Incluir hashtags */
  has_hashtags: boolean;
  /** Tom do copy */
  tone: "luxury" | "urgent" | "friendly" | "institutional" | "popular";
  /** Prompt de sistema para geração de copy */
  copy_system_prompt: string;
}

export interface BrandingRule {
  /** Usar cores da marca do usuário */
  use_brand_colors: boolean;
  /** Cor primária fallback */
  fallback_primary: string;
  /** Cor de acento fallback */
  fallback_accent: string;
  /** Incluir logo */
  include_logo: boolean;
  /** Fonte primária (títulos) */
  font_primary: string;
  /** Fonte secundária (corpo) */
  font_secondary: string;
}

export interface TemplateEngineConfig {
  /** ID do CatalogTemplate que esta config estende */
  template_id: string;
  /** Referência direta ao CatalogTemplate */
  catalog_ref: CatalogTemplate | null;
  /** Tipos suportados */
  supported_types: ("post" | "story" | "reels" | "thumbnail")[];
  /** Prompt interno do sistema (não editável pelo usuário) */
  system_prompt: string;
  /** Regras de layout */
  layout: LayoutRule;
  /** Regras de copy */
  copy: CopyRule;
  /** Regras de branding */
  branding: BrandingRule;
  /** Engine de composição visual */
  composition_engine: CompositionEngine;
  /** Engine de reestilização (opcional) */
  restyle_engine: RestyleEngine;
  /** Ativo/inativo */
  is_active: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_LAYOUT: LayoutRule = {
  text_position: "bottom",
  overlay_opacity: 0.6,
  overlay_color: "#000000",
  logo_position: "topRight",
  badge_position: "none",
  cta_position: "bottomRight",
};

const DEFAULT_COPY: CopyRule = {
  max_title_chars: 60,
  has_subtitle: true,
  has_cta: true,
  has_hashtags: true,
  tone: "friendly",
  copy_system_prompt: "Gere um copy profissional e conciso para marketing imobiliário brasileiro.",
};

const DEFAULT_BRANDING: BrandingRule = {
  use_brand_colors: true,
  fallback_primary: "#1A1A2E",
  fallback_accent: "#00F2FF",
  include_logo: true,
  font_primary: "Montserrat",
  font_secondary: "Montserrat",
};

// ─── Configs por template ────────────────────────────────────────────────────

function catalogRef(id: string): CatalogTemplate | null {
  return CREATIVE_CATALOG.find((t) => t.id === id) ?? null;
}

export const TEMPLATE_ENGINE_CONFIGS: TemplateEngineConfig[] = [
  // ── FEED ────────────────────────────────────────────────────────────────
  {
    template_id: "feed-luxury-hero",
    catalog_ref: catalogRef("feed-luxury-hero"),
    supported_types: ["post"],
    system_prompt: "Criativo de luxo para feed imobiliário. Foto grande com overlay dark no rodapé, texto em branco com acentos dourados.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.55,
      overlay_color: "#0A0A0A",
      badge_position: "topLeft",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "luxury",
      copy_system_prompt: "Gere um copy sofisticado e exclusivo para imóvel de alto padrão. Tom elegante, sem exageros. Use palavras como: exclusivo, sofisticação, elegância.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#0A0A0A",
      fallback_accent: "#D4AF37",
      font_primary: "Playfair Display",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "feed-modern-clean",
    catalog_ref: catalogRef("feed-modern-clean"),
    supported_types: ["post"],
    system_prompt: "Criativo moderno e limpo para feed. Layout minimalista com bastante espaço em branco, tipografia bold.",
    layout: {
      ...DEFAULT_LAYOUT,
      text_position: "left_panel",
      overlay_opacity: 0,
      overlay_color: "#FFFFFF",
      logo_position: "topLeft",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "friendly",
      copy_system_prompt: "Gere um copy moderno e direto para marketing imobiliário. Tom profissional mas acessível.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#1A1A2E",
      fallback_accent: "#3B82F6",
      font_primary: "Poppins",
      font_secondary: "Poppins",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "feed-captacao-express",
    catalog_ref: catalogRef("feed-captacao-express"),
    supported_types: ["post"],
    system_prompt: "Criativo de captação rápida. Foco em urgência e CTA forte. Badge de destaque visível.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.5,
      badge_position: "topRight",
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "urgent",
      copy_system_prompt: "Gere um copy urgente e persuasivo para captação de imóveis. Use gatilhos de escassez e urgência.",
    },
    branding: { ...DEFAULT_BRANDING, fallback_accent: "#EF4444" },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "feed-popular-oferta",
    catalog_ref: catalogRef("feed-popular-oferta"),
    supported_types: ["post"],
    system_prompt: "Criativo popular para ofertas acessíveis. Cores vivas, preço em destaque, linguagem simples.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.7,
      overlay_color: "#1E3A5F",
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "popular",
      copy_system_prompt: "Gere um copy popular e acessível. Linguagem simples, foco no preço e condições de pagamento. Tom de oportunidade.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#1E3A5F",
      fallback_accent: "#F59E0B",
      font_primary: "Montserrat",
    },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "feed-minimal-editorial",
    catalog_ref: catalogRef("feed-minimal-editorial"),
    supported_types: ["post"],
    system_prompt: "Criativo editorial minimalista. Grande foco na fotografia, texto mínimo e elegante.",
    layout: {
      text_position: "bottom",
      overlay_opacity: 0.3,
      overlay_color: "#000000",
      logo_position: "bottomLeft",
      badge_position: "none",
      cta_position: "none",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 40,
      has_subtitle: false,
      has_cta: false,
      tone: "luxury",
      copy_system_prompt: "Gere um título curto e impactante. Estilo editorial, sem CTA. Apenas o nome/localização do imóvel.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_accent: "#FFFFFF",
      font_primary: "Playfair Display",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },

  // ── STORY ──────────────────────────────────────────────────────────────
  {
    template_id: "story-luxury-cta",
    catalog_ref: catalogRef("story-luxury-cta"),
    supported_types: ["story", "reels"],
    system_prompt: "Story de luxo com CTA forte. Formato 9:16, foto vertical com overlay gradiente no rodapé.",
    layout: {
      text_position: "bottom",
      overlay_opacity: 0.6,
      overlay_color: "#000000",
      logo_position: "topLeft",
      badge_position: "topRight",
      cta_position: "bottomRight",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "luxury",
      max_title_chars: 50,
      copy_system_prompt: "Gere um copy curto e luxuoso para story. CTA direto: 'Arraste para cima', 'Saiba mais', 'Agende visita'.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_accent: "#D4AF37",
      font_primary: "Playfair Display",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "story-modern-tour",
    catalog_ref: catalogRef("story-modern-tour"),
    supported_types: ["story"],
    system_prompt: "Story moderno para tour virtual. Layout clean, tipografia bold, cores vivas.",
    layout: {
      ...DEFAULT_LAYOUT,
      text_position: "top",
      overlay_opacity: 0.4,
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "friendly",
      copy_system_prompt: "Gere um copy convidativo para tour virtual do imóvel. Tom empolgante mas profissional.",
    },
    branding: { ...DEFAULT_BRANDING, fallback_accent: "#6366F1" },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "story-urgencia",
    catalog_ref: catalogRef("story-urgencia"),
    supported_types: ["story"],
    system_prompt: "Story de urgência/oferta relâmpago. Cores quentes, badge de desconto, countdown visual.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.7,
      overlay_color: "#7F1D1D",
      badge_position: "topRight",
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "urgent",
      copy_system_prompt: "Gere um copy urgente para oferta relâmpago. Use: ÚLTIMAS UNIDADES, OPORTUNIDADE ÚNICA, PREÇO ESPECIAL.",
    },
    branding: { ...DEFAULT_BRANDING, fallback_accent: "#EF4444" },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },

  // ── LUXO ───────────────────────────────────────────────────────────────
  {
    template_id: "luxo-editorial-full",
    catalog_ref: catalogRef("luxo-editorial-full"),
    supported_types: ["post", "story"],
    system_prompt: "Peça editorial full-bleed de luxo. Foto hero com mínimo de texto. Marca sutil.",
    layout: {
      text_position: "bottom",
      overlay_opacity: 0.35,
      overlay_color: "#000000",
      logo_position: "bottomRight",
      badge_position: "none",
      cta_position: "none",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 30,
      has_subtitle: false,
      has_cta: false,
      has_hashtags: false,
      tone: "luxury",
      copy_system_prompt: "Apenas o nome do empreendimento e localização. Estilo revista de arquitetura.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_accent: "#D4AF37",
      font_primary: "Playfair Display",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "luxo-dark-cinema",
    catalog_ref: catalogRef("luxo-dark-cinema"),
    supported_types: ["post", "story"],
    system_prompt: "Criativo dark cinema para alto padrão. Overlay escuro pesado, acentos dourados, tipografia serif elegante.",
    layout: {
      text_position: "bottom",
      overlay_opacity: 0.55,
      overlay_color: "#0A0A0A",
      logo_position: "topLeft",
      badge_position: "topLeft",
      cta_position: "bottomRight",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "luxury",
      copy_system_prompt: "Gere um copy cinematográfico de alto luxo. Palavras curtas e impactantes. Badge: EXCLUSIVO.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#0A0A0A",
      fallback_accent: "#D4AF37",
      font_primary: "Playfair Display",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },

  // ── POPULAR ────────────────────────────────────────────────────────────
  {
    template_id: "popular-minha-casa",
    catalog_ref: catalogRef("popular-minha-casa"),
    supported_types: ["post", "story"],
    system_prompt: "Criativo Minha Casa Minha Vida. Cores verdes/azuis, preço acessível em destaque, linguagem popular.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.65,
      overlay_color: "#064E3B",
      badge_position: "topRight",
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "popular",
      copy_system_prompt: "Gere um copy para MCMV. Foco em: parcelas acessíveis, subsídio, entrada facilitada. Linguagem simples e direta.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#064E3B",
      fallback_accent: "#10B981",
    },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "popular-lancamento-bairro",
    catalog_ref: catalogRef("popular-lancamento-bairro"),
    supported_types: ["post"],
    system_prompt: "Criativo de lançamento em bairro popular. Destaque para localização e infraestrutura do bairro.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.6,
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "popular",
      copy_system_prompt: "Gere um copy de lançamento focado no bairro e infraestrutura. Escolas, transporte, comércio. Tom de oportunidade.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_accent: "#F59E0B",
    },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },

  // ── INSTITUCIONAL ──────────────────────────────────────────────────────
  {
    template_id: "institucional-corretor",
    catalog_ref: catalogRef("institucional-corretor"),
    supported_types: ["post", "story"],
    system_prompt: "Peça institucional de corretor. Foto do profissional com dados de contato e marca.",
    layout: {
      text_position: "left_panel",
      overlay_opacity: 0,
      overlay_color: "#FFFFFF",
      logo_position: "topLeft",
      badge_position: "none",
      cta_position: "bottomRight",
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "institutional",
      has_hashtags: false,
      copy_system_prompt: "Gere um copy institucional de corretor. Nome, CRECI, especialidade, contato. Tom profissional e confiável.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#1E293B",
      fallback_accent: "#3B82F6",
      font_primary: "Poppins",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "institucional-imobiliaria",
    catalog_ref: catalogRef("institucional-imobiliaria"),
    supported_types: ["post", "story"],
    system_prompt: "Peça institucional de imobiliária. Foco na marca, valores e portfólio.",
    layout: {
      ...DEFAULT_LAYOUT,
      text_position: "full_overlay",
      overlay_opacity: 0.5,
    },
    copy: {
      ...DEFAULT_COPY,
      tone: "institutional",
      has_hashtags: false,
      copy_system_prompt: "Gere um copy institucional de imobiliária. Destaque anos de mercado, portfólio, missão. Tom corporativo.",
    },
    branding: { ...DEFAULT_BRANDING, font_primary: "Poppins" },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },

  // ── BANNER ─────────────────────────────────────────────────────────────
  {
    template_id: "banner-meta-feed",
    catalog_ref: catalogRef("banner-meta-feed"),
    supported_types: ["post"],
    system_prompt: "Banner para Meta Ads (feed). CTA forte, imagem atrativa, texto curto e direto.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.5,
      cta_position: "center",
      badge_position: "topRight",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 40,
      tone: "urgent",
      copy_system_prompt: "Gere um copy para anúncio Meta Ads. Curto, direto, com CTA forte. Máximo 2 linhas.",
    },
    branding: { ...DEFAULT_BRANDING },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "banner-meta-story",
    catalog_ref: catalogRef("banner-meta-story"),
    supported_types: ["story"],
    system_prompt: "Banner para Meta Ads (story/reels). 9:16, CTA 'swipe up' ou 'saiba mais'.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.55,
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 35,
      tone: "urgent",
      copy_system_prompt: "Gere um copy para anúncio story Meta. Ultra curto, CTA: 'Arraste para cima'.",
    },
    branding: { ...DEFAULT_BRANDING },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },
  {
    template_id: "banner-google-display",
    catalog_ref: catalogRef("banner-google-display"),
    supported_types: ["post", "thumbnail"],
    system_prompt: "Banner para Google Display Network. Múltiplos tamanhos, CTA claro, marca visível.",
    layout: {
      ...DEFAULT_LAYOUT,
      overlay_opacity: 0.4,
      cta_position: "bottomRight",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 30,
      has_hashtags: false,
      tone: "friendly",
      copy_system_prompt: "Gere um copy para banner Google Display. Título curto, CTA direto.",
    },
    branding: { ...DEFAULT_BRANDING },
    composition_engine: "dalle",
    restyle_engine: "none",
    is_active: true,
  },

  // ── TERRENO ALPHAVILLE (Dark Gold Urgency) ──────────────────────────────
  {
    template_id: "agent_terreno_alphaville",
    catalog_ref: catalogRef("agent_terreno_alphaville"),
    supported_types: ["post", "story", "reels"],
    system_prompt: "Dark gold para terrenos/lotes: foto aérea drone + urgência bold + preço dourado + pill CTA dourado com texto ESCURO #0D1F3C. Diferencial: CTA nunca usa texto branco.",
    layout: {
      text_position: "bottom",
      overlay_opacity: 0.95,
      overlay_color: "#0D1F3C",
      logo_position: "bottomRight",
      badge_position: "none",
      cta_position: "center",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 40,
      has_subtitle: true,
      has_cta: true,
      has_hashtags: true,
      tone: "urgent",
      copy_system_prompt: "Gere copy de venda de terreno/lote com urgência. Título em CAPS (ex: TERRENO DE ESQUINA). Badge: ÚLTIMA OPORTUNIDADE. Preço em destaque. CTA: Agende Sua Visita. Tom: urgência + exclusividade. Hashtags para cidade do imóvel.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#C9A84C",
      fallback_accent: "#D4A843",
      font_primary: "Playfair Display",
      font_secondary: "Inter",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },

  // ── BLACK GOLD TOWER (Lançamento) ──────────────────────────────────────
  {
    template_id: "agent_black_gold_tower",
    catalog_ref: catalogRef("agent_black_gold_tower"),
    supported_types: ["post", "story", "reels"],
    system_prompt: "Dark premium com torre residencial. Layout dark-split-info: foto à direita, zona de texto à esquerda com glow dourado. Título bold 3 linhas, grid 2x2+1 features com emojis, card de preço dourado, pill CTA com telefone.",
    layout: {
      text_position: "left_panel",
      overlay_opacity: 0.90,
      overlay_color: "#05050A",
      logo_position: "topLeft",
      badge_position: "topLeft",
      cta_position: "bottomLeft",
    },
    copy: {
      ...DEFAULT_COPY,
      max_title_chars: 36,
      has_subtitle: true,
      has_cta: true,
      has_hashtags: true,
      tone: "luxury",
      copy_system_prompt: "Gere um copy de lançamento de torre residencial premium. Título em 3 linhas curtas (máx 12 chars cada), impactante e aspiracional. Features: 5 diferenciais do empreendimento (comunidade, lazer, localização, transporte, áreas verdes). Preço formatado. CTA: 'Agende uma Visita'. Badge: LANÇAMENTO.",
    },
    branding: {
      ...DEFAULT_BRANDING,
      fallback_primary: "#D4A843",
      fallback_accent: "#D4A843",
      font_primary: "Bebas Neue",
      font_secondary: "Inter",
    },
    composition_engine: "shotstack",
    restyle_engine: "none",
    is_active: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna a config do template engine pelo ID, ou null */
export function getTemplateConfig(templateId: string): TemplateEngineConfig | null {
  return TEMPLATE_ENGINE_CONFIGS.find((c) => c.template_id === templateId) ?? null;
}

/** Retorna configs ativas filtradas por categoria */
export function getActiveConfigs(category?: CreativeCategory): TemplateEngineConfig[] {
  return TEMPLATE_ENGINE_CONFIGS.filter(
    (c) => c.is_active && (!category || c.catalog_ref?.category === category)
  );
}

/** Retorna configs por estilo visual */
export function getConfigsByStyle(style: VisualStyle): TemplateEngineConfig[] {
  return TEMPLATE_ENGINE_CONFIGS.filter(
    (c) => c.is_active && c.catalog_ref?.visual_style === style
  );
}

/**
 * Resolve o copy system prompt ideal para o template + tom fornecido.
 * Usado pelo pipeline invisível para gerar copy automaticamente.
 */
export function resolveCopyPrompt(templateId: string, userDescription: string): string {
  const config = getTemplateConfig(templateId);
  if (!config) return DEFAULT_COPY.copy_system_prompt;

  return `${config.copy.copy_system_prompt}\n\nDescrição do usuário: ${userDescription}\n\nTemplate: ${config.catalog_ref?.name ?? templateId}\nEstilo: ${config.catalog_ref?.visual_style ?? "modern"}\nCategoria: ${config.catalog_ref?.category ?? "feed"}`;
}

/**
 * Resolve as regras de branding para a composição visual.
 * Mescla regras do template com branding do usuário (se houver).
 */
export function resolveBranding(
  templateId: string,
  userBranding?: { primary_color?: string; secondary_color?: string; logo_url?: string | null }
): BrandingRule {
  const config = getTemplateConfig(templateId);
  const base = config?.branding ?? DEFAULT_BRANDING;

  if (!userBranding || !base.use_brand_colors) return base;

  return {
    ...base,
    fallback_primary: userBranding.primary_color ?? base.fallback_primary,
    fallback_accent: userBranding.secondary_color ?? base.fallback_accent,
    include_logo: base.include_logo && !!userBranding.logo_url,
  };
}
