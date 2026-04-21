-- ===========================================================
-- Landing Pages geradas pelo corretor a partir do cadastro de imóvel
--
-- Regras de negócio:
-- - max 5 LPs HTML ativas por usuário (tempo indeterminado enquanto ativas)
-- - max 5 LPs PDF por usuário (auto-expiram em 5 dias)
-- - rota pública: /imovel/:slug
-- - cada LP pertence a 1 imóvel (site_imoveis) e pode ser recriada
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imovel_id UUID NOT NULL REFERENCES public.site_imoveis(id) ON DELETE CASCADE,

  -- escolha do corretor
  template TEXT NOT NULL CHECK (template IN ('ambar','linho','salvia','noir','lar','solene')),
  slug TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('html','pdf')),

  -- customizações opcionais (fallback: puxa do imóvel)
  headline TEXT,
  subheadline TEXT,
  descricao_custom TEXT,
  fotos_selecionadas TEXT[] DEFAULT '{}',
  amenities_custom TEXT[] DEFAULT '{}',

  -- estado
  ativo BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ,             -- NULL para HTML; +5 dias para PDF
  pdf_url TEXT,                        -- preenchido quando tipo = 'pdf'

  -- analytics simples
  views_count INTEGER DEFAULT 0 NOT NULL,
  leads_count INTEGER DEFAULT 0 NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ------- Indexes -------
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug_active
  ON public.landing_pages(slug)
  WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_landing_pages_user_id
  ON public.landing_pages(user_id);

CREATE INDEX IF NOT EXISTS idx_landing_pages_imovel_id
  ON public.landing_pages(imovel_id);

-- ------- Quota trigger (5 HTML ativas + 5 PDFs não expirados) -------
CREATE OR REPLACE FUNCTION public.check_landing_pages_quota()
RETURNS TRIGGER AS $$
DECLARE
  html_count INTEGER;
  pdf_count INTEGER;
BEGIN
  -- HTML: conta ativas (menos a própria em update)
  IF NEW.tipo = 'html' AND NEW.ativo = true THEN
    SELECT COUNT(*) INTO html_count
      FROM public.landing_pages
      WHERE user_id = NEW.user_id
        AND tipo = 'html'
        AND ativo = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF html_count >= 5 THEN
      RAISE EXCEPTION 'Limite de 5 landing pages HTML ativas atingido. Desative uma antes de criar outra.'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- PDF: conta não expiradas (menos a própria em update)
  IF NEW.tipo = 'pdf' AND NEW.expires_at IS NOT NULL AND NEW.expires_at > NOW() THEN
    SELECT COUNT(*) INTO pdf_count
      FROM public.landing_pages
      WHERE user_id = NEW.user_id
        AND tipo = 'pdf'
        AND expires_at > NOW()
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF pdf_count >= 5 THEN
      RAISE EXCEPTION 'Limite de 5 PDFs guardados atingido. Aguarde expirar ou remova um antes.'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_landing_pages_quota ON public.landing_pages;
CREATE TRIGGER enforce_landing_pages_quota
  BEFORE INSERT OR UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.check_landing_pages_quota();

-- ------- updated_at -------
DROP TRIGGER IF EXISTS update_landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------- RLS -------
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Corretor (dono) faz CRUD total da sua LP
DROP POLICY IF EXISTS "user_manages_own_landing_pages" ON public.landing_pages;
CREATE POLICY "user_manages_own_landing_pages"
  ON public.landing_pages
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Qualquer visitante (anon) pode ler LP ativa e não expirada (página pública)
DROP POLICY IF EXISTS "public_read_active_landing_pages" ON public.landing_pages;
CREATE POLICY "public_read_active_landing_pages"
  ON public.landing_pages
  FOR SELECT
  USING (
    ativo = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Service role (edge functions, admin) total
DROP POLICY IF EXISTS "service_role_landing_pages" ON public.landing_pages;
CREATE POLICY "service_role_landing_pages"
  ON public.landing_pages
  FOR ALL
  USING (auth.role() = 'service_role');

-- ------- Comment -------
COMMENT ON TABLE public.landing_pages IS
  'Landing pages que o corretor gera a partir de um imóvel. Máximo 5 HTML ativas + 5 PDFs não expirados por usuário.';
