/**
 * useSiteImoveis.ts — React Query hooks para imóveis do Site Imobiliário
 * Conectado ao Supabase — tabela "site_imoveis" + Storage bucket "site-fotos".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { SiteImovel } from "@/types/site";

// ─── Fetch ──────────────────────────────────────────────────────────────────

async function fetchImoveis(siteId: string): Promise<SiteImovel[]> {
  const { data, error } = await supabase
    .from("site_imoveis")
    .select("*")
    .eq("site_id", siteId)
    .order("ordem_exibicao", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as SiteImovel[];
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useSiteImoveis(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-imoveis", siteId],
    queryFn: () => fetchImoveis(siteId!),
    enabled: Boolean(siteId),
    staleTime: 15_000,
  });
}

export function useCreateImovel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<SiteImovel, "id" | "created_at" | "updated_at" | "user_id">) => {
      const { data, error } = await supabase
        .from("site_imoveis")
        .insert({ ...input, user_id: user!.id } as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as SiteImovel;
    },
    onSuccess: (imovel) => {
      qc.invalidateQueries({ queryKey: ["site-imoveis", imovel.site_id] });
      toast({ title: "Imóvel criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao criar imóvel",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateImovel() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      siteId,
      ...updates
    }: Partial<SiteImovel> & { id: string; siteId: string }) => {
      const { data, error } = await supabase
        .from("site_imoveis")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...(data as unknown as SiteImovel), _siteId: siteId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["site-imoveis", result._siteId] });
      toast({ title: "Imóvel atualizado" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao atualizar imóvel",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteImovel() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, siteId }: { id: string; siteId: string }) => {
      const { error } = await supabase
        .from("site_imoveis")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { siteId };
    },
    onSuccess: ({ siteId }) => {
      qc.invalidateQueries({ queryKey: ["site-imoveis", siteId] });
      toast({ title: "Imóvel excluído" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao excluir imóvel",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleDestaque() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      siteId,
      destaque,
    }: {
      id: string;
      siteId: string;
      destaque: boolean;
    }) => {
      const { data, error } = await supabase
        .from("site_imoveis")
        .update({ destaque: !destaque } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...(data as unknown as SiteImovel), _siteId: siteId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["site-imoveis", result._siteId] });
      toast({
        title: result.destaque ? "Imóvel marcado como destaque" : "Destaque removido",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao alterar destaque",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useUploadFotos() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      imovelId,
      siteId,
      files,
    }: {
      imovelId: string;
      siteId: string;
      files: File[];
    }) => {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const filePath = `${user!.id}/imoveis/${imovelId}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("site-fotos")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("site-fotos")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Fetch current fotos array and append new ones
      const { data: current, error: fetchErr } = await supabase
        .from("site_imoveis")
        .select("fotos")
        .eq("id", imovelId)
        .single();

      if (fetchErr) throw fetchErr;

      const existingFotos = (current as unknown as { fotos: string[] })?.fotos ?? [];
      const mergedFotos = [...existingFotos, ...uploadedUrls];

      const { data, error: updateErr } = await supabase
        .from("site_imoveis")
        .update({ fotos: mergedFotos } as never)
        .eq("id", imovelId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return { ...(data as unknown as SiteImovel), _siteId: siteId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["site-imoveis", result._siteId] });
      toast({ title: "Fotos enviadas com sucesso" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao enviar fotos",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
