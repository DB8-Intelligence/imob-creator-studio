/**
 * SiteContentConfigurator — modal corretor-acessível pra customizar
 * conteúdo DENTRO das seções (sem mexer na estrutura de layout).
 *
 * MVP atual: slider pra "Quantos imóveis mostrar na home".
 * Futuras expansões: escolha de variante (grid/carrossel), ordem dos
 * cards (mais recentes / preço / destaque), etc.
 *
 * Diferente do SiteSectionsEditor (admin-only), este modal é acessível
 * a qualquer corretor — é personalização de conteúdo, não estrutura.
 */
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, Loader2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  IMOVEIS_COUNT_DEFAULT, IMOVEIS_COUNT_MAX, IMOVEIS_COUNT_MIN,
  normalizeSiteSectionsConfig,
  type CorretorSite, type SiteSectionsConfig,
} from "@/types/site";

interface SiteContentConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: CorretorSite;
  /** Callback chamado após salvar (parent atualiza o draft). */
  onSaved?: (newConfig: SiteSectionsConfig) => void;
}

export default function SiteContentConfigurator({
  open, onOpenChange, site, onSaved,
}: SiteContentConfiguratorProps) {
  const { toast } = useToast();
  const [count, setCount] = useState<number>(IMOVEIS_COUNT_DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const cfg = normalizeSiteSectionsConfig(site.sections_config);
    setCount(cfg.content?.imoveis_count || IMOVEIS_COUNT_DEFAULT);
  }, [open, site.sections_config]);

  async function handleSave() {
    setSaving(true);

    const currentConfig = normalizeSiteSectionsConfig(site.sections_config);
    const newConfig: SiteSectionsConfig = {
      ...currentConfig,
      content: {
        ...currentConfig.content,
        imoveis_count: count,
      },
    };

    const { error } = await supabase
      .from("corretor_sites")
      .update({ sections_config: newConfig })
      .eq("id", site.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Personalização salva" });
    onSaved?.(newConfig);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Personalizar conteúdo do site</DialogTitle>
          <DialogDescription>
            Ajustes rápidos que você pode fazer no conteúdo do seu site público.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Imóveis: quantidade */}
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Home className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Imóveis visíveis na home</h3>
                <p className="text-[11px] text-muted-foreground">
                  Quantos imóveis mostrar na seção Imóveis do seu site.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Quantidade
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {count}
                </span>
              </div>
              <Slider
                value={[count]}
                min={IMOVEIS_COUNT_MIN}
                max={IMOVEIS_COUNT_MAX}
                step={1}
                onValueChange={(v) => setCount(v[0] || IMOVEIS_COUNT_DEFAULT)}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{IMOVEIS_COUNT_MIN}</span>
                <span>Padrão: {IMOVEIS_COUNT_DEFAULT}</span>
                <span>{IMOVEIS_COUNT_MAX}</span>
              </div>
            </div>
          </section>

          {/* Placeholder pra futuras opções de conteúdo */}
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              Mais opções de personalização em breve: variantes de exibição
              (grade, carrossel), ordenação e filtros destacados.
            </p>
          </div>
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
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
