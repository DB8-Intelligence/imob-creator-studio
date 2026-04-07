/**
 * MediaReuseMenu.tsx — Menu de reuso cruzado de ativos (DEV-25)
 *
 * Exibe fluxos disponíveis para reutilizar o asset selecionado:
 * - Gerar Post
 * - Gerar Vídeo
 * - Virtual Staging
 * - Gerar Variação
 *
 * Navega para a rota do fluxo com prefill state (template, preset, mood, etc.)
 */
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Paintbrush, RefreshCw, ArrowRight } from "lucide-react";
import type { MediaItem, ReuseFlow } from "@/types/media-library";
import { getAvailableFlows, buildNavigationState, getFlowConfig } from "@/lib/asset-reuse";

interface MediaReuseMenuProps {
  item: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FLOW_ICONS: Record<ReuseFlow, typeof FileText> = {
  post: FileText,
  video: Video,
  staging: Paintbrush,
  variation: RefreshCw,
};

const FLOW_DESCRIPTIONS: Record<ReuseFlow, string> = {
  post: "Criar post ou legenda usando este asset como base",
  video: "Gerar vídeo a partir deste asset com preset e template",
  staging: "Aplicar virtual staging nesta imagem",
  variation: "Gerar uma nova variação mantendo os mesmos parâmetros",
};

export function MediaReuseMenu({ item, open, onOpenChange }: MediaReuseMenuProps) {
  const navigate = useNavigate();

  if (!item) return null;

  const flows = getAvailableFlows(item);

  function handleFlow(flow: ReuseFlow) {
    const nav = buildNavigationState(item!, flow);
    navigate(nav.route, { state: nav.state });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Reutilizar Asset
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{item.name}</span>
            {" — "}escolha o fluxo para reaproveitar
          </DialogDescription>
        </DialogHeader>

        {/* Prefill info */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.templateId && <Badge variant="secondary" className="text-[10px]">Template: {item.templateName ?? item.templateId}</Badge>}
          {item.presetId && <Badge variant="secondary" className="text-[10px]">Preset: {item.presetId}</Badge>}
          {item.moodId && <Badge variant="secondary" className="text-[10px]">Mood: {item.moodId}</Badge>}
          {item.format && <Badge variant="secondary" className="text-[10px]">Formato: {item.format}</Badge>}
          {item.engineId && <Badge variant="secondary" className="text-[10px]">Engine: {item.engineId}</Badge>}
          {item.aspectRatio && <Badge variant="secondary" className="text-[10px]">Aspecto: {item.aspectRatio}</Badge>}
        </div>

        {/* Flow options */}
        <div className="space-y-2">
          {flows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Este asset ainda nao pode ser reutilizado (processando ou sem URL).
            </p>
          ) : (
            flows.map((flow) => {
              const Icon = FLOW_ICONS[flow];
              const config = getFlowConfig(flow);
              return (
                <button
                  key={flow}
                  type="button"
                  onClick={() => handleFlow(flow)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{FLOW_DESCRIPTIONS[flow]}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
