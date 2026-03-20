import { supabase } from "@/integrations/supabase/client";
import type { BrandTemplate, BrandTemplateInput } from "@/types/brandTemplate";

async function proxyCall<T>(opts: { method: string; path: string; body?: Record<string, unknown> }): Promise<T> {
  const res = await supabase.functions.invoke("inbox-proxy", {
    method: "POST",
    body: { _method: opts.method, _path: opts.path, ...opts.body },
  });
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function fetchTemplates(workspaceId?: string | null): Promise<BrandTemplate[]> {
  const suffix = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
  return proxyCall<BrandTemplate[]>({ method: "GET", path: `/templates${suffix}` });
}

export async function createTemplate(data: BrandTemplateInput, workspaceId?: string | null): Promise<BrandTemplate> {
  return proxyCall<BrandTemplate>({
    method: "POST",
    path: "/templates",
    body: { ...(data as unknown as Record<string, unknown>), workspace_id: workspaceId ?? null },
  });
}

export async function updateTemplate(id: string, data: Partial<BrandTemplateInput>, workspaceId?: string | null): Promise<BrandTemplate> {
  return proxyCall<BrandTemplate>({
    method: "PATCH",
    path: `/templates/${id}`,
    body: { ...(data as unknown as Record<string, unknown>), workspace_id: workspaceId ?? null },
  });
}

export async function deleteTemplate(id: string, workspaceId?: string | null): Promise<void> {
  await proxyCall<void>({ method: "DELETE", path: `/templates/${id}${workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : ""}` });
}
