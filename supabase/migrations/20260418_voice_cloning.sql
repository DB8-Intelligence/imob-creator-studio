-- ============================================================
-- 20260418_voice_cloning.sql — Sprint 3: Voz clonada (Plus)
--
-- Schema do módulo de Voice Cloning via ElevenLabs:
-- • voice_clones        → 1 clone por user; guarda elevenlabs_voice_id
-- • voice_usage_log     → auditoria de cada TTS enviado
-- • user_whatsapp_instances.voice_mode → texto | voz | ambos
-- • Storage bucket `voice-samples` (privado) para amostras originais
--
-- Gate: plan_slug = 'pro' em module_id='whatsapp' (Secretária Virtual Plus)
-- RLS: owner-only; service_role ignora.
-- ============================================================

-- 1. Tabela de clones (um ativo por user)
CREATE TABLE IF NOT EXISTS public.voice_clones (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  elevenlabs_voice_id   text NOT NULL,
  display_name          text NOT NULL DEFAULT 'Minha voz',
  sample_storage_path   text,                                -- voice-samples/<user_id>/<id>.m4a
  preview_url           text,                                -- URL assinada do áudio de preview gerado
  status                text NOT NULL DEFAULT 'ready'
                        CHECK (status IN ('ready','failed','archived')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, elevenlabs_voice_id)
);

CREATE INDEX IF NOT EXISTS voice_clones_user_status_idx
  ON public.voice_clones (user_id, status);

-- Um único clone ativo por user (status = 'ready')
CREATE UNIQUE INDEX IF NOT EXISTS voice_clones_one_active_per_user
  ON public.voice_clones (user_id) WHERE status = 'ready';

-- 2. Log de uso (TTS + envio)
CREATE TABLE IF NOT EXISTS public.voice_usage_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_clone_id  uuid REFERENCES public.voice_clones(id) ON DELETE SET NULL,
  phone           text NOT NULL,
  char_count      integer NOT NULL,
  outcome         text NOT NULL
                  CHECK (outcome IN ('sent','failed','skipped')),
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_usage_log_user_created_idx
  ON public.voice_usage_log (user_id, created_at DESC);

-- 3. Coluna de modo de resposta na instância
ALTER TABLE public.user_whatsapp_instances
  ADD COLUMN IF NOT EXISTS voice_mode text NOT NULL DEFAULT 'texto'
  CHECK (voice_mode IN ('texto','voz','auto'));

COMMENT ON COLUMN public.user_whatsapp_instances.voice_mode IS
  'texto = só texto (default); voz = sempre áudio clonado; auto = espelha o lead (áudio quando lead manda áudio, curtas e saudações em voz)';

-- 4. RLS
ALTER TABLE public.voice_clones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_usage_log  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS voice_clones_self     ON public.voice_clones;
DROP POLICY IF EXISTS voice_usage_log_self  ON public.voice_usage_log;

CREATE POLICY voice_clones_self ON public.voice_clones
  FOR ALL TO authenticated
  USING      (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY voice_usage_log_self ON public.voice_usage_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 5. Trigger de updated_at
CREATE OR REPLACE FUNCTION public.set_voice_clones_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS voice_clones_set_updated_at ON public.voice_clones;
CREATE TRIGGER voice_clones_set_updated_at
  BEFORE UPDATE ON public.voice_clones
  FOR EACH ROW EXECUTE FUNCTION public.set_voice_clones_updated_at();

-- 6. Storage bucket privado para amostras
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-samples', 'voice-samples', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "voice-samples owner read"   ON storage.objects;
DROP POLICY IF EXISTS "voice-samples owner write"  ON storage.objects;
DROP POLICY IF EXISTS "voice-samples owner delete" ON storage.objects;

CREATE POLICY "voice-samples owner read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "voice-samples owner write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "voice-samples owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-samples'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
