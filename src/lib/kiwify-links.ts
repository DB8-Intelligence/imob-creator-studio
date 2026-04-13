/**
 * kiwify-links.ts — Fonte única para checkouts Kiwify (10 produtos NexoImob).
 *
 * Prioriza env vars do Vercel (`VITE_KIWIFY_*`). Quando ausente, usa a URL
 * definitiva como fallback. A tabela Supabase `kiwify_products` é a fonte
 * de verdade final — este arquivo é o cache client-side.
 */

// ─── Produtos definitivos (env var > fallback hardcoded) ─────────────
export const KIWIFY_PRODUCTS = {
  profissional: import.meta.env.VITE_KIWIFY_PROFISSIONAL_URL || "https://pay.kiwify.com.br/TMeCHm5",
  addonVideos: import.meta.env.VITE_KIWIFY_ADDON_VIDEOS_URL || "https://pay.kiwify.com.br/pHXcSm9",
  addonWhatsapp: import.meta.env.VITE_KIWIFY_ADDON_WHATSAPP_URL || "https://pay.kiwify.com.br/8rAK0uZ",
  addonSocial: import.meta.env.VITE_KIWIFY_ADDON_SOCIAL_URL || "https://pay.kiwify.com.br/y7gAGN7",
  criativosStarter: import.meta.env.VITE_KIWIFY_CREATOR_CRIATIVOS_STARTER || "https://pay.kiwify.com.br/UjBaKio",
  criativosBasico: import.meta.env.VITE_KIWIFY_CREATOR_CRIATIVOS_BASICO || "https://pay.kiwify.com.br/gCd9MsZ",
  criativosPro: import.meta.env.VITE_KIWIFY_CREATOR_CRIATIVOS_PRO || "https://pay.kiwify.com.br/2ofOTll",
  videosStarter: import.meta.env.VITE_KIWIFY_CREATOR_VIDEOS_STARTER || "https://pay.kiwify.com.br/Cp7NNZm",
  videosBasico: import.meta.env.VITE_KIWIFY_CREATOR_VIDEOS_BASICO || "https://pay.kiwify.com.br/iJ5cYCJ",
  videosPro: import.meta.env.VITE_KIWIFY_CREATOR_VIDEOS_PRO || "https://pay.kiwify.com.br/rJ4B7Op",
} as const;

// ─── Taxonomia por módulo (usado pelas LPs de Criativos e Vídeos) ────
export const KIWIFY_CHECKOUT_CRIATIVOS = {
  starter: KIWIFY_PRODUCTS.criativosStarter,
  basico: KIWIFY_PRODUCTS.criativosBasico,
  pro: KIWIFY_PRODUCTS.criativosPro,
} as const;

export const KIWIFY_CHECKOUT_VIDEOS = {
  starter: KIWIFY_PRODUCTS.videosStarter,
  basico: KIWIFY_PRODUCTS.videosBasico,
  pro: KIWIFY_PRODUCTS.videosPro,
} as const;

// ─── Shims legados — mantém as páginas antigas funcionando ───────────
// As páginas PlansPage/VideosPricingPage/VideoPricingCards esperam
// { [tier]: { monthly, yearly } }. Como Kiwify usa o mesmo link para
// mensal e anual (preço calculado na UI), apontamos ambos para a mesma URL.

export const KIWIFY_SUBSCRIPTION_LINKS = {
  starter:  { monthly: KIWIFY_PRODUCTS.criativosStarter, yearly: KIWIFY_PRODUCTS.criativosStarter },
  standard: { monthly: KIWIFY_PRODUCTS.criativosBasico,  yearly: KIWIFY_PRODUCTS.criativosBasico  },
  plus:     { monthly: KIWIFY_PRODUCTS.criativosPro,     yearly: KIWIFY_PRODUCTS.criativosPro     },
  premium:  { monthly: KIWIFY_PRODUCTS.profissional,     yearly: KIWIFY_PRODUCTS.profissional     },
} as const;

export const KIWIFY_VIDEO_LINKS = {
  starter:  { monthly: KIWIFY_PRODUCTS.videosStarter, yearly: KIWIFY_PRODUCTS.videosStarter },
  standard: { monthly: KIWIFY_PRODUCTS.videosBasico,  yearly: KIWIFY_PRODUCTS.videosBasico  },
  plus:     { monthly: KIWIFY_PRODUCTS.videosPro,     yearly: KIWIFY_PRODUCTS.videosPro     },
  premium:  { monthly: KIWIFY_PRODUCTS.videosPro,     yearly: KIWIFY_PRODUCTS.videosPro     },
} as const;

// Créditos avulsos ainda não têm produto Kiwify — mantemos placeholder
// para que handleKiwifyCheckout roteie para WhatsApp via fallback.
export const KIWIFY_CREDIT_LINKS: Record<number, string> = {
  20:  "https://pay.kiwify.com.br/TODO",
  50:  "https://pay.kiwify.com.br/TODO",
  150: "https://pay.kiwify.com.br/TODO",
};

// ─── Helpers ─────────────────────────────────────────────────────────

export function isKiwifyLinkReady(url: string): boolean {
  return !!url && url !== "#" && !url.includes("/TODO");
}

export function handleKiwifyCheckout(url: string): boolean {
  if (isKiwifyLinkReady(url)) {
    window.open(url, "_blank", "noopener");
    return true;
  }
  const msg = encodeURIComponent("Olá! Tenho interesse em assinar um plano do NexoImob AI. Podem me ajudar?");
  window.open(`https://wa.me/5571999990000?text=${msg}`, "_blank", "noopener");
  return false;
}
