/**
 * useChannelConnections.ts — Hook para gerenciar conexões de canais (DEV-30)
 *
 * CRUD de channel_connections. Tokens são salvos no Supabase e injetados
 * no payload pelo publish-dispatch (server-side). O frontend só exibe
 * status de conexão (has_token), nunca o token em si.
 *
 * WhatsApp: Evolution API v2 (self-hosted).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ChannelConnectionInput, ChannelConnectionSafe } from "@/types/channel-connection";

export function useChannelConnections(workspaceId: string | null) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const {
    data: connections = [],
    isLoading,
    error,
  } = useQuery<ChannelConnectionSafe[]>({
    queryKey: ["channel-connections", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      // Only select safe columns — never fetch tokens to the browser
      const { data, error } = await supabase
        .from("channel_connections")
        .select("id, workspace_id, channel, is_active, display_name, ig_user_id, page_id, evolution_phone, ig_access_token, page_access_token, evolution_api_key, created_at, updated_at")
        .eq("workspace_id", workspaceId!)
        .order("channel");
      if (error) throw error;
      // Convert to safe format: only expose has_token booleans, never raw tokens
      return (data ?? []).map((c) => ({
        id: c.id,
        channel: c.channel as ChannelConnectionSafe["channel"],
        is_active: c.is_active,
        display_name: c.display_name,
        has_ig_token: Boolean(c.ig_access_token),
        has_fb_token: Boolean(c.page_access_token),
        has_evolution_key: Boolean(c.evolution_api_key),
        ig_user_id: c.ig_user_id,
        page_id: c.page_id,
        evolution_phone: c.evolution_phone,
        created_at: c.created_at,
      } satisfies ChannelConnectionSafe));
    },
    staleTime: 30_000,
  });

  const upsertMut = useMutation({
    mutationFn: async (input: ChannelConnectionInput) => {
      const { data, error } = await supabase
        .from("channel_connections")
        .upsert(
          {
            workspace_id: workspaceId!,
            channel: input.channel,
            display_name: input.display_name ?? null,
            ig_user_id: input.ig_user_id ?? null,
            ig_access_token: input.ig_access_token ?? null,
            page_id: input.page_id ?? null,
            page_access_token: input.page_access_token ?? null,
            evolution_instance_name: input.evolution_instance_name ?? null,
            evolution_api_key: input.evolution_api_key ?? null,
            evolution_phone: input.evolution_phone ?? null,
            is_active: true,
          },
          { onConflict: "workspace_id,channel" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-connections", workspaceId] });
      toast({ title: "Canal conectado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao conectar canal", description: err.message, variant: "destructive" });
    },
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("channel_connections")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-connections", workspaceId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("channel_connections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channel-connections", workspaceId] });
      toast({ title: "Canal desconectado" });
    },
  });

  function getConnection(channel: string): ChannelConnectionSafe | undefined {
    return connections.find((c) => c.channel === channel);
  }

  return {
    connections,
    isLoading,
    error,
    upsert: (input: ChannelConnectionInput) => upsertMut.mutate(input),
    toggle: (id: string, is_active: boolean) => toggleMut.mutate({ id, is_active }),
    remove: (id: string) => deleteMut.mutate(id),
    getConnection,
    isUpserting: upsertMut.isPending,
  };
}
