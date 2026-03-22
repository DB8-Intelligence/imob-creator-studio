import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mapeia formato para tamanho DALL-E 3
const FORMAT_TO_SIZE: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
  quadrado: "1024x1024",
  feed: "1024x1024",
  stories: "1024x1792",
  paisagem: "1792x1024",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      prompt_base,
      titulo,
      subtitulo,
      cta,
      canal,
      tipo,
      formatos,
      quantidade,
    } = await req.json();

    if (!prompt_base || !titulo) {
      return new Response(JSON.stringify({ error: "prompt_base and titulo are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair user do JWT
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const anonClient = createClient(supabaseUrl, anonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await anonClient.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    const canalLabel = canal === "instagram" ? "Instagram" : "Facebook";
    const tipoLabel = tipo === "post" ? "post profissional" : "anúncio publicitário";
    const formato = Array.isArray(formatos) ? formatos[0] : "quadrado";
    const size = FORMAT_TO_SIZE[formato] ?? "1024x1024";
    const n = quantidade === 5 ? 2 : 1; // DALL-E 3 suporta máx 1 por chamada; geramos em loop

    // Monta prompt final combinando template + textos do usuário
    const finalPrompt = `${prompt_base}

Social media ${tipoLabel} for ${canalLabel}.
Main headline text: "${titulo}"
${subtitulo ? `Subtitle text: "${subtitulo}"` : ""}
${cta ? `Call to action button: "${cta}"` : ""}

Brazilian real estate market style. Professional marketing design. High quality, Instagram-ready visual composition. Do not include any real people faces. Text should be clearly readable.`;

    console.log("Generating creative with DALL-E 3:", { formato, size, n, canal, tipo });

    // Gera imagens (1 de cada vez para DALL-E 3)
    const urls: string[] = [];
    const totalImages = quantidade === 5 ? 3 : 1;

    for (let i = 0; i < totalImages; i++) {
      const dalleResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: finalPrompt,
          n: 1,
          size,
          quality: "hd",
          response_format: "b64_json",
        }),
      });

      if (!dalleResponse.ok) {
        const err = await dalleResponse.text();
        console.error("DALL-E error:", dalleResponse.status, err);
        if (dalleResponse.status === 429) throw new Error("Limite de requisições DALL-E. Tente novamente.");
        throw new Error(`DALL-E API error: ${dalleResponse.status}`);
      }

      const dalleData = await dalleResponse.json();
      const b64 = dalleData.data?.[0]?.b64_json;
      if (!b64) throw new Error("DALL-E did not return image data");

      // Upload para Supabase Storage
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let j = 0; j < binaryStr.length; j++) {
        bytes[j] = binaryStr.charCodeAt(j);
      }

      const fileName = `criativo-${Date.now()}-${i}.png`;
      const filePath = `criativos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("creatives")
        .upload(filePath, bytes, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(filePath);
      urls.push(urlData.publicUrl);

      // Salva na tabela creatives
      if (userId) {
        await supabase.from("creatives").insert({
          user_id: userId,
          name: `${tipoLabel} - ${titulo.substring(0, 50)}`,
          format: formato,
          exported_url: urlData.publicUrl,
          status: "draft",
          content_data: { titulo, subtitulo, cta, canal, tipo, template_prompt: prompt_base },
        });
      }
    }

    // Debita créditos server-side (1 crédito por criativo gerado)
    if (userId) {
      const creditAmount = urls.length; // cada imagem = 1 crédito
      const { error: creditError } = await supabase.rpc("consume_credits", {
        p_user_id: userId,
        p_amount: creditAmount,
      });
      if (creditError) {
        // Log mas não bloqueia — imagens já foram geradas
        console.error("Erro ao debitar créditos:", creditError.message);
      } else {
        console.log(`${creditAmount} crédito(s) debitado(s) para usuário ${userId}`);
      }
    }

    console.log("Criativos gerados:", urls.length);

    return new Response(
      JSON.stringify({ success: true, urls }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("gerar-criativo error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
