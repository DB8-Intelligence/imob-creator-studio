/**
 * JobStatusScreen — Reusable job progress UI.
 * Displays: pending → processing (with progress bar) → completed / error.
 * Works with any job table via useJobStatus hook.
 */
import { useJobStatus } from "@/hooks/useJobStatus";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react";

interface JobStatusScreenProps {
  jobId: string;
  table?: string;
  onComplete?: (outputData: Record<string, unknown>) => void;
  onRetry?: () => void;
  labels?: Record<string, string>;
}

const DEFAULT_LABELS: Record<string, string> = {
  pending: "Na fila de processamento...",
  validating: "Validando entrada...",
  processing_image: "Processando imagem...",
  processing: "Processando...",
  generating_copy: "Gerando textos...",
  composing: "Preparando composicao...",
  rendering: "Renderizando...",
  done: "Concluido!",
  completed: "Concluido!",
  error: "Erro no processamento",
  failed: "Falha no processamento",
};

export default function JobStatusScreen({
  jobId,
  table,
  onComplete,
  onRetry,
  labels,
}: JobStatusScreenProps) {
  const { job, loading, isCompleted, isError, isProcessing } = useJobStatus(jobId, { table });

  const statusLabels = { ...DEFAULT_LABELS, ...labels };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 flex items-center justify-center gap-3 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Job nao encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed
  if (isCompleted) {
    const outputUrl =
      (job.output_data?.creative_url as string) ??
      (job.output_data?.result_url as string) ??
      (job.output_data?.video_url as string) ??
      (job.output_data?.restored_url as string) ??
      null;

    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Pronto!</p>
              <p className="text-xs text-green-600">
                Processado em{" "}
                {job.completed_at && job.created_at
                  ? formatDuration(job.created_at, job.completed_at)
                  : "—"}
              </p>
            </div>
          </div>

          {outputUrl && (
            <div className="rounded-xl overflow-hidden border border-green-200">
              {outputUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={outputUrl} controls className="w-full max-h-80" />
              ) : (
                <img src={outputUrl} alt="Resultado" className="w-full max-h-80 object-cover" />
              )}
            </div>
          )}

          <div className="flex gap-2">
            {outputUrl && (
              <Button
                className="flex-1 bg-[#002B5B] hover:bg-[#001d3d] text-white gap-1.5"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = outputUrl;
                  link.download = `output-${job.id.substring(0, 8)}`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            )}
            {onComplete && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onComplete(job.output_data ?? {})}
              >
                Criar outro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800">
                {statusLabels[job.status] ?? "Erro"}
              </p>
              <p className="text-xs text-red-600">
                {job.error_message ?? "Algo deu errado. Tente novamente."}
              </p>
            </div>
          </div>

          {onRetry && (
            <Button variant="outline" className="w-full gap-1.5" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Processing / Pending
  return (
    <Card className="border-[#002B5B]/20 bg-[#002B5B]/[0.02]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#002B5B]/10 flex items-center justify-center">
            {job.status === "pending" ? (
              <Clock className="h-5 w-5 text-[#002B5B]/60" />
            ) : (
              <Loader2 className="h-5 w-5 text-[#002B5B] animate-spin" />
            )}
          </div>
          <div>
            <p className="font-semibold text-[#002B5B]">
              {statusLabels[job.status] ?? "Processando..."}
            </p>
            <p className="text-xs text-gray-500">
              Voce pode fechar esta pagina. Sera notificado quando concluir.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress value={job.progress} className="h-2" />
          <p className="text-[11px] text-gray-400 text-right">{Math.round(job.progress)}%</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}min ${rem}s` : `${mins}min`;
}
