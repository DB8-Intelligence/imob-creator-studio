-- =========================================================================
-- PART 97 — Trust, Explanation & Audit Surfaces
-- Tables: bookagent_explanations, bookagent_trust_signals, bookagent_audit_narratives
-- =========================================================================

-- ─── Explanations (registro principal de explicação) ─────────────────────────

CREATE TABLE IF NOT EXISTS bookagent_explanations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL,
  domain        text NOT NULL CHECK (domain IN (
    'decision', 'policy', 'campaign', 'publication',
    'execution', 'recovery', 'copilot', 'billing', 'override'
  )),
  reference_id  text NOT NULL,
  reference_type text NOT NULL,
  summary       text NOT NULL,
  trust_signal  jsonb NOT NULL DEFAULT '{}',
  decision_data jsonb,
  policy_data   jsonb,
  execution_data jsonb,
  traces        jsonb NOT NULL DEFAULT '[]',
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz
);

CREATE INDEX idx_explanations_tenant ON bookagent_explanations (tenant_id, created_at DESC);
CREATE INDEX idx_explanations_ref ON bookagent_explanations (reference_id, reference_type);
CREATE INDEX idx_explanations_domain ON bookagent_explanations (domain, created_at DESC);

-- ─── Trust Signals (snapshot de confiança por referência) ────────────────────

CREATE TABLE IF NOT EXISTS bookagent_trust_signals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           text NOT NULL,
  reference_id        text NOT NULL,
  reference_type      text NOT NULL,
  confidence_score    real NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  confidence_level    text NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low', 'unknown')),
  risk_score          real NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
  risk_level          text NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'none')),
  policy_compliant    boolean NOT NULL DEFAULT true,
  fallback_used       boolean NOT NULL DEFAULT false,
  recovery_triggered  boolean NOT NULL DEFAULT false,
  human_review_needed boolean NOT NULL DEFAULT false,
  governance_status   text NOT NULL DEFAULT 'compliant' CHECK (governance_status IN ('compliant', 'warning', 'violation')),
  factors             jsonb NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trust_tenant ON bookagent_trust_signals (tenant_id, created_at DESC);
CREATE INDEX idx_trust_ref ON bookagent_trust_signals (reference_id, reference_type);
CREATE INDEX idx_trust_risk ON bookagent_trust_signals (risk_level, created_at DESC);

-- ─── Audit Narratives (narrativas consumíveis por audience) ──────────────────

CREATE TABLE IF NOT EXISTS bookagent_audit_narratives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  explanation_id  uuid NOT NULL REFERENCES bookagent_explanations(id) ON DELETE CASCADE,
  audience        text NOT NULL CHECK (audience IN ('customer', 'admin', 'copilot', 'support')),
  title           text NOT NULL,
  narrative       text NOT NULL,
  highlights      jsonb NOT NULL DEFAULT '[]',
  severity        text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_narratives_explanation ON bookagent_audit_narratives (explanation_id);
CREATE INDEX idx_narratives_audience ON bookagent_audit_narratives (audience, created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE bookagent_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookagent_trust_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookagent_audit_narratives ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own tenant data
CREATE POLICY "Users read own explanations"
  ON bookagent_explanations FOR SELECT TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Users read own trust signals"
  ON bookagent_trust_signals FOR SELECT TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Users read own narratives"
  ON bookagent_audit_narratives FOR SELECT TO authenticated
  USING (explanation_id IN (
    SELECT id FROM bookagent_explanations WHERE tenant_id = auth.uid()::text
  ));

-- Service role can do everything (backend writes)
CREATE POLICY "Service writes explanations"
  ON bookagent_explanations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service writes trust signals"
  ON bookagent_trust_signals FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service writes narratives"
  ON bookagent_audit_narratives FOR ALL TO service_role
  USING (true) WITH CHECK (true);
