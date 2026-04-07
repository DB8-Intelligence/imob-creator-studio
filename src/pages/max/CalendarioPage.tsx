/**
 * CalendarioPage.tsx — Feed de Conteúdo + Calendário Editorial (DEV-27)
 *
 * Aba Feed: timeline unificada (generated_assets + automation_logs + creatives)
 * Aba Calendário: visualização mês/semana/dia com conteúdos gerados e agendados
 *
 * Fontes unificadas via useContentFeed hook.
 * Estados padronizados: scheduled, processing, done, error, ready_to_publish.
 */
import { useState, useMemo } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  CalendarRange, Plus, ChevronLeft, ChevronRight, Search,
  Filter, X, Loader2, Rss, CalendarDays, Bot, User, Send,
  FileText, Video, Type, CheckCircle, Clock, AlertCircle, Eye,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useContentFeed } from "@/hooks/useContentFeed";
import { usePublicationQueue } from "@/hooks/usePublicationQueue";
import { ContentFeedCard } from "@/components/content-feed/ContentFeedCard";
import { SchedulePublicationDialog } from "@/components/content-feed/SchedulePublicationDialog";
import { PublicationQueuePanel } from "@/components/content-feed/PublicationQueuePanel";
import type { ContentFeedItem, ContentType, ContentStatus, ContentOrigin, CalendarView } from "@/types/content-feed";
import type { PublicationStatus, SchedulePublicationInput } from "@/types/publication";

// ─── Calendar helpers ─────────────────────────────────────────────────────

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getItemDate(item: ContentFeedItem): Date {
  return new Date(item.scheduledAt ?? item.createdAt);
}

const STATUS_DOT: Record<ContentStatus, string> = {
  scheduled: "bg-blue-500",
  processing: "bg-amber-500",
  done: "bg-emerald-500",
  error: "bg-red-500",
  ready_to_publish: "bg-cyan-500",
};

const TYPE_DOT: Record<ContentType, string> = {
  post: "bg-blue-500",
  video: "bg-violet-500",
  text: "bg-amber-500",
};

// ─── Filter options ───────────────────────────────────────────────────────

const TYPE_OPTIONS: { id: ContentType; label: string }[] = [
  { id: "post", label: "Post" },
  { id: "video", label: "Vídeo" },
  { id: "text", label: "Texto" },
];
const STATUS_OPTIONS: { id: ContentStatus; label: string }[] = [
  { id: "done", label: "Concluído" },
  { id: "processing", label: "Processando" },
  { id: "scheduled", label: "Agendado" },
  { id: "error", label: "Erro" },
  { id: "ready_to_publish", label: "Pronto" },
];
const ORIGIN_OPTIONS: { id: ContentOrigin; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "automation", label: "Automação" },
];

// ─── Component ────────────────────────────────────────────────────────────

const today = new Date();

export default function CalendarioPage() {
  const { workspaceId } = useWorkspaceContext();
  const { data: allItems, isLoading } = useContentFeed(workspaceId);
  const {
    queue, logs: pubLogs, schedule, cancel, retry, publishNow: pubNow,
    isScheduling, queuedCount, publishedCount, getLogsForItem,
  } = usePublicationQueue(workspaceId);

  // State
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ContentType | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContentStatus | null>(null);
  const [filterOrigin, setFilterOrigin] = useState<ContentOrigin | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calView, setCalView] = useState<CalendarView>("month");

  // Schedule dialog
  const [scheduleItem, setScheduleItem] = useState<ContentFeedItem | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const items = allItems ?? [];

  // Filtered items
  const filtered = useMemo(() => {
    let result = items;
    if (filterType) result = result.filter((i) => i.type === filterType);
    if (filterStatus) result = result.filter((i) => i.status === filterStatus);
    if (filterOrigin) result = result.filter((i) => i.origin === filterOrigin);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.templateName?.toLowerCase().includes(q) || i.generationType?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filterType, filterStatus, filterOrigin, search]);

  const activeFiltersCount = [filterType, filterStatus, filterOrigin].filter(Boolean).length;

  // KPIs
  const doneCount = items.filter((i) => i.status === "done").length;
  const processingCount = items.filter((i) => i.status === "processing" || i.status === "scheduled").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const automationCount = items.filter((i) => i.origin === "automation").length;

  // Calendar data
  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(y, m, d));
    return days;
  }, [currentMonth]);

  const itemsByDateKey = useMemo(() => {
    const map = new Map<string, ContentFeedItem[]>();
    for (const item of filtered) {
      const d = getItemDate(item);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [filtered]);

  function getItemsForDate(d: Date) {
    return itemsByDateKey.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? [];
  }

  const selectedDayItems = getItemsForDate(selectedDate);

  // Week view days
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  function clearFilters() {
    setFilterType(null);
    setFilterStatus(null);
    setFilterOrigin(null);
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CalendarRange className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendário Editorial</h1>
              <p className="text-sm text-muted-foreground">{items.length} conteúdo{items.length !== 1 ? "s" : ""} &middot; {automationCount} via automação</p>
            </div>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => { setScheduleItem(null); setScheduleOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />Agendar Post
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Concluídos", value: doneCount, color: "text-emerald-500" },
            { label: "Na fila", value: queuedCount, color: "text-blue-500" },
            { label: "Publicados", value: publishedCount, color: "text-cyan-500" },
            { label: "Via automação", value: automationCount, color: "text-violet-500" },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[150px] max-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9 text-sm" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="sm" className="h-9 gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />Filtros
            {activeFiltersCount > 0 && <Badge className="text-[10px] px-1.5 py-0 h-4 ml-1">{activeFiltersCount}</Badge>}
          </Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl bg-muted/50 border border-border">
            <select title="Filtrar por tipo" value={filterType ?? ""} onChange={(e) => setFilterType((e.target.value || null) as ContentType | null)} className="text-sm h-8 px-2 rounded-lg border border-border bg-background">
              <option value="">Tipo: Todos</option>
              {TYPE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select title="Filtrar por status" value={filterStatus ?? ""} onChange={(e) => setFilterStatus((e.target.value || null) as ContentStatus | null)} className="text-sm h-8 px-2 rounded-lg border border-border bg-background">
              <option value="">Status: Todos</option>
              {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select title="Filtrar por origem" value={filterOrigin ?? ""} onChange={(e) => setFilterOrigin((e.target.value || null) as ContentOrigin | null)} className="text-sm h-8 px-2 rounded-lg border border-border bg-background">
              <option value="">Origem: Todos</option>
              {ORIGIN_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearFilters}>
                <X className="w-3 h-3" />Limpar
              </Button>
            )}
          </div>
        )}

        {/* Main tabs: Feed | Calendário */}
        <Tabs defaultValue="calendario">
          <TabsList>
            <TabsTrigger value="feed" className="gap-1.5"><Rss className="w-4 h-4" />Feed</TabsTrigger>
            <TabsTrigger value="calendario" className="gap-1.5"><CalendarDays className="w-4 h-4" />Calendário</TabsTrigger>
            <TabsTrigger value="fila" className="gap-1.5">
              <Send className="w-4 h-4" />Fila
              {queuedCount > 0 && <Badge className="text-[10px] px-1.5 py-0 h-4 ml-1">{queuedCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ── Feed tab ──────────────────────────────────── */}
          <TabsContent value="feed" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Rss className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search.trim() || activeFiltersCount > 0 ? "Nenhum resultado para os filtros" : "Nenhum conteúdo gerado ainda"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((item) => (
                  <ContentFeedCard
                    key={item.id}
                    item={item}
                    onSchedule={(i) => { setScheduleItem(i); setScheduleOpen(true); }}
                    publicationStatus={(item.publicationStatus as PublicationStatus) ?? null}
                    publicationChannel={item.publicationChannel ?? null}
                  />
                ))}
                <p className="text-xs text-muted-foreground mt-3">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </TabsContent>

          {/* ── Calendar tab ──────────────────────────────── */}
          <TabsContent value="calendario" className="mt-4">
            {/* View selector + nav */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-base font-semibold min-w-[160px] text-center">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex border border-border rounded-lg">
                {(["month", "week", "day"] as CalendarView[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCalView(v)}
                    className={cn("px-3 py-1.5 text-xs font-medium transition-colors", calView === v ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-muted-foreground animate-spin" /></div>
            ) : calView === "month" ? (
              /* ── Month view ─────────────────────────────── */
              <div className="grid lg:grid-cols-[1fr_280px] gap-6">
                <div>
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS.map((w) => <div key={w} className="text-center text-[10px] font-semibold uppercase text-muted-foreground py-2">{w}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
                    {calendarDays.map((day, idx) => {
                      if (!day) return <div key={`e-${idx}`} className="bg-card p-2 min-h-[80px]" />;
                      const dayItems = getItemsForDate(day);
                      const isToday = isSameDay(day, today);
                      const isSelected = isSameDay(day, selectedDate);
                      return (
                        <button key={day.toISOString()} type="button" onClick={() => setSelectedDate(day)}
                          className={cn("bg-card p-2 min-h-[80px] text-left transition-colors hover:bg-muted/50", isSelected && "bg-accent/5 ring-1 ring-accent ring-inset")}>
                          <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium", isToday ? "bg-accent text-accent-foreground" : "text-foreground")}>{day.getDate()}</span>
                          {dayItems.length > 0 && (
                            <div className="flex gap-0.5 mt-1 flex-wrap">
                              {dayItems.slice(0, 4).map((it) => (
                                <div key={it.id} className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[it.status])} title={`${it.name} (${it.status})`} />
                              ))}
                              {dayItems.length > 4 && <span className="text-[8px] text-muted-foreground">+{dayItems.length - 4}</span>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar: selected day */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </h3>
                  {selectedDayItems.length === 0 && <p className="text-xs text-muted-foreground py-4">Nenhum conteúdo neste dia.</p>}
                  {selectedDayItems.map((item) => (
                    <ContentFeedCard key={item.id} item={item} compact />
                  ))}
                </div>
              </div>
            ) : calView === "week" ? (
              /* ── Week view ──────────────────────────────── */
              <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
                {weekDays.map((day) => {
                  const dayItems = getItemsForDate(day);
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button key={day.toISOString()} type="button" onClick={() => setSelectedDate(day)}
                      className={cn("bg-card p-3 min-h-[200px] text-left transition-colors hover:bg-muted/50 flex flex-col", isSelected && "bg-accent/5 ring-1 ring-accent ring-inset")}>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-[10px] text-muted-foreground uppercase">{WEEKDAYS[day.getDay()]}</span>
                        <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium", isToday ? "bg-accent text-accent-foreground" : "text-foreground")}>{day.getDate()}</span>
                      </div>
                      <div className="space-y-1 flex-1">
                        {dayItems.slice(0, 5).map((it) => (
                          <div key={it.id} className="flex items-center gap-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", TYPE_DOT[it.type])} />
                            <span className="text-[10px] text-foreground truncate">{it.name}</span>
                          </div>
                        ))}
                        {dayItems.length > 5 && <span className="text-[9px] text-muted-foreground">+{dayItems.length - 5} mais</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ── Day view ───────────────────────────────── */
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </h3>
                {selectedDayItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum conteúdo neste dia.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayItems.map((item) => (
                      <ContentFeedCard
                    key={item.id}
                    item={item}
                    onSchedule={(i) => { setScheduleItem(i); setScheduleOpen(true); }}
                    publicationStatus={(item.publicationStatus as PublicationStatus) ?? null}
                    publicationChannel={item.publicationChannel ?? null}
                  />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Fila tab (DEV-29) ─────────────────────────── */}
          <TabsContent value="fila" className="mt-4">
            <PublicationQueuePanel
              queue={queue}
              getLogsForItem={getLogsForItem}
              onCancel={cancel}
              onRetry={retry}
              onPublishNow={pubNow}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule dialog */}
      <SchedulePublicationDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        item={scheduleItem}
        onSchedule={(input: SchedulePublicationInput) => {
          schedule(input);
          setScheduleOpen(false);
        }}
        isScheduling={isScheduling}
      />
    </AppLayout>
  );
}
