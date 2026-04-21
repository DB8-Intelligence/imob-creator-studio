export type TemaCorr = 'brisa' | 'urbano' | 'litoral' | 'dark-premium' | 'nestland' | 'nexthm' | 'ortiz' | 'quarter' | 'rethouse' | 'capital' | 'horizonte' | 'prisma' | 'eixo' | 'vitrine' | 'onix' | 'farol' | 'aurora' | 'sereno' | 'portico'

// ─── Layout de seções do site público ──────────────────────────────
export type SiteSectionKey = 'hero' | 'imoveis' | 'about' | 'depoimentos' | 'contato' | 'footer'

export interface SiteSectionsConfig {
  order: SiteSectionKey[]
  enabled: Record<SiteSectionKey, boolean>
  /** Conteúdo customizável pelo corretor dentro de cada seção. */
  content?: {
    /** Quantidade de imóveis visíveis na seção Imóveis (3-12). Default: 6. */
    imoveis_count?: number
  }
}

export const IMOVEIS_COUNT_MIN = 3
export const IMOVEIS_COUNT_MAX = 12
export const IMOVEIS_COUNT_DEFAULT = 6

export const DEFAULT_SITE_SECTIONS: SiteSectionsConfig = {
  order: ['hero', 'imoveis', 'about', 'depoimentos', 'contato', 'footer'],
  enabled: { hero: true, imoveis: true, about: true, depoimentos: true, contato: true, footer: true },
  content: { imoveis_count: IMOVEIS_COUNT_DEFAULT },
}

/** Helper: retorna quantos imóveis a seção deve mostrar (fallback 6). */
export function getImoveisCount(site: { sections_config?: SiteSectionsConfig | null | unknown }): number {
  const cfg = site.sections_config as SiteSectionsConfig | null | undefined
  const raw = cfg?.content?.imoveis_count
  if (typeof raw !== 'number') return IMOVEIS_COUNT_DEFAULT
  if (raw < IMOVEIS_COUNT_MIN) return IMOVEIS_COUNT_MIN
  if (raw > IMOVEIS_COUNT_MAX) return IMOVEIS_COUNT_MAX
  return raw
}

export const SITE_SECTION_META: Record<SiteSectionKey, { label: string; description: string; emoji: string }> = {
  hero:         { label: 'Hero / Busca',       description: 'Topo do site com banner e busca',          emoji: '🏠' },
  imoveis:      { label: 'Imóveis',            description: 'Lista dos seus imóveis destaque',           emoji: '🏢' },
  about:        { label: 'Quem sou / Sobre',   description: 'Sua bio + serviços que você oferece',       emoji: '👤' },
  depoimentos:  { label: 'Depoimentos',        description: 'Avaliações de clientes',                    emoji: '⭐' },
  contato:      { label: 'Contato',            description: 'Formulário + WhatsApp + telefone',          emoji: '📞' },
  footer:       { label: 'Rodapé',             description: 'Créditos, redes sociais, CRECI',            emoji: '🦶' },
}

export function normalizeSiteSectionsConfig(raw: unknown): SiteSectionsConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE_SECTIONS
  const obj = raw as Partial<SiteSectionsConfig>
  return {
    order: Array.isArray(obj.order) && obj.order.length > 0 ? obj.order : DEFAULT_SITE_SECTIONS.order,
    enabled: { ...DEFAULT_SITE_SECTIONS.enabled, ...(obj.enabled || {}) },
    content: { ...DEFAULT_SITE_SECTIONS.content, ...(obj.content || {}) },
  }
}

export type TipoImovel = 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'rural' | 'cobertura' | 'studio'
export type FinalidadeImovel = 'venda' | 'aluguel' | 'temporada'
export type StatusImovel = 'disponivel' | 'reservado' | 'vendido' | 'alugado'

export const TEMAS: { id: TemaCorr; label: string; cor: string; preview: string }[] = [
  { id: 'brisa', label: 'Brisa', cor: '#0284C7', preview: 'Azul claro, praia, leve' },
  { id: 'urbano', label: 'Urbano', cor: '#374151', preview: 'Cinza escuro, moderno' },
  { id: 'litoral', label: 'Litoral', cor: '#D97706', preview: 'Areia dourada, tropical' },
  { id: 'dark-premium', label: 'Dark Premium', cor: '#1E3A8A', preview: 'Navy e dourado, luxo' },
  { id: 'nestland', label: 'Nestland', cor: '#b99755', preview: 'Elegante, minimalista, dourado' },
  { id: 'nexthm', label: 'NextHM', cor: '#2c686b', preview: 'Verde natureza, serifado' },
  { id: 'ortiz', label: 'Ortiz', cor: '#25a5de', preview: 'Azul classico, slider hero' },
  { id: 'quarter', label: 'Quarter', cor: '#FF5A3C', preview: 'Moderno, dark, vermelho' },
  { id: 'rethouse', label: 'Rethouse', cor: '#3454d1', preview: 'Limpo, azul royal, clean' },
  { id: 'capital', label: 'Capital', cor: '#CC0000', preview: 'Tradicional, vermelho, portal completo' },
  { id: 'horizonte', label: 'Horizonte', cor: '#F39200', preview: 'Corporativo moderno, azul marinho + laranja' },
  { id: 'prisma', label: 'Prisma', cor: '#3B82F6', preview: 'Minimalista, navy + branco, grid de categorias' },
  { id: 'eixo', label: 'Eixo', cor: '#10B981', preview: 'Regional navy + verde, precos tricolor por finalidade' },
  { id: 'vitrine', label: 'Vitrine', cor: '#0066CC', preview: 'Catalogo amplo, azul + verde + chatbot, 16 categorias' },
  { id: 'onix', label: 'Onix', cor: '#1A1A1A', preview: 'Boutique luxo monocromatico, preto + dourado discreto' },
  { id: 'farol', label: 'Farol', cor: '#0099CC', preview: 'Regional corporativo, ciano + teal, chips de categoria' },
  { id: 'aurora', label: 'Aurora', cor: '#1A3A52', preview: 'Luminoso, navy + ambar, preco em overlay na foto' },
  { id: 'sereno', label: 'Sereno', cor: '#065F46', preview: 'Wellness, verde emerald + areia, refugio/natureza' },
  { id: 'portico', label: 'Portico', cor: '#1D4ED8', preview: 'Portal marketplace, azul royal, hero ultra minimalista' },
]

export interface CorretorSite {
  id: string; user_id: string; nome_completo: string; creci: string; foto_url: string;
  bio: string; especialidades: string[]; anos_experiencia: number;
  telefone: string; whatsapp: string; email_contato: string;
  instagram: string; facebook: string; linkedin: string; youtube: string;
  slug: string; dominio_customizado: string; dominio_verificado: boolean;
  dominio_verificado_at: string | null; cname_token: string;
  tema: TemaCorr; cor_primaria: string; cor_secundaria: string;
  logo_url: string; banner_hero_url: string;
  banner_hero_titulo: string; banner_hero_subtitulo: string;
  meta_titulo: string; meta_descricao: string; google_analytics_id: string;
  publicado: boolean; created_at: string; updated_at: string;
  sections_config?: SiteSectionsConfig | null;
}

export interface SiteImovel {
  id: string; user_id: string; site_id: string; titulo: string; descricao: string;
  tipo: TipoImovel; finalidade: FinalidadeImovel; status: StatusImovel;
  endereco: string; bairro: string; cidade: string; estado: string; cep: string;
  latitude?: number; longitude?: number; preco?: number; preco_condominio?: number;
  area_total?: number; area_construida?: number;
  quartos: number; suites: number; banheiros: number; vagas: number; andar?: number;
  fotos: string[]; foto_capa: string; video_url?: string; tour_virtual_url?: string;
  features: string[]; publicar_zap: boolean; publicar_olx: boolean; publicar_vivareal: boolean;
  codigo_externo: string; slug?: string; destaque: boolean; ordem_exibicao: number;
  created_at: string; updated_at: string;
}

export interface SiteDepoimento {
  id: string; user_id: string; site_id: string; nome_cliente: string;
  foto_url: string; texto: string; avaliacao: number; tipo_negocio: string;
  ativo: boolean; ordem: number; created_at: string;
}

export interface SiteLead {
  id: string; site_id: string; corretor_user_id: string; imovel_id?: string;
  nome: string; email?: string; telefone: string; mensagem: string;
  interesse: 'compra' | 'aluguel' | 'avaliacao' | 'outro';
  origem: string; processado: boolean; created_at: string;
}
