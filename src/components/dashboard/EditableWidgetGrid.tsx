/**
 * EditableWidgetGrid — envolve os widgets do dashboard com react-grid-layout.
 *
 * - Modo view: widgets fixos na posição salva do usuário
 * - Modo edit: arrasta/redimensiona; botão Salvar persiste; Resetar volta ao padrão
 *
 * Os widgets são passados como `children` com `data-widget-id={WidgetId}` no root
 * de cada um — o grid usa esse id pra casar com o layout.
 */
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import GridLayout, { type Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Check, Edit3, RotateCcw, X, Loader2,
} from "lucide-react";
import {
  DASHBOARD_COLS,
  DASHBOARD_ROW_HEIGHT,
  type WidgetId,
  type WidgetLayout,
} from "@/types/dashboard-layout";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

// CSS necessário do react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface EditableWidgetGridProps {
  /**
   * Map widgetId → elemento React que será renderizado na célula.
   * Só widgets que estiverem no mapa E no layout aparecem.
   */
  widgets: Partial<Record<WidgetId, ReactElement>>;
}

export default function EditableWidgetGrid({
  widgets,
}: EditableWidgetGridProps) {
  const { layout, loading, saving, saveLayout, resetLayout } = useDashboardLayout();
  const { toast } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [draftLayout, setDraftLayout] = useState<WidgetLayout[]>(layout);

  // Largura responsiva (pega do container)
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1100);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Sincroniza draft quando layout muda (ao sair do edit sem salvar, ou ao carregar)
  useMemo(() => {
    if (!editMode) setDraftLayout(layout);
  }, [layout, editMode]);

  function startEdit() {
    setDraftLayout(layout);
    setEditMode(true);
  }

  function cancelEdit() {
    setDraftLayout(layout);
    setEditMode(false);
  }

  async function commitEdit() {
    const result = await saveLayout(draftLayout);
    if (result.success) {
      toast({ title: "Layout salvo" });
      setEditMode(false);
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function doReset() {
    const result = await resetLayout();
    if (result.success) {
      toast({ title: "Layout resetado ao padrão" });
      setEditMode(false);
    } else {
      toast({
        title: "Erro ao resetar",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  const currentLayout = editMode ? draftLayout : layout;

  // Só renderiza widgets que existem no mapa
  const visibleLayout = currentLayout.filter((l) => widgets[l.i]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          {editMode && (
            <p className="text-xs text-muted-foreground">
              Arraste os widgets pra reposicionar ou use os cantos pra redimensionar.
              Lembre de salvar.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startEdit}
              className="gap-1.5"
            >
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

      {/* Grid */}
      <div
        ref={containerRef}
        className={
          editMode
            ? "rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-2"
            : ""
        }
      >
        <GridLayout
          className="layout"
          layout={visibleLayout as Layout[]}
          cols={DASHBOARD_COLS}
          rowHeight={DASHBOARD_ROW_HEIGHT}
          width={width}
          isDraggable={editMode}
          isResizable={editMode}
          compactType="vertical"
          margin={[12, 12]}
          draggableHandle={editMode ? undefined : ".drag-disabled-will-never-match"}
          onLayoutChange={(newLayout) => {
            if (editMode) {
              // Preserva os min/max do draft, só atualiza x/y/w/h
              setDraftLayout((prev) =>
                prev.map((w) => {
                  const updated = newLayout.find((nl) => nl.i === w.i);
                  if (!updated) return w;
                  return {
                    ...w,
                    x: updated.x,
                    y: updated.y,
                    w: updated.w,
                    h: updated.h,
                  };
                })
              );
            }
          }}
        >
          {visibleLayout.map((item) => (
            <div key={item.i} className="overflow-hidden">
              {widgets[item.i]}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
