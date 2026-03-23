-- ============================================================
-- iMobCreatorAI — Logomarca do workspace como watermark
-- Aplicada em TODAS as imagens geradas/processadas:
--   • 1-2 imagens com geração IA (prompt de melhoria)
--   • demais imagens: apenas upscale + logo sobreposta
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Campos de logomarca na tabela workspaces
--    (configuração centralizada por conta de corretor)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.workspaces
  -- URL da logomarca armazenada no bucket 'logos'
  ADD COLUMN IF NOT EXISTS logo_url              TEXT,

  -- Versão secundária: logo escura para fundos claros (opcional)
  ADD COLUMN IF NOT EXISTS logo_dark_url         TEXT,

  -- Versão secundária: logo clara/branca para fundos escuros (opcional)
  ADD COLUMN IF NOT EXISTS logo_light_url        TEXT,

  -- Posição do watermark na imagem
  ADD COLUMN IF NOT EXISTS logo_position         TEXT NOT NULL DEFAULT 'bottom_right'
    CONSTRAINT chk_logo_position CHECK (logo_position IN (
      'top_left', 'top_right',
      'bottom_left', 'bottom_right',
      'center'
    )),

  -- Tamanho relativo ao lado menor da imagem (%)
  ADD COLUMN IF NOT EXISTS logo_size_pct         SMALLINT NOT NULL DEFAULT 12
    CONSTRAINT chk_logo_size CHECK (logo_size_pct BETWEEN 5 AND 35),

  -- Opacidade do watermark (0.0 = invisível, 1.0 = sólido)
  ADD COLUMN IF NOT EXISTS logo_opacity          NUMERIC(3,2) NOT NULL DEFAULT 0.90
    CONSTRAINT chk_logo_opacity CHECK (logo_opacity BETWEEN 0.10 AND 1.00),

  -- Margem interna em pixels (distância das bordas)
  ADD COLUMN IF NOT EXISTS logo_margin_px        SMALLINT NOT NULL DEFAULT 20
    CONSTRAINT chk_logo_margin CHECK (logo_margin_px BETWEEN 0 AND 80),

  -- Aplicar watermark em imagens upscale (não apenas nas geradas por IA)
  ADD COLUMN IF NOT EXISTS logo_apply_on_upscale BOOLEAN NOT NULL DEFAULT true,

  -- Aplicar watermark nas imagens geradas por prompt IA
  ADD COLUMN IF NOT EXISTS logo_apply_on_ai_gen  BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.workspaces.logo_url IS
  'URL pública da logomarca principal. Armazenada no bucket logos/{workspace_id}/logo.*
   Formatos aceitos: PNG com transparência (preferido), SVG, WEBP.
   Será inserida como watermark em TODAS as imagens do pipeline.';

COMMENT ON COLUMN public.workspaces.logo_dark_url IS
  'Variação escura da logo para fundos claros. Se nula, usa logo_url.';

COMMENT ON COLUMN public.workspaces.logo_light_url IS
  'Variação clara/branca da logo para fundos escuros. Se nula, usa logo_url.';

COMMENT ON COLUMN public.workspaces.logo_position IS
  'Posição do watermark: top_left | top_right | bottom_left | bottom_right | center';

COMMENT ON COLUMN public.workspaces.logo_size_pct IS
  'Tamanho da logo em % do lado menor da imagem. Ex: 12 = 12% de largura/altura.';

COMMENT ON COLUMN public.workspaces.logo_opacity IS
  'Opacidade do watermark. 0.90 = levemente transparente (padrão).';

COMMENT ON COLUMN public.workspaces.logo_margin_px IS
  'Distância da logo até as bordas da imagem (pixels). Padrão: 20px.';

COMMENT ON COLUMN public.workspaces.logo_apply_on_upscale IS
  'Se TRUE: logo aplicada nas 10 imagens processadas somente com upscale.
   Pipeline: imagem recebida → upscale IA → logo sobreposta.';

COMMENT ON COLUMN public.workspaces.logo_apply_on_ai_gen IS
  'Se TRUE: logo aplicada nas 1-2 imagens geradas via prompt IA (criativo completo).
   Pipeline: imagem selecionada → geração IA com prompt de melhoria → logo sobreposta.';

-- ─────────────────────────────────────────────────────────────
-- 2. Snapshot da logo aplicada em cada submissão
--    (auditoria: saber exatamente qual versão foi usada)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.partner_submissions
  ADD COLUMN IF NOT EXISTS applied_logo_url      TEXT,
  ADD COLUMN IF NOT EXISTS applied_logo_config   JSONB DEFAULT '{}'::JSONB;

COMMENT ON COLUMN public.partner_submissions.applied_logo_url IS
  'Snapshot da URL da logo no momento do processamento. Garante que versões
   futuras da logo não alterem imagens já publicadas.';

COMMENT ON COLUMN public.partner_submissions.applied_logo_config IS
  'Snapshot das configurações de logo usadas na geração (para auditoria e reprocessamento).
   Estrutura:
   {
     "position":    "bottom_right",
     "size_pct":    12,
     "opacity":     0.90,
     "margin_px":   20,
     "on_upscale":  true,
     "on_ai_gen":   true,
     "applied_at":  "2026-03-23T12:30:00Z"
   }';

-- ─────────────────────────────────────────────────────────────
-- 3. Storage bucket para logomarcas
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,                           -- público para leitura (imagens são servidas diretamente)
  2097152,                        -- 2 MB por arquivo
  ARRAY[
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────
-- 4. Políticas de acesso ao bucket logos
-- ─────────────────────────────────────────────────────────────

-- Qualquer um pode visualizar logos (necessário para as imagens publicadas)
CREATE POLICY "logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Membro do workspace pode fazer upload (caminho: logos/{workspace_id}/*)
CREATE POLICY "logos_workspace_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT wm.workspace_id::TEXT
      FROM public.workspace_memberships wm
      WHERE wm.user_id = auth.uid()
        AND wm.status = 'active'
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Membro owner/admin pode atualizar a logo
CREATE POLICY "logos_workspace_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT wm.workspace_id::TEXT
      FROM public.workspace_memberships wm
      WHERE wm.user_id = auth.uid()
        AND wm.status = 'active'
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Membro owner/admin pode excluir a logo
CREATE POLICY "logos_workspace_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT wm.workspace_id::TEXT
      FROM public.workspace_memberships wm
      WHERE wm.user_id = auth.uid()
        AND wm.status = 'active'
        AND wm.role IN ('owner', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. Função helper: retorna configuração completa de logo
--    Usada pelo n8n e Edge Functions no momento do processamento
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_workspace_logo_config(p_workspace_id UUID)
RETURNS JSON LANGUAGE sql SECURITY DEFINER AS $$
  SELECT json_build_object(
    'logo_url',            w.logo_url,
    'logo_dark_url',       w.logo_dark_url,
    'logo_light_url',      w.logo_light_url,
    'position',            w.logo_position,
    'size_pct',            w.logo_size_pct,
    'opacity',             w.logo_opacity,
    'margin_px',           w.logo_margin_px,
    'apply_on_upscale',    w.logo_apply_on_upscale,
    'apply_on_ai_gen',     w.logo_apply_on_ai_gen,
    'has_logo',            (w.logo_url IS NOT NULL)
  )
  FROM public.workspaces w
  WHERE w.id = p_workspace_id;
$$;

COMMENT ON FUNCTION public.get_workspace_logo_config IS
  'Retorna JSON com todas as configurações de logomarca do workspace.
   Chamada pelo n8n antes de iniciar o upscale/geração para saber:
   - URL da logo a sobrepor
   - Posição, tamanho e opacidade
   - Se deve aplicar em upscale e/ou imagens IA
   Uso: SELECT get_workspace_logo_config(''uuid-do-workspace'')';
