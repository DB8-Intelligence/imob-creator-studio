/**
 * /dashboard/campaigns — Internal campaign builder.
 * Browse Meta + Google campaign structures, generate UTM links,
 * copy ad copy variants, and export briefs.
 */
import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
  Target, Search, Megaphone, Filter, Globe, DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/app/AppLayout";
import { buildShareUrl } from "@/lib/shareUtils";
import { copyToClipboard } from "@/lib/shareUtils";
import {
  META_CAMPAIGNS, GOOGLE_CAMPAIGNS, DAILY_BUDGET_TOTAL_BRL,
  type AdCampaign, type GoogleCampaign, type CopyVariant,
} from "@/lib/adCampaigns";

// ── Helpers ───────────────────────────────────────────────────────────────────

const APP_BASE =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://app.db8intelligence.com.br";

function buildUtmUrl(destination: string, source: string, medium: string, campaign: string): string {
  const url = new URL(`${APP_BASE}${destination}`);
  url.searchParams.set("utm_source",   source);
  url.searchParams.set("utm_medium",   medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

// ── Copy chip ─────────────────────────────────────────────────────────────────

function CopyChip({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)] hover:text-[var(--ds-fg)] transition-all"
      title={`Copiar ${label ?? "texto"}`}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {label ?? "Copiar"}
    </button>
  );
}

// ── UTM Link row ──────────────────────────────────────────────────────────────

function UtmRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center gap-2 bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-xl px-3 py-2">
      <Globe className="w-3.5 h-3.5 text-[var(--ds-fg-subtle)] shrink-0" />
      <span className="font-mono text-[11px] text-[var(--ds-fg-muted)] truncate flex-1">{url}</span>
      <button onClick={handle} className="shrink-0 text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[var(--ds-fg-subtle)] hover:text-[var(--ds-cyan)]">
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ── Copy variant card ─────────────────────────────────────────────────────────

function CopyCard({ variant, platform }: { variant: CopyVariant; platform: "meta" | "google" }) {
  const accentCls = platform === "meta"
    ? "bg-[rgba(0,178,255,0.08)] text-[#60C8FF] border-[rgba(0,178,255,0.2)]"
    : "bg-[rgba(52,211,153,0.08)] text-emerald-400 border-[rgba(52,211,153,0.2)]";

  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${accentCls}`}>
          Variante {variant.id}
        </span>
        <CopyChip text={`${variant.headline}\n\n${variant.body}\n\nCTA: ${variant.cta}`} label="Copiar tudo" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-1">Headline</p>
        <p className="text-sm font-semibold text-[var(--ds-fg)]">{variant.headline}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-1">Body</p>
        <p className="text-xs text-[var(--ds-fg-muted)] leading-relaxed">{variant.body}</p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[var(--ds-fg-subtle)] uppercase tracking-wider mb-0.5">CTA</p>
          <p className="text-xs font-semibold text-[var(--ds-gold)]">{variant.cta}</p>
        </div>
        <CopyChip text={variant.cta} label="CTA" />
      </div>
    </div>
  );
}

// ── Meta campaign accordion ───────────────────────────────────────────────────

function MetaCampaignCard({ campaign }: { campaign: AdCampaign }) {
  const [open,         setOpen]         = useState(false);
  const [activeCreative, setActiveCreative] = useState(0);

  const utmUrl = buildUtmUrl(campaign.destination, campaign.utmSource, campaign.utmMedium, campaign.utmCampaign);
  const cr      = campaign.creatives[activeCreative];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,178,255,0.1)] flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-[#60C8FF]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ds-fg)]">{campaign.name}</p>
            <p className="text-xs text-[var(--ds-fg-muted)]">{campaign.icp}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--ds-fg-subtle)] font-mono hidden md:inline">{campaign.destination}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(0,178,255,0.08)] text-[#60C8FF] border border-[rgba(0,178,255,0.2)]">
            {campaign.creatives.length} criativos
          </span>
          {open ? <ChevronDown className="w-4 h-4 text-[var(--ds-fg-subtle)]" /> : <ChevronRight className="w-4 h-4 text-[var(--ds-fg-subtle)]" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-5 border-t border-[var(--ds-border)]">
              {/* Meta info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Destino</p>
                  <p className="text-xs text-[var(--ds-fg-muted)] font-mono">{campaign.destination}</p>
                </div>
                <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Budget</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">{campaign.budgetNote}</p>
                </div>
                <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Targeting</p>
                  <p className="text-xs text-[var(--ds-fg-muted)] line-clamp-2">{campaign.targetingNote}</p>
                </div>
              </div>

              {/* UTM URL */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">Link com UTM</p>
                <UtmRow url={utmUrl} />
              </div>

              {/* Creative selector */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">
                  Criativos ({campaign.creatives.length})
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.creatives.map((cr, i) => (
                    <button
                      key={cr.id}
                      onClick={() => setActiveCreative(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        i === activeCreative
                          ? "bg-[rgba(0,178,255,0.12)] text-[#60C8FF] border border-[rgba(0,178,255,0.3)]"
                          : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
                      }`}
                    >
                      #{i + 1} {cr.concept.split(" — ")[0]}
                    </button>
                  ))}
                </div>

                {/* Active creative detail */}
                <div className="glass rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--ds-fg)]">{cr.concept}</p>
                    <p className="text-[11px] text-[var(--ds-fg-muted)] mt-0.5 italic">"{cr.hook}"</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Formatos</p>
                    <div className="flex gap-1.5">
                      {cr.format.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(212,175,55,0.08)] text-[var(--ds-gold)] border border-[rgba(212,175,55,0.2)]">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Brief visual</p>
                    <p className="text-xs text-[var(--ds-fg-muted)]">{cr.visualNote}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                    {cr.copy.map((v) => (
                      <CopyCard key={v.id} variant={v} platform="meta" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Google campaign accordion ─────────────────────────────────────────────────

function GoogleCampaignCard({ campaign }: { campaign: GoogleCampaign }) {
  const [open, setOpen] = useState(false);
  const ag = campaign.adGroups[0];
  const utmUrl = buildUtmUrl(ag.finalUrl, "google", "cpc", campaign.utmCampaign);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(52,211,153,0.08)] flex items-center justify-center">
            <Search className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ds-fg)]">{campaign.name}</p>
            <p className="text-xs text-[var(--ds-fg-muted)]">{ag.keywords.length} keywords · {ag.headlines.length} headlines</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--ds-fg-subtle)] font-mono hidden md:inline">{ag.finalUrl}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.06)] text-emerald-400 border border-[rgba(52,211,153,0.2)]">
            Search
          </span>
          {open ? <ChevronDown className="w-4 h-4 text-[var(--ds-fg-subtle)]" /> : <ChevronRight className="w-4 h-4 text-[var(--ds-fg-subtle)]" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-5 border-t border-[var(--ds-border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Budget</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">{campaign.budgetNote}</p>
                </div>
                <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-1">Targeting</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">{campaign.targetingNote}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">Link com UTM</p>
                <UtmRow url={utmUrl} />
              </div>

              {/* Keywords */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)] mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {ag.keywords.map((kw) => (
                    <span key={kw.keyword} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)]">
                      <span className={`w-1.5 h-1.5 rounded-full ${kw.matchType === "exact" ? "bg-[var(--ds-gold)]" : kw.matchType === "phrase" ? "bg-[var(--ds-cyan)]" : "bg-[var(--ds-fg-subtle)]"}`} />
                      {kw.keyword}
                      <span className="text-[var(--ds-fg-subtle)]">{kw.bid}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--ds-fg-subtle)] mt-2">
                  <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--ds-gold)] inline-block" /> Exata</span>
                  <span className="ml-3 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--ds-cyan)] inline-block" /> Frase</span>
                  <span className="ml-3 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--ds-fg-subtle)] inline-block" /> Ampla</span>
                </p>
              </div>

              {/* Headlines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Headlines ({ag.headlines.length}/15)</p>
                  <CopyChip text={ag.headlines.join("\n")} label="Copiar todas" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ag.headlines.map((h) => (
                    <span key={h} className="px-2.5 py-1 rounded-lg text-xs bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)]">{h}</span>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-subtle)]">Descrições ({ag.descriptions.length}/4)</p>
                  <CopyChip text={ag.descriptions.join("\n\n")} label="Copiar todas" />
                </div>
                <div className="flex flex-col gap-2">
                  {ag.descriptions.map((d, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--ds-surface)] border border-[var(--ds-border)]">
                      <p className="text-xs text-[var(--ds-fg-muted)] flex-1">{d}</p>
                      <CopyChip text={d} label="Copiar" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignBuilderPage() {
  const [tab, setTab]       = useState<"meta" | "google">("meta");
  const [search, setSearch] = useState("");

  const filteredMeta = useMemo(() =>
    META_CAMPAIGNS.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.icp.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const filteredGoogle = useMemo(() =>
    GOOGLE_CAMPAIGNS.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--ds-bg)] section-px py-10">
        <div className="section-container max-w-4xl">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[var(--ds-cyan)]" />
              <h1 className="text-xl font-bold text-[var(--ds-fg)]">Estrutura de Campanhas</h1>
            </div>
            <p className="text-[var(--ds-fg-muted)] text-sm">
              Campanhas Meta Ads + Google Ads com copy, targeting e links UTM prontos.
            </p>

            {/* Budget summary */}
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] w-fit">
              <DollarSign className="w-4 h-4 text-[var(--ds-gold)]" />
              <span className="text-sm text-[var(--ds-fg-muted)]">
                Budget total estimado: <span className="font-semibold text-[var(--ds-fg)]">R$ {DAILY_BUDGET_TOTAL_BRL}/dia</span>
                <span className="text-[var(--ds-fg-subtle)] ml-1">(R$ {(DAILY_BUDGET_TOTAL_BRL * 30).toLocaleString("pt-BR")}/mês)</span>
              </span>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--ds-surface)] border border-[var(--ds-border)]">
              {(["meta", "google"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t
                      ? "bg-[rgba(0,242,255,0.08)] text-[var(--ds-cyan)] border border-[rgba(0,242,255,0.2)]"
                      : "text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
                  }`}
                >
                  {t === "meta" ? "Meta Ads" : "Google Ads"} ({t === "meta" ? META_CAMPAIGNS.length : GOOGLE_CAMPAIGNS.length})
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ds-fg-subtle)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar campanhas..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] text-sm text-[var(--ds-fg)] placeholder-[var(--ds-fg-subtle)] focus:outline-none focus:border-[var(--ds-border-2)]"
              />
            </div>
          </div>

          {/* Campaign list */}
          <div className="flex flex-col gap-4">
            {tab === "meta"
              ? filteredMeta.map((c) => <MetaCampaignCard key={c.id} campaign={c} />)
              : filteredGoogle.map((c) => <GoogleCampaignCard key={c.id} campaign={c} />)
            }
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
