import { supabase } from "@/integrations/supabase/client";
import type { WorkspaceInfo, WorkspaceMembership } from "@/types/workspace";

export async function fetchWorkspaceOverview() {
  const [{ data: memberships, error: membershipsError }, { data: userData, error: userError }] = await Promise.all([
    supabase
      .from("workspace_memberships" as never)
      .select("id, workspace_id, user_id, role, status, created_at, updated_at")
      .eq("status", "active")
      .limit(1),
    supabase.auth.getUser(),
  ]);

  if (membershipsError) throw membershipsError;
  if (userError) throw userError;

  const membership = (memberships as unknown as WorkspaceMembership[] | null)?.[0] ?? null;
  if (!membership) {
    return { workspace: null, membership: null, user: userData.user ?? null };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces" as never)
    .select("id, name, slug, plan, status, owner_user_id, created_at, updated_at")
    .eq("id", membership.workspace_id)
    .maybeSingle();

  if (workspaceError) throw workspaceError;

  return {
    workspace: workspace as unknown as WorkspaceInfo | null,
    membership,
    user: userData.user ?? null,
  };
}
