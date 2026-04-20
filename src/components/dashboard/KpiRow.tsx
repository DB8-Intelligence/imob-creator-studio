/**
 * KpiRow — Linha de 4 KPIs rápidos no topo do Dashboard
 *
 * Números grandes estilo cards financeiros (inspiração Univen):
 * leads do mês, imóveis ativos, visitas no site, taxa de conversão.
 *
 * Componente puro — recebe os valores já calculados pelo consumer.
 */
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

export interface KpiItem {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Cor de destaque (ícone + delta) — ex: "#002B5B" */
  accent?: string;
  /** Variação vs período anterior (opcional). Positivo, negativo ou 0 */
  deltaPercent?: number | null;
  /** Sufixo do valor (ex: "%", "R$") */
  suffix?: string;
  /** Prefixo do valor (ex: "R$ ") */
  prefix?: string;
  /** Link pra drill-down */
  href?: string;
}

interface KpiRowProps {
  items: KpiItem[];
  loading?: boolean;
}

export function KpiRow({ items, loading = false }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {loading
        ? [0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-3 w-20 bg-muted rounded animate-pulse mb-3" />
                <div className="h-7 w-14 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        : items.map((kpi) => {
            const Icon = kpi.icon;
            const accent = kpi.accent ?? "#002B5B";
            const delta = kpi.deltaPercent;
            const hasDelta = typeof delta === "number";
            const DeltaIcon = !hasDelta
              ? Minus
              : delta > 0
                ? TrendingUp
                : delta < 0
                  ? TrendingDown
                  : Minus;
            const deltaColor = !hasDelta
              ? "text-muted-foreground"
              : delta > 0
                ? "text-emerald-600"
                : delta < 0
                  ? "text-red-600"
                  : "text-muted-foreground";

            const content = (
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${accent}14`, color: accent }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  {kpi.prefix && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {kpi.prefix}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-[#002B5B] leading-none">
                    {kpi.value}
                  </span>
                  {kpi.suffix && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {kpi.suffix}
                    </span>
                  )}
                </div>
                {hasDelta && (
                  <div
                    className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${deltaColor}`}
                  >
                    <DeltaIcon className="h-3 w-3" />
                    {delta > 0 ? "+" : ""}
                    {delta}% vs mês anterior
                  </div>
                )}
              </CardContent>
            );

            return kpi.href ? (
              <Link
                key={kpi.id}
                to={kpi.href}
                className="group block hover:shadow-md transition-shadow rounded-lg"
              >
                <Card className="h-full group-hover:border-[#002B5B]/30 transition-colors">
                  {content}
                </Card>
              </Link>
            ) : (
              <Card key={kpi.id}>{content}</Card>
            );
          })}
    </div>
  );
}

export default KpiRow;
