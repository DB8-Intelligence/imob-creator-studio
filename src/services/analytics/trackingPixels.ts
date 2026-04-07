/**
 * trackingPixels.ts — GA4 + Meta Pixel bridge (DEV-34 Growth)
 *
 * Bridges internal events to GA4 and Meta Pixel.
 * IDs are loaded from env vars (VITE_GA4_ID, VITE_META_PIXEL_ID).
 * If IDs are not set, functions are no-ops.
 */

// ─── GA4 ─────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

/** Initialize GA4 script tag */
export function initGA4() {
  if (!GA4_ID || typeof document === "undefined") return;
  if (document.querySelector(`script[src*="gtag"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: true });
}

/** Track GA4 event */
export function trackGA4Event(eventName: string, params?: Record<string, unknown>) {
  if (!GA4_ID || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/** Track GA4 page view (for SPA navigation) */
export function trackGA4PageView(path: string, title: string) {
  if (!GA4_ID || !window.gtag) return;
  window.gtag("config", GA4_ID, { page_path: path, page_title: title });
}

// ─── Meta Pixel ──────────────────────────────────────────────────────────────

/** Initialize Meta Pixel script */
export function initMetaPixel() {
  if (!PIXEL_ID || typeof document === "undefined") return;
  if (window.fbq) return;

  // Meta Pixel base code
  const script = document.createElement("script");
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // noscript fallback
  const noscript = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
}

/** Track Meta Pixel standard event */
export function trackPixelEvent(eventName: string, params?: Record<string, unknown>) {
  if (!PIXEL_ID || !window.fbq) return;
  window.fbq("track", eventName, params);
}

/** Track Meta Pixel custom event */
export function trackPixelCustom(eventName: string, params?: Record<string, unknown>) {
  if (!PIXEL_ID || !window.fbq) return;
  window.fbq("trackCustom", eventName, params);
}

// ─── Unified bridge ──────────────────────────────────────────────────────────

/** Initialize all tracking pixels */
export function initTracking() {
  initGA4();
  initMetaPixel();
}

/** Track a conversion event across all platforms */
export function trackConversion(event: string, params?: Record<string, unknown>) {
  // GA4
  trackGA4Event(event, params);

  // Meta Pixel — map to standard events
  const PIXEL_MAP: Record<string, string> = {
    signup: "CompleteRegistration",
    creative_generated: "Lead",
    publication_done: "Purchase",
    upgrade: "Subscribe",
    trial_start: "StartTrial",
  };

  const pixelEvent = PIXEL_MAP[event];
  if (pixelEvent) {
    trackPixelEvent(pixelEvent, params);
  } else {
    trackPixelCustom(event, params);
  }
}
