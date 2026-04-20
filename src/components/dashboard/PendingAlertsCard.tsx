/**
 * PendingAlertsCard — Card de alertas de pendências
 *
 * Inspirado no "Alertas de pendências" do Univen: lista compacta de itens
 * operacionais que o corretor precisa resolver, com badge colorido
 * (vermelho se > 0, azul neutro se 0) e navegação ao clicar.
 *
 * Componente puro — recebe a lista de alertas pronta pelo consumer
 * (que é quem faz as queries no Supabase).
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

export interface PendingAlert {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  href: string;
  /** Severidade visual: critical (vermelho quando > 0) ou warning (âmbar quando > 0) */
  severity?: "critical" | "warning";
}

interface PendingAlertsCardProps {
  alerts: PendingAlert[];
  /** Título do card — default "Alertas de Pendências" */
  title?: string;
  /** Sub-rótulo ao lado do título */
  scopeLabel?: string;
  /** Se está carregando */
  loading?: boolean;
}

export function PendingAlertsCard({
  alerts,
  title = "Alertas de Pendências",
  scopeLabel = "Todos",
  loading = false,
}: PendingAlertsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#002B5B]" />
            <h3 className="text-sm font-bold text-[#002B5B]">{title}</h3>
            {scopeLabel && (
              <span className="text-[11px] text-muted-foreground">
                ({scopeLabel})
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-5 w-8 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              const hasPending = alert.count > 0;
              const severity = alert.severity ?? "critical";
              const badgeClass = hasPending
                ? severity === "warning"
                  ? "bg-amber-500 text-white"
                  : "bg-red-600 text-white"
                : "bg-blue-500 text-white";

              return (
                <li key={alert.id}>
                  <Link
                    to={alert.href}
                    className="flex items-center justify-between py-1.5 rounded-md -mx-1 px-1 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          hasPending
                            ? "text-gray-600"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-sm truncate ${
                          hasPending
                            ? "text-gray-800 group-hover:text-[#002B5B]"
                            : "text-muted-foreground"
                        }`}
                      >
                        {alert.label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center ${badgeClass}`}
                    >
                      {alert.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default PendingAlertsCard;
