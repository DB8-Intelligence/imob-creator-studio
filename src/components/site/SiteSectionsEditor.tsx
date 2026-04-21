/**
 * SiteSectionsEditor — modal pra reordenar + ligar/desligar seções do site.
 *
 * UX simplificada com setas (▲▼) em cada linha pra mover + checkbox pra toggle.
 * Sem drag-and-drop (botões são mais confiáveis em mobile e acessíveis).
 */
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowDown, ArrowUp, Check, Eye, EyeOff, Loader2, RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_SITE_SECTIONS,
  normalizeSiteSectionsConfig,
  SITE_SECTION_META,
  type CorretorSite,
  type SiteSectionKey,
  type SiteSectionsConfig,
} from "@/types/site";

interface SiteSectionsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: CorretorSite;
  /** Callback chamado após salvar com sucesso (parent deve refrescar o state). */
  onSaved?: (newConfig: SiteSectionsConfig) => void;
}

export default function SiteSectionsEditor({
  open,
  onOpenChange,
  site,
  onSaved,
}: SiteSectionsEditorProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<SiteSectionsConfig>(
    normalizeSiteSectionsConfig(site.sections_config),
  );
  const [saving, setSaving] = useState(false);

  // Atualiza quando abrir com site diferente
  useEffect(() => {
    if (open) {
      setConfig(normalizeSiteSectionsConfig(site.sections_config));
    }
  }, [open, site.sections_config]);

  function moveUp(idx: number) {
    if (idx === 0) return;
    setConfig((prev) => {
      const newOrder = [...prev.order];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      return { ...prev, order: newOrder };
    });
  }

  function moveDown(idx: number) {
    if (idx === config.order.length - 1) return;
    setConfig((prev) => {
      const newOrder = [...prev.order];
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
      return { ...prev, order: newOrder };
    });
  }

  function toggleEnabled(key: SiteSectionKey) {
    setConfig((prev) => ({
      ...prev,
      enabled: { ...prev.enabled, [key]: !prev.enabled[key] },
    }));
  }

  function resetDefault() {
    setConfig(DEFAULT_SITE_SECTIONS);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("corretor_sites")
      .update({ sections_config: config })
      .eq("id", site.id);
    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar layout",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Layout do site atualizado" });
    onSaved?.(config);
    onOpenChange(false);
  }

  const enabledCount = Object.values(config.enabled).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar layout do site</DialogTitle>
          <DialogDescription>
            Arraste com as setas pra reordenar as seções do seu site público.
            Use o botão pra esconder uma seção sem deletá-la.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {enabledCount} de {config.order.length} seções visíveis
          </span>
          <button
            type="button"
            onClick={resetDefault}
            className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Padrão
          </button>
        </div>

        <div className="space-y-2">
          {config.order.map((key, idx) => {
            const meta = SITE_SECTION_META[key];
            const isEnabled = config.enabled[key] !== false;
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                  isEnabled
                    ? "border-accent/30 bg-white"
                    : "border-muted bg-muted/30 opacity-60"
                }`}
              >
                {/* Arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-20"
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === config.order.length - 1}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-20"
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Position number */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.emoji}</span>
                    <p className="text-sm font-semibold">{meta.label}</p>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {meta.description}
                  </p>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleEnabled(key)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                    isEnabled
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                  }`}
                  aria-label={isEnabled ? "Esconder seção" : "Mostrar seção"}
                  title={isEnabled ? "Visível — clique pra esconder" : "Escondida — clique pra mostrar"}
                >
                  {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvar layout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
