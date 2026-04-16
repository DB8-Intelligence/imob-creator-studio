/**
 * useJobStatus — Generic job status tracker with Supabase Realtime.
 * Works with any table that has: id, status, progress, output_data, error_message.
 * Supports: generation_jobs, creative_jobs, video_jobs, jobs.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JobRecord {
  id: string;
  status: string;
  progress: number;
  output_data: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface UseJobStatusOptions {
  /** Table name to query (default: "generation_jobs") */
  table?: string;
}

export function useJobStatus(jobId: string | null, options?: UseJobStatusOptions) {
  const table = options?.table ?? "generation_jobs";
  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    (async () => {
      const { data } = await supabase
        .from(table as "generation_jobs")
        .select("id, status, progress, output_data, error_message, created_at, completed_at")
        .eq("id", jobId)
        .maybeSingle();

      if (data) setJob(data as unknown as JobRecord);
      setLoading(false);
    })();

    // Realtime subscription
    const channel = supabase
      .channel(`job-status-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table,
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as unknown as JobRecord);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, table]);

  const isCompleted = job?.status === "done" || job?.status === "completed";
  const isError = job?.status === "error" || job?.status === "failed";
  const isProcessing = !isCompleted && !isError && !!job;

  return { job, loading, isCompleted, isError, isProcessing };
}
