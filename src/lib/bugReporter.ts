/**
 * bugReporter — helper central pra submissão de bug reports.
 *
 * Usado por 2 fontes:
 *  1. BugReporterWidget (manual — staff reporta do canto da tela)
 *  2. GlobalErrorBoundary (automático — quando React crasha)
 *
 * Fluxo:
 *  - Captura screenshot do viewport via html-to-image (best-effort)
 *  - Faz upload pro bucket bug-screenshots
 *  - Monta BugContext com URL, rota, API log, screenshot_path, etc
 *  - INSERT em bug_reports
 */
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { getApiLog } from "./apiLogBuffer";
import type {
  BugContext,
  BugSeverity,
} from "@/types/bug-report";

interface SubmitBugInput {
  userId: string;
  title: string;
  description?: string;
  severity: BugSeverity;
  /** Se true (default), tenta capturar screenshot. */
  captureScreenshot?: boolean;
  /** Dados extras pra mesclar no context (ex: crash info). */
  extraContext?: Partial<BugContext>;
}

export interface SubmitBugResult {
  success: boolean;
  bugId?: string;
  error?: string;
}

/**
 * Tenta capturar o viewport como PNG + upload pro bucket.
 * Retorna o path no bucket ou null se falhar (best-effort).
 */
async function captureAndUploadScreenshot(userId: string): Promise<string | null> {
  try {
    const dataUrl = await toPng(document.body, {
      cacheBust: true,
      // Limita tamanho pra economizar storage (max width 1600)
      pixelRatio: window.devicePixelRatio > 1 ? 1.5 : 1,
      filter: (node) => {
        // Ignora o próprio widget de bug report (evita self-screenshot)
        if (node.getAttribute?.("data-bug-widget") === "true") return false;
        return true;
      },
    });

    // dataUrl = "data:image/png;base64,..."
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const path = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from("bug-screenshots")
      .upload(path, blob, { contentType: "image/png", upsert: false });

    if (error) {
      console.warn("bug_screenshot_upload_failed", error);
      return null;
    }
    return path;
  } catch (err) {
    console.warn("bug_screenshot_capture_failed", err);
    return null;
  }
}

export async function submitBug(input: SubmitBugInput): Promise<SubmitBugResult> {
  const screenshot =
    input.captureScreenshot !== false
      ? await captureAndUploadScreenshot(input.userId)
      : null;

  const context: BugContext = {
    url: window.location.href,
    route: window.location.pathname,
    user_agent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    api_log: getApiLog(),
    timestamp: new Date().toISOString(),
    screenshot_path: screenshot,
    ...input.extraContext,
  };

  const { data, error } = await supabase
    .from("bug_reports")
    .insert({
      user_id: input.userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      severity: input.severity,
      context,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Insert falhou" };
  }
  return { success: true, bugId: data.id };
}

/** Gera signed URL pra ler o screenshot de um bug. */
export async function getBugScreenshotUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("bug-screenshots")
    .createSignedUrl(path, 60 * 60); // 1h

  if (error || !data) {
    console.warn("bug_screenshot_url_failed", error);
    return null;
  }
  return data.signedUrl;
}
