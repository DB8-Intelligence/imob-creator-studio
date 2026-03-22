export type UserPlan = "credits" | "pro" | "vip";

export interface UserPlanInfo {
  id: string;
  email?: string;
  user_plan: UserPlan;
  credits_remaining: number;
  credits_total: number;
}
