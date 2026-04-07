/**
 * explainability.ts — API routes para Trust, Explanation & Audit Surfaces
 *
 * Routes:
 *   GET /api/explainability/decision/:id     — explicação de uma decisão
 *   GET /api/explainability/job/:id          — explicação de um job/pipeline
 *   GET /api/explainability/reference/:type/:id — explicação por referência genérica
 *   GET /api/audit/campaign/:id              — audit surface de campanha
 *   GET /api/audit/publication/:id           — audit surface de publicação
 *   GET /api/audit/narratives/:explanationId — narrativas por audience
 *   GET /api/trust/tenant/:id               — trust overview de um tenant
 *   GET /api/trust/high-risk/:tenantId      — sinais de alto risco
 *   GET /api/explainability/list             — listar explicações com filtros
 */

import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase";

export async function explainabilityRoutes(app: FastifyInstance) {

  // ─── GET /api/explainability/reference/:type/:id ───────────────────────────

  app.get<{ Params: { type: string; id: string } }>(
    "/api/explainability/reference/:type/:id",
    async (req, reply) => {
      const { type, id } = req.params;

      const { data, error } = await supabase
        .from("bookagent_explanations")
        .select("*")
        .eq("reference_id", id)
        .eq("reference_type", type)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return reply.status(404).send({ error: "Explicacao nao encontrada" });
      }

      return reply.send(data);
    }
  );

  // ─── GET /api/explainability/decision/:id ──────────────────────────────────

  app.get<{ Params: { id: string } }>(
    "/api/explainability/decision/:id",
    async (req, reply) => {
      const { data, error } = await supabase
        .from("bookagent_explanations")
        .select("*")
        .eq("reference_id", req.params.id)
        .eq("domain", "decision")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return reply.status(404).send({ error: "Decisao nao encontrada" });
      }

      return reply.send({
        explanation: data,
        decision: data.decision_data,
        trust: data.trust_signal,
      });
    }
  );

  // ─── GET /api/explainability/job/:id ───────────────────────────────────────

  app.get<{ Params: { id: string } }>(
    "/api/explainability/job/:id",
    async (req, reply) => {
      const { data, error } = await supabase
        .from("bookagent_explanations")
        .select("*")
        .eq("reference_id", req.params.id)
        .in("domain", ["execution", "decision", "policy"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return reply.status(404).send({ error: "Nenhuma explicacao para este job" });
      }

      return reply.send({
        jobId: req.params.id,
        explanations: data,
        primaryExecution: data.find((d) => d.domain === "execution") ?? null,
        decisions: data.filter((d) => d.domain === "decision"),
        policies: data.filter((d) => d.domain === "policy"),
      });
    }
  );

  // ─── GET /api/audit/campaign/:id ───────────────────────────────────────────

  app.get<{ Params: { id: string }; Querystring: { audience?: string } }>(
    "/api/audit/campaign/:id",
    async (req, reply) => {
      const audience = (req.query.audience ?? "admin") as string;

      const { data: explanation } = await supabase
        .from("bookagent_explanations")
        .select("*")
        .eq("reference_id", req.params.id)
        .eq("reference_type", "campaign")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!explanation) {
        return reply.status(404).send({ error: "Audit de campanha nao encontrado" });
      }

      const { data: narratives } = await supabase
        .from("bookagent_audit_narratives")
        .select("*")
        .eq("explanation_id", explanation.id)
        .eq("audience", audience);

      return reply.send({
        explanation,
        narratives: narratives ?? [],
      });
    }
  );

  // ─── GET /api/audit/publication/:id ────────────────────────────────────────

  app.get<{ Params: { id: string }; Querystring: { audience?: string } }>(
    "/api/audit/publication/:id",
    async (req, reply) => {
      const audience = (req.query.audience ?? "admin") as string;

      const { data: explanation } = await supabase
        .from("bookagent_explanations")
        .select("*")
        .eq("reference_id", req.params.id)
        .eq("reference_type", "publication")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!explanation) {
        return reply.status(404).send({ error: "Audit de publicacao nao encontrado" });
      }

      const { data: narratives } = await supabase
        .from("bookagent_audit_narratives")
        .select("*")
        .eq("explanation_id", explanation.id)
        .eq("audience", audience);

      return reply.send({
        explanation,
        narratives: narratives ?? [],
      });
    }
  );

  // ─── GET /api/audit/narratives/:explanationId ──────────────────────────────

  app.get<{ Params: { explanationId: string }; Querystring: { audience?: string } }>(
    "/api/audit/narratives/:explanationId",
    async (req, reply) => {
      let query = supabase
        .from("bookagent_audit_narratives")
        .select("*")
        .eq("explanation_id", req.params.explanationId)
        .order("created_at", { ascending: true });

      if (req.query.audience) {
        query = query.eq("audience", req.query.audience);
      }

      const { data, error } = await query;
      if (error) return reply.status(500).send({ error: error.message });

      return reply.send(data ?? []);
    }
  );

  // ─── GET /api/trust/tenant/:id ─────────────────────────────────────────────

  app.get<{ Params: { id: string } }>(
    "/api/trust/tenant/:id",
    async (req, reply) => {
      const tenantId = req.params.id;

      // Risk breakdown
      const { data: signals } = await supabase
        .from("bookagent_trust_signals")
        .select("risk_level, governance_status, human_review_needed, confidence_score")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!signals) return reply.send({ tenantId, totalSignals: 0 });

      const riskBreakdown: Record<string, number> = { none: 0, low: 0, medium: 0, high: 0, critical: 0 };
      const govBreakdown: Record<string, number> = { compliant: 0, warning: 0, violation: 0 };
      let humanReviewPending = 0;
      let avgConfidence = 0;

      for (const s of signals) {
        const rl = s.risk_level as string;
        const gs = s.governance_status as string;
        if (rl in riskBreakdown) riskBreakdown[rl]++;
        if (gs in govBreakdown) govBreakdown[gs]++;
        if (s.human_review_needed) humanReviewPending++;
        avgConfidence += s.confidence_score;
      }

      avgConfidence = signals.length > 0 ? Math.round((avgConfidence / signals.length) * 100) / 100 : 0;

      return reply.send({
        tenantId,
        totalSignals: signals.length,
        avgConfidence,
        riskBreakdown,
        governanceBreakdown: govBreakdown,
        humanReviewPending,
      });
    }
  );

  // ─── GET /api/trust/high-risk/:tenantId ────────────────────────────────────

  app.get<{ Params: { tenantId: string }; Querystring: { limit?: string } }>(
    "/api/trust/high-risk/:tenantId",
    async (req, reply) => {
      const limit = parseInt(req.query.limit ?? "20", 10);

      const { data, error } = await supabase
        .from("bookagent_trust_signals")
        .select("reference_id, reference_type, risk_level, risk_score, confidence_score, governance_status, human_review_needed, factors, created_at")
        .eq("tenant_id", req.params.tenantId)
        .in("risk_level", ["critical", "high", "medium"])
        .order("risk_score", { ascending: false })
        .limit(limit);

      if (error) return reply.status(500).send({ error: error.message });

      return reply.send(data ?? []);
    }
  );

  // ─── GET /api/explainability/list ──────────────────────────────────────────

  app.get<{ Querystring: { tenant_id: string; domain?: string; limit?: string; offset?: string } }>(
    "/api/explainability/list",
    async (req, reply) => {
      const { tenant_id, domain, limit: limitStr, offset: offsetStr } = req.query;
      if (!tenant_id) return reply.status(400).send({ error: "tenant_id obrigatorio" });

      const limit = parseInt(limitStr ?? "20", 10);
      const offset = parseInt(offsetStr ?? "0", 10);

      let query = supabase
        .from("bookagent_explanations")
        .select("id, tenant_id, domain, reference_id, reference_type, summary, trust_signal, created_at")
        .eq("tenant_id", tenant_id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (domain) query = query.eq("domain", domain);

      const { data, error } = await query;
      if (error) return reply.status(500).send({ error: error.message });

      return reply.send(data ?? []);
    }
  );
}
