export type UserPlan = "credits" | "pro" | "vip";

export interface UserPlanInfo {
  user_plan: UserPlan;
  credits_remaining: number;
  name?: string;
  email?: string;
}
