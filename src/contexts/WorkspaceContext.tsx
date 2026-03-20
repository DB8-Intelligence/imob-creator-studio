import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { setStoredActiveWorkspaceId } from "@/services/workspaceApi";

interface WorkspaceContextValue {
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  workspacePlan: string | null;
  workspaceRole: string | null;
  workspaces: Array<{ id: string; name: string; slug: string; plan: string }>;
  isLoading: boolean;
  setActiveWorkspaceId: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useWorkspace();

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId: data?.workspace?.id ?? null,
      workspaceName: data?.workspace?.name ?? null,
      workspaceSlug: data?.workspace?.slug ?? null,
      workspacePlan: data?.workspace?.plan ?? null,
      workspaceRole: data?.membership?.role ?? null,
      workspaces: (data?.workspaces ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        plan: item.plan,
      })),
      isLoading,
      setActiveWorkspaceId: (workspaceId: string) => {
        setStoredActiveWorkspaceId(workspaceId);
        refetch();
      },
    }),
    [data, isLoading, refetch],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
