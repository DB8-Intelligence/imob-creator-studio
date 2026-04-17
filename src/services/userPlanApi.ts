import { supabase } from "@/integrations/supabase/client";
import type { UserPlan, UserPlanInfo, ModulePlanInfo, PlanSlug } from "@/types/userPlan";

function mapSlugToLegacy(slug: PlanSlug | null): UserPlan {
  if (slug === "max") return "vip";
  if (slug === "pro") return "pro";
  return "credits";
}

export async function fetchUserPlan(): Promise<UserPlanInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("my_plan")
    .select("plan_slug, plan_name, credits_total, credits_remaining, status")
    .maybeSingle();

  if (error) throw new Error(error.message);

  const slug = (data?.plan_slug ?? null) as PlanSlug | null;
  const isActive = data?.status === "active";

  return {
    id: user.id,
    email: user.email ?? undefined,
    user_plan: isActive ? mapSlugToLegacy(slug) : "credits",
    plan_slug: isActive ? slug : null,
    plan_name: isActive ? (data?.plan_name ?? null) : null,
    credits_remaining: data?.credits_remaining ?? 0,
    credits_total: data?.credits_total ?? 0,
  };
}

/** Fetch active module plan from the my_plan view */
export async function fetchModulePlan(): Promise<ModulePlanInfo | null> {
  const { data, error } = await supabase
    .from("my_plan")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ModulePlanInfo | null;
}

export interface ConsumeCreditsResult {
  success: boolean;
  unlimited?: boolean;
  credits_remaining: number;
  credits_used?: number;
  credits_total?: number;
  plan_slug?: string | null;
  plan_name?: string | null;
  error?: string;
  message?: string;
}

export async function consumeCredits(amount: number): Promise<ConsumeCreditsResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc("consume_credits", {
    p_user_id: user.id,
    p_amount: amount,
  });

  if (error) throw new Error(error.message);

  const result = data as unknown as ConsumeCreditsResult;
  if (!result?.success) {
    throw new Error(result?.message || "Falha ao consumir créditos");
  }
  return result;
}
