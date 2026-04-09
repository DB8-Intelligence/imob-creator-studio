import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserPlan, fetchHotmartPlan, consumeCredits } from "@/services/userPlanApi";
import { toast } from "@/hooks/use-toast";
import type { UserPlanInfo, HotmartPlanInfo } from "@/types/userPlan";

export const USER_PLAN_KEY = ["user-plan"];

export function useUserPlan() {
  return useQuery({
    queryKey: USER_PLAN_KEY,
    queryFn: fetchUserPlan,
    staleTime: 30_000,
    retry: 1,
  });
}

const HOTMART_PLAN_KEY = ["hotmart-plan"];

/** Hook for Hotmart-based plan (user_plans table via my_plan view) */
export function useHotmartPlan() {
  const query = useQuery({
    queryKey: HOTMART_PLAN_KEY,
    queryFn: fetchHotmartPlan,
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
