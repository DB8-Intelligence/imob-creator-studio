# PROMPT 1 — FOUNDATION: Schema + Backend Base
# Para usar no Claude Code dentro do repositório imob-creator-studio

---

Você está implementando o sistema de geração de criativos do ImobCreator AI.
Leia o CLAUDE.md em `.claude/` antes de começar.

Stack: Node.js + Fastify + Supabase + TypeScript.
Frontend é WeWeb (no-code) — não criar arquivos de frontend agora.

## FASE 1 — Banco de dados (Supabase migrations)

Criar os arquivos em `supabase/migrations/` nesta ordem exata:

### 001_user_brand_profiles.sql
```sql
CREATE TABLE IF NOT EXISTS user_brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome_corretor TEXT NOT NULL,
  nome_imobiliaria TEXT,
  creci TEXT,
  whatsapp TEXT NOT NULL DEFAULT '',
  instagram TEXT,
  cidade_atuacao TEXT NOT NULL DEFAULT '',
  nicho TEXT NOT NULL DEFAULT 'residencial'
    CHECK (nicho IN ('residencial','comercial','luxo','lancamentos','rural')),
  publico_alvo TEXT NOT NULL DEFAULT 'geral'
    CHECK (publico_alvo IN ('jovens','familias','investidores','alto_padrao','geral')),
  tom_comunicacao TEXT NOT NULL DEFAULT 'amigavel'
    CHECK (tom_comunicacao IN ('formal','sofisticado','amigavel','urgente','aspiracional')),
  logo_url TEXT,
  cores_marca JSONB DEFAULT '{}',
  estilo_marca TEXT,
  foto_corretor_url TEXT,
  onboarding_completo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ubp_user_id ON user_brand_profiles(user_id);
```

### 002_creative_templates.sql
```sql
CREATE TABLE IF NOT EXISTS creative_templates (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Imobiliário',
  tags TEXT[] DEFAULT '{}',
  tipos TEXT[] NOT NULL DEFAULT '{post,story,reels}',
  config_visual JSONB NOT NULL DEFAULT '{}',
  shotstack_template JSONB NOT NULL DEFAULT '{}',
  prompt_flux JSONB DEFAULT '{}',
  pipeline_config JSONB NOT NULL DEFAULT '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}',
  badge_label TEXT,
  badge_tipo TEXT CHECK (badge_tipo IN ('recomendado','novo','popular',NULL)),
  ativo BOOLEAN DEFAULT true,
  ordem_exibicao INTEGER DEFAULT 0,
  creditos INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ct_categoria ON creative_templates(categoria);
CREATE INDEX idx_ct_ativo ON creative_templates(ativo);
```

### 003_creative_jobs.sql
```sql
CREATE TYPE job_status AS ENUM (
  'pending','validating','processing_image','generating_copy',
  'composing','rendering','done','error'
);

CREATE TYPE job_mode AS ENUM ('form','assistant');

CREATE TABLE IF NOT EXISTS creative_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode job_mode NOT NULL DEFAULT 'form',
  template_id TEXT REFERENCES creative_templates(id),
  style_id TEXT,
  status job_status NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  formats TEXT[] NOT NULL DEFAULT '{post,story,reels}',
  variation_count INTEGER DEFAULT 1 CHECK (variation_count IN (1,5)),
  image_count INTEGER DEFAULT 1 CHECK (image_count IN (1,2,3)),
  input_images JSONB DEFAULT '[]',
  logo_url TEXT,
  use_brand_identity BOOLEAN DEFAULT false,
  user_description TEXT,
  generated_copy JSONB DEFAULT '{}',
  manual_copy JSONB DEFAULT '{}',
  analise_resultado JSONB DEFAULT '{}',
  vars_resolvidas JSONB DEFAULT '{}',
  auto_selected_template_id TEXT,
  auto_selected_style_id TEXT,
  auto_selected_pipeline JSONB DEFAULT '{}',
  decision_reason TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cj_user_id ON creative_jobs(user_id);
CREATE INDEX idx_cj_status ON creative_jobs(status);
CREATE INDEX idx_cj_created ON creative_jobs(created_at DESC);
```

### 004_generated_creatives.sql
```sql
CREATE TABLE IF NOT EXISTS generated_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES creative_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  formato TEXT NOT NULL CHECK (formato IN ('post','story','reels','thumbnail','quadrado','paisagem')),
  shotstack_render_id TEXT,
  output_url TEXT,
  thumbnail_url TEXT,
  copy_instagram TEXT,
  copy_story TEXT,
  copy_whatsapp TEXT,
  template_id TEXT,
  style_id TEXT,
  status TEXT NOT NULL DEFAULT 'rendering' CHECK (status IN ('rendering','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gc_job_id ON generated_creatives(job_id);
CREATE INDEX idx_gc_user_id ON generated_creatives(user_id);
CREATE INDEX idx_gc_status ON generated_creatives(status);
```

### 005_agent_registry.sql
```sql
CREATE TYPE agent_category AS ENUM (
  'copy','visual','branding','composicao','validacao',
  'publicacao','analytics','roteamento','template_decision'
);

CREATE TYPE pipeline_stage AS ENUM (
  'input_collection','image_analysis','branding_analysis',
  'template_decision','copy_generation','image_restyling',
  'composition','rendering','validation','publication','analytics'
);

CREATE TABLE IF NOT EXISTS agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prompt_master TEXT NOT NULL,
  category agent_category NOT NULL,
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  pipeline_stage pipeline_stage NOT NULL,
  trigger_mode TEXT NOT NULL DEFAULT 'always'
    CHECK (trigger_mode IN ('always','conditional','manual')),
  active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_registry(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  prompt_master TEXT NOT NULL,
  config_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_registry(id) ON DELETE CASCADE,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('form','assistant','both')),
  stage_name pipeline_stage NOT NULL,
  execution_order INTEGER DEFAULT 0,
  condition_json JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS agent_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_registry(id),
  job_id UUID REFERENCES creative_jobs(id) ON DELETE CASCADE,
  stage_name TEXT,
  input_payload JSONB DEFAULT '{}',
  output_payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error','skipped')),
  duration_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ael_job_id ON agent_execution_logs(job_id);
CREATE INDEX idx_ael_agent_id ON agent_execution_logs(agent_id);
```

---

## FASE 2 — Tipos TypeScript

Criar `src/types/` com os seguintes arquivos. Não usar `any` — tipagem completa.

### src/types/index.ts
Exportar todos os tipos dos arquivos abaixo.

### src/types/user-brand-profile.ts
```typescript
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
```

### src/types/image-analysis.ts
```typescript
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
```

### src/types/pipeline.ts
```typescript
export interface ResolvedPalette {
  primaria: string;
  secundaria: string;
  fundo: string;
  texto: string;
  texto_corpo: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  accent: string;
  accent_40: string;
  accent_12: string;
  accent_08: string;
  fonte: 'marca' | 'imagem';
  css_overlay_lateral: string;
  css_overlay_inferior: string;
}

export interface PipelineVars {
  imagem_url: string;
  logo_url: string;
  formato: 'post' | 'story' | 'reels' | 'quadrado' | 'paisagem';
  largura: number;
  altura: number;
  tipo_imovel: string;
  posicao_foto_background: string;
  titulo_linha1: string;
  titulo_linha2: string;
  titulo_completo: string;
  subtitulo: string;
  conceito_campanha: string;
  cta_texto: string;
  badge_texto: string;
  script_elegante: string;
  copy_instagram: string;
  copy_story: string;
  copy_whatsapp: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_fundo: string;
  cor_accent: string;
  cor_accent_40: string;
  cor_accent_12: string;
  cor_accent_08: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  overlay_css_lateral: string;
  overlay_css_inferior: string;
  cor_texto_corpo: string;
  nome_corretor: string;
  creci?: string;
  whatsapp: string;
  layout_recomendado: string;
}

export type JobStatus =
  | 'pending' | 'validating' | 'processing_image'
  | 'generating_copy' | 'composing' | 'rendering' | 'done' | 'error';

export interface CreativeJobInput {
  mode: 'form' | 'assistant';
  template_id?: string;
  formats: string[];
  variation_count: 1 | 5;
  image_count: 1 | 2 | 3;
  input_images: string[];
  logo_url?: string;
  use_brand_identity: boolean;
  style_id?: string;
  user_description: string;
  generated_copy?: Partial<CopyGerado>;
  manual_copy?: Record<string, string>;
  metadata?: Record<string, unknown>;
}
```

---

## FASE 3 — Serviços backend

Criar `src/services/` com:

### src/services/image-analyzer.service.ts

Usar `claude-sonnet-4-6` com vision.
Prompt completo está em `.claude/skills/imobcreator-creative-engine/SKILL.md` — leia antes de implementar.
Retorna `ImageAnalysis`.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { ImageAnalysis, UserBrandProfile } from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeCreative(params: {
  image_url?: string;
  image_base64?: string;
  image_mime?: string;
  texto_bruto: string;
  user_profile: UserBrandProfile;
}): Promise<ImageAnalysis> {
  // Montar imageContent baseado em url ou base64
  // Usar o prompt unificado da skill
  // Parsear e retornar ImageAnalysis
  // Em caso de erro de parse: logar e retornar defaults seguros
}
```

### src/services/color-resolver.service.ts

Lógica: se `user_profile.logo_url && user_profile.cores_marca?.primaria` → usar marca, senão → usar imagem.
Retorna `ResolvedPalette`.

### src/services/template-decision.service.ts

Classificador `input_analyzer()` que retorna recomendações de template.

```typescript
export interface TemplateDecision {
  image_type: string;
  campaign_goal: string;
  luxury_level: 'standard' | 'premium' | 'ultra';
  composition_type: string;
  recommended_templates: string[];
  recommended_style: string;
  recommended_copy_mode: 'ia' | 'manual';
  recommended_pipeline: object;
  decision_reason: string;
}

// Regras de decisão:
// tem_pessoa=true + ambiente=externo + tipo=corretor → 'autoridade_expert'
// luminosidade=escura + luxury_level=ultra → 'dark_premium' ou 'luxo_dourado'
// qualidade=alta + ambiente=interno + contraste=alto → 'expert_photoshop' ou 'ia_express'
// urgencia no texto + badge_urgencia → 'ia_express'
// texto educativo/dicas → 'ia_imobiliario'
// default → 'dark_premium'
```

### src/services/pipeline-orchestrator.service.ts

Orquestra todo o fluxo de um job. Atualiza status no Supabase a cada etapa.

```typescript
export async function runPipeline(jobId: string): Promise<void> {
  // 1. Buscar job + user_profile do Supabase
  // 2. updateJobStatus(jobId, 'validating', 10)
  // 3. analyzeCreative() → analise_resultado
  // 4. updateJobStatus(jobId, 'processing_image', 30)
  // 5. resolveColors() → palette
  // 6. template_decision se auto_select
  // 7. updateJobStatus(jobId, 'generating_copy', 50)
  // 8. buildVars() → vars_resolvidas
  // 9. updateJobStatus(jobId, 'composing', 65)
  // 10. Para cada formato: buildShotstackJson() → renderizar
  // 11. updateJobStatus(jobId, 'rendering', 80)
  // 12. Salvar generated_creatives
  // 13. updateJobStatus(jobId, 'done', 100)
}

async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  progress: number,
  error?: string
): Promise<void> {
  await supabase
    .from('creative_jobs')
    .update({ status, progress, error_message: error, updated_at: new Date().toISOString() })
    .eq('id', jobId);
}
```

### src/services/shotstack.service.ts

```typescript
// POST para Shotstack + polling + webhook handler
// Usar SHOTSTACK_API_KEY do env
// Webhook: POST /webhooks/shotstack?jobId=X&formato=Y
```

### src/services/prompt-assimilation.service.ts

Recebe prompt bruto → usa claude-haiku-4-5 para classificar → retorna estrutura do agente.

```typescript
export async function assimilateAgentPrompt(params: {
  name: string;
  description: string;
  prompt_master: string;
}): Promise<{
  slug: string;
  category: string;
  pipeline_stage: string;
  input_schema: object;
  output_schema: object;
  trigger_mode: string;
  reason: string;
}> {
  // Usar claude-haiku-4-5 com prompt de classificação
  // Retornar estrutura para criar agent_registry
}
```

---

## FASE 4 — Rotas API (Fastify)

Criar `src/routes/`:

### POST /api/creative-jobs/create
- Validar input com zod
- Criar job no Supabase (status: pending)
- Disparar `runPipeline(job.id)` de forma assíncrona (não aguardar)
- Retornar `{ job_id, status: 'pending' }` imediatamente

### GET /api/creative-jobs/:id/status
- Retornar `{ status, progress, formats_done }` para polling do WeWeb

### GET /api/creative-jobs/:id/result
- Retornar URLs dos criativos gerados quando `status === 'done'`

### GET /api/templates
- Query params: `categoria`, `ativo`
- Retornar lista de templates

### POST /api/onboarding/logo-analyze
- Multipart upload
- Chamar Claude Vision para extrair cores
- Salvar no Supabase Storage + atualizar user_brand_profiles
- Retornar `{ logo_url, cores }`

### POST /api/onboarding/brand
- Salvar perfil completo de onboarding

### POST /api/agents/create
- Receber `{ name, description, prompt_master }`
- Chamar `assimilateAgentPrompt()`
- Criar agent_registry + agent_versions + agent_bindings
- Retornar agente criado

### POST /api/webhooks/shotstack
- Receber callback do Shotstack
- Atualizar generated_creatives.output_url e status
- Verificar se todos formatos do job estão done → atualizar creative_jobs.status = 'done'

---

## FASE 5 — Seed de templates

Criar `supabase/seed/templates.sql` com INSERT dos templates:
- dark_premium
- ia_express
- expert_photoshop (glass morphism)
- imobiliario_top
- ia_imobiliario
- classico_elegante

Os JSONs completos de cada template estão em `.claude/skills/imobcreator-creative-engine/`.

---

## FASE 6 — Seed de agentes base

Criar `supabase/seed/agents.sql` com INSERT dos 5 agentes hardcoded iniciais:
1. image_analyzer_agent — pipeline_stage: image_analysis
2. copy_generator_agent — pipeline_stage: copy_generation
3. color_extractor_agent — pipeline_stage: branding_analysis
4. template_selector_agent — pipeline_stage: template_decision
5. composition_builder_agent — pipeline_stage: composition

---

## Regras de implementação

1. Nunca modificar a imagem original — ela é sempre `background` layer
2. Copy sempre deriva de `user_description` — nunca inventar
3. Cores: se `user_profile.cores_marca` existe → usar; senão → extrair da imagem
4. `runPipeline()` é sempre assíncrono — o endpoint retorna imediatamente
5. Status do job é atualizado no Supabase a cada etapa — WeWeb faz polling
6. `claude-sonnet-4-6` para análise visual; `claude-haiku-4-5` para copy simples e classificação
7. Logs de execução de agente sempre em `agent_execution_logs`
8. Variáveis de ambiente necessárias: ANTHROPIC_API_KEY, FAL_KEY, SHOTSTACK_API_KEY,
   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_BASE_URL

Ao encontrar pendência resolva automaticamente se possível.
Só marque como pendência externa se depender de credencial ou serviço externo.
