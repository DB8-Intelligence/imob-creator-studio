/**
 * AdminBugsPage — lista e faz triage dos bugs reportados.
 * Rota: /admin/bugs (protegida por useIsSuperAdmin).
 *
 * Filtros por severidade e status. Cards expansíveis com contexto
 * completo + timeline das chamadas de rede que o usuário fez antes
 * de reportar (destaca em vermelho as que falharam).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bug, Loader2, ShieldOff, ChevronDown, ChevronRight, Globe,
  Monitor, Calendar, User, RefreshCw, Save, Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { supabase } from "@/integrations/supabase/client";
import { getBugScreenshotUrl } from "@/lib/bugReporter";
import {
  SEVERITY_LABELS, STATUS_LABELS,
  type BugContext, type BugReport, type BugSeverity, type BugStatus,
} from "@/types/bug-report";

interface BugRowWithEmail extends BugReport {
  user_email?: string | null;
}

export default function AdminBugsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsSuperAdmin();
  const { toast } = useToast();

  const [bugs, setBugs] = useState<BugRowWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSev, setFilterSev] = useState<BugSeverity | "all">("all");
  const [filterStatus, setFilterStatus] = useState<BugStatus | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Busca emails em batch (admin_roles não dá acesso a auth.users diretamente,
    // mas super_admin tem acesso via service role se necessário — aqui deixa null
    // se não conseguir resolver)
    const rows = (data as unknown as BugReport[]) || [];
    setBugs(rows.map((r) => ({ ...r })));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isAdmin) fetchBugs();
  }, [isAdmin, fetchBugs]);

  const filtered = useMemo(() => {
    return bugs.filter((b) => {
      if (filterSev !== "all" && b.severity !== filterSev) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      return true;
    });
  }, [bugs, filterSev, filterStatus]);

  const stats = useMemo(() => {
    const s: Record<BugStatus, number> = {
      new: 0, investigating: 0, fixed: 0, wont_fix: 0,
    };
    bugs.forEach((b) => { s[b.status] = (s[b.status] || 0) + 1; });
    return s;
  }, [bugs]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function updateStatus(bug: BugRowWithEmail, status: BugStatus) {
    setSavingId(bug.id);
    const { error } = await supabase
      .from("bug_reports")
      .update({ status })
      .eq("id", bug.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setBugs((prev) => prev.map((b) => (b.id === bug.id ? { ...b, status } : b)));
    toast({ title: `Status → ${STATUS_LABELS[status].label}` });
  }

  async function saveNote(bug: BugRowWithEmail) {
    const note = noteDraft[bug.id] ?? bug.admin_notes ?? "";
    setSavingId(bug.id);
    const { error } = await supabase
      .from("bug_reports")
      .update({ admin_notes: note || null })
      .eq("id", bug.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setBugs((prev) =>
      prev.map((b) =>
        b.id === bug.id ? { ...b, admin_notes: note || null } : b
      )
    );
    toast({ title: "Anotação salva" });
  }

  if (adminLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-md py-24 text-center">
          <ShieldOff className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="mb-2 text-xl font-bold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Esta página é apenas para super_admins do sistema.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Bug className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bug Reports</h1>
              <p className="text-sm text-muted-foreground">
                Bugs e sugestões enviados pelos usuários via widget in-app.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={fetchBugs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.keys(STATUS_LABELS) as BugStatus[]).map((s) => (
            <Card key={s}>
              <CardContent className="pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABELS[s].label}
                </p>
                <p className="mt-1 text-2xl font-bold">{stats[s]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Severidade:
          </span>
          <FilterButton active={filterSev === "all"} onClick={() => setFilterSev("all")}>
            Todas
          </FilterButton>
          {(Object.keys(SEVERITY_LABELS) as BugSeverity[]).map((s) => (
            <FilterButton
              key={s}
              active={filterSev === s}
              onClick={() => setFilterSev(s)}
            >
              {SEVERITY_LABELS[s].emoji} {SEVERITY_LABELS[s].label}
            </FilterButton>
          ))}

          <span className="ml-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status:
          </span>
          <FilterButton
            active={filterStatus === "all"}
            onClick={() => setFilterStatus("all")}
          >
            Todos
          </FilterButton>
          {(Object.keys(STATUS_LABELS) as BugStatus[]).map((s) => (
            <FilterButton
              key={s}
              active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
            >
              {STATUS_LABELS[s].label}
            </FilterButton>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <Bug className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {bugs.length === 0
                ? "Nenhum bug reportado ainda."
                : "Nenhum resultado com esses filtros."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bug) => (
              <BugCard
                key={bug.id}
                bug={bug}
                expanded={expanded.has(bug.id)}
                onToggle={() => toggleExpanded(bug.id)}
                onStatusChange={(s) => updateStatus(bug, s)}
                noteValue={noteDraft[bug.id] ?? bug.admin_notes ?? ""}
                onNoteChange={(v) =>
                  setNoteDraft((p) => ({ ...p, [bug.id]: v }))
                }
                onNoteSave={() => saveNote(bug)}
                saving={savingId === bug.id}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* ---------------- Components ---------------- */

function FilterButton({
  active, children, onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-muted bg-transparent text-muted-foreground hover:bg-muted/30"
      }`}
    >
      {children}
    </button>
  );
}

function BugCard({
  bug, expanded, onToggle, onStatusChange,
  noteValue, onNoteChange, onNoteSave, saving,
}: {
  bug: BugRowWithEmail;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (s: BugStatus) => void;
  noteValue: string;
  onNoteChange: (v: string) => void;
  onNoteSave: () => void;
  saving: boolean;
}) {
  const sev = SEVERITY_LABELS[bug.severity];
  const st = STATUS_LABELS[bug.status];
  const ctx = (bug.context || {}) as Partial<BugContext>;
  const api = ctx.api_log || [];

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/20"
      >
        <div className="mt-0.5 flex-shrink-0">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${sev.color}`}>
              {sev.emoji} {sev.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${st.color}`}>
              {st.label}
            </Badge>
          </div>
          <p className="font-semibold">{bug.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(bug.created_at).toLocaleString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "2-digit",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
            {ctx.route && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {ctx.route}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {bug.user_id.slice(0, 8)}…
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <CardContent className="border-t border-border bg-muted/10 pt-4">
          {bug.description && (
            <div className="mb-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Descrição
              </p>
              <p className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm">
                {bug.description}
              </p>
            </div>
          )}

          {/* Crash info (se veio de ErrorBoundary) */}
          {ctx.error_stack && (
            <div className="mb-4">
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Crash automático
              </p>
              <pre className="max-h-48 overflow-auto rounded-md bg-red-50 p-3 font-mono text-[11px] text-red-900">
                {ctx.error_stack}
              </pre>
              {ctx.component_stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] text-muted-foreground">
                    Component stack
                  </summary>
                  <pre className="mt-1 max-h-32 overflow-auto rounded-md bg-muted/30 p-2 font-mono text-[10px]">
                    {ctx.component_stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Screenshot */}
          {ctx.screenshot_path && (
            <div className="mb-4">
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                Screenshot do viewport
              </p>
              <ScreenshotPreview path={ctx.screenshot_path} />
            </div>
          )}

          {/* Contexto */}
          <div className="mb-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
            <div className="rounded-md bg-white p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Globe className="mr-1 inline-block h-3 w-3" />
                URL
              </p>
              <p className="break-all font-mono">{ctx.url || "—"}</p>
            </div>
            <div className="rounded-md bg-white p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Monitor className="mr-1 inline-block h-3 w-3" />
                Ambiente
              </p>
              <p className="line-clamp-2">
                {ctx.viewport?.width}×{ctx.viewport?.height}
                {" · "}
                <span className="text-muted-foreground">{ctx.user_agent?.slice(0, 80)}…</span>
              </p>
            </div>
          </div>

          {/* Timeline API */}
          {api.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Últimas {api.length} chamadas de rede
              </p>
              <div className="space-y-1 rounded-md bg-white p-3 font-mono text-[11px]">
                {api.map((e, i) => {
                  const isError = e.status >= 400 || e.status === 0;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 ${
                        isError ? "text-red-700" : "text-gray-700"
                      }`}
                    >
                      <span className="w-10 flex-shrink-0 font-semibold">
                        {e.method}
                      </span>
                      <span
                        className={`w-10 flex-shrink-0 font-semibold ${
                          isError ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {e.status || "ERR"}
                      </span>
                      <span className="w-14 flex-shrink-0 text-muted-foreground">
                        {e.duration_ms}ms
                      </span>
                      <span className="truncate flex-1">{e.path}</span>
                      {e.error && (
                        <span className="text-red-600 truncate">
                          {e.error}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Triage: mudar status */}
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Alterar status
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABELS) as BugStatus[]).map((s) => {
                const active = bug.status === s;
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => !active && onStatusChange(s)}
                    disabled={active || saving}
                  >
                    {STATUS_LABELS[s].label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Anotações internas
            </p>
            <Textarea
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Diagnóstico, link pra PR, etc."
              rows={2}
            />
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onNoteSave}
              disabled={saving}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Salvar anotação
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/** Carrega + exibe screenshot lazy. Clica pra abrir fullscreen em nova aba. */
function ScreenshotPreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const signed = await getBugScreenshotUrl(path);
      if (!signed) {
        setFailed(true);
        setLoading(false);
        return;
      }
      setUrl(signed);
      setLoading(false);
    })();
  }, [path]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md bg-muted/30">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (failed || !url) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center text-[11px] text-muted-foreground">
        Não foi possível carregar o screenshot.
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block overflow-hidden rounded-md border border-border transition hover:ring-2 hover:ring-accent/40"
      title="Abrir em tamanho real"
    >
      <img
        src={url}
        alt="Screenshot do bug"
        className="w-full object-cover"
        loading="lazy"
      />
    </a>
  );
}
