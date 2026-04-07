# Variable Resolver — Montagem do Objeto Final

## Todos os tipos TypeScript

```typescript
// src/types/user-brand-profile.ts
export interface UserBrandProfile {
  id: string;
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
  cores_marca?: {
    primaria: string;
    secundaria: string;
    neutra: string;
    fundo_preferido: string;
  };
  estilo_marca?: 'moderno' | 'classico' | 'minimalista' | 'bold' | 'elegante';
  created_at: string;
}

// src/types/image-analysis.ts
export interface ImageAnalysis {
  imovel: {
    tipo: string;
    ambiente: 'interno' | 'externo' | 'aereo' | 'fachada' | 'area_comum';
    tem_pessoa: boolean;
    posicao_focal: 'esquerda' | 'centro' | 'direita' | 'full';
    luminosidade: 'escura' | 'media' | 'clara';
    contraste: 'alto' | 'medio' | 'baixo';
    zona_livre_texto: string;
    qualidade_foto: 'alta' | 'media' | 'baixa';
    angulo: string;
  };
  cores_imagem: {
    dominante: string;
    secundaria: string;
    terciaria: string;
    fundo_sugerido: string;
    accent_sugerido: string;
    overlay_intensidade: number;
    overlay_css_lateral: string;
    overlay_css_inferior: string;
  };
  copy: {
    titulo_linha1: string;
    titulo_linha2: string;
    titulo_completo: string;
    subtitulo: string;
    conceito_campanha: string;
    cta_texto: string;
    badge_texto: string;
    script_elegante: string;
    mood: string;
    copy_instagram: string;
  };
  composicao: {
    layout_recomendado: string;
    estilo_overlay: string;
    saturacao_foto: string;
    ajuste_brilho: number;
    ajuste_contraste: number;
    posicao_foto_background: string;
  };
  prompt_flux: {
    descricao_cena: string;
    estilo_fotografico: string;
    iluminacao: string;
    elementos_preservar: string;
  };
}

// src/types/pipeline-vars.ts
export interface PipelineVars {
  // Imagem
  imagem_url: string;
  logo_url: string;
  formato: 'post' | 'story' | 'reels';
  largura: number;
  altura: number;

  // Imóvel
  tipo_imovel: string;
  ambiente: string;
  posicao_focal: string;
  posicao_foto_background: string;

  // Copy
  titulo_linha1: string;
  titulo_linha2: string;
  titulo_completo: string;
  subtitulo: string;
  conceito_campanha: string;
  cta_texto: string;
  badge_texto: string;
  script_elegante: string;
  copy_instagram: string;

  // Cores resolvidas
  cor_primaria: string;
  cor_secundaria: string;
  cor_fundo: string;
  overlay_rgba: string;
  overlay_rgba_40: string;
  overlay_rgba_60: string;
  overlay_rgba_95: string;
  cor_accent: string;
  cor_accent_40: string;
  cor_accent_12: string;
  overlay_css_lateral: string;
  overlay_css_inferior: string;

  // Marca
  nome_corretor: string;
  creci?: string;
  whatsapp: string;

  // Composição
  layout_recomendado: string;
  saturacao_foto: string;
}
```

## buildVars — função que monta o objeto completo

```typescript
// src/services/pipeline/variable-resolver.service.ts

export function buildVars(
  analise: ImageAnalysis,
  cores: ResolvedPalette,
  userProfile: UserBrandProfile,
  imagem_url: string,
  formato: 'post' | 'story' | 'reels'
): PipelineVars {

  const dimensoes = {
    post:  { largura: 1080, altura: 1350 },
    story: { largura: 1080, altura: 1920 },
    reels: { largura: 1080, altura: 1920 },
  };

  return {
    // Imagem e formato
    imagem_url,
    logo_url: userProfile.logo_url || '',
    formato,
    ...dimensoes[formato],

    // Imóvel
    tipo_imovel: analise.imovel.tipo,
    ambiente: analise.imovel.ambiente,
    posicao_focal: analise.imovel.posicao_focal,
    posicao_foto_background: analise.composicao.posicao_foto_background,

    // Copy (vem do Claude, baseado no texto_bruto do usuário)
    titulo_linha1:    analise.copy.titulo_linha1,
    titulo_linha2:    analise.copy.titulo_linha2,
    titulo_completo:  analise.copy.titulo_completo,
    subtitulo:        analise.copy.subtitulo,
    conceito_campanha: analise.copy.conceito_campanha,
    cta_texto:        analise.copy.cta_texto,
    badge_texto:      analise.copy.badge_texto,
    script_elegante:  analise.copy.script_elegante,
    copy_instagram:   analise.copy.copy_instagram,

    // Cores (resolvidas pelo color-resolver)
    cor_primaria:        cores.primaria,
    cor_secundaria:      cores.secundaria,
    cor_fundo:           cores.fundo,
    overlay_rgba:        cores.overlay_rgba,
    overlay_rgba_40:     cores.overlay_rgba_40,
    overlay_rgba_60:     cores.overlay_rgba_60,
    overlay_rgba_95:     cores.overlay_rgba_95,
    cor_accent:          cores.accent,
    cor_accent_40:       cores.accent_40,
    cor_accent_12:       cores.accent_12,
    overlay_css_lateral:  cores.css_overlay_lateral,
    overlay_css_inferior: cores.css_overlay_inferior,

    // Marca do usuário
    nome_corretor: userProfile.nome_corretor,
    creci:         userProfile.creci,
    whatsapp:      userProfile.whatsapp,

    // Composição
    layout_recomendado: analise.composicao.layout_recomendado,
    saturacao_foto:     analise.composicao.saturacao_foto,
  };
}

// Interpolação de {{variavel}} em strings e objetos aninhados
export function interpolate(template: string, vars: PipelineVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = (vars as any)[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export function interpolateDeep(obj: any, vars: PipelineVars): any {
  if (typeof obj === 'string') return interpolate(obj, vars);
  if (Array.isArray(obj)) return obj.map(item => interpolateDeep(item, vars));
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = interpolateDeep(obj[key], vars);
    }
    return result;
  }
  return obj;
}
```

## Database Schema (Supabase)

```sql
-- 001_user_brand_profiles.sql
CREATE TABLE user_brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_corretor TEXT NOT NULL,
  nome_imobiliaria TEXT,
  creci TEXT,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  cidade_atuacao TEXT NOT NULL,
  nicho TEXT NOT NULL DEFAULT 'residencial',
  publico_alvo TEXT NOT NULL DEFAULT 'geral',
  tom_comunicacao TEXT NOT NULL DEFAULT 'amigavel',
  logo_url TEXT,
  cores_marca JSONB,
  estilo_marca TEXT,
  onboarding_completo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 002_creative_templates.sql
CREATE TABLE creative_templates (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Imobiliário',
  tags TEXT[],
  tipos TEXT[] NOT NULL DEFAULT '{post,story,reels}',
  config_visual JSONB NOT NULL,
  shotstack_template JSONB NOT NULL,
  prompt_flux JSONB,
  pipeline_config JSONB NOT NULL,
  ativo BOOLEAN DEFAULT true,
  ordem_exibicao INTEGER DEFAULT 0,
  creditos INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 003_creative_jobs.sql
CREATE TABLE creative_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_id TEXT REFERENCES creative_templates(id),
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | analyzing | generating | rendering | completed | failed
  texto_bruto TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  analise_resultado JSONB,
  vars_resolvidas JSONB,
  formatos TEXT[] NOT NULL DEFAULT '{post,story,reels}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 004_generated_creatives.sql
CREATE TABLE generated_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES creative_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  formato TEXT NOT NULL, -- post | story | reels
  shotstack_render_id TEXT,
  output_url TEXT,
  thumbnail_url TEXT,
  copy_instagram TEXT,
  status TEXT NOT NULL DEFAULT 'rendering',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_creative_jobs_user ON creative_jobs(user_id);
CREATE INDEX idx_creative_jobs_status ON creative_jobs(status);
CREATE INDEX idx_generated_creatives_job ON generated_creatives(job_id);
CREATE INDEX idx_generated_creatives_user ON generated_creatives(user_id);
```
