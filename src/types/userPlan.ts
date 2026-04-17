export type UserPlan = "credits" | "pro" | "vip";

export type PlanSlug = "starter" | "basico" | "pro" | "max";

export interface UserPlanInfo {
  id: string;
  email?: string;
  user_plan: UserPlan;
  plan_slug: PlanSlug | null;
  plan_name: string | null;
  credits_remaining: number;
  credits_total: number;
}

/** Shape returned by the my_plan view (módulos ativos do usuário) */
export interface ModulePlanInfo {
  plan_slug: PlanSlug;
  plan_name: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  status: "active" | "canceled" | "refunded" | "pending";
  activated_at: string;
  expires_at: string | null;
}
