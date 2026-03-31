import { supabase } from "@/integrations/supabase/client";
import type { WorkspaceInfo, WorkspaceMembership } from "@/types/workspace";

const ACTIVE_WORKSPACE_KEY = "db8intelligence.activeWorkspaceId";

export function getStoredActiveWorkspaceId() {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setStoredActiveWorkspaceId(workspaceId: string) {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export async function ensureWorkspaceForCurrentUser() {
  const { error } = await supabase.rpc("ensure_workspace_for_current_user" as never);
  if (error) throw error;
}

export async function fetchWorkspaceOverview() {
  const [{ data: memberships, error: membershipsError }, { data: userData, error: userError }] = await Promise.all([
    supabase
      .from("workspace_memberships" as never)
      .select("id, workspace_id, user_id, role, status, created_at, updated_at")
      .eq("status", "active"),
    supabase.auth.getUser(),
  ]);

  if (membershipsError) throw membershipsError;
  if (userError) throw userError;

  const membershipList = (memberships as unknown as WorkspaceMembership[] | null) ?? [];
  if (membershipList.length === 0) {
    return { workspace: null, membership: null, memberships: [], user: userData.user ?? null };
  }

  const storedWorkspaceId = getStoredActiveWorkspaceId();
  const activeMembership =
    membershipList.find((item) => item.workspace_id === storedWorkspaceId) ?? membershipList[0];

  const workspaceIds = membershipList.map((item) => item.workspace_id);
  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspaces" as never)
    .select("id, name, slug, plan, status, owner_user_id, created_at, updated_at")
    .in("id", workspaceIds);

  if (workspaceError) throw workspaceError;

  const workspaceList = (workspaces as unknown as WorkspaceInfo[] | null) ?? [];
  const activeWorkspace = workspaceList.find((item) => item.id === activeMembership.workspace_id) ?? null;

  if (activeWorkspace?.id) {
    setStoredActiveWorkspaceId(activeWorkspace.id);
  }

  return {
    workspace: activeWorkspace,
    membership: activeMembership,
    memberships: membershipList,
    workspaces: workspaceList,
    user: userData.user ?? null,
  };
}
