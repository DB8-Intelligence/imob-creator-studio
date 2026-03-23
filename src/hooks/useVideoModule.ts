import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activateVideoAddon, createVideoJob, fetchVideoJobs, fetchVideoModuleOverview, releaseVideoCredit, updateVideoJobStatus } from "@/services/videoModuleApi";
import type { CreateVideoJobInput, VideoJob } from "@/types/video";
import { useToast } from "@/hooks/use-toast";

export function useVideoJobs(workspaceId: string | null) {
  return useQuery({
    queryKey: ["video-jobs", workspaceId],
    queryFn: () => fetchVideoJobs(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useVideoModuleOverview(workspaceId: string | null) {
  return useQuery({
    queryKey: ["video-module-overview", workspaceId],
    queryFn: () => fetchVideoModuleOverview(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 15_000,
  });
}

export function useCreateVideoJob(workspaceId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: Omit<CreateVideoJobInput, "workspaceId">) =>
      createVideoJob({ ...input, workspaceId: workspaceId as string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-jobs", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar job de vídeo", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateVideoJobStatus(workspaceId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, outputUrl }: { id: string; status: VideoJob["status"]; outputUrl?: string | null }) =>
      updateVideoJobStatus(id, status, outputUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-jobs", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar status do vídeo", description: err.message, variant: "destructive" });
    },
  });
}

export function useReleaseVideoCredit(workspaceId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => releaseVideoCredit(workspaceId as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao liberar crédito de vídeo", description: err.message, variant: "destructive" });
    },
  });
}

export function useActivateVideoAddon(workspaceId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: { addonType: "standard" | "plus" | "premium"; billingCycle: "monthly" | "yearly" }) =>
      activateVideoAddon({ workspaceId: workspaceId as string, ...params }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-jobs", workspaceId] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao ativar módulo de vídeo", description: err.message, variant: "destructive" });
    },
  });
}
