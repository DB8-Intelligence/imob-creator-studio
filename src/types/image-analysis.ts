/**
 * image-analysis.ts — Resultado da análise Claude Vision (Creative Engine)
 *
 * Retornado pelo prompt unificado (claude-sonnet-4-6 com vision).
 * Contém análise do imóvel, paleta de cores, copy gerado e recomendações de composição.
 */

export interface ImovelInfo {
  tipo: string;
  ambiente: 'interno' | 'externo' | 'aereo' | 'fachada' | 'area_comum';
  tem_pessoa: boolean;
  posicao_focal: 'esquerda' | 'centro' | 'direita' | 'full';
  luminosidade: 'escura' | 'media' | 'clara';
  contraste: 'alto' | 'medio' | 'baixo';
  zona_livre_texto: string;
  qualidade_foto: 'alta' | 'media' | 'baixa';
  angulo: string;
}

export interface CoresImagem {
  dominante: string;
  secundaria: string;
  terciaria: string;
  fundo_sugerido: string;
  accent_sugerido: string;
  overlay_intensidade: number;
  overlay_css_lateral: string;
  overlay_css_inferior: string;
}

export interface CopyGerado {
  titulo_linha1: string;
  titulo_linha2: string;
  titulo_completo: string;
  subtitulo: string;
  conceito_campanha: string;
  cta_texto: string;
  badge_texto: string;
  script_elegante: string;
  mood: 'aspiracional' | 'urgencia' | 'exclusividade' | 'educativo' | 'conquista' | 'familiar';
  copy_instagram: string;
  copy_story: string;
  copy_whatsapp: string;
}

export interface ComposicaoAnalise {
  layout_recomendado: 'texto_esquerda' | 'texto_direita' | 'texto_superior' | 'texto_inferior' | 'central';
  estilo_overlay: 'lateral' | 'inferior' | 'superior' | 'diagonal' | 'vinheta' | 'full';
  saturacao_foto: 'aumentar' | 'manter' | 'reduzir';
  ajuste_brilho: number;
  ajuste_contraste: number;
  posicao_foto_background: string;
}

export interface PromptFluxAnalise {
  descricao_cena: string;
  estilo_fotografico: string;
  iluminacao: string;
  elementos_preservar: string;
}

export interface ImageAnalysis {
  imovel: ImovelInfo;
  cores_imagem: CoresImagem;
  copy: CopyGerado;
  composicao: ComposicaoAnalise;
  prompt_flux: PromptFluxAnalise;
}
