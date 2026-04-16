/**
 * funnel.ts — client-side funnel event tracker
 *
 * Fire-and-forget inserter into public.funnel_events. Never throws, never
 * blocks UX. Uses the shared supabase singleton (anon key), which is allowed
 * to INSERT into funnel_events by the public RLS policy.
 *
 * Session ID strategy: generated once per browser tab in sessionStorage.
 * Persistent across navigations within the same tab, resets on tab close.
 *
 * Naming convention (snake_case, verb_object):
 *   Frontend: view_landing, view_pricing, click_cta, click_checkout, select_plan
 *   Backend (via edge functions): webhook_received, payment_approved,
 *                                  subscription_created, credits_released,
 *                                  webhook_error, payment_suspect
 *
 * Metadata fields (no fixed schema, but common ones):
 *   - page: window.location.pathname
 *   - plan: starter | basico | pro | profissional
 *   - module: criativos | videos | site | crm | whatsapp | social | saas
 *   - source: utm_source or referrer
 *   - provider: kiwify | asaas (backend only)
 *   - order_id / payment_id (backend only)
 */

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "nexoimob_session_id";

/** Returns a stable session id for the current browser tab. */
function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage blocked (private mode, etc.) — generate ephemeral id.
    return crypto.randomUUID();
  }
}

/** Extracts utm_source / referrer so we always have a traffic origin. */
function getDefaultMetadata(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const utmSource = url.searchParams.get("utm_source");
  const utmMedium = url.searchParams.get("utm_medium");
  const utmCampaign = url.searchParams.get("utm_campaign");
  return {
    page: window.location.pathname,
    source: utmSource || document.referrer || "direct",
    ...(utmMedium && { utm_medium: utmMedium }),
    ...(utmCampaign && { utm_campaign: utmCampaign }),
  };
}

export interface TrackOptions {
  email?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget event track. Never throws, never blocks navigation.
 *
 * @example
 * trackEvent("click_checkout", { metadata: { plan: "basico", module: "criativos" } });
 */
export function trackEvent(event: string, options: TrackOptions = {}): void {
  if (!event || event.length > 64) return;

  const row = {
    event,
    email: options.email ?? null,
    session_id: getSessionId(),
    metadata: {
      ...getDefaultMetadata(),
      ...(options.metadata ?? {}),
    },
  };

  // Fire-and-forget: we do not await and we swallow any error.
  // Tracking must never degrade UX.
  supabase
    .from("funnel_events")
    .insert(row)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        // Dev-only console; terser drops this in production builds.
        console.warn("[funnel] insert failed:", error.message);
      }
    });
}

// ── Typed shortcuts for the core funnel events ─────────────────

export const funnel = {
  viewLanding:   (meta?: Record<string, unknown>) => trackEvent("view_landing", { metadata: meta }),
  viewPricing:   (meta?: Record<string, unknown>) => trackEvent("view_pricing", { metadata: meta }),
  clickCTA:      (ctaName: string, meta?: Record<string, unknown>) =>
                   trackEvent("click_cta", { metadata: { cta: ctaName, ...meta } }),
  clickCheckout: (plan: string, mod: string, meta?: Record<string, unknown>) =>
                   trackEvent("click_checkout", { metadata: { plan, module: mod, ...meta } }),
  selectPlan:    (plan: string, meta?: Record<string, unknown>) =>
                   trackEvent("select_plan", { metadata: { plan, ...meta } }),
  scrollSection: (section: string, meta?: Record<string, unknown>) =>
                   trackEvent("scroll_section", { metadata: { section, ...meta } }),
  startSignup:   (meta?: Record<string, unknown>) => trackEvent("start_signup", { metadata: meta }),
  completeSignup:(email: string, meta?: Record<string, unknown>) =>
                   trackEvent("complete_signup", { email, metadata: meta }),
};
