/**
 * UnivenStyleWidgets.tsx — Cards inspirados no dashboard Univen
 *
 * 4 widgets reutilizáveis para o Dashboard:
 *   • AtendimentosPendentesCard — lista ou placeholder "Nenhum pendente"
 *   • CompromissosCard          — agenda de hoje + amanhã
 *   • BigCounterCard            — número grande (Meus imóveis / Meus clientes)
 *   • PretensaoBarChart         — barras horizontais Venda/Locação/Temporada/Permuta
 *
 * Todos recebem dados via props — mocks vivem no Dashboard.tsx para que a
 * Fase B (dados reais) substitua apenas o data source sem tocar nos
 * componentes de apresentação.
 */
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar as CalendarIcon,
  Info,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

/* ============================================================== */
/*  Atendimentos pendentes                                         */
/* ============================================================== */

export interface AtendimentoItem {
  id: string;
  clientName: string;
  scheduledAt: string; // ISO
  status: "pendente" | "atrasado";
  href: string;
}

interface AtendimentosPendentesCardProps {
  items: AtendimentoItem[];
  title?: string;
  scopeLabel?: string;
  loading?: boolean;
}

export function AtendimentosPendentesCard({
  items,
  title = "Atendimentos pendentes",
  scopeLabel = "Últimos 7 dias",
  loading = false,
}: AtendimentosPendentesCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#002B5B]">{title}</h3>
            {scopeLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {scopeLabel}
              </p>
            )}
          </div>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3 text-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento pendente
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id}>
                <Link
                  to={it.href}
                  className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        it.status === "atrasado"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[#002B5B]">
                        {it.clientName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(it.scheduledAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {it.status === "atrasado" && (
                    <Badge
                      variant="destructive"
                      className="text-[9px] shrink-0"
                    >
                      Atrasado
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================== */
/*  Compromissos (hoje + amanhã)                                   */
/* ============================================================== */

export interface CompromissoItem {
  id: string;
  title: string;
  startAt: string; // ISO
  location?: string;
  type: "visita" | "reuniao" | "ligacao" | "outro";
  href: string;
}

interface CompromissosCardProps {
  items: CompromissoItem[];
  title?: string;
  scopeLabel?: string;
  loading?: boolean;
}

const COMPROMISSO_STYLE: Record<
  CompromissoItem["type"],
  { bg: string; text: string; label: string }
> = {
  visita: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Visita" },
  reuniao: { bg: "bg-blue-100", text: "text-blue-700", label: "Reunião" },
  ligacao: { bg: "bg-amber-100", text: "text-amber-700", label: "Ligação" },
  outro: { bg: "bg-gray-100", text: "text-gray-700", label: "Outro" },
};

export function CompromissosCard({
  items,
  title = "Compromissos",
  scopeLabel = "Hoje e amanhã",
  loading = false,
}: CompromissosCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#002B5B]">{title}</h3>
            {scopeLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {scopeLabel}
              </p>
            )}
          </div>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3 text-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sem compromissos hoje ou amanhã
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => {
              const style = COMPROMISSO_STYLE[c.type];
              const when = new Date(c.startAt);
              return (
                <li key={c.id}>
                  <Link
                    to={c.href}
                    className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className={`flex flex-col items-center justify-center h-11 w-11 rounded-lg shrink-0 ${style.bg} ${style.text}`}
                    >
                      <span className="text-[10px] uppercase font-semibold leading-none">
                        {when.toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                      <span className="text-base font-bold leading-tight">
                        {when.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {when.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate mt-0.5 group-hover:text-[#002B5B]">
                        {c.title}
                      </p>
                      {c.location && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.location}
                        </p>
                      )}
                    </div>
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

/* ============================================================== */
/*  BigCounterCard — número gigante no meio                        */
/* ============================================================== */

export interface CounterStat {
  label: string;
  value: number | string;
  /** Se positivo, renderiza em verde (novos); se negativo, em vermelho (atrasados) */
  tone?: "positive" | "negative" | "neutral";
}

interface BigCounterCardProps {
  title: string;
  scopeLabel?: string;
  icon?: LucideIcon;
  mainValue: number | string;
  mainLabel?: string;
  stats?: CounterStat[];
  accent?: string;
  href?: string;
  loading?: boolean;
}

export function BigCounterCard({
  title,
  scopeLabel = "Todos",
  icon: Icon,
  mainValue,
  mainLabel,
  stats = [],
  accent = "#002B5B",
  href,
  loading = false,
}: BigCounterCardProps) {
  const body = (
    <CardContent className="p-5 flex flex-col h-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#002B5B]">{title}</h3>
          {scopeLabel && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ({scopeLabel})
            </p>
          )}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="h-12 w-24 rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <div
            className="text-5xl lg:text-6xl font-light leading-none tracking-tight"
            style={{ color: accent }}
          >
            {mainValue}
          </div>
          {mainLabel && (
            <p className="mt-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              {mainLabel}
            </p>
          )}
        </div>
      )}

      {stats.length > 0 && !loading && (
        <div className="mt-3 space-y-1.5 pt-3 border-t border-border">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">{s.label}</span>
              <span
                className={`font-bold ${
                  s.tone === "positive"
                    ? "text-blue-600"
                    : s.tone === "negative"
                      ? "text-red-600"
                      : "text-foreground"
                }`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  );

  return href ? (
    <Link to={href} className="block h-full">
      <Card className="h-full hover:shadow-md hover:border-[#002B5B]/30 transition-all cursor-pointer">
        {body}
      </Card>
    </Link>
  ) : (
    <Card className="h-full">{body}</Card>
  );
}

/* ============================================================== */
/*  PretensaoBarChart — barras CSS puras (sem lib externa)         */
/* ============================================================== */

export interface PretensaoItem {
  label: string; // "Venda", "Locação", "Temporada", "Permuta"
  value: number;
  color?: string;
}

interface PretensaoBarChartProps {
  title?: string;
  scopeLabel?: string;
  items: PretensaoItem[];
  loading?: boolean;
}

export function PretensaoBarChart({
  title = "Meus imóveis × Pretensão",
  scopeLabel = "Todos",
  items,
  loading = false,
}: PretensaoBarChartProps) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#002B5B]">{title}</h3>
            {scopeLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ({scopeLabel})
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-end gap-3 pt-3">
            {[60, 30, 10, 15].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-muted animate-pulse"
                  style={{ height: `${h}%` }}
                />
                <div className="h-2 w-8 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid horizontal de referência */}
            <div className="relative flex-1 min-h-[160px] pt-3">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-t border-dashed border-muted"
                  />
                ))}
              </div>

              {/* Barras */}
              <div className="relative h-full flex items-end justify-around gap-2">
                {items.map((it) => {
                  const pct = Math.round((it.value / max) * 100);
                  return (
                    <div
                      key={it.label}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[11px] font-semibold text-foreground">
                        {it.value}
                      </span>
                      <BarFill
                        heightPct={pct}
                        color={it.color ?? "#ef4444"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Labels embaixo */}
            <div className="mt-2 flex items-start justify-around gap-2">
              {items.map((it) => (
                <span
                  key={it.label}
                  className="flex-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {it.label}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* Helper: barra individual que seta a altura via ref (evita inline style lint) */
function BarFill({ heightPct, color }: { heightPct: number; color: string }) {
  return (
    <div
      className="w-full max-w-[40px] rounded-t transition-all"
      ref={(el) => {
        if (el) {
          el.style.height = `${heightPct}%`;
          el.style.backgroundColor = color;
          el.style.minHeight = heightPct > 0 ? "4px" : "0px";
        }
      }}
    />
  );
}
