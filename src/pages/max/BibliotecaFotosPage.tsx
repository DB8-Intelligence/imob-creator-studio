/**
 * BibliotecaFotosPage.tsx — Biblioteca Unificada de Mídia (DEV-24 + DEV-25)
 *
 * Fonte única: generated_assets + creatives (legado).
 * Filtros: tipo, formato, generation_type, data, status.
 * Ações: preview, download, excluir, reutilizar (reuso cruzado DEV-25).
 * Views: grid e lista.
 */
import { useState, useMemo, useRef } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  FolderOpen, Upload, Search, Image, Film, FileText, Trash2,
  Grid3X3, List, Loader2, Clock, AlertCircle, Eye, Download,
  MoreHorizontal, Filter, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useMediaLibrary, useDeleteMediaItem } from "@/hooks/useMediaLibrary";
import { MediaCard } from "@/components/biblioteca/MediaCard";
import { MediaPreviewDialog } from "@/components/biblioteca/MediaPreviewDialog";
import { MediaReuseMenu } from "@/components/biblioteca/MediaReuseMenu";
import type { MediaItem, MediaType, MediaStatus } from "@/types/media-library";

// ─── Sidebar categories ──────────────────────────────────────────────────

type FilterCategory = "todos" | "image" | "video" | "post" | "processing" | "lixeira";

const CATEGORIES: { id: FilterCategory; label: string; emoji: string; type?: MediaType; statusFilter?: MediaStatus[] }[] = [
  { id: "todos",      label: "Todos os Arquivos", emoji: "📁" },
  { id: "image",      label: "Imagens",           emoji: "🏠", type: "image" },
  { id: "video",      label: "Vídeos",            emoji: "🎬", type: "video" },
  { id: "post",       label: "Posts / Criativos",  emoji: "🎨", type: "post" },
  { id: "processing", label: "Em Processamento",  emoji: "⏳", statusFilter: ["processing", "pending"] },
  { id: "lixeira",    label: "Lixeira",           emoji: "🗑️" },
];

// ─── Filter options ──────────────────────────────────────────────────────

const FORMAT_OPTIONS = ["reels", "feed", "youtube", "story", "png", "jpg", "mp4"];
const STATUS_OPTIONS: { id: MediaStatus; label: string }[] = [
  { id: "done", label: "Concluído" },
  { id: "processing", label: "Processando" },
  { id: "pending", label: "Na fila" },
  { id: "error", label: "Erro" },
  { id: "draft", label: "Rascunho" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

function countByType(items: MediaItem[], type: MediaType): number {
  return items.filter((i) => i.type === type).length;
}

function countByStatus(items: MediaItem[], statuses: MediaStatus[]): number {
  return items.filter((i) => statuses.includes(i.status)).length;
}

function getCategoryCount(items: MediaItem[], cat: typeof CATEGORIES[number]): number {
  if (cat.id === "todos") return items.length;
  if (cat.id === "lixeira") return 0;
  if (cat.statusFilter) return countByStatus(items, cat.statusFilter);
  if (cat.type) return countByType(items, cat.type);
  return 0;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function timeAgoShort(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const TYPE_ICON_MAP = {
  image: { icon: Image, color: "text-blue-500" },
  video: { icon: Film, color: "text-violet-500" },
  post:  { icon: FileText, color: "text-pink-500" },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export default function BibliotecaFotosPage() {
  const { toast } = useToast();
  const { workspaceId } = useWorkspaceContext();
  const { data: allItems, isLoading } = useMediaLibrary(workspaceId);
  const deleteMut = useDeleteMediaItem(workspaceId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [category, setCategory] = useState<FilterCategory>("todos");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterFormat, setFilterFormat] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<MediaStatus | null>(null);
  const [filterGenType, setFilterGenType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Preview & Reuse dialogs
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reuseItem, setReuseItem] = useState<MediaItem | null>(null);
  const [reuseOpen, setReuseOpen] = useState(false);

  const items = allItems ?? [];

  // Unique generation types for filter
  const genTypes = useMemo(() => {
    const set = new Set(items.map((i) => i.generationType).filter(Boolean) as string[]);
    return [...set].sort();
  }, [items]);

  // Filter logic
  const filtered = useMemo(() => {
    let result = items;

    // Category filter
    const catDef = CATEGORIES.find((c) => c.id === category);
    if (category === "lixeira") return [];
    if (catDef?.type) result = result.filter((i) => i.type === catDef.type);
    if (catDef?.statusFilter) result = result.filter((i) => catDef.statusFilter!.includes(i.status));

    // Advanced filters
    if (filterFormat) result = result.filter((i) => i.format === filterFormat);
    if (filterStatus) result = result.filter((i) => i.status === filterStatus);
    if (filterGenType) result = result.filter((i) => i.generationType === filterGenType);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.generationType?.toLowerCase().includes(q) || i.templateName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, category, search, filterFormat, filterStatus, filterGenType]);

  const activeFiltersCount = [filterFormat, filterStatus, filterGenType].filter(Boolean).length;

  // Storage estimate (sum of fileSizeBytes)
  const totalBytes = useMemo(() => items.reduce((s, i) => s + (i.fileSizeBytes ?? 0), 0), [items]);
  const storageUsedGB = totalBytes / (1024 * 1024 * 1024);
  const storageTotal = 50;
  const storagePct = Math.min(100, Math.round((storageUsedGB / storageTotal) * 100));

  // Handlers
  function handleDelete(item: MediaItem) {
    deleteMut.mutate(item, {
      onSuccess: () => toast({ title: "Arquivo excluído" }),
    });
  }

  function handlePreview(item: MediaItem) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  function handleReuse(item: MediaItem) {
    setReuseItem(item);
    setReuseOpen(true);
  }

  function clearFilters() {
    setFilterFormat(null);
    setFilterStatus(null);
    setFilterGenType(null);
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Biblioteca</h1>
              <p className="text-sm text-muted-foreground">{items.length} arquivo{items.length !== 1 ? "s" : ""} &middot; Fonte unificada</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 h-9 w-[180px] text-sm" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />Filtros
              {activeFiltersCount > 0 && <Badge className="text-[10px] px-1.5 py-0 h-4 ml-1">{activeFiltersCount}</Badge>}
            </Button>
            <div className="flex border border-border rounded-lg">
              <button type="button" title="Grid" className={cn("p-1.5", viewMode === "grid" && "bg-muted")} onClick={() => setViewMode("grid")}><Grid3X3 className="w-4 h-4" /></button>
              <button type="button" title="Lista" className={cn("p-1.5", viewMode === "list" && "bg-muted")} onClick={() => setViewMode("list")}><List className="w-4 h-4" /></button>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Upload className="w-4 h-4 mr-2" />Upload
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" title="Upload arquivos" onChange={() => toast({ title: "Upload iniciado" })} />
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl bg-muted/50 border border-border">
            <select
              title="Filtrar por formato"
              value={filterFormat ?? ""}
              onChange={(e) => setFilterFormat(e.target.value || null)}
              className="text-sm h-8 px-2 rounded-lg border border-border bg-background"
            >
              <option value="">Formato: Todos</option>
              {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            <select
              title="Filtrar por status"
              value={filterStatus ?? ""}
              onChange={(e) => setFilterStatus((e.target.value || null) as MediaStatus | null)}
              className="text-sm h-8 px-2 rounded-lg border border-border bg-background"
            >
              <option value="">Status: Todos</option>
              {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <select
              title="Filtrar por tipo de geração"
              value={filterGenType ?? ""}
              onChange={(e) => setFilterGenType(e.target.value || null)}
              className="text-sm h-8 px-2 rounded-lg border border-border bg-background"
            >
              <option value="">Tipo de geração: Todos</option>
              {genTypes.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={clearFilters}>
                <X className="w-3 h-3" />Limpar
              </Button>
            )}
          </div>
        )}

        {/* Main layout */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); clearFilters(); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  category === cat.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{cat.emoji}</span>
                <span className="flex-1">{cat.label}</span>
                <span className="text-[10px] opacity-60">{getCategoryCount(items, cat)}</span>
              </button>
            ))}

            {/* Storage gauge */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Armazenamento</p>
              <Progress value={storagePct} className="h-2 mb-1" />
              <p className="text-[10px] text-muted-foreground">{storageUsedGB.toFixed(1)} GB de {storageTotal} GB ({storagePct}%)</p>
            </div>
          </div>

          {/* Main area */}
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              </div>
            ) : category === "lixeira" ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Trash2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Lixeira vazia</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <FolderOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search.trim() || activeFiltersCount > 0 ? "Nenhum resultado para os filtros aplicados" : "Nenhum arquivo encontrado"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPreview={handlePreview}
                    onDownload={() => {}}
                    onDelete={handleDelete}
                    onReuse={handleReuse}
                  />
                ))}
              </div>
            ) : (
              /* List view */
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Nome</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 hidden sm:table-cell">Tipo</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 hidden md:table-cell">Formato</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2 hidden sm:table-cell">Tamanho</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Data</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const typeCfg = TYPE_ICON_MAP[item.type];
                      const TypeIcon = typeCfg.icon;
                      return (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={cn("w-4 h-4 flex-shrink-0", typeCfg.color)} />
                              <span className="text-foreground truncate max-w-[200px]">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden sm:table-cell">
                            <Badge variant="secondary" className="text-[10px]">
                              {item.type === "image" ? "Imagem" : item.type === "video" ? "Vídeo" : "Post"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground text-xs hidden md:table-cell">{item.format ?? "—"}</td>
                          <td className="px-3 py-2">
                            {item.status === "done" ? (
                              <span className="text-xs text-emerald-500">Concluído</span>
                            ) : item.status === "processing" ? (
                              <span className="text-xs text-amber-500 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Processando</span>
                            ) : item.status === "pending" ? (
                              <span className="text-xs text-blue-500 inline-flex items-center gap-1"><Clock className="w-3 h-3" />Na fila</span>
                            ) : item.status === "error" ? (
                              <span className="text-xs text-red-500 inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" />Erro</span>
                            ) : (
                              <span className="text-xs text-zinc-400">Rascunho</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell">{formatSize(item.fileSizeBytes)}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{timeAgoShort(item.createdAt)}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(item.status === "done" || item.status === "draft") && item.url && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Preview" onClick={() => handlePreview(item)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Usar novamente" onClick={() => handleReuse(item)}>
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Excluir" onClick={() => handleDelete(item)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              {filtered.length} arquivo{filtered.length !== 1 ? "s" : ""}
              {activeFiltersCount > 0 && ` (${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} ativo${activeFiltersCount > 1 ? "s" : ""})`}
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <MediaPreviewDialog
        item={previewItem}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDelete={handleDelete}
        onReuse={handleReuse}
      />
      <MediaReuseMenu
        item={reuseItem}
        open={reuseOpen}
        onOpenChange={setReuseOpen}
      />
    </AppLayout>
  );
}
