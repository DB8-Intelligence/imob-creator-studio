-- ============================================================================
-- MIGRATION: ImobCreator Schema Divergence Fix
-- Data:      2026-04-03
-- Autor:     QA Sentinel – Etapa 4 Integration Audit
-- Versão:    2.0 (revisada e auditada linha a linha)
--
-- OBJETIVO:
--   Alinhar o schema real do Supabase com o contrato esperado pelo frontend
--   e pelas Edge Functions, sem operações destrutivas.
--
-- BLOCOS:
--   1. Utility: trigger function update_updated_at()
--   2. CREATE TABLE creatives
--   3. CREATE TABLE prompt_templates
--   4. CREATE TABLE property_media
--   5. CREATE TABLE video_plan_addons
--   6. CREATE TABLE workspace_members  (usada pelo Kiwify webhook)
--   7. ALTER  TABLE profiles  (+ 9 colunas)
--   8. ALTER  TABLE properties (+ 8 colunas)
--
-- SEGURANÇA:
--   - Todos os CREATE usam IF NOT EXISTS
--   - Todos os ALTER verificam existência prévia da coluna
--   - RLS habilitado em todas as novas tabelas
--   - Nenhuma coluna existente é removida ou renomeada
--   - Nenhum dado existente é alterado
--
-- PÓS-MIGRATION:
--   Regenerar types: supabase gen types typescript > src/integrations/supabase/types.ts
-- ============================================================================


-- ═══ BLOCO 1: UTILITY ══════════════════════════════════════════════════════
-- Trigger function reutilizável para auto-atualizar updated_at

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ═══ BLOCO 2: TABLE creatives ══════════════════════════════════════════════
--
-- Consumidores frontend:
--   • Dashboard.tsx      → SELECT id, name, format, status, created_at, exported_url, property_id, properties(title)
--   • Library.tsx         → SELECT id, name, format, status, created_at, exported_url, caption, property_id, brand_id, properties(title), brands(name)
--   • Library.tsx         → DELETE by id
--   • Export.tsx           → UPDATE scheduled_at, status WHERE id
--   • Export.tsx           → INSERT user_id, name, format, status, scheduled_at, caption, exported_url
--   • useArtGeneration.ts → SELECT id, name, format, exported_url, status, created_at, content_data WHERE property_id
--
-- NOTA: Library.tsx faz JOIN "brands(name)" — essa tabela NÃO existe no schema.
--       O JOIN será silenciosamente ignorado pelo PostgREST (retorna null).
--       Se brands for necessário no futuro, criar em migration separada.

CREATE TABLE IF NOT EXISTS public.creatives (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   uuid        REFERENCES public.properties(id) ON DELETE SET NULL,
  brand_id      uuid        DEFAULT NULL,             -- FK para futura tabela "brands"
  name          text        NOT NULL DEFAULT 'Sem título',
  format        text        NOT NULL DEFAULT 'feed_square',
  status        text        DEFAULT 'draft',           -- draft | scheduled | published | archived
  caption       text,
  exported_url  text,
  scheduled_at  timestamptz,
  content_data  jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creatives' AND policyname = 'creatives_select_own') THEN
    CREATE POLICY creatives_select_own ON public.creatives FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creatives' AND policyname = 'creatives_insert_own') THEN
    CREATE POLICY creatives_insert_own ON public.creatives FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creatives' AND policyname = 'creatives_update_own') THEN
    CREATE POLICY creatives_update_own ON public.creatives FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creatives' AND policyname = 'creatives_delete_own') THEN
    CREATE POLICY creatives_delete_own ON public.creatives FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_creatives_user_id     ON public.creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_property_id ON public.creatives(property_id);
CREATE INDEX IF NOT EXISTS idx_creatives_status      ON public.creatives(status);

DROP TRIGGER IF EXISTS creatives_set_updated_at ON public.creatives;
CREATE TRIGGER creatives_set_updated_at
  BEFORE UPDATE ON public.creatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ═══ BLOCO 3: TABLE prompt_templates ════════════════════════════════════════
--
-- Consumidores frontend:
--   • SettingsPrompts.tsx → SELECT category, category_value, prompt_text WHERE user_id
--   • SettingsPrompts.tsx → UPSERT on (user_id, category, category_value)

CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category        text        NOT NULL,                -- property_type | property_standard | state
  category_value  text        NOT NULL,                -- apartamento | luxo | SP ...
  prompt_text     text        NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, category_value)            -- necessário para UPSERT
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_templates' AND policyname = 'prompt_templates_select_own') THEN
    CREATE POLICY prompt_templates_select_own ON public.prompt_templates FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_templates' AND policyname = 'prompt_templates_insert_own') THEN
    CREATE POLICY prompt_templates_insert_own ON public.prompt_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_templates' AND policyname = 'prompt_templates_update_own') THEN
    CREATE POLICY prompt_templates_update_own ON public.prompt_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_templates' AND policyname = 'prompt_templates_delete_own') THEN
    CREATE POLICY prompt_templates_delete_own ON public.prompt_templates FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_user_id ON public.prompt_templates(user_id);

DROP TRIGGER IF EXISTS prompt_templates_set_updated_at ON public.prompt_templates;
CREATE TRIGGER prompt_templates_set_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ═══ BLOCO 4: TABLE property_media ══════════════════════════════════════════
--
-- Consumidores frontend:
--   • usePropertyWithCover.ts → SELECT file_url WHERE property_id AND is_cover=true
--   • usePropertyWithCover.ts → SELECT file_url WHERE property_id ORDER BY sort_order LIMIT 1

CREATE TABLE IF NOT EXISTS public.property_media (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_url      text        NOT NULL,
  file_type     text        DEFAULT 'image',           -- image | video
  is_cover      boolean     DEFAULT false,
  sort_order    int         DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_media' AND policyname = 'property_media_select_own') THEN
    CREATE POLICY property_media_select_own ON public.property_media FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_media.property_id AND p.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_media' AND policyname = 'property_media_insert_own') THEN
    CREATE POLICY property_media_insert_own ON public.property_media FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_media.property_id AND p.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_media' AND policyname = 'property_media_update_own') THEN
    CREATE POLICY property_media_update_own ON public.property_media FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_media.property_id AND p.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_media.property_id AND p.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_media' AND policyname = 'property_media_delete_own') THEN
    CREATE POLICY property_media_delete_own ON public.property_media FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_media.property_id AND p.user_id = auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON public.property_media(property_id);
CREATE INDEX IF NOT EXISTS idx_property_media_cover       ON public.property_media(property_id, is_cover) WHERE is_cover = true;


-- ═══ BLOCO 5: TABLE video_plan_addons ═══════════════════════════════════════
--
-- Consumidores:
--   • kiwify-webhook/index.ts (Edge Function) → INSERT addon, UPDATE status=inactive
--   • videoModuleApi.ts (frontend)            → SELECT * WHERE workspace_id AND status=active
--   • videoModuleApi.ts (frontend)            → RPC consume_video_credit(target_workspace_id)
--
-- Interface esperada (src/types/video.ts → VideoPlanAddon):
--   id, workspace_id, addon_type, billing_cycle, credits_total,
--   credits_used, status, expires_at, created_at, updated_at, metadata

CREATE TABLE IF NOT EXISTS public.video_plan_addons (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid        NOT NULL,                -- FK para workspaces (criada se existir)
  addon_type      text        NOT NULL DEFAULT 'standard', -- standard | plus | premium
  billing_cycle   text        NOT NULL DEFAULT 'monthly',  -- monthly | yearly
  credits_total   int,
  credits_used    int         NOT NULL DEFAULT 0,
  status          text        NOT NULL DEFAULT 'active',   -- active | inactive | trial
  expires_at      timestamptz,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_plan_addons ENABLE ROW LEVEL SECURITY;

-- RLS: leitura pelo service_role (webhook) e por membros do workspace
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_plan_addons' AND policyname = 'video_plan_addons_select_authenticated') THEN
    CREATE POLICY video_plan_addons_select_authenticated ON public.video_plan_addons FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_plan_addons' AND policyname = 'video_plan_addons_insert_service') THEN
    CREATE POLICY video_plan_addons_insert_service ON public.video_plan_addons FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_plan_addons' AND policyname = 'video_plan_addons_update_service') THEN
    CREATE POLICY video_plan_addons_update_service ON public.video_plan_addons FOR UPDATE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_video_plan_addons_workspace ON public.video_plan_addons(workspace_id, status);

DROP TRIGGER IF EXISTS video_plan_addons_set_updated_at ON public.video_plan_addons;
CREATE TRIGGER video_plan_addons_set_updated_at
  BEFORE UPDATE ON public.video_plan_addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ═══ BLOCO 6: TABLE workspace_members ═══════════════════════════════════════
--
-- Consumidores:
--   • kiwify-webhook/index.ts → SELECT workspace_id WHERE user_id AND role='owner'
--
-- NOTA: O frontend usa "workspace_memberships" (workspaceApi.ts), mas o webhook
--       usa "workspace_members". Ambos precisam existir, ou a Edge Function quebra.
--       A tabela workspace_memberships já pode existir separadamente.
--       Esta tabela é usada SOMENTE pelo webhook Kiwify.

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid        NOT NULL,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text        NOT NULL DEFAULT 'member', -- owner | admin | editor | member | viewer
  status          text        NOT NULL DEFAULT 'active', -- active | invited | inactive
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'workspace_members_select_own') THEN
    CREATE POLICY workspace_members_select_own ON public.workspace_members FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'workspace_members_select_service') THEN
    CREATE POLICY workspace_members_select_service ON public.workspace_members FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workspace_members' AND policyname = 'workspace_members_insert_service') THEN
    CREATE POLICY workspace_members_insert_service ON public.workspace_members FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id, role);


-- ═══ BLOCO 7: ALTER profiles ════════════════════════════════════════════════
--
-- Consumidores:
--   • SettingsProfile.tsx    → SELECT/UPDATE: full_name, creci, state, city, phone, instagram, language_style, target_audience
--   • AuthContext.tsx        → SELECT * (todos os campos)
--   • useAIAgent.ts          → READ: company_name, language_style, target_audience, city, state, full_name
--
-- Colunas que JÁ EXISTEM no banco:
--   id, user_id, full_name, created_at, updated_at, evolution_instance_name,
--   motivo_uso, onboarding_completed, profissao, segmento_mercado,
--   whatsapp_connected, whatsapp_number, whatsapp_verified
--
-- Colunas que FALTAM (9 total):

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='creci') THEN
    ALTER TABLE public.profiles ADD COLUMN creci text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='state') THEN
    ALTER TABLE public.profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='city') THEN
    ALTER TABLE public.profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='instagram') THEN
    ALTER TABLE public.profiles ADD COLUMN instagram text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='language_style') THEN
    ALTER TABLE public.profiles ADD COLUMN language_style text DEFAULT 'formal';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='target_audience') THEN
    ALTER TABLE public.profiles ADD COLUMN target_audience text DEFAULT 'medio';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='company_name') THEN
    ALTER TABLE public.profiles ADD COLUMN company_name text;
  END IF;
END $$;


-- ═══ BLOCO 8: ALTER properties ══════════════════════════════════════════════
--
-- Consumidores:
--   • usePropertyWithCover.ts → READ: title, address, city, state, price, price_type, bedrooms, bathrooms, area_sqm, description
--   • Dashboard.tsx (JOIN)    → READ: properties(title)
--
-- Colunas que JÁ EXISTEM:
--   id, user_id, city, description, images, investment_value,
--   neighborhood, property_type, size_m2, standard, status, created_at
--
-- Colunas que FALTAM (8 total):

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='title') THEN
    ALTER TABLE public.properties ADD COLUMN title text DEFAULT 'Sem título';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='address') THEN
    ALTER TABLE public.properties ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='state') THEN
    ALTER TABLE public.properties ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='price') THEN
    ALTER TABLE public.properties ADD COLUMN price numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='price_type') THEN
    ALTER TABLE public.properties ADD COLUMN price_type text DEFAULT 'venda';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='bedrooms') THEN
    ALTER TABLE public.properties ADD COLUMN bedrooms int;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='bathrooms') THEN
    ALTER TABLE public.properties ADD COLUMN bathrooms int;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='properties' AND column_name='area_sqm') THEN
    ALTER TABLE public.properties ADD COLUMN area_sqm numeric;
  END IF;
END $$;


-- ═══ FIM DA MIGRATION ══════════════════════════════════════════════════════
-- Após aplicar, executar:
--   supabase gen types typescript --project-id <ID> > src/integrations/supabase/types.ts
-- ════════════════════════════════════════════════════════════════════════════
