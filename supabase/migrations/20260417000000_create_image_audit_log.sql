-- =====================================================
-- TAREFA 4 — Migration: Create image_audit_log table
-- =====================================================
--
-- Propósito: Ledger append-only para rastrear todas as operações
-- de image-restoration (antes: virtual-staging)
--
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE image_audit_log
-- =====================================================

CREATE TABLE IF NOT EXISTS public.image_audit_log (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Identification
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Operation Metadata
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'upload',
    'process_started',
    'process_completed',
    'process_failed',
    'result_retrieved',
    'credit_consumed',
    'error_logged',
    'retry_attempt',
    'timeout'
  )),

  -- Image Reference
  image_id UUID UNIQUE,
  original_file_name TEXT,
  file_size_bytes INTEGER,
  file_mime_type TEXT,

  -- Processing Details
  processing_status TEXT CHECK (processing_status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'timeout',
    'cancelled'
  )),

  -- Result Tracking
  result_url TEXT,
  processing_duration_ms INTEGER,
  output_file_size_bytes INTEGER,

  -- Error Handling
  error_code TEXT,
  error_message TEXT,
  error_details JSONB,

  -- Billing & Credits
  credits_allocated INTEGER,
  credits_consumed INTEGER,
  plan_slug TEXT,

  -- Quality Metrics (reservado para Go-Live Fase 2)
  psnr_score NUMERIC(5, 2),
  ssim_score NUMERIC(5, 4),
  quality_notes TEXT,

  -- Request Context
  request_ip_hash TEXT,
  user_agent_hash TEXT,
  api_key_hash TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB,

  -- Constraints
  CONSTRAINT valid_credits CHECK (
    (credits_allocated >= 0) AND
    (credits_consumed >= 0) AND
    (credits_consumed <= credits_allocated)
  )
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX idx_image_audit_log_workspace_id
  ON public.image_audit_log(workspace_id);

CREATE INDEX idx_image_audit_log_user_id
  ON public.image_audit_log(user_id);

CREATE INDEX idx_image_audit_log_created_at
  ON public.image_audit_log(created_at DESC);

CREATE INDEX idx_image_audit_log_operation_type
  ON public.image_audit_log(operation_type);

CREATE INDEX idx_image_audit_log_processing_status
  ON public.image_audit_log(processing_status);

CREATE INDEX idx_image_audit_log_image_id
  ON public.image_audit_log(image_id)
  WHERE image_id IS NOT NULL;

CREATE INDEX idx_image_audit_log_workspace_created
  ON public.image_audit_log(workspace_id, created_at DESC);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

ALTER TABLE public.image_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY image_audit_log_select_own_workspace ON public.image_audit_log
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY image_audit_log_insert_service_role ON public.image_audit_log
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
  );

CREATE POLICY image_audit_log_update_service_role ON public.image_audit_log
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.role() = 'service_role'
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_image_restoration_operation(
  p_workspace_id UUID,
  p_user_id UUID,
  p_operation_type TEXT,
  p_image_id UUID DEFAULT NULL,
  p_processing_status TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_credits_allocated INTEGER DEFAULT 0,
  p_credits_consumed INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  INSERT INTO public.image_audit_log (
    workspace_id,
    user_id,
    operation_type,
    image_id,
    processing_status,
    error_code,
    error_message,
    credits_allocated,
    credits_consumed,
    metadata,
    created_at
  ) VALUES (
    p_workspace_id,
    p_user_id,
    p_operation_type,
    p_image_id,
    p_processing_status,
    p_error_code,
    p_error_message,
    p_credits_allocated,
    p_credits_consumed,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_image_restoration_result(
  p_log_id BIGINT,
  p_processing_status TEXT,
  p_result_url TEXT DEFAULT NULL,
  p_processing_duration_ms INTEGER DEFAULT NULL,
  p_output_file_size_bytes INTEGER DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_psnr_score NUMERIC DEFAULT NULL,
  p_ssim_score NUMERIC DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.image_audit_log
  SET
    processing_status = p_processing_status,
    result_url = COALESCE(p_result_url, result_url),
    processing_duration_ms = COALESCE(p_processing_duration_ms, processing_duration_ms),
    output_file_size_bytes = COALESCE(p_output_file_size_bytes, output_file_size_bytes),
    error_code = COALESCE(p_error_code, error_code),
    error_message = COALESCE(p_error_message, error_message),
    psnr_score = COALESCE(p_psnr_score, psnr_score),
    ssim_score = COALESCE(p_ssim_score, ssim_score),
    completed_at = CASE
      WHEN p_processing_status IN ('completed', 'failed', 'timeout') THEN NOW()
      ELSE completed_at
    END
  WHERE id = p_log_id;
END;
$$;

-- =====================================================
-- 5. PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.log_image_restoration_operation TO service_role;
GRANT EXECUTE ON FUNCTION public.update_image_restoration_result TO service_role;
GRANT SELECT ON public.image_audit_log TO authenticated;

-- =====================================================
-- 6. TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE public.image_audit_log
  IS 'Append-only audit log para operações de image restoration. Rastreia uploads, processamento, créditos consumidos e erros.';

COMMENT ON COLUMN public.image_audit_log.operation_type
  IS 'Tipo de operação: upload, process_started, process_completed, process_failed, etc.';

COMMENT ON COLUMN public.image_audit_log.processing_status
  IS 'Status do processamento: pending, processing, completed, failed, timeout, cancelled';

COMMENT ON COLUMN public.image_audit_log.psnr_score
  IS 'Peak Signal-to-Noise Ratio — qualidade da restauração (dB). Reservado para Go-Live Fase 2.';

COMMENT ON COLUMN public.image_audit_log.ssim_score
  IS 'Structural Similarity Index — similaridade visual vs. original (0-1). Reservado para Go-Live Fase 2.';
