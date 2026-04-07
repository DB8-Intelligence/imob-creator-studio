/**
 * PropertyVisitsTab.tsx — Aba "Histórico de Visitas" no editor de imóvel
 *
 * Timeline de visitas + notas + taxa de conversão.
 */
import { Badge } from "@/components/ui/badge";
import { CalendarDays, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_CONFIG } from "@/types/appointment";
import type { PropertyVisitSummary } from "@/hooks/usePropertyMAX";

interface PropertyVisitsTabProps {
  visits: PropertyVisitSummary[];
  taxaConversao: number;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const RESULTADO_EMOJI: Record<string, string> = {
  gostou_muito: "🤩", gostou: "😊", neutro: "😐", nao_gostou: "😕",
};

export function PropertyVisitsTab({ visits, taxaConversao }: PropertyVisitsTabProps) {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-accent" />
          <span className="font-semibold text-foreground">{visits.length} visita{visits.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-muted-foreground">Taxa de conversão: <span className="font-bold text-foreground">{taxaConversao}%</span></span>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma visita registrada para este imóvel.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit, idx) => {
            const statusCfg = APPOINTMENT_STATUS_CONFIG[visit.status as keyof typeof APPOINTMENT_STATUS_CONFIG];

            return (
              <div key={visit.id} className="flex gap-3 relative">
                {/* Line */}
                {idx < visits.length - 1 && <div className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />}

                {/* Icon */}
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10", statusCfg?.bgColor ?? "bg-muted")}>
                  <span className="text-sm">{statusCfg?.emoji ?? "📅"}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{visit.lead_nome}</span>
                    <Badge variant="outline" className={cn("text-[10px]", statusCfg?.bgColor)}>
                      {statusCfg?.label ?? visit.status}
                    </Badge>
                    {visit.resultado && (
                      <span className="text-xs">{RESULTADO_EMOJI[visit.resultado] ?? ""} {visit.resultado.replace(/_/g, " ")}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(visit.data_hora)}</p>
                  {visit.notas && (
                    <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 rounded-lg px-2.5 py-1.5">{visit.notas}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
