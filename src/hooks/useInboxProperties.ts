import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyStatus } from "@/components/inbox/StatusBadge";
import type { InboxProperty } from "@/components/inbox/PropertyCard";

async function fetchProperties(): Promise<InboxProperty[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "GET",
  });
  if (res.error) throw new Error(res.error.message);
  return res.data as InboxProperty[];
}

async function patchPropertyStatus(id: string, status: PropertyStatus): Promise<void> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST", // edge functions only support POST; we pass method info in body
    body: { _method: "PATCH", _path: `/properties/${id}`, status },
  });
  if (res.error) throw new Error(res.error.message);
}

export function useInboxProperties() {
  return useQuery({
    queryKey: ["inbox-properties"],
    queryFn: fetchProperties,
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
