import { supabase } from "@/integrations/supabase/client";
import type { UserPlanInfo } from "@/types/userPlan";

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
