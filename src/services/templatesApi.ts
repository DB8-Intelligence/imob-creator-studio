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

export async function fetchTemplates(): Promise<BrandTemplate[]> {
  return proxyCall<BrandTemplate[]>({ method: "GET", path: "/templates" });
}

export async function createTemplate(data: BrandTemplateInput): Promise<BrandTemplate> {
  return proxyCall<BrandTemplate>({ method: "POST", path: "/templates", body: data as unknown as Record<string, unknown> });
}

export async function updateTemplate(id: string, data: Partial<BrandTemplateInput>): Promise<BrandTemplate> {
  return proxyCall<BrandTemplate>({ method: "PATCH", path: `/templates/${id}`, body: data as unknown as Record<string, unknown> });
}

export async function deleteTemplate(id: string): Promise<void> {
  await proxyCall<void>({ method: "DELETE", path: `/templates/${id}` });
}
