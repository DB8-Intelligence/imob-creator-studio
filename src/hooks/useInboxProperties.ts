import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import type { PropertyStatus } from "@/components/inbox/StatusBadge";
import type { InboxProperty } from "@/components/inbox/PropertyCard";

async function fetchProperties(workspaceId?: string | null): Promise<InboxProperty[]> {
  const suffix = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "GET", _path: `/properties${suffix}` },
  });
  if (res.error) throw new Error(res.error.message);
  return res.data as InboxProperty[];
}

async function patchPropertyStatus(id: string, status: PropertyStatus): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: "PATCH", _path: `/properties/${id}`, status },
  });
  if (res.error) throw new Error(res.error.message);
}

export function useInboxProperties() {
  const { workspaceId } = useWorkspaceContext();
  return useQuery({
    queryKey: ["inbox-properties", workspaceId],
    queryFn: () => fetchProperties(workspaceId),
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
}

export function useUpdatePropertyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      patchPropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-properties"] });
      toast({ title: "Status atualizado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
  });
}
