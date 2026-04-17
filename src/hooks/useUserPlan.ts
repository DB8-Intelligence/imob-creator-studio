import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserPlan, fetchModulePlan, consumeCredits } from "@/services/userPlanApi";
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

const MODULE_PLAN_KEY = ["module-plan"];

/** Hook for active module plan (user_subscriptions via my_plan view) */
export function useModulePlan() {
  const query = useQuery({
    queryKey: MODULE_PLAN_KEY,
    queryFn: fetchModulePlan,
    staleTime: 30_000,
    retry: 1,
  });

  const plan = query.data;
  const hasActivePlan = plan?.status === "active";
  const isMax = plan?.plan_slug === "max";
  const creditsLeft = plan?.credits_remaining ?? 0;

  return { ...query, plan, hasActivePlan, isMax, creditsLeft };
}

export function useConsumeCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => consumeCredits(amount),
    onSuccess: (result) => {
      qc.setQueryData<UserPlanInfo>(USER_PLAN_KEY, (old) =>
        old ? { ...old, credits_remaining: result.credits_remaining } : old
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
