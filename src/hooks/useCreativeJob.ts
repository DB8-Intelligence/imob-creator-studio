/**
 * useCreativeJob.ts — Hook para o sistema dual de criação de criativos
 *
 * Responsabilidades:
 *  - Criar creative_job no Supabase
 *  - Disparar pipeline de geração (backend Fastify faz o trabalho pesado)
 *  - Assinar atualizações Realtime do creative_job
 *  - Listar jobs recentes do usuário
 */
import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadGenerationInput } from "@/services/generationApi";
import type {
  CreativeJob,
  CreativeJobInput,
  CreativeJobStatus,
  CopyData,
} from "@/types/creative-job";

const QUERY_KEY = "creative-jobs";

export function useCreativeJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── Lista de jobs recentes do usuário ──────────────────────────────────
  const {
    data: jobs = [],
    isLoading,
  } = useQuery<CreativeJob[]>({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creative_jobs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as CreativeJob[];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // ── Realtime subscription ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`creative-jobs-rt-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "creative_jobs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: [QUERY_KEY, user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  // ── Criar job + upload de imagens ──────────────────────────────────────
  const createMut = useMutation({
    mutationFn: async (input: CreativeJobInput & { inputFiles?: File[] }) => {
      if (!user) throw new Error("Auth required");

      // 1. Upload de imagens (se houver Files)
      let imageUrls = [...input.input_images];
      if (input.inputFiles && input.inputFiles.length > 0) {
        const uploads = await Promise.allSettled(
          input.inputFiles.map((f) => uploadGenerationInput(f, "creative-inputs"))
        );
        const uploaded = uploads
          .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
          .map((r) => r.value);
        imageUrls = [...imageUrls, ...uploaded];
      }

      // 2. Criar creative_job (status: pending)
      const genCopy = input.generated_copy ?? {};
      const manCopy = input.manual_copy ?? {};

      const { data: job, error: insertErr } = await supabase
        .from("creative_jobs")
        .insert({
          user_id: user.id,
          mode: input.mode,
          template_id: input.template_id || null,
          style_id: input.style_id,
          status: "pending" as CreativeJobStatus,
          progress: 0,
          formats: input.formats,
          variation_count: input.variation_count,
          image_count: input.image_count,
          input_images: imageUrls,
          logo_url: input.logo_url,
          use_brand_identity: input.use_brand_identity,
          user_description: input.user_description,
          generated_copy: genCopy as Record<string, unknown>,
          manual_copy: manCopy as Record<string, unknown>,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 3. O backend Fastify (via polling ou webhook) pega jobs pendentes
      //    e roda o pipeline. O frontend apenas observa via Realtime.

      return { jobId: job.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] });
      toast({ title: "Criativo enviado para geração!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao criar criativo",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const getJob = useCallback(
    (jobId: string): CreativeJob | undefined => jobs.find((j) => j.id === jobId),
    [jobs]
  );

  // ── Buscar criativos gerados de um job ─────────────────────────────────
  const getGeneratedCreatives = useCallback(async (jobId: string) => {
    const { data, error } = await supabase
      .from("generated_creatives")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }, []);

  return {
    jobs,
    isLoading,
    createJob: (input: CreativeJobInput & { inputFiles?: File[] }) => createMut.mutateAsync(input),
    isCreating: createMut.isPending,
    getJob,
    getGeneratedCreatives,
  };
}
