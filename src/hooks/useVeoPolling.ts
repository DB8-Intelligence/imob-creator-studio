import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VeoOperation {
  operationName: string;
  workspaceId: string;
  jobId?: string;
  segmentIndex?: number;
}

interface VeoResult {
  success: boolean;
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  progress?: number | null;
}

interface PollState {
  /** Map of operationName → latest result */
  results: Record<string, VeoResult>;
  /** Operations currently being polled */
  activeOps: Set<string>;
}

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const MAX_POLL_ATTEMPTS = 60; // 10 minutes max

/**
 * Hook that manages polling for Veo video generation operations.
 *
 * Usage:
 *   const { startPolling, results, isPolling } = useVeoPolling();
 *   // After getting an operationName from image-to-video:
 *   startPolling({ operationName, workspaceId, jobId, segmentIndex });
 *   // Check results[operationName] for status updates
 */
export function useVeoPolling() {
  const [state, setState] = useState<PollState>({
    results: {},
    activeOps: new Set(),
  });

  const intervalsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const attemptsRef = useRef<Record<string, number>>({});

  const pollOnce = useCallback(async (op: VeoOperation): Promise<VeoResult> => {
    const { data, error } = await supabase.functions.invoke("poll-video-status", {
      body: {
        operationName: op.operationName,
        workspaceId: op.workspaceId,
        jobId: op.jobId,
        segmentIndex: op.segmentIndex,
      },
    });

    if (error) {
      return { success: false, status: "failed", error: error.message };
    }

    return data as VeoResult;
  }, []);

  const stopPolling = useCallback((operationName: string) => {
    if (intervalsRef.current[operationName]) {
      clearTimeout(intervalsRef.current[operationName]);
      delete intervalsRef.current[operationName];
    }
    delete attemptsRef.current[operationName];
    setState((prev) => {
      const next = new Set(prev.activeOps);
      next.delete(operationName);
      return { ...prev, activeOps: next };
    });
  }, []);

  const startPolling = useCallback(
    (op: VeoOperation, onComplete?: (result: VeoResult) => void) => {
      const { operationName } = op;

      // Already polling this op
      if (state.activeOps.has(operationName)) return;

      attemptsRef.current[operationName] = 0;

      setState((prev) => {
        const next = new Set(prev.activeOps);
        next.add(operationName);
        return {
          ...prev,
          activeOps: next,
          results: {
            ...prev.results,
            [operationName]: { success: true, status: "processing" },
          },
        };
      });

      const doPoll = async () => {
        attemptsRef.current[operationName] =
          (attemptsRef.current[operationName] ?? 0) + 1;

        const result = await pollOnce(op);

        setState((prev) => ({
          ...prev,
          results: { ...prev.results, [operationName]: result },
        }));

        if (result.status === "completed" || result.status === "failed") {
          stopPolling(operationName);
          onComplete?.(result);
          return;
        }

        if (attemptsRef.current[operationName]! >= MAX_POLL_ATTEMPTS) {
          const timeout: VeoResult = {
            success: false,
            status: "failed",
            error: "Tempo limite excedido. O vídeo pode ter falhado.",
          };
          setState((prev) => ({
            ...prev,
            results: { ...prev.results, [operationName]: timeout },
          }));
          stopPolling(operationName);
          onComplete?.(timeout);
          return;
        }

        // Schedule next poll
        intervalsRef.current[operationName] = setTimeout(doPoll, POLL_INTERVAL_MS);
      };

      // Start first poll after a short delay (video needs time to begin processing)
      intervalsRef.current[operationName] = setTimeout(doPoll, 5_000);
    },
    [pollOnce, stopPolling, state.activeOps]
  );

  const stopAll = useCallback(() => {
    Object.keys(intervalsRef.current).forEach(stopPolling);
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    stopAll,
    results: state.results,
    activeOps: state.activeOps,
    isPolling: state.activeOps.size > 0,
  };
}
