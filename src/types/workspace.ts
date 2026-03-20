export type WorkspacePlan = "credits" | "pro" | "vip";
export type WorkspaceRole = "owner" | "admin" | "editor" | "member" | "viewer";

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  status: "active" | "inactive";
  owner_user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: "active" | "invited" | "inactive";
  created_at?: string;
  updated_at?: string;
}
