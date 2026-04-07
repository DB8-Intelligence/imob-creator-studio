/**
 * CreativeStudioPage — Página principal de criação de criativos (dual mode)
 *
 * Dois modos:
 *   Tab 1: Assistente IA (conversa guiada)
 *   Tab 2: Formulário (formulário direto)
 *
 * Ambos convergem para o mesmo pipeline interno via useCreativeJob.
 * Ao gerar, mostra ProcessingScreen com status real do job.
 * Resultado final vai para "Minhas Criações" (Library).
 */
import { useState, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { FormFlow } from "@/components/studio/FormFlow";
import { AssistantFlow } from "@/components/studio/AssistantFlow";
import { ProcessingScreen } from "@/components/studio/ProcessingScreen";
import { useCreativeJob } from "@/hooks/useCreativeJob";
import {
  Bot,
  FileText,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { CreativeJobInput, CreativeJob } from "@/types/creative-job";
import { STATUS_LABELS } from "@/types/creative-job";

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "assistant" | "form";
type View = "create" | "processing" | "history";

// ─── Component ───────────────────────────────────────────────────────────────

const CreativeStudioPage = () => {
  const { jobs, isLoading, createJob, isCreating, getJob } = useCreativeJob();

  const [mode, setMode] = useState<Mode>("assistant");
  const [view, setView] = useState<View>("create");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Active job from Realtime-updated list
  const activeJob: CreativeJob | undefined = activeJobId ? getJob(activeJobId) : undefined;

  // ── Submit handler (shared by both flows) ──────────────────────────────
  const handleSubmit = useCallback(
    async (input: CreativeJobInput & { inputFiles?: File[] }) => {
      const result = await createJob(input);
      setActiveJobId(result.jobId);
      setView("processing");
    },
    [createJob]
  );

  // ── Reset handler ──────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setActiveJobId(null);
    setView("create");
  }, []);

  // ── Recent jobs (últimos 10) ───────────────────────────────────────────
  const recentJobs = jobs.slice(0, 10);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ds-fg)]">Criar Criativo</h1>
            <p className="text-sm text-[var(--ds-fg-muted)] mt-1">
              Escolha entre o assistente IA ou o formulário direto
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "history" ? "create" : "history")}
            className="border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
          >
            <History className="w-4 h-4 mr-2" />
            {view === "history" ? "Voltar" : "Histórico"}
          </Button>
        </div>

        {/* ═══════ HISTORY VIEW ═══════ */}
        {view === "history" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-[var(--ds-fg)]">Últimos criativos</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--ds-cyan)]" />
              </div>
            ) : recentJobs.length === 0 ? (
              <p className="text-sm text-[var(--ds-fg-muted)] py-8 text-center">
                Nenhum criativo gerado ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setActiveJobId(job.id);
                      setView("processing");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-bg)] hover:border-[var(--ds-cyan)]/40 transition-all text-left"
                  >
                    {/* Status icon */}
                    {job.status === "done" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : job.status === "error" ? (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    ) : (
                      <Clock className="w-5 h-5 text-[var(--ds-cyan)] shrink-0" />
                    )}

                    {/* Preview thumb */}
                    {job.result_urls?.[0] ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--ds-border)] shrink-0">
                        <img src={job.result_urls[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--ds-surface)] border border-[var(--ds-border)] shrink-0" />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--ds-fg)] truncate">
                        {job.template_id}
                      </p>
                      <p className="text-xs text-[var(--ds-fg-muted)]">
                        {job.mode === "assistant" ? "Assistente IA" : "Formulário"}
                        {" · "}
                        {STATUS_LABELS[job.status]}
                        {" · "}
                        {new Date(job.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    {/* Progress */}
                    {job.status !== "done" && job.status !== "error" && (
                      <span className="text-xs font-medium text-[var(--ds-cyan)]">
                        {job.progress}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════ PROCESSING VIEW ═══════ */}
        {view === "processing" && (
          <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6 animate-in fade-in duration-300">
            <ProcessingScreen
              job={(activeJob as CreativeJob) ?? null}
              onReset={handleReset}
            />
          </div>
        )}

        {/* ═══════ CREATE VIEW ═══════ */}
        {view === "create" && (
          <>
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--ds-bg)] border border-[var(--ds-border)] w-fit">
              <button
                type="button"
                onClick={() => setMode("assistant")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "assistant"
                    ? "bg-[var(--ds-cyan)]/15 text-[var(--ds-cyan)] shadow-sm"
                    : "text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
                }`}
              >
                <Bot className="w-4 h-4" />
                Assistente IA
              </button>
              <button
                type="button"
                onClick={() => setMode("form")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "form"
                    ? "bg-[var(--ds-cyan)]/15 text-[var(--ds-cyan)] shadow-sm"
                    : "text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
                }`}
              >
                <FileText className="w-4 h-4" />
                Formulário
              </button>
            </div>

            {/* Content area */}
            <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
              {mode === "assistant" ? (
                <AssistantFlow
                  onSubmit={handleSubmit}
                  isSubmitting={isCreating}
                  activeJobId={activeJobId}
                />
              ) : (
                <FormFlow
                  onSubmit={handleSubmit}
                  isSubmitting={isCreating}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default CreativeStudioPage;
