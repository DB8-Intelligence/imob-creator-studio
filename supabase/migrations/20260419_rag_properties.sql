-- ============================================================
-- 20260419_rag_properties.sql — Módulo 4: RAG de Empreendimentos
--
-- Adiciona busca semântica nos imóveis via embeddings (OpenAI text-embedding-3-small).
-- A Secretária Virtual usa match_properties() para encontrar o top-K imóvel
-- mais relevante à pergunta do lead, em vez de passar top-15 mais recentes.
--
-- Componentes:
-- 1. Extensão pgvector
-- 2. Coluna embedding vector(1536) + índice HNSW em properties
-- 3. Função match_properties(workspace, query_embedding, top_k, threshold)
-- 4. Trigger dispatch_embed_property_event — fire-and-forget pg_net → edge function
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- 1. Coluna de embedding (1536 dims = text-embedding-3-small)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- Índice HNSW para similaridade coseno (mais rápido que ivfflat em QPS baixo)
CREATE INDEX IF NOT EXISTS properties_embedding_hnsw_idx
  ON public.properties
  USING hnsw (embedding extensions.vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 2. Função de busca semântica
CREATE OR REPLACE FUNCTION public.match_properties(
  p_workspace_id      uuid,
  p_query_embedding   extensions.vector(1536),
  p_match_count       int DEFAULT 5,
  p_match_threshold   float DEFAULT 0.3
)
RETURNS TABLE (
  id              uuid,
  reference       text,
  title           text,
  property_type   text,
  bedrooms        int,
  suites          int,
  parking         int,
  area_built      numeric,
  price           numeric,
  price_type      text,
  pretension      text,
  city            text,
  neighborhood    text,
  description     text,
  similarity      float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id, p.reference, p.title, p.property_type, p.bedrooms, p.suites, p.parking,
    p.area_built, p.price, p.price_type, p.pretension, p.city, p.neighborhood,
    p.description,
    1 - (p.embedding <=> p_query_embedding) AS similarity
  FROM public.properties p
  WHERE p.workspace_id = p_workspace_id
    AND p.embedding IS NOT NULL
    AND p.status <> 'archived'
    AND 1 - (p.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY p.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_properties TO service_role, authenticated;

-- 3. Trigger: dispara edge function embed-property quando propriedade
--    é criada ou atualizada em campos relevantes
CREATE OR REPLACE FUNCTION public.dispatch_embed_property_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supabase_url text;
  _secret       text;
  _text_changed boolean;
BEGIN
  -- No INSERT sempre dispara; no UPDATE só se texto relevante mudou
  IF TG_OP = 'UPDATE' THEN
    _text_changed :=
      COALESCE(OLD.title,       '') IS DISTINCT FROM COALESCE(NEW.title,       '') OR
      COALESCE(OLD.description, '') IS DISTINCT FROM COALESCE(NEW.description, '') OR
      COALESCE(OLD.property_type, '') IS DISTINCT FROM COALESCE(NEW.property_type, '') OR
      COALESCE(OLD.city,        '') IS DISTINCT FROM COALESCE(NEW.city,        '') OR
      COALESCE(OLD.neighborhood, '') IS DISTINCT FROM COALESCE(NEW.neighborhood, '') OR
      COALESCE(OLD.bedrooms,     0) IS DISTINCT FROM COALESCE(NEW.bedrooms,     0) OR
      COALESCE(OLD.suites,       0) IS DISTINCT FROM COALESCE(NEW.suites,       0) OR
      COALESCE(OLD.parking,      0) IS DISTINCT FROM COALESCE(NEW.parking,      0) OR
      COALESCE(OLD.area_built,   0) IS DISTINCT FROM COALESCE(NEW.area_built,   0) OR
      COALESCE(OLD.price,        0) IS DISTINCT FROM COALESCE(NEW.price,        0);
    IF NOT _text_changed THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Supabase URL fixo (project ImobCreatorAi)
  _supabase_url := 'https://spjnymdizezgmzwoskoj.supabase.co';

  -- Lê internal_webhook_secret do vault (se vault não tiver, aborta graciosamente)
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets
  WHERE name = 'internal_webhook_secret'
  LIMIT 1;

  IF _secret IS NULL THEN
    RAISE WARNING 'dispatch_embed_property_event: internal_webhook_secret não configurado no vault';
    RETURN NEW;
  END IF;

  -- Fire-and-forget — nunca bloqueia o write da propriedade
  PERFORM net.http_post(
    url     := _supabase_url || '/functions/v1/embed-property',
    body    := jsonb_build_object('property_id', NEW.id),
    headers := jsonb_build_object(
      'Content-Type',      'application/json',
      'x-internal-secret', _secret
    ),
    timeout_milliseconds := 2000
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'dispatch_embed_property_event failed: %', sqlerrm;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_properties_embed_dispatch ON public.properties;
CREATE TRIGGER trg_properties_embed_dispatch
  AFTER INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.dispatch_embed_property_event();
