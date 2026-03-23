-- ============================================================
-- iMobCreatorAI — Campos detalhados em partner_submissions
-- Adiciona:
--   • 10 colunas individuais para imagens recebidas
--   • 10 colunas individuais para imagens após upscale
--   • Campos estruturados do imóvel (property_info JSONB)
--   • Descrição final gerada pela IA com base em CTA + branding
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Imagens recebidas individualmente (originais do parceiro)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.partner_submissions
  ADD COLUMN IF NOT EXISTS image_received_01  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_02  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_03  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_04  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_05  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_06  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_07  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_08  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_09  TEXT,
  ADD COLUMN IF NOT EXISTS image_received_10  TEXT;

COMMENT ON COLUMN public.partner_submissions.image_received_01 IS 'Melhor imagem recebida — posição 1 (selecionada pela IA por qualidade)';
COMMENT ON COLUMN public.partner_submissions.image_received_02 IS 'Imagem recebida — posição 2';
COMMENT ON COLUMN public.partner_submissions.image_received_03 IS 'Imagem recebida — posição 3';
COMMENT ON COLUMN public.partner_submissions.image_received_04 IS 'Imagem recebida — posição 4';
COMMENT ON COLUMN public.partner_submissions.image_received_05 IS 'Imagem recebida — posição 5';
COMMENT ON COLUMN public.partner_submissions.image_received_06 IS 'Imagem recebida — posição 6';
COMMENT ON COLUMN public.partner_submissions.image_received_07 IS 'Imagem recebida — posição 7';
COMMENT ON COLUMN public.partner_submissions.image_received_08 IS 'Imagem recebida — posição 8';
COMMENT ON COLUMN public.partner_submissions.image_received_09 IS 'Imagem recebida — posição 9';
COMMENT ON COLUMN public.partner_submissions.image_received_10 IS 'Imagem recebida — posição 10';

-- ─────────────────────────────────────────────────────────────
-- 2. Imagens após upscale (processadas pela IA, prontas para criativo)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.partner_submissions
  ADD COLUMN IF NOT EXISTS image_upscaled_01  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_02  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_03  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_04  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_05  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_06  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_07  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_08  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_09  TEXT,
  ADD COLUMN IF NOT EXISTS image_upscaled_10  TEXT;

COMMENT ON COLUMN public.partner_submissions.image_upscaled_01 IS 'Imagem 1 após upscale IA — alta resolução, pronta para uso';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_02 IS 'Imagem 2 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_03 IS 'Imagem 3 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_04 IS 'Imagem 4 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_05 IS 'Imagem 5 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_06 IS 'Imagem 6 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_07 IS 'Imagem 7 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_08 IS 'Imagem 8 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_09 IS 'Imagem 9 após upscale';
COMMENT ON COLUMN public.partner_submissions.image_upscaled_10 IS 'Imagem 10 após upscale';

-- ─────────────────────────────────────────────────────────────
-- 3. Informações estruturadas do imóvel
--    Extraídas do descritivo bruto pela IA ou preenchidas pelo parceiro
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.partner_submissions
  ADD COLUMN IF NOT EXISTS property_info JSONB DEFAULT '{}'::JSONB;

COMMENT ON COLUMN public.partner_submissions.property_info IS
  'Dados estruturados do imóvel extraídos pela IA do descritivo bruto.
   Estrutura esperada:
   {
     "tipo":          "Apartamento" | "Casa" | "Cobertura" | "Terreno" | "Comercial",
     "finalidade":    "Venda" | "Locação" | "Venda e Locação",
     "preco":         "850000",
     "area_total":    "120",           -- m²
     "area_privativa":"98",            -- m² (apartamentos)
     "quartos":       3,
     "suites":        1,
     "banheiros":     2,
     "vagas":         2,
     "andar":         "8",
     "endereco":      "Rua das Flores, 123",
     "bairro":        "Moema",
     "cidade":        "São Paulo",
     "estado":        "SP",
     "condominio":    "1200",          -- R$/mês
     "iptu":          "320",           -- R$/mês
     "diferenciais":  ["piscina", "academia", "churrasqueira", "portaria 24h"],
     "codigo_interno":"AP-2041"
   }';

-- ─────────────────────────────────────────────────────────────
-- 4. Descrição final gerada pela IA
--    Combina: CTA aprovado + bio/branding do perfil do corretor
--    Usada como legenda do post e texto do criativo
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.partner_submissions
  ADD COLUMN IF NOT EXISTS ai_branded_description  TEXT,
  ADD COLUMN IF NOT EXISTS ai_branded_caption      TEXT,
  ADD COLUMN IF NOT EXISTS ai_branded_hashtags     TEXT,
  ADD COLUMN IF NOT EXISTS ai_branding_context     JSONB DEFAULT '{}'::JSONB;

COMMENT ON COLUMN public.partner_submissions.ai_branded_description IS
  'Descrição longa gerada pela IA. Combina o CTA aprovado pelo corretor com o
   tom de voz, branding e bio do perfil do workspace para criar um texto
   persuasivo e alinhado com a identidade da marca. Usada no body do post.';

COMMENT ON COLUMN public.partner_submissions.ai_branded_caption IS
  'Legenda curta (até 2200 caracteres) otimizada para Instagram/Facebook.
   Gerada pela IA com base em: CTA aprovado + property_info + branding do perfil.
   Inclui emojis estratégicos e chamada para ação final.';

COMMENT ON COLUMN public.partner_submissions.ai_branded_hashtags IS
  'Bloco de hashtags gerado pela IA. Mistura tags de nicho do imóvel,
   localização e branding do corretor. Exemplo:
   #apartamentomoema #imoveissp #corretorimobiliario #seuslogan';

COMMENT ON COLUMN public.partner_submissions.ai_branding_context IS
  'Snapshot do contexto de branding usado na geração (para auditoria/debug).
   Estrutura:
   {
     "profile_bio":    "...",   -- bio do perfil no momento da geração
     "tone_of_voice":  "...",   -- tom definido no workspace
     "brand_keywords": [...],   -- palavras-chave da marca
     "cta_style":      "...",   -- estilo do CTA aprovado
     "model_used":     "claude-sonnet-4-6",
     "generated_at":   "2026-03-23T12:00:00Z"
   }';

-- ─────────────────────────────────────────────────────────────
-- Índices adicionais úteis
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partner_submissions_property_tipo
  ON public.partner_submissions USING GIN (property_info);

CREATE INDEX IF NOT EXISTS idx_partner_submissions_branding_ctx
  ON public.partner_submissions USING GIN (ai_branding_context);
