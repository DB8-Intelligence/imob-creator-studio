export interface RealEstateStylePreset {
  id: string;
  title: string;
  category: "captacao" | "conversao" | "luxo" | "conteudo" | "video";
  headline: string;
  description: string;
  idealFor: string;
  visualDirection: string;
  ctaStyle: string;
  tags: string[];
}

export const realEstateStylePresets: RealEstateStylePreset[] = [
  {
    id: "captacao-express",
    title: "Captação Express",
    category: "captacao",
    headline: "Direto ao ponto para captar rápido",
    description: "Estilo comercial, limpo e objetivo para atrair proprietários e mostrar autoridade.",
    idealFor: "captação de imóveis e posts de corretor ativo",
    visualDirection: "tipografia forte, foto central e CTA visível",
    ctaStyle: "chamada direta para contato",
    tags: ["captação", "urgência", "autoridade"],
  },
  {
    id: "luxo-premium",
    title: "Luxo Premium",
    category: "luxo",
    headline: "Editorial sofisticado para alto padrão",
    description: "Mais espaço visual, sensação premium e foco em percepção de valor.",
    idealFor: "casas de alto padrão, imóveis exclusivos e branding de luxo",
    visualDirection: "layout elegante, respiro e contraste refinado",
    ctaStyle: "CTA discreto com aura premium",
    tags: ["luxo", "alto padrão", "sofisticação"],
  },
  {
    id: "oportunidade-quente",
    title: "Oportunidade Quente",
    category: "conversao",
    headline: "Oferta com percepção de urgência",
    description: "Estilo para destacar preço, condição e escassez sem parecer amador.",
    idealFor: "campanhas de venda, promoções e imóveis com gatilho de decisão",
    visualDirection: "boxes de preço, contraste e ritmo visual forte",
    ctaStyle: "CTA agressivo para lead rápido",
    tags: ["oferta", "urgência", "conversão"],
  },
  {
    id: "tour-imobiliario",
    title: "Tour Imobiliário",
    category: "video",
    headline: "Narrativa visual para apresentar o imóvel",
    description: "Funciona bem para carrossel, reels e conteúdo guiado por sequência.",
    idealFor: "reels, vídeo curto, visita guiada e storytelling do imóvel",
    visualDirection: "ordem de ambientes, ritmo e transição clara",
    ctaStyle: "CTA para agendar visita",
    tags: ["tour", "reels", "storytelling"],
  },
  {
    id: "carrossel-beneficios",
    title: "Carrossel de Benefícios",
    category: "conteudo",
    headline: "Explique diferenciais sem poluir a peça",
    description: "Ótimo para transformar atributos do imóvel em sequência persuasiva.",
    idealFor: "carrosséis educativos e explicação de diferenciais",
    visualDirection: "blocos de informação, ícones e hierarquia clara",
    ctaStyle: "CTA para salvar, compartilhar ou chamar no direct",
    tags: ["carrossel", "educativo", "benefícios"],
  },
  {
    id: "reels-conversao",
    title: "Reels de Conversão",
    category: "video",
    headline: "Mais retenção, ritmo e impacto",
    description: "Pensado para vídeos curtos com hook forte, movimento e copy direta.",
    idealFor: "reels imobiliários, cortes rápidos e captação de atenção",
    visualDirection: "frames fortes, textos grandes e ritmo acelerado",
    ctaStyle: "CTA curto para DM ou WhatsApp",
    tags: ["reels", "hook", "retencao"],
  },
];
