export interface CreativeTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
  isNew?: boolean;
  isFavorite?: boolean;
  prompt: string; // enviado ao backend para geração DALL-E 3
  previewGradient: string;
}

export const CREATIVE_CATEGORIES = [
  { id: "top", label: "TOP Temas" },
  { id: "new", label: "Novos" },
  { id: "all", label: "Todos" },
  { id: "imovel", label: "Imobiliário" },
  { id: "vendas", label: "Vendas" },
  { id: "captacao", label: "Captação" },
  { id: "engajamento", label: "Engajamento" },
];

export const CREATIVE_TEMPLATES: CreativeTemplate[] = [
  {
    id: "ia-imobiliaria",
    name: "IA Imobiliária",
    description: "Campanha conceitual e visualmente poderosa",
    categories: ["top", "imovel"],
    isFavorite: true,
    prompt:
      "Professional real estate marketing post with modern architecture photography, luxury property showcase, clean minimalist layout, gradient overlay, bold headline typography, Instagram-optimized square format, high-end brand aesthetic, 4K quality, cinematic lighting",
    previewGradient: "from-purple-600 to-indigo-800",
  },
  {
    id: "produto-destaque",
    name: "Produto em Destaque",
    description: "Fundo clean com produto centralizado",
    categories: ["top", "vendas"],
    prompt:
      "Clean product showcase marketing post, centered product photography, minimalist white or light background, bold product name typography, strong call-to-action, professional e-commerce style, high contrast, Instagram feed optimized",
    previewGradient: "from-slate-700 to-slate-900",
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    description: "Fundo escuro elegante com detalhes luminosos",
    categories: ["top", "imovel", "captacao"],
    prompt:
      "Dark luxury marketing post, deep black or dark navy background, golden accent details, premium property or brand photography, elegant serif typography, high-end real estate aesthetic, moody cinematic atmosphere, Instagram post format",
    previewGradient: "from-gray-900 to-zinc-900",
  },
  {
    id: "expert-photoshop",
    name: "Expert Photoshop",
    description: "Glass Morphism Premium com vidro fosco translúcido",
    categories: ["top", "new"],
    isNew: true,
    prompt:
      "Glass morphism design style marketing post, frosted glass panels with blur effect, translucent overlays, modern UI aesthetic, vibrant gradient background visible through glass elements, premium brand feel, contemporary digital art style",
    previewGradient: "from-cyan-500 to-blue-700",
  },
  {
    id: "imobiliario-top",
    name: "Imobiliário Top",
    description: "Design sofisticado com cores vibrantes e paletas",
    categories: ["top", "imovel", "vendas"],
    isFavorite: true,
    prompt:
      "Sophisticated real estate marketing post, vibrant color palette with purple and orange accents, luxury property photography, bold geometric shapes, modern typography hierarchy, social media optimized, high visual impact, professional Brazilian real estate market style",
    previewGradient: "from-orange-500 to-red-700",
  },
  {
    id: "captacao-express",
    name: "Captação Express",
    description: "Direto ao ponto, comercial e rápido",
    categories: ["captacao"],
    prompt:
      "Direct real estate lead generation post, clean professional layout, property owner focused messaging, trust-building visual elements, contact information area, Brazilian real estate agent branding style, clear value proposition, urgency-driven design",
    previewGradient: "from-green-600 to-emerald-800",
  },
  {
    id: "engajamento-viral",
    name: "Engajamento Viral",
    description: "Alto impacto para retenção no feed",
    categories: ["engajamento"],
    prompt:
      "High engagement social media post design, eye-catching color contrast, curiosity-driven visual hook, text-heavy design with interesting facts or statistics, Instagram feed optimized, scroll-stopping aesthetic, vibrant and energetic color scheme",
    previewGradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "luxo-premium",
    name: "Luxo Premium",
    description: "Editorial, elegante e alto padrão",
    categories: ["imovel", "captacao"],
    prompt:
      "Ultra-luxury real estate editorial post, magazine-quality photography treatment, elegant gold and white color palette, sophisticated serif typography, high-end property showcase, premium brand positioning, aspirational lifestyle imagery",
    previewGradient: "from-amber-700 to-yellow-900",
  },
  {
    id: "oportunidade-quente",
    name: "Oportunidade Quente",
    description: "Urgência e percepção de oferta imperdível",
    categories: ["vendas", "engajamento"],
    prompt:
      "Urgent sales marketing post with red and orange color scheme, bold discount or opportunity messaging, real estate deal highlight, time-sensitive offer visual elements, high contrast typography, attention-grabbing design, Brazilian market style",
    previewGradient: "from-red-500 to-orange-600",
  },
  {
    id: "minimalista-clean",
    name: "Minimalista Clean",
    description: "Elegância na simplicidade, fundo claro",
    categories: ["new", "imovel"],
    isNew: true,
    prompt:
      "Minimalist clean real estate post design, white or very light background, subtle typography, lots of white space, small elegant accent colors, high-quality property photo as hero, refined and understated brand aesthetic, premium simplicity",
    previewGradient: "from-gray-200 to-gray-400",
  },
];
