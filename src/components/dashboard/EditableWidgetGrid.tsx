/**
 * EditableWidgetGrid — grid responsivo do dashboard com:
 *  - drag + resize em modo edit
 *  - 3 breakpoints (lg/md/sm) com layouts separados salvos
 *  - widget library: adicionar/remover widgets da visualização
 */
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Responsive, WidthProvider, type Layout, type Layouts } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Check, Edit3, RotateCcw, X, Loader2, LayoutGrid, EyeOff, Plus,
} from "lucide-react";
import {
  ALL_WIDGET_IDS,
  BREAKPOINTS,
  COLS_BY_BREAKPOINT,
  DASHBOARD_ROW_HEIGHT,
  WIDGET_META,
  addWidgetToLayouts,
  removeWidgetFromLayouts,
  type Breakpoint,
  type DashboardLayouts,
  type WidgetId,
} from "@/types/dashboard-layout";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditableWidgetGridProps {
  widgets: Partial<Record<WidgetId, ReactElement>>;
}

export default function EditableWidgetGrid({ widgets }: EditableWidgetGridProps) {
  const { layouts, loading, saving, saveLayouts, resetLayouts } = useDashboardLayout();
  const { data: isAdmin = false } = useIsSuperAdmin();
  const { toast } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<DashboardLayouts>(layouts);

  useEffect(() => {
    if (!editMode) setDraft(layouts);
  }, [layouts, editMode]);

  const currentLayouts = editMode ? draft : layouts;

  const visibleIds = useMemo(() => {
    const ids = new Set<WidgetId>();
    (["lg", "md", "sm"] as Breakpoint[]).forEach((bp) => {
      currentLayouts[bp].forEach((w) => ids.add(w.i));
    });
    return ids;
  }, [currentLayouts]);

  const hiddenIds = ALL_WIDGET_IDS.filter((id) => !visibleIds.has(id));

  function startEdit() {
    setDraft(layouts);
    setEditMode(true);
  }

  function cancelEdit() {
    setDraft(layouts);
    setEditMode(false);
  }

  async function commitEdit() {
    const r = await saveLayouts(draft);
    if (r.success) {
      toast({ title: "Layout salvo" });
      setEditMode(false);
    } else {
      toast({ title: "Erro ao salvar", description: r.error, variant: "destructive" });
    }
  }

  async function doReset() {
    const r = await resetLayouts();
    if (r.success) {
      toast({ title: "Layout resetado ao padrão" });
      setEditMode(false);
    } else {
      toast({ title: "Erro ao resetar", description: r.error, variant: "destructive" });
    }
  }

  function toggleWidget(id: WidgetId, add: boolean) {
    setDraft((prev) =>
      add ? addWidgetToLayouts(prev, id) : removeWidgetFromLayouts(prev, id)
    );
  }

  const renderableIds: WidgetId[] = Array.from(visibleIds).filter((id) => widgets[id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar — apenas super_admin vê os controles de edição */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1">
            {editMode && (
              <p className="text-xs text-muted-foreground">
                Arraste os widgets pra reposicionar, use os cantos pra redimensionar.
                O layout é salvo separado por tamanho de tela.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editMode && (
              <WidgetLibraryPopover
                hiddenIds={hiddenIds}
                visibleIds={Array.from(visibleIds)}
                onToggle={toggleWidget}
              />
            )}

            {!editMode ? (
              <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" />
                Editar layout
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={doReset}
                  disabled={saving}
                  className="gap-1.5 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Padrão
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={commitEdit}
                  disabled={saving}
                  className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Salvar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Grid — edit só funciona pra admin (defensive além do gate de UI) */}
      <div
        className={
          editMode && isAdmin
            ? "rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-2"
            : ""
        }
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts as unknown as Layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS_BY_BREAKPOINT}
          rowHeight={DASHBOARD_ROW_HEIGHT}
          isDraggable={editMode && isAdmin}
          isResizable={editMode && isAdmin}
          compactType="vertical"
          margin={[12, 12]}
          onLayoutChange={(_current: Layout[], all: Layouts) => {
            if (!editMode || !isAdmin) return;
            setDraft({
              lg: (all.lg || []) as typeof draft.lg,
              md: (all.md || []) as typeof draft.md,
              sm: (all.sm || []) as typeof draft.sm,
            });
          }}
        >
          {renderableIds.map((id) => (
            <div key={id} className="relative overflow-hidden">
              {editMode && isAdmin && (
                <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-accent shadow-sm backdrop-blur">
                  <LayoutGrid className="h-3 w-3" />
                  {WIDGET_META[id].label}
                </div>
              )}
              {widgets[id]}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {renderableIds.length === 0 && editMode && isAdmin && (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum widget no dashboard. Use "Widgets" pra adicionar.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Widget library popover ---------------- */

function WidgetLibraryPopover({
  hiddenIds,
  visibleIds,
  onToggle,
}: {
  hiddenIds: WidgetId[];
  visibleIds: WidgetId[];
  onToggle: (id: WidgetId, add: boolean) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Widgets
          {hiddenIds.length > 0 && (
            <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
              {hiddenIds.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        <div className="mb-3">
          <p className="text-sm font-semibold">Biblioteca de widgets</p>
          <p className="text-[11px] text-muted-foreground">
            Marque pra mostrar, desmarque pra esconder do dashboard.
          </p>
        </div>

        <div className="max-h-[320px] space-y-1.5 overflow-y-auto">
          {ALL_WIDGET_IDS.map((id) => {
            const meta = WIDGET_META[id];
            const isVisible = visibleIds.includes(id);
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                  isVisible
                    ? "border-accent/40 bg-accent/5"
                    : "border-transparent bg-muted/40 hover:bg-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => onToggle(id, e.target.checked)}
                  className="mt-1 h-4 w-4 accent-accent"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.emoji}</span>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    {!isVisible && (
                      <EyeOff className="ml-auto h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
