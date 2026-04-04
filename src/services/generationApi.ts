/**
 * generationApi.ts
 *
 * Serviço frontend para o pipeline de geração do ImobCreator AI.
 *
 * Responsabilidades:
 *  - Enviar GenerationRequest para generate-dispatch
 *  - Assinar atualizações de status via Supabase Realtime
 *  - Consultar jobs e assets
 *  - Cancelar jobs pendentes
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  GenerationRequest,
  GenerationResponse,
  GenerationStatus,
} from "@/lib/generation-contract";
import type { Database } from "@/integrations/supabase/types";

type GenerationJobRow = Database["public"]["Tables"]["generation_jobs"]["Row"];
type GeneratedAssetRow = Database["public"]["Tables"]["generated_assets"]["Row"];

// ─── Dispatch ────────────────────────────────────────────────────────────────

/**
 * dispatchGeneration
 *
 * Envia o payload para a edge function `generate-dispatch`.
 * Em modo "async" retorna imediatamente com job_id + status "pending".
 * Em modo "sync" aguarda o resultado (até ~30s).
 *
 * Use `subscribeToJob` para receber atualizações em tempo real (async).
 */
export async function dispatchGeneration(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const { data, error } = await supabase.functions.invoke<GenerationResponse>(
    "generate-dispatch",
    { body: request }
  );

  if (error) throw new Error(`generate-dispatch error: ${error.message}`);
  if (!data)  throw new Error("generate-dispatch returned no data");

  return data;
}

// ─── Realtime subscription ───────────────────────────────────────────────────

/**
 * subscribeToJob
 *
 * Assina via Supabase Realtime as atualizações do job.
 * O callback é chamado sempre que status, result_url ou error_message mudar.
 *
 * Retorna a função de unsubscribe — chame-a ao desmontar o componente.
 *
 * @example
 * const unsub = subscribeToJob(jobId, (job) => {
 *   if (job.status === "done") setResultUrl(job.result_url);
 *   if (job.status === "error") setError(job.error_message);
 * });
 * return () => unsub();
 */
export function subscribeToJob(
  jobId: string,
  onUpdate: (job: GenerationJobRow) => void
): () => void {
  const channel = supabase
    .channel(`generation_job_${jobId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "generation_jobs",
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        onUpdate(payload.new as GenerationJobRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Consultas ───────────────────────────────────────────────────────────────

/** Busca um job pelo ID. */
export async function getGenerationJob(
  jobId: string
): Promise<GenerationJobRow | null> {
  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    console.warn("[generationApi] getGenerationJob error:", error.message);
    return null;
  }
  return data;
}

/** Lista jobs recentes do usuário, com paginação simples. */
export async function listGenerationJobs(opts?: {
  limit?: number;
  offset?: number;
  status?: GenerationStatus;
  generation_type?: string;
}): Promise<GenerationJobRow[]> {
  let query = supabase
    .from("generation_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 20);

  if (opts?.offset)          query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);
  if (opts?.status)          query = query.eq("status", opts.status);
  if (opts?.generation_type) query = query.eq("generation_type", opts.generation_type);

  const { data, error } = await query;
  if (error) {
    console.warn("[generationApi] listGenerationJobs error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Busca os assets gerados por um job. */
export async function getJobAssets(
  jobId: string
): Promise<GeneratedAssetRow[]> {
  const { data, error } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[generationApi] getJobAssets error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Lista todos os assets do usuário (galeria). */
export async function listGeneratedAssets(opts?: {
  limit?: number;
  asset_type?: string;
  generation_type?: string;
}): Promise<GeneratedAssetRow[]> {
  let query = supabase
    .from("generated_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 50);

  if (opts?.asset_type)      query = query.eq("asset_type", opts.asset_type);
  if (opts?.generation_type) query = query.eq("generation_type", opts.generation_type);

  const { data, error } = await query;
  if (error) {
    console.warn("[generationApi] listGeneratedAssets error:", error.message);
    return [];
  }
  return data ?? [];
}

// ─── Upload de imagem de entrada ─────────────────────────────────────────────

/**
 * uploadGenerationInput
 *
 * Faz upload de um arquivo de imagem para o bucket `creatives` do Supabase
 * e retorna a URL pública. Usado para converter File/base64 local em URL
 * antes de chamar dispatchGeneration (que exige image_urls).
 *
 * @param file  File object (do input ou câmera)
 * @param prefix  Pasta de destino no bucket (padrão: "inputs")
 */
export async function uploadGenerationInput(
  file: File,
  prefix = "inputs"
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("creatives")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from("creatives").getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ─── Hook de polling (fallback) ──────────────────────────────────────────────

/**
 * pollJobUntilDone
 *
 * Fallback para quando Realtime não está disponível.
 * Faz polling a cada `intervalMs` até status "done" | "error" ou timeout.
 */
export async function pollJobUntilDone(
  jobId: string,
  opts?: { intervalMs?: number; timeoutMs?: number }
): Promise<GenerationJobRow | null> {
  const intervalMs = opts?.intervalMs ?? 2000;
  const timeoutMs  = opts?.timeoutMs  ?? 120_000;
  const deadline   = Date.now() + timeoutMs;

  return new Promise((resolve) => {
    const tick = async () => {
      if (Date.now() > deadline) {
        resolve(null);
        return;
      }

      const job = await getGenerationJob(jobId);
      if (!job) { resolve(null); return; }

      if (job.status === "done" || job.status === "error") {
        resolve(job);
        return;
      }

      setTimeout(tick, intervalMs);
    };

    tick();
  });
}
