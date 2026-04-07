/**
 * RouteTracker — Tracks SPA page views for GA4 + Meta Pixel (DEV-34 Growth)
 *
 * Also sets per-page meta tags via usePageMeta.
 * Place inside BrowserRouter.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackGA4PageView, trackPixelEvent } from "@/services/analytics/trackingPixels";
import { usePageMeta, PAGE_META } from "@/hooks/usePageMeta";

export function RouteTracker() {
  const location = useLocation();

  // Set per-page meta tags
  const meta = PAGE_META[location.pathname];
  usePageMeta(meta ?? {});

  // Track page views on route change
  useEffect(() => {
    trackGA4PageView(location.pathname, document.title);
    trackPixelEvent("PageView");
  }, [location.pathname]);

  return null;
}
