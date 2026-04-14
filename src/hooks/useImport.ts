import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ImportPlatform = "tecimob" | "jetimob" | "univen" | "buscaimo" | "generic";

export interface ImportPreview {
  job_id: string;
  total: number;
  preview: Record<string, unknown>[];
}

export function useImport() {
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const callEdge = async (action: string, body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-data?action=${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    return res.json();
  };

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `imports/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imports").upload(path, file);
    setUploading(false);
    if (error) throw error;
    return path;
  }, []);

  const parseFile = useCallback(async (filePath: string, platform: ImportPlatform) => {
    setParsing(true);
    const fileType = filePath.endsWith(".xml") ? "xml" : "csv";
    const result = await callEdge("parse", {
      file_url: filePath,
      file_type: fileType,
      source_platform: platform,
    });
    setPreview(result);
    setJobId(result.job_id);
    setParsing(false);
    return result;
  }, []);

  const confirmImport = useCallback(async () => {
    if (!jobId) return;
    setImporting(true);
    setStatus("processing");
    await callEdge("confirm", { job_id: jobId });

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const data = await callEdge("status", { job_id: jobId });
      const pct = data?.total_records > 0
        ? Math.round((data.imported_records / data.total_records) * 100) : 0;
      setProgress(pct);
      setStatus(data?.status ?? "processing");
      if (data?.status === "done" || data?.status === "error") {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setImporting(false);
      }
    }, 3000);
  }, [jobId]);

  const reset = useCallback(() => {
    setPreview(null);
    setJobId(null);
    setStatus("idle");
    setProgress(0);
  }, []);

  return {
    uploading, parsing, importing, progress, preview, status,
    uploadFile, parseFile, confirmImport, reset,
  };
}
