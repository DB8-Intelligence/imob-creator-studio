/**
 * CreativePreview — exibe criativo gerado com acoes de download,
 * regenerar (consome credito) e agendar post (modal data/hora).
 */
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import {
  Download,
  RefreshCw,
  CalendarClock,
  Zap,
  Loader2,
  Check,
  ImageIcon,
} from "lucide-react";

interface CreativePreviewProps {
  /** URL da imagem gerada */
  imageUrl: string | null;
  /** Formato do criativo (para exibir no badge) */
  format?: string;
  /** Dimensoes (ex: "1080 x 1350") */
  dimensions?: string;
  /** Creditos que o regenerar consome */
  regenerateCost?: number;
  /** Callback para regenerar — chamado APOS credito consumido */
  onRegenerate?: () => void;
  /** Callback para agendar post */
  onSchedule?: (date: string, time: string) => void;
  /** Indica se esta gerando/regenerando */
  loading?: boolean;
}

export function CreativePreview({
  imageUrl,
  format,
  dimensions,
  regenerateCost = 1,
  onRegenerate,
  onSchedule,
  loading = false,
}: CreativePreviewProps) {
  const { data: plan } = useUserPlan();
  const consumeCredits = useConsumeCredits();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [downloading, setDownloading] = useState(false);

  const creditsRemaining = plan?.credits_remaining ?? 0;
  const canRegenerate = creditsRemaining >= regenerateCost && !loading;

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `criativo-${format ?? "post"}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [imageUrl, format]);

  // ── Regenerar ───────────────────────────────────────────────────────────────
  const handleRegenerate = useCallback(async () => {
    if (!canRegenerate) return;
    try {
      await consumeCredits.mutateAsync(regenerateCost);
      onRegenerate?.();
    } catch {
      // toast is handled by useConsumeCredits onError
    }
  }, [canRegenerate, consumeCredits, regenerateCost, onRegenerate]);

  // ── Agendar ─────────────────────────────────────────────────────────────────
  const handleScheduleConfirm = useCallback(() => {
    if (!scheduleDate || !scheduleTime) return;
    onSchedule?.(scheduleDate, scheduleTime);
    setScheduleOpen(false);
    setScheduleDate("");
    setScheduleTime("09:00");
  }, [scheduleDate, scheduleTime, onSchedule]);

  return (
    <div className="flex flex-col gap-4">
      {/* Credits badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {format && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[var(--ds-border)] font-mono">
              {format}
            </Badge>
          )}
          {dimensions && (
            <span className="text-[11px] text-[var(--ds-fg-subtle)]">{dimensions}</span>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[11px] px-2 py-0.5 h-5 gap-1",
            creditsRemaining > 0
              ? "border-amber-500/40 text-amber-400"
              : "border-red-500/40 text-red-400"
          )}
        >
          <Zap className="w-3 h-3" />
          {creditsRemaining} credito{creditsRemaining !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Image preview */}
      <div className="relative rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Criativo gerado"
            className={cn(
              "w-full h-auto object-contain transition-opacity",
              loading && "opacity-40"
            )}
          />
        ) : (
          <div className="w-full aspect-[4/5] flex flex-col items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 text-[var(--ds-cyan)] animate-spin" />
                <p className="text-sm text-[var(--ds-fg-muted)]">Gerando criativo...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-[var(--ds-fg-subtle)]" />
                <p className="text-sm text-[var(--ds-fg-subtle)]">Nenhum criativo gerado</p>
              </>
            )}
          </div>
        )}

        {/* Loading overlay on regenerate */}
        {loading && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-xs text-white font-medium">Regenerando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {imageUrl && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={!canRegenerate || consumeCredits.isPending}
            className={cn(
              "flex-1 border-[var(--ds-border)]",
              canRegenerate
                ? "text-[var(--ds-cyan)] hover:bg-[rgba(0,242,255,0.06)]"
                : "text-[var(--ds-fg-subtle)] opacity-50"
            )}
          >
            {consumeCredits.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Regenerar ({regenerateCost})
          </Button>

          {onSchedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleOpen(true)}
              className="flex-1 border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
            >
              <CalendarClock className="w-4 h-4" />
              Agendar
            </Button>
          )}
        </div>
      )}

      {/* Schedule modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)]">
          <DialogHeader>
            <DialogTitle>Agendar publicacao</DialogTitle>
            <DialogDescription className="text-[var(--ds-fg-muted)]">
              Escolha a data e horario para publicar este criativo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-xs font-semibold text-[var(--ds-fg-muted)] mb-1.5 block">
                Data
              </label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="bg-[var(--ds-surface)] border-[var(--ds-border)] text-[var(--ds-fg)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ds-fg-muted)] mb-1.5 block">
                Horario
              </label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="bg-[var(--ds-surface)] border-[var(--ds-border)] text-[var(--ds-fg)]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setScheduleOpen(false)}
              className="text-[var(--ds-fg-muted)]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleScheduleConfirm}
              disabled={!scheduleDate || !scheduleTime}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
