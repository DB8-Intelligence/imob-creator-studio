import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createVideoJob, fetchVideoJobs, fetchVideoModuleOverview, releaseVideoCredit, updateVideoJobStatus } from "@/services/videoModuleApi";
import type { CreateVideoJobInput, VideoJob } from "@/types/video";

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

  return useMutation({
    mutationFn: (input: Omit<CreateVideoJobInput, "workspaceId">) =>
      createVideoJob({ ...input, workspaceId: workspaceId as string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-jobs", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
  });
}

export function useUpdateVideoJobStatus(workspaceId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, outputUrl }: { id: string; status: VideoJob["status"]; outputUrl?: string | null }) =>
      updateVideoJobStatus(id, status, outputUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-jobs", workspaceId] });
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
  });
}

export function useReleaseVideoCredit(workspaceId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => releaseVideoCredit(workspaceId as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-module-overview", workspaceId] });
    },
  });
}
