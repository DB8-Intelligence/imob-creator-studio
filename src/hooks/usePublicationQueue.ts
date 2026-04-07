/**
 * usePublicationQueue.ts — Hook da fila de publicação (DEV-28 / DEV-29B)
 *
 * CRUD de publication_queue + logs.
 * Integração real com Supabase via @tanstack/react-query.
 * Realtime subscription para atualização automática de status.
 *
 * Fluxo:
 * 1. Usuário agenda publicação → cria item na queue (queued)
 * 2. n8n cron (1min) chama publish-dispatch → seleciona itens prontos
 * 3. publish-dispatch despacha para n8n Publish Router → publica no canal
 * 4. n8n chama publish-callback → atualiza status (published/error)
 * 5. Realtime subscription atualiza UI automaticamente
 */
import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PublicationQueueItem,
  PublicationLog,
  SchedulePublicationInput,
  PublicationStatus,
} from "@/types/publication";

// ─── Queries ──────────────────────────────────────────────────────────────

export function usePublicationQueue(workspaceId: string | null) {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  // Fetch queue items
  const {
    data: queue = [],
    isLoading,
    error,
  } = useQuery<PublicationQueueItem[]>({
    queryKey: ["publication-queue", workspaceId],
    enabled: !!workspaceId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publication_queue")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("scheduled_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as PublicationQueueItem[];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  // Fetch logs for all queue items
  const queueIds = useMemo(() => queue.map((q) => q.id), [queue]);
  const { data: logs = [] } = useQuery<PublicationLog[]>({
    queryKey: ["publication-logs", queueIds],
    enabled: queueIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publication_logs")
        .select("*")
        .in("publication_id", queueIds)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as PublicationLog[];
    },
    staleTime: 10_000,
  });

  // ── Realtime subscription (DEV-29B) ──────────────────────────────────
  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`pub-queue-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "publication_queue",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          // Invalidate queries on any change to publication_queue
          qc.invalidateQueries({ queryKey: ["publication-queue", workspaceId] });
          qc.invalidateQueries({ queryKey: ["publication-logs"] });
          qc.invalidateQueries({ queryKey: ["content-feed", workspaceId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, qc]);

  // ── Derived ─────────────────────────────────────────────────────────

  function getLogsForItem(publicationId: string): PublicationLog[] {
    return logs.filter((l) => l.publication_id === publicationId);
  }

  const { queuedCount, publishedCount, errorCount } = useMemo(() => ({
    queuedCount: queue.filter((q) => q.status === "queued").length,
    publishedCount: queue.filter((q) => q.status === "published").length,
    errorCount: queue.filter((q) => q.status === "error").length,
  }), [queue]);

  // ── Mutations ───────────────────────────────────────────────────────

  const scheduleMut = useMutation({
    mutationFn: async (input: SchedulePublicationInput) => {
      const now = new Date().toISOString();

      // Create queue item
      const { data: item, error: qErr } = await supabase
        .from("publication_queue")
        .insert({
          user_id: user!.id,
          workspace_id: workspaceId!,
          asset_id: input.asset_id ?? null,
          content_feed_id: input.content_feed_id ?? null,
          channel: input.channel,
          status: "queued" as PublicationStatus,
          caption: input.caption ?? null,
          scheduled_at: input.scheduled_at,
          retry_count: 0,
        })
        .select()
        .single();

      if (qErr) throw qErr;

      // Create initial log
      await supabase.from("publication_logs").insert({
        publication_id: item.id,
        action: "scheduled",
        status: "queued",
        payload: { scheduled_at: input.scheduled_at, channel: input.channel },
      });

      return item;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publication-queue", workspaceId] });
      qc.invalidateQueries({ queryKey: ["content-feed", workspaceId] });
      toast({ title: "Publicação agendada" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao agendar", description: err.message, variant: "destructive" });
    },
  });

  const cancelMut = useMutation({
    mutationFn: async (publicationId: string) => {
      const { error } = await supabase
        .from("publication_queue")
        .update({ status: "cancelled" as PublicationStatus })
        .eq("id", publicationId);
      if (error) throw error;

      await supabase.from("publication_logs").insert({
        publication_id: publicationId,
        action: "cancelled",
        status: "cancelled",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publication-queue", workspaceId] });
      toast({ title: "Publicação cancelada" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao cancelar", description: err.message, variant: "destructive" });
    },
  });

  const retryMut = useMutation({
    mutationFn: async (publicationId: string) => {
      const item = queue.find((q) => q.id === publicationId);
      if (!item) throw new Error("Item not found");

      const { error } = await supabase
        .from("publication_queue")
        .update({
          status: "queued" as PublicationStatus,
          error_message: null,
          retry_count: item.retry_count + 1,
        })
        .eq("id", publicationId);
      if (error) throw error;

      await supabase.from("publication_logs").insert({
        publication_id: publicationId,
        action: "retry",
        status: "queued",
        payload: { retry_count: item.retry_count + 1 },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publication-queue", workspaceId] });
      toast({ title: "Tentando novamente" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro no retry", description: err.message, variant: "destructive" });
    },
  });

  const publishNowMut = useMutation({
    mutationFn: async (publicationId: string) => {
      // Set scheduled_at to now so n8n picks it up immediately
      const { error } = await supabase
        .from("publication_queue")
        .update({
          scheduled_at: new Date().toISOString(),
          status: "queued" as PublicationStatus,
        })
        .eq("id", publicationId);
      if (error) throw error;

      await supabase.from("publication_logs").insert({
        publication_id: publicationId,
        action: "publish_started",
        status: "queued",
        payload: { immediate: true },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publication-queue", workspaceId] });
      toast({ title: "Publicação iniciada" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
    },
  });

  return {
    queue,
    logs,
    isLoading,
    error,
    queuedCount,
    publishedCount,
    errorCount,
    getLogsForItem,
    schedule: (input: SchedulePublicationInput) => scheduleMut.mutate(input),
    cancel: (id: string) => cancelMut.mutate(id),
    retry: (id: string) => retryMut.mutate(id),
    publishNow: (id: string) => publishNowMut.mutate(id),
    isScheduling: scheduleMut.isPending,
  };
}
