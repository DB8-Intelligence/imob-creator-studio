/**
 * Types pro sistema de Bug Reporter.
 */

export type BugSeverity = "blocker" | "bug" | "suggestion";
export type BugStatus = "new" | "investigating" | "fixed" | "wont_fix";

export interface ApiLogEntry {
  method: string;
  path: string;
  status: number;
  error?: string;
  timestamp: string;
  duration_ms: number;
}

export interface BugContext {
  url: string;
  route: string;
  user_agent: string;
  viewport: { width: number; height: number };
  api_log: ApiLogEntry[];
  timestamp: string;
  /** Extra opcional — dados do workspace ativo, módulo em uso, etc. */
  extra?: Record<string, unknown>;
}

export interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  severity: BugSeverity;
  status: BugStatus;
  context: BugContext;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Para admin listar com email do reporter (join). */
export interface BugReportWithUser extends BugReport {
  reporter_email?: string | null;
}

export interface CreateBugInput {
  title: string;
  description?: string;
  severity: BugSeverity;
  context: BugContext;
}

export const SEVERITY_LABELS: Record<BugSeverity, { label: string; color: string; emoji: string }> = {
  blocker:    { label: "Crítico",    color: "bg-red-500/10 text-red-600 border-red-500/30",      emoji: "🚨" },
  bug:        { label: "Bug",        color: "bg-amber-500/10 text-amber-700 border-amber-500/30", emoji: "🐛" },
  suggestion: { label: "Sugestão",   color: "bg-blue-500/10 text-blue-600 border-blue-500/30",    emoji: "💡" },
};

export const STATUS_LABELS: Record<BugStatus, { label: string; color: string }> = {
  new:           { label: "Novo",         color: "bg-slate-500/10 text-slate-600 border-slate-500/30" },
  investigating: { label: "Investigando", color: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  fixed:         { label: "Corrigido",    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  wont_fix:      { label: "Não corrigir", color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
};
