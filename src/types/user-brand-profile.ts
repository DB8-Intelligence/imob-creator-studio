/**
 * user-brand-profile.ts — Perfil de marca do usuário (Creative Engine)
 *
 * Armazenado na tabela user_brand_profiles.
 * Preenchido durante o onboarding de marca (1º login).
 * Usado pelo pipeline para resolver cores, copy e branding.
 */

export interface CoresMarca {
  primaria: string;
  secundaria: string;
  neutra: string;
  fundo_preferido: string;
  estilo_detectado?: string;
}

export interface UserBrandProfile {
  id: string;
  user_id: string;
  nome_corretor: string;
  nome_imobiliaria?: string;
  creci?: string;
  whatsapp: string;
  instagram?: string;
  cidade_atuacao: string;
  nicho: 'residencial' | 'comercial' | 'luxo' | 'lancamentos' | 'rural';
  publico_alvo: 'jovens' | 'familias' | 'investidores' | 'alto_padrao' | 'geral';
  tom_comunicacao: 'formal' | 'sofisticado' | 'amigavel' | 'urgente' | 'aspiracional';
  logo_url?: string;
  cores_marca?: CoresMarca;
  estilo_marca?: string;
  foto_corretor_url?: string;
  onboarding_completo: boolean;
  created_at: string;
  updated_at: string;
}
