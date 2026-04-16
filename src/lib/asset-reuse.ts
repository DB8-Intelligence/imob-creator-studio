/**
 * asset-reuse.ts — Reuso cruzado de ativos (DEV-25)
 *
 * Constrói prefill state a partir de qualquer MediaItem para diferentes fluxos:
 * - post: gerar post a partir do asset
 * - video: gerar vídeo a partir do asset
 * - staging: image restoration
 * - variation: gerar variação do mesmo tipo
 *
 * Mantém vínculo com asset original via sourceAssetId no state.
 */
import type { MediaItem, ReuseFlow, AssetReusePrefill } from "@/types/media-library";

/** Extrai campos reaproveitáveis de um MediaItem */
export function buildReusePrefill(item: MediaItem): AssetReusePrefill {
  const meta = item.metadata ?? {};
  return {
    sourceAssetId: item.sourceId,
    templateId: item.templateId,
    presetId: item.presetId,
    moodId: item.moodId,
    engineId: item.engineId,
    format: item.format,
    aspectRatio: item.aspectRatio,
    propertyId: item.propertyId,
    imageUrls: item.url ? [item.url] : [],
    metadata: meta as Record<string, unknown>,
  };
}

/** Fluxos suportados por tipo de mídia */
export function getAvailableFlows(item: MediaItem): ReuseFlow[] {
  const flows: ReuseFlow[] = [];

  if (item.status !== "done" && item.status !== "draft") return flows;

  switch (item.type) {
    case "image":
      flows.push("post", "video", "staging", "variation");
      break;
    case "video":
      flows.push("post", "variation");
      break;
    case "post":
      flows.push("variation");
      if (item.url) flows.push("video");
      break;
  }
  return flows;
}

/** Labels e rotas por fluxo */
const FLOW_CONFIG: Record<ReuseFlow, { label: string; route: string; icon: string }> = {
  post:      { label: "Gerar Post",           route: "/criativos",       icon: "FileText" },
  video:     { label: "Gerar Vídeo",          route: "/video-creator",   icon: "Video" },
  staging:   { label: "Image Restoration",    route: "/criativos",       icon: "Paintbrush" },
  variation: { label: "Gerar Variação",       route: "",                 icon: "RefreshCw" },
};

export function getFlowConfig(flow: ReuseFlow) {
  return FLOW_CONFIG[flow];
}

/** Constrói navigation state para o fluxo escolhido */
export function buildNavigationState(item: MediaItem, flow: ReuseFlow) {
  const prefill = buildReusePrefill(item);
  const config = FLOW_CONFIG[flow];

  // Variação reutiliza a mesma rota do tipo original
  let route = config.route;
  if (flow === "variation") {
    route = item.type === "video" ? "/video-creator" : "/criativos";
  }

  return {
    route,
    state: {
      prefill: true,
      reuseFlow: flow,
      ...prefill,
    },
  };
}
