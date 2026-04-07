/**
 * ProcessingScreen — Tela de progresso conectada ao status real do job
 *
 * Mostra cada etapa do pipeline invisível com indicadores visuais.
 * O status vem do creative_job via Realtime (não é fake).
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Library,
  RefreshCw,
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_PROGRESS,
  type CreativeJob,
  type CreativeJobStatus,
} from "@/types/creative-job";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProcessingScreenProps {
  job: CreativeJob | null;
  onReset: () => void;
}

const PIPELINE_STEPS: { status: CreativeJobStatus; label: string }[] = [
  { status: "validating", label: "Validando entrada" },
  { status: "processing_image", label: "Processando imagem" },
  { status: "generating_copy", label: "Preparando textos" },
  { status: "composing", label: "Montando composição" },
  { status: "rendering", label: "Renderizando criativo" },
];

const STATUS_ORDER: CreativeJobStatus[] = [
  "pending",
  "validating",
  "processing_image",
  "generating_copy",
  "composing",
  "rendering",
  "done",
];

// ─── Component ───────────────────────────────────────────────────────────────

export function ProcessingScreen({ job, onReset }: ProcessingScreenProps) {
  const navigate = useNavigate();

  const status = job?.status ?? "pending";
  const progress = job?.progress ?? STATUS_PROGRESS[status] ?? 0;
  const isDone = status === "done";
  const isError = status === "error";

  const currentIndex = useMemo(() => {
    return STATUS_ORDER.indexOf(status);
  }, [status]);

  // ── Done state ──────────────────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-[var(--ds-fg)]">Criativo pronto!</h3>
          <p className="text-sm text-[var(--ds-fg-muted)] mt-1">
            Seu criativo foi gerado com sucesso e está disponível em Minhas Criações.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => navigate("/library")}
            className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
          >
            <Library className="w-4 h-4 mr-2" />
            Abrir Minhas Criações
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Criar outro
          </Button>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-[var(--ds-fg)]">Falha na geração</h3>
          <p className="text-sm text-[var(--ds-fg-muted)] mt-1">
            {job?.error_message ?? "Algo deu errado. Tente novamente."}
          </p>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // ── Processing state ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 animate-in fade-in duration-300">
      {/* Spinner */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-[var(--ds-border)]" />
        <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="var(--ds-cyan)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.89} 289`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[var(--ds-cyan)]">{progress}%</span>
        </div>
      </div>

      {/* Status label */}
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--ds-fg)]">{STATUS_LABELS[status]}</p>
        <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">Não feche esta página</p>
      </div>

      {/* Pipeline steps */}
      <div className="w-full max-w-sm space-y-3">
        {PIPELINE_STEPS.map((ps, i) => {
          const stepIndex = STATUS_ORDER.indexOf(ps.status);
          const isComplete = currentIndex > stepIndex;
          const isCurrent = status === ps.status;

          return (
            <div key={ps.status} className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-[var(--ds-cyan)] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--ds-border)]" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isComplete
                    ? "text-emerald-400"
                    : isCurrent
                    ? "text-[var(--ds-fg)] font-medium"
                    : "text-[var(--ds-fg-subtle)]"
                }`}
              >
                {ps.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
