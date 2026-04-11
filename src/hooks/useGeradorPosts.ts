/**
 * useGeradorPosts.ts — React Query hooks + Realtime para Gerador de Posts
 * Conectado ao Supabase — tabela "gerador_posts" + Edge Function "gerar-post-imovel".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { GeradorPost, FormatoPost, EstiloPost } from "@/types/gerador";

// ─── Customizacoes (localStorage) ──────────────────────────────────────────

export interface Customizacoes {
  logo_url: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_texto: string;
  fonte: string;
}

const LS_KEY = "gerador_posts_customizacoes";

const DEFAULT_CUSTOMIZACOES: Customizacoes = {
  logo_url: "",
  cor_primaria: "#1E3A5F",
  cor_secundaria: "#D4AF37",
  cor_texto: "#FFFFFF",
  fonte: "Montserrat",
};

function loadCustomizacoes(): Customizacoes {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_CUSTOMIZACOES, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_CUSTOMIZACOES;
}

export function useCustomizacoes() {
  const [customizacoes, setCustomizacoes] = useState<Customizacoes>(loadCustomizacoes);

  const updateCustomizacoes = useCallback((partial: Partial<Customizacoes>) => {
    setCustomizacoes((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { customizacoes, updateCustomizacoes };
}

// ─── Fetch posts ───────────────────────────────────────────────────────────

async function fetchPosts(userId: string, imovelId?: string): Promise<(GeradorPost & { imovel_titulo?: string; imovel_foto_capa?: string })[]> {
  let query = supabase
    .from("gerador_posts" as any)
    .select("*, site_imoveis!inner(titulo, foto_capa)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (imovelId) {
    query = query.eq("imovel_id", imovelId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as any[]).map((row: any) => ({
    ...row,
    imovel_titulo: row.site_imoveis?.titulo,
    imovel_foto_capa: row.site_imoveis?.foto_capa,
    site_imoveis: undefined,
  }));
}

export function usePosts(imovelId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gerador-posts", user?.id, imovelId],
    queryFn: () => fetchPosts(user!.id, imovelId),
    enabled: Boolean(user?.id),
    staleTime: 10_000,
  });
}

// ─── Gerar post (Edge Function) ────────────────────────────────────────────

interface GerarPostInput {
  imovel_id: string;
  formato: FormatoPost;
  estilo: EstiloPost;
  customizacoes: Customizacoes;
}

interface GerarPostResult {
  post_id: string;
  legenda: string;
}

export function useGerarPost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: GerarPostInput): Promise<GerarPostResult> => {
      const { data, error } = await supabase.functions.invoke("gerar-post-imovel", {
        body: {
          user_id: user!.id,
          imovel_id: input.imovel_id,
          formato: input.formato,
          estilo: input.estilo,
          logo_url: input.customizacoes.logo_url,
          cor_primaria: input.customizacoes.cor_primaria,
          cor_secundaria: input.customizacoes.cor_secundaria,
          cor_texto: input.customizacoes.cor_texto,
          fonte: input.customizacoes.fonte,
        },
      });

      if (error) throw error;
      return data as GerarPostResult;
    },
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["gerador-posts", user?.id, variables.imovel_id] });
      toast({ title: "Post sendo gerado!", description: "Aguarde alguns segundos..." });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao gerar post",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// ─── Delete post ───────────────────────────────────────────────────────────

export function useDeletePost() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, imovelId }: { postId: string; imovelId: string }) => {
      const { error } = await supabase
        .from("gerador_posts" as any)
        .delete()
        .eq("id", postId);

      if (error) throw error;
      return { imovelId };
    },
    onSuccess: ({ imovelId }) => {
      qc.invalidateQueries({ queryKey: ["gerador-posts", user?.id, imovelId] });
      toast({ title: "Post excluído" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao excluir post",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

// ─── Download ──────────────────────────────────────────────────────────────

export async function downloadPost(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

// ─── Copy text ─────────────────────────────────────────────────────────────

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

// ─── Realtime subscription ─────────────────────────────────────────────────

export function useGeradorRealtime(userId: string | undefined, imovelId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("gerador-posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gerador_posts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["gerador-posts", userId, imovelId] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "gerador_posts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["gerador-posts", userId, imovelId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, imovelId, qc]);
}
