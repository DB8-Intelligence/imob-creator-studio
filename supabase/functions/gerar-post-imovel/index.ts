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
    if (!authHeader) return json({ success: false, error: "Não autorizado" }, 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return json({ success: false, error: "Não autorizado" }, 401);

    const { imovel_id, formato, estilo, customizacoes } = await req.json();
    if (!imovel_id || !formato) return json({ success: false, error: "imovel_id e formato obrigatórios" }, 400);

    // ── PASSO 1: Buscar dados do imóvel ──
    const { data: imovel, error: imovelErr } = await supabase
      .from("site_imoveis")
      .select("*")
      .eq("id", imovel_id)
      .eq("user_id", user.id)
      .single();

    if (imovelErr || !imovel) return json({ success: false, error: "Imóvel não encontrado" }, 404);

    // Buscar dados do corretor
    const { data: corretor } = await supabase
      .from("corretor_sites")
      .select("nome_completo, whatsapp, logo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    // ── PASSO 2: Gerar legenda com Claude ──
    let legenda_gerada = "";
    let hashtags_geradas: string[] = [];
    let cta_gerado = "Fale comigo no WhatsApp!";

    try {
      const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (anthropicKey) {
        const precoFormatado = imovel.preco
          ? `R$ ${Number(imovel.preco).toLocaleString("pt-BR")}`
          : "Consulte";

        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 600,
            system: `Você é um especialista em marketing imobiliário brasileiro e copywriter de alta conversão para Instagram.
Crie legendas que geram CURIOSIDADE e DESEJO, com linguagem natural brasileira, emojis estratégicos e CTA claro.
FORMATO DE RESPOSTA (JSON puro, sem markdown):
{"legenda":"texto completo","hashtags":["#tag1","#tag2"],"cta":"texto do CTA"}`,
            messages: [{
              role: "user",
              content: `Crie legenda de Instagram para: ${imovel.titulo} - ${imovel.tipo} ${imovel.finalidade === "venda" ? "À Venda" : "Para Alugar"} - ${precoFormatado} - ${imovel.quartos || 0} quartos, ${imovel.banheiros || 0} banheiros, ${imovel.area_total || ""} m² - ${imovel.bairro}, ${imovel.cidade}/${imovel.estado} - Amenidades: ${(imovel.features || []).join(", ") || "não informadas"} - Estilo: ${estilo || "dark_premium"} - Formato: ${formato.includes("story") ? "Story" : "Post"}`
            }],
          }),
        });

        const claudeData = await anthropicRes.json();
        const textoIA = claudeData.content?.[0]?.text || "";

        try {
          const parsed = JSON.parse(textoIA);
          legenda_gerada = parsed.legenda || textoIA;
          hashtags_geradas = parsed.hashtags || [];
          cta_gerado = parsed.cta || "Fale comigo no WhatsApp!";
        } catch {
          legenda_gerada = textoIA;
        }
      }
    } catch (e) {
      console.error("Claude error:", e);
      legenda_gerada = `✨ ${imovel.titulo} - ${imovel.bairro}, ${imovel.cidade}. Fale comigo para mais informações!`;
    }

    // ── PASSO 3: Tentar render Shotstack (se disponível) ──
    let shotstack_render_id: string | null = null;
    let imagem_url: string | null = null;
    let postStatus = "done"; // default to done if no shotstack

    try {
      const shotstackRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/shotstack-render`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            action: "render",
            template: estilo === "litoral" ? "brisa" : (estilo || "dark_premium"),
            merge_fields: {
              foto_url: imovel.foto_capa || (imovel.fotos?.[0] || ""),
              logo_url: customizacoes?.logo_url || corretor?.logo_url || "",
              preco: imovel.preco ? `R$ ${Number(imovel.preco).toLocaleString("pt-BR")}` : "Consulte",
              endereco: `${imovel.bairro}, ${imovel.cidade}`,
              detalhes: [
                imovel.quartos > 0 ? `${imovel.quartos} quartos` : "",
                imovel.vagas > 0 ? `${imovel.vagas} vagas` : "",
                imovel.area_total ? `${imovel.area_total} m²` : "",
              ].filter(Boolean).join(" · "),
              cta: cta_gerado,
              cor_primaria: customizacoes?.cor_primaria || "#1E3A8A",
              cor_secundaria: customizacoes?.cor_secundaria || "#F59E0B",
            },
            output_size: formato.includes("story")
              ? { width: 1080, height: 1920 }
              : { width: 1080, height: 1080 },
          }),
        }
      );

      const shotstackData = await shotstackRes.json();
      if (shotstackData.response?.id) {
        shotstack_render_id = shotstackData.response.id;
        postStatus = "processing";
      }
    } catch (e) {
      console.error("Shotstack error (non-fatal):", e);
      // Continue without shotstack — post will be text-only
    }

    // ── PASSO 4: Salvar no banco ──
    const { data: postJob, error: insertErr } = await supabase
      .from("gerador_posts")
      .insert({
        user_id: user.id,
        imovel_id,
        formato,
        estilo: estilo || "dark_premium",
        legenda_gerada,
        hashtags_geradas,
        cta_gerado,
        shotstack_render_id,
        imagem_url,
        status: postStatus,
        logo_url: customizacoes?.logo_url || "",
        cor_primaria: customizacoes?.cor_primaria || "#1E3A8A",
        cor_secundaria: customizacoes?.cor_secundaria || "#F59E0B",
        cor_texto: customizacoes?.cor_texto || "#FFFFFF",
        fonte: customizacoes?.fonte || "Plus Jakarta Sans",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return json({ success: false, error: insertErr.message }, 500);
    }

    return json({
      success: true,
      post_id: postJob.id,
      shotstack_render_id,
      legenda_gerada,
      hashtags_geradas,
      cta_gerado,
      status: postStatus,
    });
  } catch (err) {
    console.error("gerar-post-imovel error:", err);
    return json({ success: false, error: (err as Error).message || "Erro interno" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
