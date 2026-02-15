import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserPlan, updateUserPlan } from "@/services/userPlanApi";
import { toast } from "@/hooks/use-toast";
import type { UserPlanInfo } from "@/types/userPlan";

const QUERY_KEY = ["user-plan"];

export function useUserPlan() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchUserPlan,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useDecrementCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const current = qc.getQueryData<UserPlanInfo>(QUERY_KEY);
      const newCredits = Math.max((current?.credits_remaining ?? 1) - 1, 0);
      return updateUserPlan({ credits_remaining: newCredits });
    },
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEY, data);
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar créditos", description: err.message, variant: "destructive" });
    },
  });
}
