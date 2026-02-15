import { supabase } from "@/integrations/supabase/client";
import type { UserPlanInfo } from "@/types/userPlan";

async function proxyCall<T>(opts: { method: string; path: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: opts.method, _path: opts.path, ...opts.body },
  });
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function fetchUserPlan(): Promise<UserPlanInfo> {
  return proxyCall<UserPlanInfo>({ method: "GET", path: "/me" });
}

export async function updateUserPlan(data: Partial<UserPlanInfo>): Promise<UserPlanInfo> {
  return proxyCall<UserPlanInfo>({ method: "PATCH", path: "/me", body: data as Record<string, unknown> });
}
