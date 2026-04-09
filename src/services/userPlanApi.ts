import { supabase } from "@/integrations/supabase/client";
import type { UserPlanInfo, HotmartPlanInfo } from "@/types/userPlan";

export async function fetchUserPlan(): Promise<UserPlanInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("users")
    .select("id, email, user_plan, credits_remaining, credits_total")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return data as UserPlanInfo;
}

/** Fetch active Hotmart plan from the my_plan view */
export async function fetchHotmartPlan(): Promise<HotmartPlanInfo | null> {
  const { data, error } = await supabase
    .from("my_plan")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as HotmartPlanInfo | null;
}

export async function consumeCredits(amount: number): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc("consume_credits", {
    p_user_id: user.id,
    p_amount: amount,
  });

  if (error) throw new Error(error.message);
  return data as number;
}
