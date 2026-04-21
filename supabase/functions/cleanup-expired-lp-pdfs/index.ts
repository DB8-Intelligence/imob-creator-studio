/**
 * cleanup-expired-lp-pdfs — Edge function diária.
 *
 * Remove do storage e da base os PDFs com `expires_at` < now().
 * Agendada via pg_cron (diária, 3h UTC).
 *
 * Segurança: verifica header `x-internal-secret` contra
 * vault `internal_webhook_secret`. Sem JWT pois é chamada pelo pg_cron.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Security: internal secret required
  const providedSecret = req.headers.get("x-internal-secret");
  if (INTERNAL_SECRET && providedSecret !== INTERNAL_SECRET) {
    return new Response(
      JSON.stringify({ error: "forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Busca PDFs expirados
    const { data: expired, error: findErr } = await supabase
      .from("landing_pages")
      .select("id, user_id, slug")
      .eq("tipo", "pdf")
      .lt("expires_at", new Date().toISOString());

    if (findErr) {
      console.error("find_expired_error", findErr);
      return jsonErr("find_failed", 500, { detail: findErr.message });
    }

    if (!expired || expired.length === 0) {
      return jsonOk({ deleted: 0, message: "nada expirado" });
    }

    // 2. Deleta arquivos do storage em batch
    const storagePaths = expired.map((lp) => `${lp.user_id}/${lp.slug}.pdf`);
    const { error: storageErr } = await supabase.storage
      .from("lp-pdfs")
      .remove(storagePaths);

    if (storageErr) {
      console.error("storage_delete_error", storageErr);
      // não aborta — seguem pra deletar os registros mesmo com erro de storage
    }

    // 3. Deleta registros da base
    const ids = expired.map((lp) => lp.id);
    const { error: deleteErr } = await supabase
      .from("landing_pages")
      .delete()
      .in("id", ids);

    if (deleteErr) {
      console.error("db_delete_error", deleteErr);
      return jsonErr("db_delete_failed", 500, { detail: deleteErr.message });
    }

    return jsonOk({
      deleted: expired.length,
      ids,
      storage_paths: storagePaths,
    });
  } catch (err) {
    console.error("unexpected_error", err);
    return jsonErr("internal_error", 500, {
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

function jsonOk(body: Record<string, unknown>) {
  return new Response(JSON.stringify({ success: true, ...body }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonErr(code: string, status: number, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ error: code, ...extra }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
