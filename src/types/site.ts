export type TemaCorr = 'brisa' | 'urbano' | 'litoral' | 'dark-premium' | 'nestland' | 'nexthm' | 'ortiz' | 'quarter' | 'rethouse'
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
