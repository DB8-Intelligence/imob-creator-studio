/**
 * generate-dispatch — Supabase Edge Function
 *
 * Ponto de entrada unificado do pipeline de geração do ImobCreator AI.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  FLUXO ASSÍNCRONO (callback_mode: "async")  [padrão]                    │
 * │                                                                          │
 * │  Frontend ──POST──▶ generate-dispatch                                   │
 * │                          │                                               │
 * │                          ├─ cria generation_jobs (status: pending)       │
 * │                          ├─ dispara webhook n8n Router                  │
 * │                          └─▶ retorna { job_id, status: "pending" }       │
 * │                                                                          │
 * │  n8n Router ──processa──▶ generation-callback                           │
 * │                          │                                               │
 * │                          ├─ atualiza generation_jobs (done/error)        │
 * │                          └─ insere generated_assets                      │
 * │                                                                          │
 * │  Frontend ◀── Supabase Realtime subscription (generation_jobs)          │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  FLUXO SÍNCRONO (callback_mode: "sync")                                 │
 * │                                                                          │
 * │  Frontend ──POST──▶ generate-dispatch                                   │
 * │                          │                                               │
 * │                          ├─ cria generation_jobs (status: pending)       │
 * │                          ├─ chama edge function diretamente (≤30s)       │
 * │                          ├─ atualiza job (done/error)                    │
 * │                          ├─ insere generated_assets                      │
 * │                          └─▶ retorna GenerationResponse completo         │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Roteamento por generation_type:
 *   gerar_post / gerar_story / gerar_banner / sketch_render / empty_lot
 *     → gerar-criativo  (DALL-E 3)
 *
 *   gerar_arte_premium / generate_art / upscale
 *     → generate-art  (Gemini 2.0 Flash)
 *
 *   virtual_staging
 *     → virtual-staging  (Gemini 2.0 Flash)
 *
 *   image_to_video
 *     → image-to-video  (Veo)
 *
 *   video_compose
 *     → compose-video
 *
 *   gerar_descricao
 *     → generate-caption  (GPT-4o)
 */
import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const N8N_GENERATION_WEBHOOK =
  "https://automacao.db8intelligence.com.br/webhook/imobcreator-generate";

/** Mapa generation_type → edge function para modo sync */
const TYPE_TO_FUNCTION: Record<string, string> = {
  gerar_post:         "gerar-criativo",
  gerar_story:        "gerar-criativo",
  gerar_banner:       "gerar-criativo",
  gerar_arte_premium: "generate-art",
  generate_art:       "generate-art",
  upscale:            "generate-art",
  virtual_staging:    "virtual-staging",
  sketch_render:      "gerar-criativo",
  empty_lot:          "gerar-criativo",
  image_to_video:     "image-to-video",
  video_compose:      "compose-video",
  video_compose_v2:   "generate-video-v2",
  gerar_descricao:    "generate-caption",
};

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ error: "authorization required" }, 401);
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authError } = await anonClient.auth.getUser();
    if (authError || !userData.user) {
      return json({ error: "invalid token" }, 401);
    }
    const userId = userData.user.id;

    // ── Parse payload ─────────────────────────────────────────────────
    const body = await req.json();

    const {
      workspace_id,
      from_studio     = false,
      generation_type,
      engine_id,
      use_case_id,
      template_id,
      template_name,
      prompt_base,
      style,
      aspect_ratio,
      visual_style,
      editable_fields,
      image_urls,
      property_id,
      branding,
      callback_mode   = "async",
      callback_url,
      credit_cost     = 1,
    } = body;

    if (!generation_type) return json({ error: "generation_type is required" }, 400);
    if (!engine_id)        return json({ error: "engine_id is required" }, 400);

    // ── Criar job ─────────────────────────────────────────────────────
    const { data: job, error: jobError } = await serviceClient
      .from("generation_jobs")
      .insert({
        user_id:         userId,
        workspace_id:    workspace_id ?? null,
        from_studio,
        generation_type,
        engine_id,
        use_case_id:     use_case_id     ?? null,
        template_id:     template_id     ?? null,
        template_name:   template_name   ?? null,
        prompt_base:     prompt_base     ?? null,
        style:           style           ?? null,
        aspect_ratio:    aspect_ratio    ?? null,
        visual_style:    visual_style    ?? null,
        editable_fields: editable_fields ?? null,
        image_urls:      image_urls      ?? null,
        property_id:     property_id     ?? null,
        branding:        branding        ?? null,
        callback_mode,
        callback_url:    callback_url    ?? null,
        status:          "pending",
        credits_consumed: credit_cost,   // persiste custo esperado para generation-callback debitar
        request_payload: body,
      })
      .select("id")
      .single();

    if (jobError || !job) {
      console.error("Failed to create generation_job:", jobError);
      return json({ error: "failed to create job" }, 500);
    }

    const jobId = job.id;

    await logJob(serviceClient, jobId, "info", `Job criado — type: ${generation_type}, engine: ${engine_id}`);

    // ── Modo assíncrono → n8n ─────────────────────────────────────────
    if (callback_mode === "async") {
      const n8nPayload = {
        ...body,
        job_id:  jobId,
        user_id: userId,
        source:  "imobcreator-studio",
      };

      // Disparar para n8n sem await (fire-and-forget)
      fetch(N8N_GENERATION_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      }).catch((err) => {
        console.error("n8n webhook dispatch error:", err);
        // Atualiza job para erro se n8n não responder
        serviceClient
          .from("generation_jobs")
          .update({ status: "error", error_message: "n8n dispatch failed: " + err.message })
          .eq("id", jobId);
      });

      return json({
        job_id:          jobId,
        status:          "pending",
        generation_type,
        engine_id,
        template_id:     template_id ?? null,
      });
    }

    // ── Modo síncrono → chama edge function diretamente ──────────────
    await serviceClient
      .from("generation_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    await logJob(serviceClient, jobId, "info", "Modo sync — chamando edge function");

    const targetFunction = TYPE_TO_FUNCTION[generation_type];
    if (!targetFunction) {
      await failJob(serviceClient, jobId, `Nenhuma função mapeada para generation_type: ${generation_type}`);
      return json({ job_id: jobId, status: "error", error_message: "unsupported generation_type" }, 400);
    }

    // Monta payload compatível com a edge function alvo
    const functionPayload = buildFunctionPayload(generation_type, body, userId);

    const fnResponse = await supabase_invoke(
      supabaseUrl,
      authHeader,
      targetFunction,
      functionPayload
    );

    if (!fnResponse.ok) {
      const errText = await fnResponse.text();
      await failJob(serviceClient, jobId, `${targetFunction} error ${fnResponse.status}: ${errText}`);
      return json({ job_id: jobId, status: "error", error_message: errText }, 502);
    }

    const fnData = await fnResponse.json();

    // Extrai result_url do payload de retorno (varia por função)
    const resultUrl   = fnData.artUrl ?? fnData.stagedUrl ?? fnData.url ?? fnData.urls?.[0] ?? null;
    const resultUrls  = fnData.urls ?? (resultUrl ? [resultUrl] : []);

    // Atualiza job como concluído
    await serviceClient
      .from("generation_jobs")
      .update({
        status:           "done",
        result_url:       resultUrl,
        result_urls:      resultUrls.length > 0 ? resultUrls : null,
        metadata:         fnData,
        credits_consumed: credit_cost,
        completed_at:     new Date().toISOString(),
      })
      .eq("id", jobId);

    // Persiste assets individuais
    if (resultUrls.length > 0) {
      await serviceClient.from("generated_assets").insert(
        resultUrls.map((url: string) => ({
          job_id:          jobId,
          user_id:         userId,
          workspace_id:    workspace_id ?? null,
          asset_url:       url,
          asset_type:      "image",
          generation_type,
          engine_id,
          template_id:     template_id ?? null,
          property_id:     property_id ?? null,
        }))
      );
    }

    // Debita créditos
    await serviceClient.rpc("consume_credits", {
      p_user_id: userId,
      p_amount:  credit_cost,
    }).then(({ error }) => {
      if (error) 
    });

    await logJob(serviceClient, jobId, "info", `Concluído — ${resultUrls.length} asset(s) gerado(s)`);

    return json({
      job_id:          jobId,
      status:          "done",
      result_url:      resultUrl,
      result_urls:     resultUrls,
      template_id:     template_id ?? null,
      engine_id,
      generation_type,
      credits_consumed: credit_cost,
      metadata:        fnData,
    });

  } catch (err) {
    console.error("generate-dispatch unhandled error:", err);
    return json({ error: err.message ?? "internal server error" }, 500);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logJob(
  client: ReturnType<typeof createClient>,
  jobId: string,
  level: "info" | "warn" | "error" | "debug",
  message: string,
  details?: Record<string, unknown>
) {
  await client.from("generation_logs").insert({ job_id: jobId, level, message, details: details ?? null });
}

async function failJob(
  client: ReturnType<typeof createClient>,
  jobId: string,
  errorMessage: string
) {
  await client
    .from("generation_jobs")
    .update({ status: "error", error_message: errorMessage, completed_at: new Date().toISOString() })
    .eq("id", jobId);
  await logJob(client, jobId, "error", errorMessage);
}

/** Invoca uma Supabase Edge Function via fetch (para modo sync dentro de outra function) */
async function supabase_invoke(
  supabaseUrl: string,
  authHeader: string,
  functionName: string,
  payload: Record<string, unknown>
): Promise<Response> {
  return fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * buildFunctionPayload
 *
 * Adapta o GenerationRequest para o payload específico de cada edge function.
 * Mantém compatibilidade com os contratos legados das functions existentes.
 *
 * IMPORTANTE: skip_credits: true é sempre injetado.
 * - No modo sync: generate-dispatch executa consume_credits após a função retornar.
 * - No modo async: o n8n router injeta skip_credits antes de chamar a função,
 *   e o generation-callback é responsável pelo débito.
 * Em ambos os casos a função alvo NÃO deve debitar créditos diretamente.
 */
function buildFunctionPayload(
  generationType: string,
  req: Record<string, unknown>,
  userId: string
): Record<string, unknown> {
  const ef = req.editable_fields as Record<string, unknown> | undefined;

  switch (generationType) {
    case "gerar_post":
    case "gerar_story":
    case "gerar_banner":
    case "sketch_render":
    case "empty_lot":
      return {
        skip_credits: true,
        prompt_base:  req.prompt_base,
        titulo:       ef?.titulo    ?? "",
        subtitulo:    ef?.subtitulo ?? "",
        cta:          ef?.cta       ?? "",
        canal:        ef?.canal     ?? "instagram",
        tipo:         ef?.tipo      ?? "post",
        formatos:     [req.aspect_ratio ?? "quadrado"],
        quantidade:   ef?.quantidade ?? 1,
      };

    case "gerar_arte_premium":
    case "generate_art":
    case "upscale":
      return {
        skip_credits: true,
        imageUrl:     (req.image_urls as string[])?.[0] ?? "",
        title:        ef?.titulo ?? "",
        description:  ef?.conceito ?? ef?.subtitulo ?? "",
        format:       req.aspect_ratio ?? "feed",
        customPrompt: req.prompt_base,
        brandId:      (req.branding as Record<string, unknown>)?.brand_id ?? null,
        propertyId:   req.property_id ?? null,
        workspaceId:  req.workspace_id ?? null,
      };

    case "virtual_staging":
      return {
        skip_credits: true,
        imageUrl:     (req.image_urls as string[])?.[0] ?? "",
        stagingStyle: req.style ?? "moderno",
        roomType:     ef?.roomType ?? "living",
        customPrompt: req.prompt_base,
        workspaceId:  req.workspace_id ?? null,
      };

    case "image_to_video":
    case "video_compose":
      return {
        skip_credits: true,
        imageUrls:    req.image_urls,
        motionPreset: req.style ?? "smooth_pan",
        workspaceId:  req.workspace_id ?? null,
      };

    case "video_compose_v2":
      return {
        skip_credits:  true,
        workspace_id:  req.workspace_id ?? null,
        video_job_id:  (req as Record<string, unknown>).video_job_id ?? null,
        photo_urls:    req.image_urls,
        motion_preset: req.style ?? "default",
        aspect_ratio:  req.aspect_ratio ?? "9:16",
        resolution:    (req as Record<string, unknown>).resolution ?? "1080p",
        property:      (req as Record<string, unknown>).property ?? null,
        audio:         (req as Record<string, unknown>).audio ?? null,
        plan_tier:     (req as Record<string, unknown>).plan_tier ?? "standard",
      };

    case "gerar_descricao":
      return {
        skip_credits: true,
        titulo:       ef?.titulo ?? "",
        conceito:     ef?.conceito ?? req.prompt_base ?? "",
        canal:        ef?.canal ?? "instagram",
        workspaceId:  req.workspace_id ?? null,
      };

    default:
      return { skip_credits: true, ...req, user_id: userId };
  }
}
