import type { SiteImovel } from "./site";

export type LPTemplate =
  | "ambar"    // dourado + roxo escuro — alto padrão lançamento
  | "linho"    // bege + verde natural — minimalista refinado
  | "salvia"   // sálvia + branco — contemporâneo natural
  | "noir"     // preto cinematográfico — premium escuro
  | "lar"      // tan warm — familiar acessível
  | "solene";  // navy + dourado — corporativo luxo

export type LPTipo = "html" | "pdf";

export interface LandingPage {
  id: string;
  user_id: string;
  imovel_id: string;

  template: LPTemplate;
  slug: string;
  tipo: LPTipo;

  headline: string | null;
  subheadline: string | null;
  descricao_custom: string | null;
  fotos_selecionadas: string[];
  amenities_custom: string[];

  ativo: boolean;
  expires_at: string | null;
  pdf_url: string | null;

  views_count: number;
  leads_count: number;

  created_at: string;
  updated_at: string;
}

/**
 * Metadata de cada template — usada no seletor de LP.
 */
export const LP_TEMPLATES: {
  id: LPTemplate;
  label: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  /** Classe Tailwind de gradient pra mini-preview */
  gradient: string;
  tag: "Premium" | "Novo" | "Clássico";
}[] = [
  {
    id: "ambar",
    label: "Âmbar",
    description: "Lançamento alto padrão, dourado + roxo escuro, hero 3-col",
    primaryColor: "#B19A6B",
    secondaryColor: "#3D2B47",
    gradient: "from-[#3D2B47] to-[#B19A6B]",
    tag: "Premium",
  },
  {
    id: "linho",
    label: "Linho",
    description: "Minimalista refinado, bege + verde natural, ícones line",
    primaryColor: "#8A7F6A",
    secondaryColor: "#4A5D3A",
    gradient: "from-[#4A5D3A] to-[#8A7F6A]",
    tag: "Novo",
  },
  {
    id: "salvia",
    label: "Sálvia",
    description: "Contemporâneo natural, verde sálvia + branco",
    primaryColor: "#8FA68E",
    secondaryColor: "#3D5243",
    gradient: "from-[#3D5243] to-[#8FA68E]",
    tag: "Novo",
  },
  {
    id: "noir",
    label: "Noir",
    description: "Premium escuro cinematográfico, preto + imagens fullbleed",
    primaryColor: "#1A1A1A",
    secondaryColor: "#C9A96E",
    gradient: "from-[#000000] to-[#1A1A1A]",
    tag: "Premium",
  },
  {
    id: "lar",
    label: "Lar",
    description: "Familiar warm, tan + dourado, tom acolhedor",
    primaryColor: "#8A7150",
    secondaryColor: "#D4B483",
    gradient: "from-[#8A7150] to-[#D4B483]",
    tag: "Novo",
  },
  {
    id: "solene",
    label: "Solene",
    description: "Corporativo luxo, navy + dourado, lançamento corporate",
    primaryColor: "#1B2A4A",
    secondaryColor: "#C9A96E",
    gradient: "from-[#1B2A4A] to-[#C9A96E]",
    tag: "Premium",
  },
];

/** Dados enviados pelo form da LP pro backend. */
export interface LPLeadData {
  nome: string;
  email?: string;
  telefone: string;
  mensagem?: string;
}

/** Resultado da submissão (o template reage com UI apropriada). */
export interface LPLeadResult {
  success: boolean;
  error?: string;
}

/**
 * Props passadas para cada template de LP.
 * A LP pode sobrescrever campos do imóvel via `lp.headline`, `lp.descricao_custom`, etc.
 */
export interface LPTemplateProps {
  imovel: SiteImovel;
  lp: LandingPage;
  /** Dados do corretor pra CTAs (telefone, whatsapp, etc) */
  corretor: {
    nome: string;
    telefone?: string;
    whatsapp?: string;
    email?: string;
    creci?: string;
    foto_url?: string;
    logo_url?: string;
  };
  /** Se true, renderiza modo preview (sem rastrear view, sem form submit real) */
  isPreview?: boolean;
  /**
   * Callback chamado quando o visitante submete o form da LP.
   * Responsável por inserir em site_leads + incrementar leads_count.
   * Se undefined, o template entra em modo preview (apenas UI de sucesso).
   */
  onSubmitLead?: (data: LPLeadData) => Promise<LPLeadResult>;
}

// ---------- Helpers ----------

/**
 * Gera slug único a partir do título do imóvel + sufixo aleatório.
 * Exemplo: "Casa Vila Mariana" → "casa-vila-mariana-a3f9k2"
 */
export function generateLPSlug(titulo: string): string {
  const kebab = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${kebab}-${suffix}`;
}

/**
 * Formata preço em BRL compacto.
 */
export function formatLPPrice(value?: number | null): string {
  if (!value) return "Consulte";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Link WhatsApp formatado com mensagem inicial.
 */
export function lpWhatsAppLink(phone: string, imovelTitulo: string): string {
  const clean = phone.replace(/\D/g, "");
  const msg = `Olá! Tenho interesse no imóvel "${imovelTitulo}". Gostaria de mais informações.`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

/**
 * Retorna as fotos que devem aparecer na LP:
 * - se corretor selecionou algumas, usa essas
 * - senão, usa todas do imóvel
 */
export function getLPFotos(imovel: SiteImovel, lp: LandingPage): string[] {
  if (lp.fotos_selecionadas && lp.fotos_selecionadas.length > 0) {
    return lp.fotos_selecionadas;
  }
  return imovel.fotos || [];
}

/**
 * Headline efetiva (custom ou padrão do imóvel).
 */
export function getLPHeadline(imovel: SiteImovel, lp: LandingPage): string {
  return lp.headline || imovel.titulo || "Seu próximo imóvel";
}

/**
 * Descrição efetiva (custom ou padrão do imóvel).
 */
export function getLPDescricao(imovel: SiteImovel, lp: LandingPage): string {
  return lp.descricao_custom || imovel.descricao || "";
}

/**
 * Lista de amenities (custom ou features do imóvel).
 */
export function getLPAmenities(imovel: SiteImovel, lp: LandingPage): string[] {
  if (lp.amenities_custom && lp.amenities_custom.length > 0) {
    return lp.amenities_custom;
  }
  return imovel.features || [];
}
