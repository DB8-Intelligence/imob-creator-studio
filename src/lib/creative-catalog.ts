/**
 * creative-catalog.ts
 *
 * Catálogo completo de templates visuais do ImobCreator AI.
 * Fonte de dados central para StudioPage, TemplateCatalog e VisualSamplesShowcase.
 *
 * Relacionamentos:
 *   - AIEngineId  → src/lib/ai-engines.ts
 *   - PlanTier    → src/lib/plan-rules.ts
 */

// ─── Tipos base ───────────────────────────────────────────────────────────────

export type CreativeCategory =
  | "feed"
  | "story"
  | "reels"
  | "banner"
  | "landing"
  | "luxo"
  | "popular"
  | "institucional";

export type VisualStyle =
  | "luxury"
  | "modern"
  | "minimal"
  | "corporate"
  | "popular"
  | "editorial"
  | "dark";

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "1.91:1";

export type AIEngineId =
  | "gemini_image"
  | "openai_image"
  | "virtual_staging"
  | "caption_generator"
  | "art_generator"
  | "video_generator"
  | "image_to_video"
  | "upscale";

export type EditableFieldType =
  | "text"
  | "textarea"
  | "image"
  | "color"
  | "select"
  | "logo";

export interface EditableField {
  key:         string;
  label:       string;
  type:        EditableFieldType;
  required:    boolean;
  placeholder?: string;
  options?:    string[];       // para type === "select"
  maxLength?:  number;
}

export interface CatalogTemplate {
  id:               string;
  name:             string;
  category:         CreativeCategory;
  subcategory?:     string;
  visual_style:     VisualStyle;
  aspect_ratio:     AspectRatio;
  preview_gradient: string;       // fallback quando não há imagem
  preview_image?:   string;       // URL de preview real (opcional)
  editable_fields:  EditableField[];
  recommended_for:  string[];
  supported_engines: AIEngineId[];
  primary_engine:   AIEngineId;
  status:           "active" | "beta" | "coming_soon";
  is_popular?:      boolean;
  is_new?:          boolean;
  credit_cost:      number;
  prompt_base?:     string;       // prompt base enviado ao engine
  tags:             string[];
}

// ─── Campos editáveis pré-definidos (reutilizáveis) ──────────────────────────

const FIELD_TITLE: EditableField = {
  key: "titulo", label: "Título do imóvel", type: "text", required: true,
  placeholder: "Ex: Casa Moderna no Alphaville", maxLength: 60,
};
const FIELD_DETAILS: EditableField = {
  key: "detalhes", label: "Detalhes (suítes, m², vagas)", type: "text", required: false,
  placeholder: "Ex: 4 suítes · 320m² · 3 vagas", maxLength: 80,
};
const FIELD_LOCATION: EditableField = {
  key: "localizacao", label: "Localização / Bairro", type: "text", required: false,
  placeholder: "Ex: Alphaville, SP",
};
const FIELD_PRICE: EditableField = {
  key: "preco", label: "Preço / Faixa", type: "text", required: false,
  placeholder: "Ex: R$ 1.200.000",
};
const FIELD_CTA: EditableField = {
  key: "cta", label: "Chamada para ação (CTA)", type: "text", required: false,
  placeholder: "Ex: Agende sua visita", maxLength: 40,
};
const FIELD_IMAGE: EditableField = {
  key: "imagem", label: "Foto do imóvel", type: "image", required: true,
};
const FIELD_LOGO: EditableField = {
  key: "logo", label: "Logo do corretor/imobiliária", type: "logo", required: false,
};
const FIELD_DESCRIPTION: EditableField = {
  key: "descricao", label: "Descrição livre", type: "textarea", required: false,
  placeholder: "Descreva o imóvel ou a campanha", maxLength: 300,
};
const FIELD_STYLE: EditableField = {
  key: "estilo_visual",
  label: "Estilo visual",
  type: "select",
  required: false,
  options: ["Luxury", "Modern", "Minimal", "Corporate", "Popular"],
};

// ─── Catálogo de templates ────────────────────────────────────────────────────

export const CREATIVE_CATALOG: CatalogTemplate[] = [

  // ── FEED ──────────────────────────────────────────────────────────────────

  {
    id: "feed-luxury-hero",
    name: "Feed Luxo Hero",
    category: "feed",
    visual_style: "luxury",
    aspect_ratio: "1:1",
    preview_gradient: "from-zinc-900 via-zinc-800 to-amber-900",
    preview_image: "/samples/hero-property.jpg",
    recommended_for: ["alto padrão", "lançamentos premium", "casas de luxo"],
    supported_engines: ["gemini_image", "openai_image", "art_generator"],
    primary_engine: "openai_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["luxo", "feed", "alto padrão", "premium"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_PRICE, FIELD_LOGO, FIELD_CTA],
    prompt_base: "Luxury real estate marketing post, dark elegant background, gold accents, premium property photography, editorial typography, high-end aesthetic, 1:1 ratio",
  },
  {
    id: "feed-modern-clean",
    name: "Feed Moderno Clean",
    category: "feed",
    visual_style: "modern",
    aspect_ratio: "1:1",
    preview_gradient: "from-slate-800 to-slate-600",
    preview_image: "/samples/template_post_feed_3.jpg",
    recommended_for: ["apartamentos", "imóveis de médio padrão", "lançamentos urbanos"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["moderno", "feed", "urbano", "clean"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_LOCATION, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Modern clean real estate Instagram post, minimal layout, white space, contemporary typography, professional real estate photography, square format",
  },
  {
    id: "feed-captacao-express",
    name: "Captação Express",
    category: "feed",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    preview_gradient: "from-emerald-800 to-teal-900",
    preview_image: "/samples/exemplo_criativo_db8.jpg",
    recommended_for: ["captação de imóveis", "prospecção de proprietários", "corretor ativo"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    credit_cost: 1,
    tags: ["captação", "feed", "urgência", "corretor"],
    editable_fields: [FIELD_TITLE, FIELD_DESCRIPTION, FIELD_LOCATION, FIELD_LOGO, FIELD_CTA],
    prompt_base: "Real estate lead capture post, professional agent branding, clean corporate layout, trust-building visual, Brazilian market style, property acquisition campaign",
  },
  {
    id: "feed-popular-oferta",
    name: "Oferta Quente Popular",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    preview_gradient: "from-orange-600 to-red-700",
    preview_image: "/samples/template_post_feed_2.jpg",
    recommended_for: ["imóveis populares", "urgência de venda", "promoções"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["popular", "oferta", "urgência", "preço"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_PRICE, FIELD_DETAILS, FIELD_CTA],
    prompt_base: "High-energy real estate deal post, bold orange and red colors, price highlight, urgency-driven layout, Brazilian popular market style, strong CTA",
  },
  {
    id: "feed-minimal-editorial",
    name: "Editorial Minimal",
    category: "feed",
    visual_style: "editorial",
    aspect_ratio: "4:5",
    preview_gradient: "from-gray-100 to-gray-300",
    recommended_for: ["branding pessoal", "imóveis sofisticados", "agências premium"],
    supported_engines: ["openai_image", "art_generator"],
    primary_engine: "openai_image",
    status: "active",
    is_new: true,
    credit_cost: 1,
    tags: ["editorial", "minimal", "branding", "sofisticado"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_LOGO],
    prompt_base: "Editorial minimal real estate post, white space, elegant serif font, architectural photography, magazine aesthetic, 4:5 ratio, high-end real estate brand",
  },

  // ── STORY ─────────────────────────────────────────────────────────────────

  {
    id: "story-luxury-cta",
    name: "Story Luxo com CTA",
    category: "story",
    visual_style: "luxury",
    aspect_ratio: "9:16",
    preview_gradient: "from-zinc-900 to-amber-950",
    preview_image: "/samples/template_story_3.jpg",
    recommended_for: ["alto padrão", "casas de luxo", "tráfego pago"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "openai_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["luxo", "story", "cta", "tráfego"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Luxury real estate Instagram story, full bleed property photo, elegant overlay, gold typography, strong CTA button, 9:16 vertical format, premium aesthetic",
  },
  {
    id: "story-modern-tour",
    name: "Story Tour Virtual",
    category: "story",
    visual_style: "modern",
    aspect_ratio: "9:16",
    preview_gradient: "from-blue-900 to-indigo-800",
    preview_image: "/samples/template_story_1.jpg",
    recommended_for: ["tour virtual", "apresentação de imóvel", "engajamento"],
    supported_engines: ["gemini_image", "image_to_video"],
    primary_engine: "gemini_image",
    status: "active",
    credit_cost: 1,
    tags: ["story", "tour", "engajamento", "vertical"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_LOCATION, FIELD_CTA],
    prompt_base: "Modern real estate virtual tour story, vertical format, room showcase, navigation arrows overlay, contemporary design, Instagram stories format",
  },
  {
    id: "story-urgencia",
    name: "Story Urgência",
    category: "story",
    visual_style: "popular",
    aspect_ratio: "9:16",
    preview_gradient: "from-red-700 to-orange-600",
    preview_image: "/samples/template_story_2.jpg",
    recommended_for: ["oportunidades", "preço reduzido", "última unidade"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    credit_cost: 1,
    tags: ["urgência", "story", "oferta", "conversão"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_PRICE, FIELD_DETAILS, FIELD_CTA],
    prompt_base: "Urgent real estate story, bold red/orange gradient, countdown or scarcity elements, property photo, bold typography, strong swipe-up CTA, 9:16 format",
  },

  // ── REELS ─────────────────────────────────────────────────────────────────

  {
    id: "reels-cover-luxury",
    name: "Cover Reels Luxo",
    category: "reels",
    visual_style: "luxury",
    aspect_ratio: "9:16",
    preview_gradient: "from-zinc-900 to-zinc-700",
    preview_image: "/samples/template_reels_2.jpg",
    recommended_for: ["capa de reel", "alto padrão", "showcase imóvel"],
    supported_engines: ["gemini_image", "openai_image", "image_to_video"],
    primary_engine: "image_to_video",
    status: "active",
    is_new: true,
    credit_cost: 2,
    tags: ["reels", "cover", "luxo", "vídeo"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_LOGO],
    prompt_base: "Luxury real estate reels cover, cinematic vertical frame, dramatic lighting, premium property exterior/interior, elegant typography overlay, 9:16 format",
  },
  {
    id: "reels-cover-modern",
    name: "Cover Reels Moderno",
    category: "reels",
    visual_style: "modern",
    aspect_ratio: "9:16",
    preview_gradient: "from-slate-700 to-sky-800",
    preview_image: "/samples/template_reels_1.jpg",
    recommended_for: ["apartamentos", "lançamentos", "capa de reels"],
    supported_engines: ["gemini_image", "image_to_video"],
    primary_engine: "image_to_video",
    status: "active",
    credit_cost: 2,
    tags: ["reels", "cover", "moderno", "apartamento"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_CTA],
    prompt_base: "Modern real estate reels cover, contemporary vertical composition, urban property, bold modern typography, Instagram reels first frame, 9:16",
  },

  // ── BANNER ADS ────────────────────────────────────────────────────────────

  {
    id: "banner-meta-feed",
    name: "Banner Meta Feed",
    category: "banner",
    visual_style: "modern",
    aspect_ratio: "1:1",
    preview_gradient: "from-blue-700 to-indigo-700",
    recommended_for: ["tráfego pago Meta", "feed ads", "campanhas de performance"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "openai_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["banner", "meta", "ads", "tráfego pago"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_PRICE, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Facebook/Instagram paid ad creative, real estate, bold headline, property photo, clear CTA button, professional ad layout, square format, high click-through design",
  },
  {
    id: "banner-meta-story",
    name: "Banner Meta Story/Reels",
    category: "banner",
    visual_style: "modern",
    aspect_ratio: "9:16",
    preview_gradient: "from-violet-700 to-purple-800",
    recommended_for: ["story ads", "reels ads", "tráfego pago vertical"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "openai_image",
    status: "active",
    credit_cost: 1,
    tags: ["banner", "story ads", "meta", "vertical"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_PRICE, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Vertical social media paid ad, real estate, full-bleed property image, bold headline, strong CTA, story/reels format 9:16, high-converting design",
  },
  {
    id: "banner-google-display",
    name: "Banner Google Display",
    category: "banner",
    visual_style: "corporate",
    aspect_ratio: "16:9",
    preview_gradient: "from-sky-700 to-blue-800",
    recommended_for: ["Google Display", "retargeting", "remarketing"],
    supported_engines: ["openai_image", "gemini_image"],
    primary_engine: "openai_image",
    status: "beta",
    is_new: true,
    credit_cost: 1,
    tags: ["banner", "google", "display", "retargeting"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Google Display ad banner, real estate, horizontal 16:9 format, clean professional layout, property image, headline and CTA, trustworthy brand design",
  },

  // ── LANDING PAGE ──────────────────────────────────────────────────────────

  {
    id: "landing-hero-luxury",
    name: "Hero LP Luxo",
    category: "landing",
    visual_style: "luxury",
    aspect_ratio: "16:9",
    preview_gradient: "from-zinc-900 via-zinc-800 to-stone-900",
    preview_image: "/samples/hero-property.jpg",
    recommended_for: ["landing pages de luxo", "lançamentos exclusivos", "captação de leads premium"],
    supported_engines: ["openai_image", "art_generator"],
    primary_engine: "openai_image",
    status: "active",
    credit_cost: 1,
    tags: ["landing", "hero", "luxo", "lançamento"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DESCRIPTION, FIELD_CTA, FIELD_LOGO],
    prompt_base: "Luxury real estate landing page hero section, full-width property photography, dark elegant overlay, premium headline typography, lead capture CTA, 16:9 composition",
  },
  {
    id: "landing-hero-modern",
    name: "Hero LP Moderno",
    category: "landing",
    visual_style: "modern",
    aspect_ratio: "16:9",
    preview_gradient: "from-slate-800 to-cyan-900",
    recommended_for: ["landing pages de lançamentos", "campanhas de performance", "conversão de leads"],
    supported_engines: ["openai_image", "gemini_image"],
    primary_engine: "openai_image",
    status: "active",
    credit_cost: 1,
    tags: ["landing", "hero", "moderno", "conversão"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_DESCRIPTION, FIELD_CTA],
    prompt_base: "Modern real estate landing page hero, contemporary property photography, clean layout, conversion-focused design, compelling headline, strong CTA, 16:9",
  },

  // ── LUXO ──────────────────────────────────────────────────────────────────

  {
    id: "luxo-editorial-full",
    name: "Editorial Luxo Full",
    category: "luxo",
    visual_style: "editorial",
    aspect_ratio: "1:1",
    preview_gradient: "from-stone-900 via-amber-950 to-zinc-900",
    preview_image: "/samples/hero-property.jpg",
    recommended_for: ["casas de altíssimo padrão", "branding de construtoras premium", "editorial de lançamento"],
    supported_engines: ["openai_image", "art_generator"],
    primary_engine: "art_generator",
    status: "active",
    is_popular: true,
    credit_cost: 2,
    tags: ["luxo", "editorial", "premium", "artístico"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DESCRIPTION, FIELD_LOGO, FIELD_STYLE],
    prompt_base: "Ultra-luxury real estate editorial post, magazine-quality composition, architectural photography, dark moody aesthetic, gold metallic accents, editorial serif typography, award-winning design",
  },
  {
    id: "luxo-dark-cinema",
    name: "Dark Cinema Premium",
    category: "luxo",
    visual_style: "dark",
    aspect_ratio: "1:1",
    preview_gradient: "from-gray-950 to-zinc-900",
    recommended_for: ["coberturas", "mansões", "imóveis icônicos"],
    supported_engines: ["openai_image", "art_generator"],
    primary_engine: "art_generator",
    status: "active",
    is_new: true,
    credit_cost: 2,
    tags: ["luxo", "dark", "cinema", "icônico"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_PRICE, FIELD_LOGO],
    prompt_base: "Cinematic dark luxury real estate post, dramatic black background, moody property photography, golden hour or dramatic lighting, film noir real estate aesthetic, high contrast",
  },

  // ── POPULAR ───────────────────────────────────────────────────────────────

  {
    id: "popular-minha-casa",
    name: "Minha Casa Minha Vida",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    preview_gradient: "from-green-600 to-teal-700",
    recommended_for: ["MCMV", "financiamento", "primeiro imóvel", "habitação popular"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    is_popular: true,
    credit_cost: 1,
    tags: ["popular", "MCMV", "financiamento", "família"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_PRICE, FIELD_DETAILS, FIELD_LOCATION, FIELD_CTA],
    prompt_base: "Brazilian affordable housing real estate post, friendly family-oriented design, green colors, financing highlight, approachable typography, popular market aesthetic",
  },
  {
    id: "popular-lancamento-bairro",
    name: "Lançamento de Bairro",
    category: "popular",
    visual_style: "popular",
    aspect_ratio: "1:1",
    preview_gradient: "from-blue-600 to-sky-500",
    recommended_for: ["lançamentos populares", "bairros novos", "casas em condomínio popular"],
    supported_engines: ["gemini_image", "openai_image"],
    primary_engine: "gemini_image",
    status: "active",
    credit_cost: 1,
    tags: ["popular", "lançamento", "bairro", "condomínio"],
    editable_fields: [FIELD_IMAGE, FIELD_TITLE, FIELD_DETAILS, FIELD_LOCATION, FIELD_PRICE, FIELD_CTA],
    prompt_base: "Brazilian neighborhood real estate launch post, bright friendly colors, community-focused design, property exterior photography, accessible pricing highlight",
  },

  // ── INSTITUCIONAL ─────────────────────────────────────────────────────────

  {
    id: "institucional-corretor",
    name: "Perfil Corretor",
    category: "institucional",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    preview_gradient: "from-indigo-800 to-slate-800",
    recommended_for: ["apresentação do corretor", "branding pessoal", "autoridade profissional"],
    supported_engines: ["openai_image", "gemini_image"],
    primary_engine: "openai_image",
    status: "active",
    credit_cost: 1,
    tags: ["institucional", "corretor", "branding", "autoridade"],
    editable_fields: [
      { key: "foto_profissional", label: "Foto profissional", type: "image", required: false },
      { key: "nome", label: "Nome do corretor", type: "text", required: true, placeholder: "João Silva" },
      { key: "creci", label: "CRECI", type: "text", required: false, placeholder: "CRECI 12345" },
      FIELD_LOGO, FIELD_CTA,
    ],
    prompt_base: "Professional Brazilian real estate agent profile post, clean corporate design, trust-building layout, agent headshot placeholder, CRECI credential display, authoritative brand identity",
  },
  {
    id: "institucional-imobiliaria",
    name: "Institucional Imobiliária",
    category: "institucional",
    visual_style: "corporate",
    aspect_ratio: "1:1",
    preview_gradient: "from-slate-700 to-indigo-800",
    recommended_for: ["branding de imobiliária", "post institucional", "comunicação corporativa"],
    supported_engines: ["openai_image", "gemini_image"],
    primary_engine: "openai_image",
    status: "active",
    credit_cost: 1,
    tags: ["institucional", "imobiliária", "corporate", "branding"],
    editable_fields: [FIELD_LOGO, FIELD_TITLE, FIELD_DESCRIPTION, FIELD_CTA],
    prompt_base: "Real estate agency institutional post, professional corporate design, brand identity showcase, trust and authority visual elements, clean modern layout",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<CreativeCategory, string> = {
  feed:          "Feed",
  story:         "Stories",
  reels:         "Reels",
  banner:        "Banner Ads",
  landing:       "Landing Page",
  luxo:          "Luxo",
  popular:       "Popular",
  institucional: "Institucional",
};

export const CATEGORY_DESCRIPTIONS: Record<CreativeCategory, string> = {
  feed:          "Posts para o feed do Instagram e Facebook",
  story:         "Formato vertical 9:16 para stories e interação",
  reels:         "Capas e criativos para reels e vídeos curtos",
  banner:        "Banners para tráfego pago no Meta e Google",
  landing:       "Imagens de hero para páginas de captação de leads",
  luxo:          "Estética editorial para imóveis de alto padrão",
  popular:       "Design acessível para o mercado popular",
  institucional: "Branding pessoal e corporativo para corretores e imobiliárias",
};

export const STYLE_LABELS: Record<VisualStyle, string> = {
  luxury:    "Luxo",
  modern:    "Moderno",
  minimal:   "Minimal",
  corporate: "Corporativo",
  popular:   "Popular",
  editorial: "Editorial",
  dark:      "Dark Premium",
};

export const ALL_CATEGORIES: CreativeCategory[] = [
  "feed", "story", "reels", "banner", "landing", "luxo", "popular", "institucional",
];

export function getTemplatesByCategory(cat: CreativeCategory): CatalogTemplate[] {
  return CREATIVE_CATALOG.filter((t) => t.category === cat);
}

export function getActiveTemplates(): CatalogTemplate[] {
  return CREATIVE_CATALOG.filter((t) => t.status === "active");
}

export function getPopularTemplates(): CatalogTemplate[] {
  return CREATIVE_CATALOG.filter((t) => t.is_popular);
}

export function searchTemplates(query: string): CatalogTemplate[] {
  const q = query.toLowerCase();
  return CREATIVE_CATALOG.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.recommended_for.some((r) => r.includes(q))
  );
}
