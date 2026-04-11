import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ success: false, message: "Não autorizado" }, 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return json({ success: false, message: "Não autorizado" }, 401);

    const { site_id } = await req.json();
    if (!site_id) return json({ success: false, message: "site_id obrigatório" }, 400);

    const { data: site, error: siteErr } = await supabase
      .from("corretor_sites")
      .select("id, dominio_customizado, cname_token, user_id")
      .eq("id", site_id)
      .eq("user_id", user.id)
      .single();

    if (siteErr || !site) return json({ success: false, message: "Site não encontrado" }, 404);
    if (!site.dominio_customizado) return json({ success: false, message: "Nenhum domínio configurado" }, 400);

    const domain = site.dominio_customizado.replace(/^(https?:\/\/)?(www\.)?/, "");

    // Resolve DNS via Google DNS API
    let cnameTarget = "";
    try {
      const dnsRes = await fetch(`https://dns.google/resolve?name=www.${domain}&type=CNAME`);
      const dnsData = await dnsRes.json();
      if (dnsData.Answer) {
        cnameTarget = dnsData.Answer.find((a: any) => a.type === 5)?.data?.replace(/\.$/, "") || "";
      }
    } catch {
      cnameTarget = "";
    }

    const isVerified = cnameTarget === "sites.nexoimobai.com.br";

    if (isVerified) {
      await supabase.from("corretor_sites").update({
        dominio_verificado: true,
        dominio_verificado_at: new Date().toISOString(),
      }).eq("id", site_id);

      await supabase.from("dominio_verificacoes").insert({
        site_id,
        dominio: domain,
        status: "verificado",
        detalhes: { cname_target: cnameTarget },
      });

      return json({ success: true, message: "Domínio verificado com sucesso!" });
    }

    await supabase.from("dominio_verificacoes").insert({
      site_id,
      dominio: domain,
      status: "falhou",
      detalhes: { cname_target: cnameTarget || "não encontrado" },
    });

    return json({
      success: false,
      message: "CNAME não encontrado. Aguarde até 48h para propagação DNS.",
      cname_found: cnameTarget || null,
    });
  } catch (err) {
    console.error("verify-domain error:", err);
    return json({ success: false, message: "Erro interno" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
