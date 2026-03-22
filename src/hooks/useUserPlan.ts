import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserPlan, consumeCredits } from "@/services/userPlanApi";
import { toast } from "@/hooks/use-toast";
import type { UserPlanInfo } from "@/types/userPlan";

export const USER_PLAN_KEY = ["user-plan"];

export function useUserPlan() {
  return useQuery({
    queryKey: USER_PLAN_KEY,
    queryFn: fetchUserPlan,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useConsumeCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => consumeCredits(amount),
    onSuccess: (newRemaining) => {
      qc.setQueryData<UserPlanInfo>(USER_PLAN_KEY, (old) =>
        old ? { ...old, credits_remaining: newRemaining } : old
      );
    },
    onError: (err: Error) => {
      toast({
        title: "Créditos insuficientes",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
