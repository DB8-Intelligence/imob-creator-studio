import { createContext, useContext, type ReactNode } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";

interface WorkspaceContextValue {
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  workspacePlan: string | null;
  workspaceRole: string | null;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useWorkspace();

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceId: data?.workspace?.id ?? null,
        workspaceName: data?.workspace?.name ?? null,
        workspaceSlug: data?.workspace?.slug ?? null,
        workspacePlan: data?.workspace?.plan ?? null,
        workspaceRole: data?.membership?.role ?? null,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
