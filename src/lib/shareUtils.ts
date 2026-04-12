/**
 * Share utilities — referral URLs, captions, platform links.
 * Used by SharePanel, ShareButton, and NextActionsPanel.
 */

const APP_BASE =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://app.db8intelligence.com.br";

// ── URL builder ──────────────────────────────────────────────────────────────

export interface ShareLinkParams {
  referralCode?: string;
  utmContent?: string; // e.g. 'post_share', 'library_share', 'referral_page'
  utmCampaign?: string;
}

export function buildShareUrl(params: ShareLinkParams = {}): string {
  const url = new URL(`${APP_BASE}/auth`);
  if (params.referralCode) url.searchParams.set("ref", params.referralCode);
  url.searchParams.set("utm_source", "share");
  url.searchParams.set("utm_medium", "organic");
  if (params.utmContent)  url.searchParams.set("utm_content",  params.utmContent);
  if (params.utmCampaign) url.searchParams.set("utm_campaign", params.utmCampaign);
  return url.toString();
}

// ── Caption + attribution ─────────────────────────────────────────────────────

export function buildShareCaption(caption: string, shareUrl: string): string {
  return `${caption}\n\n✨ Criado com NexoImob AI\n${shareUrl}`;
}

export function buildMinimalShareCaption(shareUrl: string): string {
  return `✨ Criado com NexoImob AI — IA para o mercado imobiliario\n${shareUrl}`;
}

// ── Platform links ────────────────────────────────────────────────────────────

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildTwitterUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

// ── Referral code generation ──────────────────────────────────────────────────

/** Derives a deterministic 8-char code from user UUID. */
export function deriveReferralCode(userId: string): string {
  return userId.replace(/-/g, "").substring(0, 8).toUpperCase();
}

// ── clipboard helper ─────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  }
}

// ── Blob download helper ──────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadFromUrl(imageUrl: string, filename: string): void {
  const a   = document.createElement("a");
  a.href     = imageUrl;
  a.download = filename;
  a.target   = "_blank";
  a.click();
}
