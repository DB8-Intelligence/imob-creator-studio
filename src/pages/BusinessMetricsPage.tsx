/**
 * /dashboard/metrics — Unified business metrics dashboard.
 * Tab 1: Financeiro (11C) — CAC, LTV, MRR, Churn, Payback
 * Tab 2: Escala       (11D) — Scaling rules, signal, budget guidance
 * Tab 3: Retargeting  (11E) — Audience segments + ad copy
 * Tab 4: Criativos    (11F) — High-performance creative specs
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  Loader2, CheckCircle2, XCircle, MinusCircle,
  Target, Repeat2, Film, ChevronDown, ChevronRight, Copy, Check,
} from "lucide-react";
import { motion } from "framer-motion";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/services/analytics/eventTracker";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import {
  SCALING_RULES, RETARGETING_AUDIENCES, HIGH_PERF_CREATIVES,
  LTV_BY_PLAN, scoreCreative,
  type ScalingSignal, type RetargetingAd,
} from "@/lib/businessMetrics";
import { copyToClipboard } from "@/lib/shareUtils";
import { StaggerChildren, fadeUpVariants } from "@/components/public/Animations";

// ── Formatting ────────────────────────────────────────────────────────────────

function brl(n: number) {
  return `R$\u00a0${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function pct(n: number) { return `${n.toFixed(1)}%`; }
function x(n: number)   { return `${n.toFixed(1)}x`; }
function mo(n: number)  { return `${n.toFixed(1)} meses`; }

// ── Signal colors ─────────────────────────────────────────────────────────────

const SIGNAL_STYLES: Record<ScalingSignal, { bg: string; text: string; border: string; icon: typeof CheckCircle2; label: string }> = {
  scale: { bg: "bg-emerald-500/8",   text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle2, label: "Escalar"  },
  hold:  { bg: "bg-amber-500/8",     text: "text-amber-400",   border: "border-amber-500/20",   icon: MinusCircle,  label: "Aguardar" },
  pause: { bg: "bg-red-500/8",       text: "text-red-400",     border: "border-red-500/20",     icon: XCircle,      label: "Pausar"   },
};

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, accent, trend }: {
  icon:    React.ElementType;
  label:   string;
  value:   string;
  sub?:    string;
  accent:  string;
  trend?:  "up" | "down" | "neutral";
}) {
  return (
    <motion.div variants={fadeUpVariants} className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-[var(--ds-fg-subtle)]"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 inline" /> : trend === "down" ? <ArrowDownRight className="w-3.5 h-3.5 inline" /> : null}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-[var(--ds-fg)]">{value}</p>
      <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: {color: string; name: string; value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--ds-bg)] border border-[var(--ds-border)] rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[var(--ds-fg)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[var(--ds-fg-muted)]" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? brl(p.value) : p.value?.toFixed?.(1) ?? p.value}
        </p>
      ))}
    </div>
  );
}

// ── Copy chip ─────────────────────────────────────────────────────────────────

function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await copyToClipboard(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)] transition-all"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Retargeting ad card ───────────────────────────────────────────────────────

function RetargetingAdCard({ ad }: { ad: RetargetingAd }) {
  const angleColors: Record<RetargetingAd["angle"], string> = {
    social_proof: "text-[var(--ds-cyan)]   border-[rgba(0,242,255,0.2)]   bg-[rgba(0,242,255,0.06)]",
    urgency:      "text-red-400           border-red-500/20              bg-red-500/5",
    benefit:      "text-[var(--ds-gold)]  border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.06)]",
    objection:    "text-[#C4B5FD]         border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.06)]",
  };
  const angleLabelMap: Record<RetargetingAd["angle"], string> = {
    social_proof: "Prova social",
    urgency:      "Urgência",
    benefit:      "Benefício",
    objection:    "Objeção",
  };
  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${angleColors[ad.angle]}`}>
            {angleLabelMap[ad.angle]}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] border border-[var(--ds-border)] text-[var(--ds-fg-subtle)] bg-[var(--ds-surface)]">
            {ad.format}
          </span>
        </div>
        <CopyChip text={`${ad.headline}\n\n${ad.body}\n\nCTA: ${ad.cta}`} />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-0.5">Headline</p>
        <p className="text-sm font-semibold text-[var(--ds-fg)]">{ad.headline}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-0.5">Body</p>
        <p className="text-xs text-[var(--ds-fg-muted)] leading-relaxed">{ad.body}</p>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-[var(--ds-border)]">
        <p className="text-xs font-semibold text-[var(--ds-gold)]">{ad.cta}</p>
        <CopyChip text={ad.cta} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════════════

// ── Tab: Financeiro (11C) ─────────────────────────────────────────────────────

function TabFinanceiro() {
  const { monthly, health, isLoading } = useBusinessMetrics();

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 text-[var(--ds-fg-muted)]">
      <Loader2 className="w-4 h-4 animate-spin mr-2" /><span className="text-sm">Carregando dados...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* KPIs */}
      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="MRR Atual"       value={brl(health.currentMrr)} sub={`ARR: ${brl(health.arr)}`}          accent="var(--ds-cyan)"  trend="up" />
        <KpiCard icon={Users}      label="Usuários Pagos"  value={String(health.activePaid)} sub={`ARPU: ${brl(health.arpu)}/mês`}  accent="#60C8FF" />
        <KpiCard icon={TrendingUp} label="Crescimento MoM" value={pct(health.monthlyGrowth)} sub="último mês"                       accent="#C4B5FD" trend={health.monthlyGrowth >= 0 ? "up" : "down"} />
        <KpiCard icon={DollarSign} label="Churn Mensal"    value={pct(health.churnRate)} sub="% usuários que saíram"                accent={health.churnRate <= 3 ? "#34D399" : health.churnRate <= 7 ? "var(--ds-gold)" : "#F87171"} trend={health.churnRate <= 3 ? "up" : "down"} />
      </StaggerChildren>

      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="CAC (último mês)" value={brl(health.cac)}          sub="custo por aquisição"    accent="var(--ds-gold)" />
        <KpiCard icon={DollarSign} label="LTV Estimado"     value={brl(health.ltv)}          sub="valor vitalício médio"  accent="#34D399" />
        <KpiCard icon={TrendingUp} label="LTV : CAC"        value={x(health.ltvCacRatio)}    sub="meta: ≥ 3x"             accent={health.ltvCacRatio >= 3 ? "#34D399" : health.ltvCacRatio >= 1 ? "var(--ds-gold)" : "#F87171"} trend={health.ltvCacRatio >= 3 ? "up" : "down"} />
        <KpiCard icon={DollarSign} label="Payback"          value={mo(health.paybackMonths)} sub="meses para recuperar CAC" accent={health.paybackMonths <= 6 ? "#34D399" : "var(--ds-gold)"} />
      </StaggerChildren>

      {/* MRR chart */}
      <div className="glass rounded-2xl p-6">
        <p className="text-sm font-semibold text-[var(--ds-fg)] mb-5">Evolução do MRR</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--ds-cyan)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--ds-cyan)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-fg-subtle)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ds-fg-subtle)" }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="mrr" name="MRR" stroke="var(--ds-cyan)" fill="url(#mrrGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CAC + Spend chart */}
      <div className="glass rounded-2xl p-6">
        <p className="text-sm font-semibold text-[var(--ds-fg)] mb-5">CAC × Investimento em Ads</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-fg-subtle)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ds-fg-subtle)" }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="totalAdSpend" name="Ad Spend (R$)" fill="rgba(212,175,55,0.5)" radius={[4,4,0,0]} />
            <Bar dataKey="cac"          name="CAC (R$)"      fill="rgba(0,242,255,0.5)"  radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LTV by plan */}
      <div className="glass rounded-2xl p-6">
        <p className="text-sm font-semibold text-[var(--ds-fg)] mb-4">LTV Estimado por Plano</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(LTV_BY_PLAN).map(([tier, data]) => (
            <div key={tier} className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2 capitalize">{tier}</p>
              <p className="text-lg font-bold text-[var(--ds-fg)]">{brl(data.ltv)}</p>
              <p className="text-xs text-[var(--ds-fg-muted)]">{brl(data.monthly)}/mês</p>
              <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-0.5">×{data.avgLifetimeMonths} meses</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Escala (11D) ─────────────────────────────────────────────────────────

function TabEscala() {
  const { health, scalingEvals, overallSignal } = useBusinessMetrics();
  const ss = SIGNAL_STYLES[overallSignal];
  const Icon = ss.icon;

  const triggeredRules  = scalingEvals.filter((e) => e.triggered);
  const scaleSignals    = triggeredRules.filter((e) => e.rule.signal === "scale");
  const holdSignals     = triggeredRules.filter((e) => e.rule.signal === "hold");
  const pauseSignals    = triggeredRules.filter((e) => e.rule.signal === "pause");

  return (
    <div className="flex flex-col gap-6">
      {/* Overall signal */}
      <div className={`rounded-2xl border p-6 ${ss.bg} ${ss.border}`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-6 h-6 ${ss.text}`} />
          <div>
            <p className={`text-lg font-bold ${ss.text}`}>Sinal atual: {ss.label}</p>
            <p className="text-xs text-[var(--ds-fg-muted)]">
              {overallSignal === "scale" && "Métricas saudáveis — seguro para aumentar investimento 20–30%"}
              {overallSignal === "hold"  && "Métricas aceitáveis — mantenha budget e otimize conversão"}
              {overallSignal === "pause" && "Métricas críticas — reduza ou pause campanhas e corrija o problema"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "LTV:CAC",  value: x(health.ltvCacRatio) },
            { label: "Churn",    value: pct(health.churnRate) },
            { label: "CAC",      value: brl(health.cac) },
            { label: "Payback",  value: mo(health.paybackMonths) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--ds-border)] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--ds-fg-subtle)]">{m.label}</p>
              <p className="text-sm font-bold text-[var(--ds-fg)] mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Triggered rules by signal */}
      {[
        { list: scaleSignals, title: "Sinais positivos — escale isso", color: "#34D399" },
        { list: holdSignals,  title: "Sinais de atenção — monitore",   color: "var(--ds-gold)" },
        { list: pauseSignals, title: "Sinais críticos — ação necessária", color: "#F87171" },
      ].filter((g) => g.list.length > 0).map((group) => (
        <div key={group.title}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: group.color }}>{group.title}</p>
          <div className="flex flex-col gap-2">
            {group.list.map(({ rule, value }) => (
              <div key={rule.id} className="glass rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ds-fg)]">{rule.label}</p>
                    <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{rule.description}</p>
                  </div>
                  {value !== null && (
                    <span className="text-xs font-mono text-[var(--ds-fg-subtle)] shrink-0">
                      atual: {rule.unit === "R$" ? brl(value) : rule.unit === "%" ? pct(value) : rule.unit === "x" ? x(value) : `${value.toFixed(1)} ${rule.unit}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* All rules reference table */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-4">Todas as regras de escala</p>
        <div className="flex flex-col gap-2">
          {SCALING_RULES.map((rule) => {
            const ss2 = SIGNAL_STYLES[rule.signal];
            const Ic  = ss2.icon;
            return (
              <div key={rule.id} className="flex items-start gap-3 py-2 border-b border-[var(--ds-border)] last:border-0">
                <Ic className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${ss2.text}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--ds-fg)]">{rule.label}</p>
                  <p className="text-[11px] text-[var(--ds-fg-muted)]">{rule.description}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${ss2.bg} ${ss2.border} ${ss2.text}`}>{ss2.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Retargeting (11E) ────────────────────────────────────────────────────

function TabRetargeting() {
  const [openId, setOpenId] = useState<string | null>(RETARGETING_AUDIENCES[0].id);

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-5 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">Como usar</p>
        <p className="text-sm text-[var(--ds-fg-muted)]">
          Configure os pixels do Meta e Google apontando para as páginas abaixo. Cada segmento já tem
          a audiência definida e os criativos prontos para copiar.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {["/", "/auth", "/lp/*", "/dashboard", "/planos"].map((p) => (
            <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-[var(--ds-border)] text-[var(--ds-fg-muted)] bg-[var(--ds-surface)]">{p}</span>
          ))}
        </div>
      </div>

      {RETARGETING_AUDIENCES.map((aud) => {
        const isOpen = openId === aud.id;
        const urgencyColor = aud.urgency === "high" ? "#F87171" : aud.urgency === "medium" ? "var(--ds-gold)" : "#34D399";
        return (
          <div key={aud.id} className="glass rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : aud.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Repeat2 className="w-4 h-4 text-[var(--ds-fg-subtle)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--ds-fg)]">{aud.label}</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">{aud.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: urgencyColor, borderColor: urgencyColor + "40", background: urgencyColor + "10" }}>
                  urgência {aud.urgency === "high" ? "alta" : aud.urgency === "medium" ? "média" : "baixa"}
                </span>
                <span className="text-[11px] text-[var(--ds-fg-subtle)]">{aud.adAngles.length} ads</span>
                {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--ds-fg-subtle)]" /> : <ChevronRight className="w-4 h-4 text-[var(--ds-fg-subtle)]" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 border-t border-[var(--ds-border)]">
                <div className="mt-4 mb-4 rounded-xl bg-[var(--ds-surface)] border border-[var(--ds-border)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Estratégia</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">{aud.strategy}</p>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-3">Criativos ({aud.adAngles.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aud.adAngles.map((ad, i) => (
                    <RetargetingAdCard key={i} ad={ad} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Criativos (11F) ──────────────────────────────────────────────────────

function TabCreativos() {
  const [active, setActive] = useState(HIGH_PERF_CREATIVES[0].id);
  const cr = HIGH_PERF_CREATIVES.find((c) => c.id === active) ?? HIGH_PERF_CREATIVES[0];

  // Demo score for display
  const { score, signal, label } = scoreCreative(3.2, 1.8, 2.5);

  return (
    <div className="flex flex-col gap-6">
      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {HIGH_PERF_CREATIVES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active === c.id
                ? "bg-[rgba(0,242,255,0.1)] text-[var(--ds-cyan)] border border-[rgba(0,242,255,0.25)]"
                : "glass text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
            }`}
          >
            <Film className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
            {c.label}
          </button>
        ))}
      </div>

      {/* Active creative */}
      <div className="glass rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-[var(--ds-fg)]">{cr.label}</p>
            <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{cr.objective}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {cr.duration && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--ds-border)] text-[var(--ds-fg-subtle)]">{cr.duration}</span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">CTR: {cr.expectedCtr}</span>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-1.5">
          {cr.platforms.map((p) => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-subtle)]">{p}</span>
          ))}
        </div>

        {/* Structure */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">Estrutura de cenas</p>
          <ol className="flex flex-col gap-1.5">
            {cr.structure.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--ds-fg-muted)]">
                <span className="w-5 h-5 rounded-full bg-[rgba(0,242,255,0.08)] text-[var(--ds-cyan)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* Copy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Headline</p>
              <CopyChip text={cr.headline} />
            </div>
            <p className="text-sm font-semibold text-[var(--ds-fg)]">{cr.headline}</p>
          </div>
          <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Body</p>
              <CopyChip text={cr.body} />
            </div>
            <p className="text-xs text-[var(--ds-fg-muted)] leading-relaxed">{cr.body}</p>
          </div>
          <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Hooks alternativos</p>
              <CopyChip text={cr.hooks.join("\n")} />
            </div>
            {cr.hooks.map((h, i) => (
              <p key={i} className="text-[11px] text-[var(--ds-fg-muted)] italic border-b border-[var(--ds-border)] last:border-0 py-1">"{h}"</p>
            ))}
          </div>
        </div>

        {/* Production note */}
        <div className="rounded-xl bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.15)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-gold)] mb-1">Nota de produção</p>
          <p className="text-xs text-[var(--ds-fg-muted)]">{cr.productionNote}</p>
        </div>

        {/* Formula */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Fórmula:</span>
          <span className="text-xs text-[var(--ds-fg-muted)] italic">{cr.copyFormula}</span>
        </div>
      </div>

      {/* Score demo */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-3">Exemplo: Pontuação de Performance de Criativo</p>
        <p className="text-xs text-[var(--ds-fg-muted)] mb-4">
          Use esse score para decidir qual criativo duplicar (escalar), testar variações (hold) ou pausar.
          Alimentado por: CTR, custo por clique, taxa de conversão.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: signal === "scale" ? "#34D399" : signal === "hold" ? "var(--ds-gold)" : "#F87171" }}
            />
          </div>
          <span className="text-sm font-bold text-[var(--ds-fg)] shrink-0">{score}/100</span>
          <span className={`text-xs font-semibold shrink-0 ${SIGNAL_STYLES[signal].text}`}>{label}</span>
        </div>
        <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-2">
          Exemplo com CTR 3.2% / CPC R$1.80 / Conversão 2.5%
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

type Tab = "financeiro" | "escala" | "retargeting" | "criativos";

const TABS: { key: Tab; label: string; icon: React.ElementType; badge: string }[] = [
  { key: "financeiro",  label: "Financeiro",  icon: DollarSign, badge: "11C" },
  { key: "escala",      label: "Escala",      icon: TrendingUp, badge: "11D" },
  { key: "retargeting", label: "Retargeting", icon: Repeat2,    badge: "11E" },
  { key: "criativos",   label: "Criativos",   icon: Film,       badge: "11F" },
];

export default function BusinessMetricsPage() {
  const { user }   = useAuth();
  const [tab, setTab] = useState<Tab>("financeiro");

  useEffect(() => {
    if (user) trackEvent(user.id, "analytics_viewed", { metadata: { section: "business_metrics" } });
  }, [user]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--ds-bg)] section-px py-10">
        <div className="section-container max-w-4xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[var(--ds-gold)]" />
              <h1 className="text-xl font-bold text-[var(--ds-fg)]">Métricas de Negócio</h1>
            </div>
            <p className="text-[var(--ds-fg-muted)] text-sm">
              CAC · LTV · MRR · Churn · Escala · Retargeting · Criativos de Alta Performance
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-2xl bg-[var(--ds-surface)] border border-[var(--ds-border)] mb-8 overflow-x-auto">
            {TABS.map((t) => {
              const Ic = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                    tab === t.key
                      ? "bg-[rgba(0,242,255,0.08)] text-[var(--ds-cyan)] border border-[rgba(0,242,255,0.2)]"
                      : "text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
                  }`}
                >
                  <Ic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--ds-fg-subtle)]">{t.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "financeiro"  && <TabFinanceiro />}
          {tab === "escala"      && <TabEscala />}
          {tab === "retargeting" && <TabRetargeting />}
          {tab === "criativos"   && <TabCreativos />}

        </div>
      </div>
    </AppLayout>
  );
}
