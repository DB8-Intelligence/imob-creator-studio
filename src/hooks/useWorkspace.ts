import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceOverview } from "@/services/workspaceApi";

export function useWorkspace() {
  return useQuery({
    queryKey: ["workspace-overview"],
    queryFn: fetchWorkspaceOverview,
    staleTime: 30_000,
    retry: 1,
  });
}
