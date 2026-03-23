/**
 * generate-strategy — Supabase Edge Function
 *
 * Recebe o briefing completo do corretor e chama o Claude API
 * para gerar uma estratégia de crescimento personalizada para
 * Instagram e Facebook.
 *
 * Entrada (POST JSON):
 *   { briefing: BriefingData }
 *
 * Saída:
 *   { strategy: string }  — texto rico com markdown
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticar usuário
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autenticação necessária" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
    const anonKey      = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const client = createClient(supabaseUrl, anonKey);
    const token  = authHeader.replace("Bearer ", "");
    const { data: { user } } = await client.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { briefing } = await req.json();

    // Montar prompt completo de estratégia
    const prompt = buildStrategyPrompt(briefing);

    // Chamar Claude API
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const anthropicData = await anthropicRes.json();
    const strategy = anthropicData.content?.[0]?.text ?? "";

    // Salvar estratégia no perfil do usuário
    const admin = createClient(supabaseUrl, serviceKey);
    await admin
      .from("profiles")
      .update({
        ai_strategy: strategy,
        ai_strategy_generated_at: new Date().toISOString(),
        briefing_completed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ strategy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-strategy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ─────────────────────────────────────────────────────────────
// Builder do prompt de estratégia
// ─────────────────────────────────────────────────────────────
function buildStrategyPrompt(b: Record<string, unknown>): string {
  const name          = b.full_name        ?? "Corretor";
  const company       = b.company_name     ?? "";
  const creci         = b.creci            ?? "";
  const city          = b.city             ?? "";
  const state         = b.state            ?? "";
  const neighborhoods = (b.neighborhoods as string[] | undefined)?.join(", ") ?? "";
  const propTypes     = (b.property_types_worked as string[] | undefined)?.join(", ") ?? "";
  const channels      = (b.marketing_channels as string[] | undefined)?.join(", ") ?? "";
  const bio           = b.bio_instagram    ?? "";
  const companyDesc   = b.company_description ?? "";
  const audience      = b.audience_profile ?? b.target_audience ?? "";
  const langStyle     = b.language_style   ?? "";
  const differentials = b.competitive_differentials ?? "";
  const goal          = b.growth_goal      ?? "";
  const frequency     = b.posting_frequency ?? "";

  return `
Você é um especialista em marketing imobiliário digital, com foco em crescimento orgânico no Instagram e Facebook para corretores de imóveis no Brasil.

Analise o perfil abaixo e crie uma ESTRATÉGIA COMPLETA E PERSONALIZADA de crescimento nas redes sociais.

## PERFIL DO CORRETOR

**Nome:** ${name}
**Empresa:** ${company}
**CRECI:** ${creci}
**Localização:** ${city}/${state}
**Bairros de atuação:** ${neighborhoods || "Não especificado"}
**Tipos de imóvel:** ${propTypes || "Não especificado"}
**Canais prioritários:** ${channels || "Instagram e Facebook"}
**Público-alvo:** ${audience || "Não especificado"}
**Tom de comunicação:** ${langStyle || "Formal"}
**Diferenciais competitivos:** ${differentials || "Não especificado"}
**Objetivo principal:** ${goal || "Crescimento e mais negócios"}
**Frequência desejada:** ${frequency || "Não especificada"}
**Bio do perfil:** ${bio || "Não informada"}
**Sobre a empresa:** ${companyDesc || "Não informado"}

---

## ENTREGUE UMA ESTRATÉGIA COMPLETA COM AS SEGUINTES SEÇÕES:

### 1. 🎯 Posicionamento de Marca
Defina como esse corretor deve se posicionar no Instagram/Facebook com base nos seus diferenciais, região e público. Seja específico para o mercado imobiliário local.

### 2. 📅 Calendário de Conteúdo
Recomende uma frequência ideal de postagens por semana e os melhores horários para publicar, considerando o público-alvo e a região de atuação.

### 3. 🏠 Tipos de Conteúdo Recomendados
Liste os 5 tipos de post mais eficazes para esse perfil, com exemplos práticos de como executar cada um (ex: tour de imóvel, dica de financiamento, bastidores, depoimento de cliente).

### 4. ✍️ Estratégia de Copy e CTA
Defina o tom de voz ideal, frases de abertura que captam atenção, e as chamadas para ação (CTA) mais eficazes para os tipos de imóvel trabalhados.

### 5. #️⃣ Estratégia de Hashtags
Sugira 3 conjuntos de hashtags específicos:
- Hashtags locais (bairros e cidade)
- Hashtags de nicho (tipo de imóvel e público)
- Hashtags de engajamento geral para o mercado imobiliário

### 6. 🚀 Plano de Crescimento em 90 Dias
Monte um plano trimestral com metas realistas de crescimento de seguidores, engajamento e geração de leads para esse perfil específico.

### 7. ⚡ Ações Prioritárias para Esta Semana
Liste as 3 ações mais importantes que o corretor deve fazer AGORA para começar a crescer rapidamente.

---

Seja específico, prático e focado no mercado imobiliário brasileiro. Use linguagem direta e motivadora. Formate a resposta com markdown para facilitar a leitura.
`.trim();
}
