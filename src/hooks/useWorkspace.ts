import { useQuery } from "@tanstack/react-query";
import { ensureWorkspaceForCurrentUser, fetchWorkspaceOverview } from "@/services/workspaceApi";
import { useAuth } from "@/contexts/AuthContext";

export function useWorkspace() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workspace-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      await ensureWorkspaceForCurrentUser();
      return fetchWorkspaceOverview();
    },
    staleTime: 30_000,
    retry: 1,
  });
}
