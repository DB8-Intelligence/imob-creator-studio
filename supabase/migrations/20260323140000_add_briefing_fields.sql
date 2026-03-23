-- ============================================================
-- iMobCreatorAI — Campos de Briefing do Corretor
-- Armazena todas as informações de perfil, área de atuação
-- e estratégia gerada pela IA para uso em todas as postagens
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Campos de briefing na tabela profiles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  -- Bio para Instagram/Facebook (exibida no perfil e usada como contexto pela IA)
  ADD COLUMN IF NOT EXISTS bio_instagram        TEXT,

  -- Descrição da empresa / imobiliária
  ADD COLUMN IF NOT EXISTS company_description  TEXT,

  -- URL do perfil no Facebook
  ADD COLUMN IF NOT EXISTS facebook_url         TEXT,

  -- Bairros / regiões de atuação (array de strings)
  ADD COLUMN IF NOT EXISTS neighborhoods        TEXT[] DEFAULT '{}',

  -- Tipos de imóvel que o corretor trabalha
  ADD COLUMN IF NOT EXISTS property_types_worked TEXT[] DEFAULT '{}',

  -- Canais de marketing prioritários
  ADD COLUMN IF NOT EXISTS marketing_channels   TEXT[] DEFAULT '{}',

  -- Público-alvo detalhado (complementa o target_audience simplificado)
  ADD COLUMN IF NOT EXISTS audience_profile     TEXT,

  -- Diferenciais competitivos do corretor / imobiliária
  ADD COLUMN IF NOT EXISTS competitive_differentials TEXT,

  -- Meta de crescimento / objetivo principal no Instagram
  ADD COLUMN IF NOT EXISTS growth_goal         TEXT,

  -- Frequência de postagem desejada (ex: "3x por semana")
  ADD COLUMN IF NOT EXISTS posting_frequency   TEXT,

  -- Estratégia gerada pela IA (texto rico)
  ADD COLUMN IF NOT EXISTS ai_strategy         TEXT,

  -- Data/hora da geração da estratégia (para saber se está atualizada)
  ADD COLUMN IF NOT EXISTS ai_strategy_generated_at TIMESTAMPTZ,

  -- Sinaliza que o briefing foi preenchido ao menos uma vez
  ADD COLUMN IF NOT EXISTS briefing_completed_at    TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.bio_instagram IS
  'Bio do perfil no Instagram/Facebook. Usada como contexto de branding
   em todas as gerações de legenda, criativo e análise de estratégia.';

COMMENT ON COLUMN public.profiles.company_description IS
  'Descrição da empresa / imobiliária para contexto de IA.';

COMMENT ON COLUMN public.profiles.neighborhoods IS
  'Bairros e regiões de atuação. Ex: ["Moema", "Vila Olímpia", "Itaim Bibi"].
   Usados para contextualizar criativos e hashtags locais.';

COMMENT ON COLUMN public.profiles.property_types_worked IS
  'Tipos de imóvel com que o corretor trabalha.
   Ex: ["apartamento", "casa", "terreno", "comercial"].';

COMMENT ON COLUMN public.profiles.marketing_channels IS
  'Canais priorizados. Ex: ["instagram", "facebook", "whatsapp", "portais"].';

COMMENT ON COLUMN public.profiles.ai_strategy IS
  'Estratégia de crescimento gerada pela IA com base no briefing completo.
   Inclui: posicionamento, tipos de conteúdo, frequência, CTAs, hashtags.
   Regenerada sempre que o corretor solicitar nova análise.';

COMMENT ON COLUMN public.profiles.briefing_completed_at IS
  'Timestamp do primeiro preenchimento completo do briefing.
   NULL = briefing ainda não preenchido (exibe onboarding).';
