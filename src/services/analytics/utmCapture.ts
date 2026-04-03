// UTM Attribution Capture
// First-touch: written once, never overwritten (stored as imob_first_touch)
// Last-touch:  always overwritten when URL has UTM params (stored as imob_last_touch)

const FIRST_TOUCH_KEY = "imob_first_touch";
const LAST_TOUCH_KEY  = "imob_last_touch";

export interface UtmData {
  utm_source?:    string;
  utm_medium?:    string;
  utm_campaign?:  string;
  utm_content?:   string;
  utm_term?:      string;
  landing_page?:  string;
  captured_at?:   string;
}

function readUtmFromUrl(): UtmData | null {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source");
  if (!source) return null;
  return {
    utm_source:   source,
    utm_medium:   params.get("utm_medium")   ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_content:  params.get("utm_content")  ?? undefined,
    utm_term:     params.get("utm_term")     ?? undefined,
    landing_page: window.location.pathname,
    captured_at:  new Date().toISOString(),
  };
}

/** First-touch: capture once per browser; ignores subsequent calls. */
export function captureAttribution(): void {
  if (localStorage.getItem(FIRST_TOUCH_KEY)) return;
  const utms = readUtmFromUrl();
  if (!utms) return;
  localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(utms));
}

/** Last-touch: always overwrite when URL has UTM params. */
export function captureLastTouch(): void {
  const utms = readUtmFromUrl();
  if (!utms) return;
  localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(utms));
}

/** Returns first-touch UTM fields for event metadata enrichment. */
export function getAttributionMetadata(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    if (!raw) return {};
    const d: UtmData = JSON.parse(raw);
    return {
      ...(d.utm_source   ? { utm_source:   d.utm_source   } : {}),
      ...(d.utm_medium   ? { utm_medium:   d.utm_medium   } : {}),
      ...(d.utm_campaign ? { utm_campaign: d.utm_campaign } : {}),
      ...(d.utm_content  ? { utm_content:  d.utm_content  } : {}),
      ...(d.utm_term     ? { utm_term:     d.utm_term     } : {}),
      ...(d.landing_page ? { landing_page: d.landing_page } : {}),
    };
  } catch {
    return {};
  }
}

/** Returns last-touch UTM fields with lt_ prefix for event metadata enrichment. */
export function getLastTouchMetadata(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LAST_TOUCH_KEY);
    if (!raw) return {};
    const d: UtmData = JSON.parse(raw);
    return {
      ...(d.utm_source   ? { lt_utm_source:   d.utm_source   } : {}),
      ...(d.utm_medium   ? { lt_utm_medium:   d.utm_medium   } : {}),
      ...(d.utm_campaign ? { lt_utm_campaign: d.utm_campaign } : {}),
      ...(d.utm_content  ? { lt_utm_content:  d.utm_content  } : {}),
      ...(d.utm_term     ? { lt_utm_term:     d.utm_term     } : {}),
      ...(d.landing_page ? { lt_landing_page: d.landing_page } : {}),
    };
  } catch {
    return {};
  }
}

/** Returns raw last-touch data or null. */
export function getLastTouch(): UtmData | null {
  try {
    const raw = localStorage.getItem(LAST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as UtmData) : null;
  } catch {
    return null;
  }
}

/** Returns raw first-touch data or null. */
export function getFirstTouch(): UtmData | null {
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as UtmData) : null;
  } catch {
    return null;
  }
}
