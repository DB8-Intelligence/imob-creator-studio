import { useRef, useEffect, useState } from "react";
import type { AttributionMetrics, AttributionRow } from "@/services/analytics/attributionQueries";
import { GitBranch, MousePointerClick, TrendingUp } from "lucide-react";

// ─── Touch model toggle ───────────────────────────────────────────────────────

type TouchModel = "first" | "last";

interface TouchToggleProps {
  model:   TouchModel;
  onChange: (m: TouchModel) => void;
}

function TouchToggle({ model, onChange }: TouchToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden text-xs font-medium">
      <button
        type="button"
        onClick={() => onChange("first")}
        className={`px-3 py-1.5 transition-colors ${model === "first" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        First Touch
      </button>
      <button
        type="button"
        onClick={() => onChange("last")}
        className={`px-3 py-1.5 transition-colors ${model === "last" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        Last Touch
      </button>
    </div>
  );
}

// ─── Bar row ─────────────────────────────────────────────────────────────────

interface AttrBarRowProps {
  row:      AttributionRow;
  maxCount: number;
}

function AttrBarRow({ row, maxCount }: AttrBarRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0;

  useEffect(() => {
    ref.current?.style.setProperty("--attr-pct", `${pct}%`);
  }, [pct]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{row.key}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div ref={ref} className="attr-bar-fill h-full rounded-full bg-accent" />
      </div>
      <span className="text-xs font-medium text-foreground w-8 text-right">{row.count}</span>
    </div>
  );
}

// ─── Dimension card ───────────────────────────────────────────────────────────

interface DimCardProps {
  title: string;
  rows:  AttributionRow[];
}

function DimCard({ title, rows }: DimCardProps) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-sm font-semibold text-foreground mb-4">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem dados</p>
      ) : (
        <div className="space-y-2.5">
          {rows.slice(0, 8).map((r) => (
            <AttrBarRow key={r.key} row={r} maxCount={max} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Coverage card ────────────────────────────────────────────────────────────

function CoverageCard({ totalSignups, trackedPct }: { totalSignups: number; trackedPct: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-accent/10">
        <TrendingUp className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{trackedPct}%</p>
        <p className="text-xs text-muted-foreground">
          de {totalSignups} cadastros com UTM rastreado
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AttributionDashboardProps {
  data:       AttributionMetrics;
  isLoading?: boolean;
}

export function AttributionDashboard({ data, isLoading }: AttributionDashboardProps) {
  const [model, setModel] = useState<TouchModel>("first");

  const src      = model === "first" ? data.by_source      : data.lt_by_source;
  const med      = model === "first" ? data.by_medium      : data.lt_by_medium;
  const campaign = model === "first" ? data.by_campaign    : data.lt_by_campaign;
  const landing  = model === "first" ? data.by_landing     : data.lt_by_landing;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">Modelo de atribuição</span>
        </div>
        <TouchToggle model={model} onChange={setModel} />
      </div>

      {/* Coverage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CoverageCard totalSignups={data.total_signups} trackedPct={data.tracked_pct} />
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-violet-500/10">
            <MousePointerClick className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.total_signups}</p>
            <p className="text-xs text-muted-foreground">total de cadastros</p>
          </div>
        </div>
      </div>

      {/* Dimension grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DimCard title="Por Canal (utm_source)"   rows={src}      />
        <DimCard title="Por Mídia (utm_medium)"   rows={med}      />
        <DimCard title="Por Campanha"             rows={campaign} />
        <DimCard title="Por Landing Page"         rows={landing}  />
      </div>
    </div>
  );
}
