import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Image Restoration — Restauração e Mobilização de Ambientes com IA
 *
 * Recebe uma foto de ambiente (vazio ou mobiliado) e gera uma versão
 * decorada no estilo solicitado usando Gemini 2.5 Flash (image generation).
 *
 * Estilos suportados:
 *  - corporativo, escandinavo, luxo, moderno, minimalista, industrial, classico
 *
 * Tipos de ambiente:
 *  - residencial, comercial
 */

type StagingStyle =
  | "corporativo"
  | "escandinavo"
  | "luxo"
  | "moderno"
  | "minimalista"
  | "industrial"
  | "classico";

type EnvironmentType = "residencial" | "comercial";

const STYLE_PROMPTS: Record<StagingStyle, string> = {
  corporativo:
    "Corporate office style: add a professional desk, ergonomic chair, bookshelves with books, subtle wall art, and warm balanced lighting. Neutral tones with dark wood accents.",
  escandinavo:
    "Scandinavian style: add light wood furniture, a comfortable linen sofa, green plants, soft cushions, and minimal decorative objects. White walls, natural light, airy and clean aesthetic.",
  luxo:
    "Luxury high-end style: add elegant velvet furniture, a crystal chandelier, gold-accented decorative pieces, designer rug, and premium curtains. Rich textures, marble accents, warm ambient lighting.",
  moderno:
    "Modern contemporary style: add sleek furniture with clean lines, neutral-colored sofa, abstract art on walls, geometric decor, and recessed lighting. Minimalist yet cozy atmosphere.",
  minimalista:
    "Minimalist style: add only essential furniture — a simple sofa, a low coffee table, one statement plant. Very clean, lots of white space, zen-like calm atmosphere.",
  industrial:
    "Industrial loft style: add leather sofa, exposed metal shelving, vintage Edison bulb lighting, concrete and brick textures, reclaimed wood table. Raw, urban, creative atmosphere.",
  classico:
    "Classic traditional style: add upholstered armchairs, ornate wooden furniture, Persian rug, classic paintings on walls, table lamps with fabric shades. Elegant, timeless, warm atmosphere.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Audit log tracking — variáveis no escopo externo para acesso no catch
  let logId: number | null = null;
  let auditWorkspaceId: string | null = null;
  let auditUserId: string | null = null;
  const startTime = Date.now();

  try {
    const {
      imageBase64,
      imageUrl,
      style,
      environmentType,
      workspaceId,
      propertyId,
      customPrompt,
    } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageBase64 ou imageUrl é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user from JWT
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const anonClient = createClient(supabaseUrl, anonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await anonClient.auth.getUser(token);
      userId = userData?.user?.id ?? null;
    }

    // Guardar IDs no escopo externo para acesso no catch
    auditWorkspaceId = workspaceId || null;
    auditUserId = userId;

    const selectedStyle: StagingStyle = style || "moderno";
    const envType: EnvironmentType = environmentType || "residencial";
    const stylePrompt = STYLE_PROMPTS[selectedStyle] || STYLE_PROMPTS.moderno;

    // ─── PONTO 1: Log upload (após validação) ───
    if (auditWorkspaceId && auditUserId) {
      try {
        const { data: uploadLogId } = await supabase.rpc('log_image_restoration_operation', {
          p_workspace_id: auditWorkspaceId,
          p_user_id: auditUserId,
          p_operation_type: 'upload',
          p_processing_status: 'pending',
          p_credits_allocated: 3, // CREDIT_COSTS.image_restoration
          p_metadata: { style: selectedStyle, environment_type: envType, property_id: propertyId || null },
        });
        logId = uploadLogId;
        console.log(`✅ Upload logged: logId=${logId}`);
      } catch (logError) {
        console.error('⚠️  Upload logging failed (non-critical):', logError);
      }
    }

    // Build the full prompt
    const prompt = `You are a professional interior designer and virtual staging expert.

Transform this empty ${envType === "comercial" ? "commercial" : "residential"} room into a beautifully furnished and decorated space.

${stylePrompt}

CRITICAL RULES:
- Keep the exact same room architecture: walls, windows, doors, floor must remain unchanged
- Maintain the original lighting direction and quality
- Furniture must respect correct perspective, scale, and shadows
- The result must look like a real photograph, photorealistic quality
- Do NOT add people or pets
- Do NOT change the wall color or floor material
${customPrompt ? `\nAdditional instructions: ${customPrompt}` : ""}

Output a single high-quality photorealistic image of the furnished room.`;

    // Prepare image content for Gemini
    let imageContent: Record<string, unknown>;
    if (imageBase64) {
      // Detect mime type from base64 prefix or default to jpeg
      let mimeType = "image/jpeg";
      if (imageBase64.startsWith("data:")) {
        const match = imageBase64.match(/^data:(image\/\w+);base64,/);
        if (match) mimeType = match[1];
      }
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      imageContent = { inlineData: { mimeType, data: rawBase64 } };
    } else {
      imageContent = { fileData: { fileUri: imageUrl, mimeType: "image/jpeg" } };
    }


    // ─── PONTO 2: Log process_started (antes de chamar Gemini) ───
    if (auditWorkspaceId && auditUserId) {
      try {
        await supabase.rpc('log_image_restoration_operation', {
          p_workspace_id: auditWorkspaceId,
          p_user_id: auditUserId,
          p_operation_type: 'process_started',
          p_processing_status: 'processing',
          p_metadata: { processing_engine: 'gemini-2.0-flash-exp', style: selectedStyle },
        });
        console.log(`⏳ Processing started`);
      } catch (logError) {
        console.error('⚠️  process_started logging failed (non-critical):', logError);
      }
    }

    // Call Gemini 2.0 Flash Experimental for image generation/editing
    // gemini-2.0-flash-exp is the model that supports responseModalities: ["IMAGE"]
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                imageContent,
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);

      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract generated image from response
    const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
    let generatedImageBase64: string | null = null;
    let generatedMimeType = "image/png";

    for (const part of parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        generatedMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!generatedImageBase64) {
      console.error("No image in Gemini response:", JSON.stringify(geminiData).substring(0, 500));
      throw new Error("Gemini não retornou uma imagem. Tente novamente com outra foto.");
    }

    // Upload to Supabase Storage
    const binaryStr = atob(generatedImageBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const ext = generatedMimeType.includes("png") ? "png" : "jpg";
    const fileName = `staging-${selectedStyle}-${Date.now()}.${ext}`;
    const storagePath = `image-restoration/${workspaceId || "global"}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("creatives")
      .upload(storagePath, bytes, {
        contentType: generatedMimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    const processingDurationMs = Date.now() - startTime;

    // ─── PONTO 3: Log sucesso + créditos consumidos ───
    if (auditWorkspaceId && auditUserId && logId) {
      try {
        await supabase.rpc('update_image_restoration_result', {
          p_log_id: logId,
          p_processing_status: 'completed',
          p_result_url: publicUrl,
          p_processing_duration_ms: processingDurationMs,
          p_output_file_size_bytes: bytes.length,
        });
        console.log(`✅ Processing completed in ${processingDurationMs}ms: ${publicUrl}`);
      } catch (logError) {
        console.error('⚠️  Result logging failed (non-critical):', logError);
      }

      // ─── PONTO 3b: Log créditos consumidos ───
      try {
        await supabase.rpc('log_image_restoration_operation', {
          p_workspace_id: auditWorkspaceId,
          p_user_id: auditUserId,
          p_operation_type: 'credit_consumed',
          p_credits_allocated: 3,
          p_credits_consumed: 3,
          p_metadata: { style: selectedStyle, duration_ms: processingDurationMs },
        });
      } catch (logError) {
        console.error('⚠️  Credit logging failed (non-critical):', logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        stagedImageUrl: publicUrl,
        style: selectedStyle,
        environmentType: envType,
        fileName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorCode = (error as Record<string, unknown>)?.code as string || 'UNKNOWN_ERROR';
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ image-restoration error: ${errorCode} - ${errorMessage}`);

    // ─── PONTO 4: Log erro no audit log ───
    if (auditWorkspaceId && auditUserId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseForLog = createClient(supabaseUrl, supabaseServiceKey);

        // Atualizar log existente com status de erro
        if (logId) {
          await supabaseForLog.rpc('update_image_restoration_result', {
            p_log_id: logId,
            p_processing_status: 'failed',
            p_processing_duration_ms: Date.now() - startTime,
            p_error_code: errorCode,
            p_error_message: errorMessage,
          });
        }

        // Log evento de erro separado
        await supabaseForLog.rpc('log_image_restoration_operation', {
          p_workspace_id: auditWorkspaceId,
          p_user_id: auditUserId,
          p_operation_type: 'error_logged',
          p_processing_status: 'failed',
          p_error_code: errorCode,
          p_error_message: errorMessage,
          p_metadata: {
            error_stack: error instanceof Error ? error.stack : null,
            duration_ms: Date.now() - startTime,
          },
        });
      } catch (logError) {
        console.error('⚠️  Error logging failed (non-critical):', logError);
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage, error_code: errorCode }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
