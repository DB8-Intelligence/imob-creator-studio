/**
 * useCorretorSite.ts — React Query hooks para o módulo Site Imobiliário
 * Conectado ao Supabase — tabela "corretor_sites".
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { CorretorSite, TemaCorr } from "@/types/site";

// ─── Defaults para auto-criação ─────────────────────────────────────────────

const SITE_DEFAULTS: Partial<CorretorSite> = {
  nome_completo: "",
  creci: "",
  foto_url: "",
  bio: "",
  especialidades: [],
  anos_experiencia: 0,
  telefone: "",
  whatsapp: "",
  email_contato: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  slug: "",
  dominio_customizado: "",
  dominio_verificado: false,
  dominio_verificado_at: null,
  cname_token: "",
  tema: "brisa" as TemaCorr,
  cor_primaria: "#0284C7",
  cor_secundaria: "#F59E0B",
  logo_url: "",
  banner_hero_url: "",
  banner_hero_titulo: "Encontre o imóvel dos seus sonhos",
  banner_hero_subtitulo: "Especialista em imóveis na sua região",
  meta_titulo: "",
  meta_descricao: "",
  google_analytics_id: "",
  publicado: false,
};

// ─── Fetch / Auto-create ────────────────────────────────────────────────────

async function fetchOrCreateSite(userId: string): Promise<CorretorSite> {
  const { data, error } = await supabase
    .from("corretor_sites")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) return data as unknown as CorretorSite;

  // Auto-create with defaults
  const { data: created, error: createErr } = await supabase
    .from("corretor_sites")
    .insert({ user_id: userId, ...SITE_DEFAULTS } as never)
    .select()
    .single();

  if (createErr) throw createErr;
  return created as unknown as CorretorSite;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useSite() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["corretor-site", user?.id],
    queryFn: () => fetchOrCreateSite(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}

export function useUpdateSite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<CorretorSite>) => {
      const { data, error } = await supabase
        .from("corretor_sites")
        .update(updates as never)
        .eq("user_id", user!.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CorretorSite;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corretor-site", user?.id] });
      toast({ title: "Site atualizado com sucesso" });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao atualizar site",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function usePublishSite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (publicado: boolean) => {
      const { data, error } = await supabase
        .from("corretor_sites")
        .update({ publicado } as never)
        .eq("user_id", user!.id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CorretorSite;
    },
    onSuccess: (site) => {
      qc.invalidateQueries({ queryKey: ["corretor-site", user?.id] });
      toast({
        title: site.publicado ? "Site publicado!" : "Site despublicado",
        description: site.publicado
          ? "Seu site está agora visível para visitantes."
          : "Seu site não está mais acessível publicamente.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao alterar publicação",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useVerifyDomain() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await supabase.functions.invoke("verify-domain", {
        body: { domain, user_id: user!.id },
      });

      if (error) throw error;
      return data as { verified: boolean; message: string };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["corretor-site", user?.id] });
      toast({
        title: result.verified ? "Domínio verificado!" : "Verificação pendente",
        description: result.message,
        variant: result.verified ? "default" : "destructive",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao verificar domínio",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
