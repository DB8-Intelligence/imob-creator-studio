/**
 * template-config.ts — Estrutura de um template de criativo (Creative Engine)
 *
 * Cada template é um JSON versionável (ex: templates/dark_premium.json)
 * que define a composição visual via Shotstack, prompts Flux, e regras
 * de layout/tipografia/elementos.
 *
 * Ref: templates/*.json, pipeline/shotstack-builder.md
 */

// ─── Pipeline Config ────────────────────────────────────────────────────────

export interface TemplatePipelineConfig {
  /** Se deve rodar análise Claude Vision */
  analise_claude: boolean;
  /** Se deve gerar imagem via Flux (apenas templates com reestilização) */
  reestilizacao_flux: boolean;
  /** Se deve compor via Shotstack (sempre true para templates padrão) */
  composicao_shotstack: boolean;
}

// ─── Tipografia ─────────────────────────────────────────────────────────────

export interface FontConfig {
  fonte: string;
  peso: number;
  tamanho?: number;
  tamanho_post?: number;
  tamanho_story?: number;
  cor: string;
  transform?: string;
  tracking?: string;
  linha_altura?: number;
}

export interface TemplateTipografia {
  titulo: FontConfig;
  subtitulo: FontConfig;
  script?: FontConfig;
  cta: FontConfig;
  badge: FontConfig;
  marca: FontConfig;
  marca_script?: FontConfig;
  marca_sub?: FontConfig;
}

// ─── Elementos visuais ──────────────────────────────────────────────────────

export interface ElementoVisual {
  [key: string]: string | number | undefined;
}

export interface TemplateElementos {
  linha_decorativa?: ElementoVisual;
  badge_box?: ElementoVisual;
  cta_btn?: ElementoVisual;
  logo_box?: ElementoVisual;
}

// ─── Layout por formato ─────────────────────────────────────────────────────

export interface FormatoLayout {
  texto_zona: string;
  texto_max_width_pct: number;
  badge_pos: string;
  cta_pos: string;
  logo_pos: string;
}

export interface TemplateLayouts {
  post?: FormatoLayout;
  story?: FormatoLayout;
  reels?: FormatoLayout;
}

// ─── Config Visual ──────────────────────────────────────────────────────────

export interface TemplateOverlayConfig {
  lateral: string;
  inferior: string;
}

export interface TemplateConfigVisual {
  overlay: TemplateOverlayConfig;
  tipografia: TemplateTipografia;
  elementos: TemplateElementos;
  layout: TemplateLayouts;
}

// ─── Prompt Flux por formato ────────────────────────────────────────────────

export interface TemplatePromptFlux {
  post?: string;
  story?: string;
  reels?: string;
}

// ─── Template Config (completo) ─────────────────────────────────────────────

export type CreativeFormato = "post" | "story" | "reels";

/**
 * TemplateConfig — estrutura completa de um template de criativo.
 * Corresponde ao JSON em templates/*.json e à tabela creative_templates.
 */
export interface TemplateConfig {
  /** ID único do template (ex: "dark_premium") */
  id: string;

  /** Nome exibido ao usuário */
  nome: string;

  /** Descrição curta */
  descricao?: string;

  /** Categoria (ex: "Imobiliário") */
  categoria: string;

  /** Tags para busca */
  tags?: string[];

  /** Formatos suportados por este template */
  tipos: CreativeFormato[];

  /** Regras visuais: overlay, tipografia, elementos, layout */
  config_visual: TemplateConfigVisual;

  /** JSON Shotstack com {{variáveis}} para interpolação */
  shotstack_template: Record<string, unknown>;

  /** Prompts Flux por formato (null se reestilização não habilitada) */
  prompt_flux?: TemplatePromptFlux | null;

  /** Configuração do pipeline para este template */
  pipeline: TemplatePipelineConfig;

  /** Se o template está ativo para uso */
  ativo?: boolean;

  /** Ordem de exibição na lista */
  ordem_exibicao?: number;

  /** Custo em créditos */
  creditos?: number;

  created_at?: string;
}
