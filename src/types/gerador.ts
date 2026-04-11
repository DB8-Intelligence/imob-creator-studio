export type FormatoPost = 'post_quadrado' | 'story_vertical' | 'carrossel_post' | 'carrossel_story'
export type EstiloPost = 'dark_premium' | 'brisa' | 'minimalista' | 'litoral'

export interface GeradorPost {
  id: string; user_id: string; imovel_id: string;
  formato: FormatoPost; estilo: EstiloPost;
  legenda_gerada: string; hashtags_geradas: string[]; cta_gerado: string;
  shotstack_render_id?: string; imagem_url?: string; slides_urls: string[];
  status: 'processing' | 'done' | 'error'; error_msg?: string;
  logo_url: string; cor_primaria: string; cor_secundaria: string; cor_texto: string; fonte: string;
  created_at: string;
}

export const FORMATOS_POST = [
  { id: 'post_quadrado' as const, label: 'Post Instagram', dimensoes: '1080×1080', icone: '📸', carrossel: false },
  { id: 'story_vertical' as const, label: 'Story Instagram', dimensoes: '1080×1920', icone: '📱', carrossel: false },
  { id: 'carrossel_post' as const, label: 'Post Instagram', dimensoes: '1080×1080', icone: '📸', carrossel: true },
  { id: 'carrossel_story' as const, label: 'Story Instagram', dimensoes: '1080×1920', icone: '📱', carrossel: true },
]

export const ESTILOS_POST = [
  { id: 'dark_premium' as const, label: 'Dark Premium', descricao: 'Navy + dourado, luxo', preview_cor: '#0F172A' },
  { id: 'brisa' as const, label: 'Brisa', descricao: 'Azul claro, litoral', preview_cor: '#0284C7' },
  { id: 'minimalista' as const, label: 'Minimalista', descricao: 'Branco + navy, clean', preview_cor: '#F8FAFC' },
  { id: 'litoral' as const, label: 'Litoral', descricao: 'Areia + verde, praia', preview_cor: '#D97706' },
]
