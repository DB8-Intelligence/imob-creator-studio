/**
 * useAIAgent — hook for AI Agent content-generation job management.
 *
 * Lifecycle:
 *   1. createJob()    → inserts row in ai_agent_jobs, fires Workflow 1 webhook
 *   2. useJobPoller() → polls Supabase every 3s while job is active
 *   3. selectOption() → updates selected_option_id, fires Workflow 2 webhook
 *   4. Polling continues until status = 'completed' | 'failed'
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ── Constants ────────────────────────────────────────────────────────────────

const N8N_WORKFLOW_1_URL =
  "https://automacao.db8intelligence.com.br/webhook/ai-agent-pesquisa";
const N8N_WORKFLOW_2_URL =
  "https://automacao.db8intelligence.com.br/webhook/ai-agent-gerar-conteudo";

const POLL_INTERVAL_MS = 3_000;

// ── Types ────────────────────────────────────────────────────────────────────

export type AIAgentFormat = "post" | "carousel" | "reel";
export type AIAgentCanal = "instagram" | "facebook";
export type AIAgentStatus =
  | "queued"
  | "researching"
  | "awaiting_selection"
  | "generating"
  | "completed"
  | "failed";

export interface AIAgentOption {
  id: string;
  angle: "educacional" | "emocional" | "autoridade";
  headline: string;
  body: string;
  cta: string;
  research_sources: string[];
}

export interface AIAgentJob {
  id: string;
  user_id: string;
  topic: string;
  subtopic: string | null;
  format: AIAgentFormat;
  canal: AIAgentCanal;
  brand_snapshot: Record<string, unknown> | null;
  options: AIAgentOption[] | null;
  selected_option_id: string | null;
  output_url: string | null;
  output_type: string | null;
  output_metadata: Record<string, unknown> | null;
  phase: 1 | 2;
  status: AIAgentStatus;
  error_message: string | null;
  n8n_execution_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAIAgentJobInput {
  topic: string;
  subtopic?: string;
  format: AIAgentFormat;
  canal?: AIAgentCanal;
}

// ── Row mapper ───────────────────────────────────────────────────────────────

function mapJob(row: Record<string, unknown>): AIAgentJob {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    topic: row.topic as string,
    subtopic: (row.subtopic as string | null) ?? null,
    format: row.format as AIAgentFormat,
    canal: (row.canal as AIAgentCanal) ?? "instagram",
    brand_snapshot: (row.brand_snapshot as Record<string, unknown> | null) ?? null,
    options: (row.options as AIAgentOption[] | null) ?? null,
    selected_option_id: (row.selected_option_id as string | null) ?? null,
    output_url: (row.output_url as string | null) ?? null,
    output_type: (row.output_type as string | null) ?? null,
    output_metadata: (row.output_metadata as Record<string, unknown> | null) ?? null,
    phase: (row.phase as 1 | 2) ?? 1,
    status: row.status as AIAgentStatus,
    error_message: (row.error_message as string | null) ?? null,
    n8n_execution_id: (row.n8n_execution_id as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

async function fetchAIAgentJobs(userId: string): Promise<AIAgentJob[]> {
  const { data, error } = await supabase
    .from("ai_agent_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(mapJob);
}

async function fetchAIAgentJob(jobId: string): Promise<AIAgentJob | null> {
  const { data, error } = await supabase
    .from("ai_agent_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapJob(data as Record<string, unknown>) : null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Fetch a list of AI agent jobs for the current user.
 * Does NOT poll — use useAIAgentJobPoller for a single live job.
 */
export function useAIAgentJobs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-agent-jobs", user?.id],
    queryFn: () => fetchAIAgentJobs(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 15_000,
  });
}

/**
 * Poll a single job until it reaches a terminal state.
 * Automatically stops polling when status is 'completed', 'failed',
 * or 'awaiting_selection' (user action required).
 */
export function useAIAgentJobPoller(jobId: string | null) {
  return useQuery({
    queryKey: ["ai-agent-job", jobId],
    queryFn: () => fetchAIAgentJob(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return POLL_INTERVAL_MS;
      if (
        status === "completed" ||
        status === "failed" ||
        status === "awaiting_selection"
      ) {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
    staleTime: 0,
  });
}

/**
 * Create a new AI agent job.
 * Inserts the row in Supabase, then fires Workflow 1 webhook.
 */
export function useCreateAIAgentJob() {
  const qc = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAIAgentJobInput): Promise<AIAgentJob> => {
      if (!user) throw new Error("Usuário não autenticado");

      const brandSnapshot = {
        company_name: (profile as Record<string, unknown> | null)?.company_name ?? null,
        language_style: (profile as Record<string, unknown> | null)?.language_style ?? null,
        target_audience: (profile as Record<string, unknown> | null)?.target_audience ?? null,
        city: (profile as Record<string, unknown> | null)?.city ?? null,
        state: (profile as Record<string, unknown> | null)?.state ?? null,
        full_name: (profile as Record<string, unknown> | null)?.full_name ?? null,
      };

      const { data, error } = await supabase
        .from("ai_agent_jobs")
        .insert({
          user_id: user.id,
          topic: input.topic,
          subtopic: input.subtopic ?? null,
          format: input.format,
          canal: input.canal ?? "instagram",
          brand_snapshot: brandSnapshot,
          status: "queued",
          phase: 1,
        })
        .select("*")
        .single();

      if (error) throw error;
      const job = mapJob(data as Record<string, unknown>);

      try {
        const webhookRes = await fetch(N8N_WORKFLOW_1_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_id: job.id,
            topic: job.topic,
            subtopic: job.subtopic,
            format: job.format,
            canal: job.canal,
            brand_snapshot: brandSnapshot,
          }),
        });
        if (!webhookRes.ok) {
          console.warn("[useAIAgent] Workflow 1 webhook returned", webhookRes.status);
        }
      } catch (webhookErr) {
        console.warn("[useAIAgent] Workflow 1 webhook error:", webhookErr);
      }

      return job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-agent-jobs", user?.id] });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao iniciar agente",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Select one of the 3 options and trigger Workflow 2.
 */
export function useSelectAIAgentOption() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      jobId,
      selectedOption,
    }: {
      jobId: string;
      selectedOption: AIAgentOption;
    }): Promise<AIAgentJob> => {
      const { data, error } = await supabase
        .from("ai_agent_jobs")
        .update({
          selected_option_id: selectedOption.id,
          status: "queued",
          phase: 2,
        })
        .eq("id", jobId)
        .select("*")
        .single();

      if (error) throw error;
      const job = mapJob(data as Record<string, unknown>);

      try {
        const webhookRes = await fetch(N8N_WORKFLOW_2_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_id: job.id,
            topic: job.topic,
            format: job.format,
            canal: job.canal,
            selected_option: selectedOption,
            selected_option_id: selectedOption.id,
            brand_snapshot: job.brand_snapshot,
          }),
        });
        if (!webhookRes.ok) {
          console.warn("[useAIAgent] Workflow 2 webhook returned", webhookRes.status);
        }
      } catch (webhookErr) {
        console.warn("[useAIAgent] Workflow 2 webhook error:", webhookErr);
      }

      return job;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ai-agent-job", variables.jobId] });
      qc.invalidateQueries({ queryKey: ["ai-agent-jobs", user?.id] });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao selecionar opção",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
