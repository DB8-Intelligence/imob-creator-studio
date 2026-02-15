import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/services/templatesApi";
import type { BrandTemplateInput } from "@/types/brandTemplate";

const QUERY_KEY = ["brand-templates"];

export function useBrandTemplates() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: fetchTemplates });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BrandTemplateInput) => createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Template criado com sucesso" });
    },
    onError: (err: Error) => toast({ title: "Erro ao criar template", description: err.message, variant: "destructive" }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandTemplateInput> }) => updateTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Template atualizado" });
    },
    onError: (err: Error) => toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Template removido" });
    },
    onError: (err: Error) => toast({ title: "Erro ao remover", description: err.message, variant: "destructive" }),
  });
}
