/**
 * generation-callback — Supabase Edge Function
 *
 * Endpoint chamado pelo n8n Router ao finalizar o processamento de um job.
 * Autenticado por service-key no header X-Service-Key.
 *
 * Responsabilidades:
 *  1. Atualizar generation_jobs (status, result_url, metadata)
 *  2. Inserir generated_assets
 *  3. Debitar créditos do usuário
 *  4. Registrar log de conclusão
 *
 * O Supabase Realtime notifica o frontend automaticamente via a publicação
 * habilitada na tabela generation_jobs (ALTER PUBLICATION supabase_realtime).
 *
 * Payload esperado (N8nGenerationCallback):
 * {
 *   job_id:            string
 *   status:            "done" | "error"
 *   result_url?:       string
 *   preview_url?:      string
 *   result_urls?:      string[]
 *   engine_id?:        string
 *   generation_type?:  string
 *   metadata?:         object
 *   error_message?:    string
 *   n8n_execution_id?: string
 * }
 */
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-service-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // ── Autenticação por service key ──────────────────────────────────
  const serviceKeyHeader = req.headers.get("x-service-key");
  const isServiceCall = serviceKeyHeader && serviceKeyHeader === supabaseServiceKey;

  if (!isServiceCall) {
    // Fallback: validate JWT properly
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }
    // Validate the JWT by attempting to get user
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { error: authErr } = await userClient.auth.getUser();
    if (authErr) {
      return json({ error: "invalid token" }, 401);
    }
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const {
      job_id,
      status,
      result_url,
      preview_url,
      result_urls,
      engine_id,
      generation_type,
      metadata,
      error_message,
      n8n_execution_id,
    } = await req.json();

    if (!job_id)  return json({ error: "job_id is required" }, 400);
    if (!status)  return json({ error: "status is required" }, 400);

    // ── Busca o job para obter user_id e workspace_id ────────────────
    const { data: job, error: fetchError } = await client
      .from("generation_jobs")
      .select("id, user_id, workspace_id, template_id, property_id, credits_consumed")
      .eq("id", job_id)
      .single();

    if (fetchError || !job) {
      return json({ error: "job not found", job_id }, 404);
    }

    const urls: string[] = result_urls ?? (result_url ? [result_url] : []);

    // ── Atualiza job ─────────────────────────────────────────────────
    const { error: updateError } = await client
      .from("generation_jobs")
      .update({
        status,
        result_url:       result_url   ?? null,
        preview_url:      preview_url  ?? null,
        result_urls:      urls.length > 0 ? urls : null,
        error_message:    error_message ?? null,
        n8n_execution_id: n8n_execution_id ?? null,
        metadata:         metadata ?? null,
        completed_at:     new Date().toISOString(),
      })
      .eq("id", job_id);

    if (updateError) {
      console.error("Failed to update job:", updateError.message);
      return json({ error: "update failed" }, 500);
    }

    // ── Persiste assets (apenas em caso de sucesso) ──────────────────
    if (status === "done" && urls.length > 0) {
      await client.from("generated_assets").insert(
        urls.map((url: string) => ({
          job_id,
          user_id:         job.user_id,
          workspace_id:    job.workspace_id ?? null,
          asset_url:       url,
          preview_url:     preview_url ?? null,
          asset_type:      "image",
          generation_type: generation_type ?? null,
          engine_id:       engine_id ?? null,
          template_id:     job.template_id ?? null,
          property_id:     job.property_id ?? null,
          metadata:        metadata ?? null,
        }))
      );

      // ── Debita créditos ────────────────────────────────────────────
      const creditCost = job.credits_consumed ?? 1;
      await client.rpc("consume_credits", {
        p_user_id: job.user_id,
        p_amount:  creditCost,
      }).then(({ error }) => {
        if (error) 
      });
    }

    // ── Automation log update ──────────────────────────────────────
    // Se este job foi disparado por uma automação, atualizar automation_logs
    const meta = (metadata ?? {}) as Record<string, unknown>;
    if (meta.automation && meta.automation_log_id) {
      const automationLogId = meta.automation_log_id as string;
      const automationStatus = status === "done" ? "success" : "error";

      // Buscar o primeiro asset gerado (se houver) para vincular
      let assetId: string | null = null;
      if (status === "done" && urls.length > 0) {
        const { data: assets } = await client
          .from("generated_assets")
          .select("id")
          .eq("job_id", job_id)
          .limit(1);
        assetId = assets?.[0]?.id ?? null;
      }

      const { error: automationLogErr } = await client
        .from("automation_logs")
        .update({
          status: automationStatus,
          asset_id: assetId,
          error: status === "error" ? (error_message ?? "unknown error") : null,
        })
        .eq("id", automationLogId);

      if (automationLogErr) {
      } else {
      }
    }

    // ── Notification ──────────────────────────────────────────────────
    await client.from("notifications").insert({
      user_id: job.user_id,
      type: status === "done" ? "generation_done" : "generation_error",
      title: status === "done" ? "Criativo gerado!" : "Erro na geração",
      message: status === "done"
        ? `Seu criativo foi gerado com sucesso. ${urls.length} arquivo(s) pronto(s).`
        : `Falha ao gerar criativo: ${error_message ?? "erro desconhecido"}`,
      link: status === "done" ? "/biblioteca" : null,
      metadata: { job_id, generation_type, urls_count: urls.length },
    }).then(({ error: notifErr }) => {
      if (notifErr) 
    });

    // ── Log ──────────────────────────────────────────────────────────
    await client.from("generation_logs").insert({
      job_id,
      level:   status === "done" ? "info" : "error",
      message: status === "done"
        ? `n8n callback: ${urls.length} asset(s) entregue(s)`
        : `n8n callback: falha — ${error_message ?? "unknown"}`,
      details: { n8n_execution_id, metadata },
    });


    return json({ ok: true, job_id, status, assets_created: urls.length });

  } catch (err) {
    console.error("generation-callback error:", err);
    return json({ error: err.message ?? "internal server error" }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
