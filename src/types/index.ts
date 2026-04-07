/**
 * index.ts — Re-export de todos os tipos do Creative Engine
 */
export type { CoresMarca, UserBrandProfile } from './user-brand-profile';
export type {
  ImovelInfo,
  CoresImagem,
  CopyGerado,
  ComposicaoAnalise,
  PromptFluxAnalise,
  ImageAnalysis,
} from './image-analysis';
export type {
  ResolvedPalette,
  PipelineVars,
  JobStatus,
  CreativeJobInput,
} from './pipeline';
export { FORMATO_DIMENSOES } from './pipeline';
export type { TemplateConfig, TemplatePipelineConfig, CreativeFormato } from './template-config';
export type { PipelineOutput, GeneratedCreative, CreativeEngineJobStatus } from './pipeline-output';
export type { PipelineInput } from './pipeline-input';
