/**
 * generate-lp-pdf — Edge Function que gera PDF de uma landing page.
 *
 * Fluxo:
 *  1. Recebe { lp_id } no POST body (auth via service role).
 *  2. Busca a LP e valida que é tipo=pdf.
 *  3. Monta a URL pública (/imovel/:slug) e chama PDFShift.
 *  4. Upload do PDF para Storage bucket `lp-pdfs/{user_id}/{slug}.pdf`.
 *  5. Gera signed URL com validade 5 dias.
 *  6. Atualiza landing_pages.pdf_url.
 *
 * Secrets necessárias (Supabase → Project → Settings → Edge Functions):
 *   - PDFSHIFT_API_KEY (obter em pdfshift.io — free sandbox disponível)
 *   - PUBLIC_SITE_URL (ex: https://nexoimobai.com.br)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PDFSHIFT_API_KEY = Deno.env.get("PDFSHIFT_API_KEY") || "";
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://nexoimobai.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { lp_id } = await req.json();
    if (!lp_id) {
      return jsonErr("lp_id_required", 400);
    }

    // 1. fetch LP
    const { data: lp, error: lpErr } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", lp_id)
      .maybeSingle();

    if (lpErr || !lp) return jsonErr("lp_not_found", 404);
    if (lp.tipo !== "pdf") return jsonErr("lp_is_not_pdf", 400);

    const publicUrl = `${PUBLIC_SITE_URL}/imovel/${lp.slug}`;
    const storagePath = `${lp.user_id}/${lp.slug}.pdf`;

    // 2. Gera PDF via PDFShift
    if (!PDFSHIFT_API_KEY) {
      return jsonErr("pdf_provider_not_configured", 503, {
        hint: "Defina PDFSHIFT_API_KEY nas secrets do Supabase.",
        public_url: publicUrl,
      });
    }

    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: publicUrl,
        sandbox: PDFSHIFT_API_KEY.startsWith("sk_") ? false : true,
        format: "A4",
        landscape: false,
        margin: "10mm",
        use_print: false,
        delay: 2000, // aguarda 2s pra carregar fontes/imagens
      }),
    });

    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      console.error("pdfshift_error", pdfRes.status, errText);
      return jsonErr("pdf_generation_failed", 502, { detail: errText });
    }

    const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());

    // 3. Upload para storage
    const { error: uploadErr } = await supabase.storage
      .from("lp-pdfs")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      console.error("storage_upload_error", uploadErr);
      return jsonErr("storage_upload_failed", 500, { detail: uploadErr.message });
    }

    // 4. Gera signed URL com 5 dias
    const { data: signed, error: signedErr } = await supabase.storage
      .from("lp-pdfs")
      .createSignedUrl(storagePath, 5 * 24 * 60 * 60);

    if (signedErr || !signed) {
      console.error("signed_url_error", signedErr);
      return jsonErr("signed_url_failed", 500);
    }

    // 5. Atualiza landing_pages.pdf_url
    const { error: updateErr } = await supabase
      .from("landing_pages")
      .update({ pdf_url: signed.signedUrl })
      .eq("id", lp_id);

    if (updateErr) {
      console.error("update_lp_error", updateErr);
      return jsonErr("update_lp_failed", 500, { detail: updateErr.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: signed.signedUrl,
        expires_in_seconds: 5 * 24 * 60 * 60,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("unexpected_error", err);
    return jsonErr("internal_error", 500, {
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

function jsonErr(code: string, status: number, extra: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({ error: code, ...extra }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
