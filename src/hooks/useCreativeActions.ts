import { useCallback, useState } from "react";
import { useModules } from "@/hooks/useModuleAccess";
import { supabase } from "@/integrations/supabase/client";
import type { Creative } from "./useCreativesGallery";

export function useCreativeActions(onSuccess?: () => void) {
  const { can } = useModules();
  const [loading, setLoading] = useState<string | null>(null);

  const download = useCallback(
    async (creative: Creative) => {
      if (!can.downloadCreative()) return { blocked: true, reason: "upgrade" };
      setLoading(creative.id);
      try {
        const formats = [
          { url: creative.format_feed, name: `${creative.template_slug}-feed.jpg` },
          { url: creative.format_story, name: `${creative.template_slug}-story.jpg` },
          { url: creative.format_square, name: `${creative.template_slug}-square.jpg` },
        ].filter((f) => f.url);
        for (const f of formats) {
          const res = await fetch(f.url!);
          const blob = await res.blob();
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = f.name;
          a.click();
          URL.revokeObjectURL(a.href);
        }
        return { blocked: false };
      } finally {
        setLoading(null);
      }
    },
    [can]
  );

  const sendWhatsApp = useCallback(
    async (creative: Creative, phone: string) => {
      if (!can.sendCreativeWA()) return { blocked: true, reason: "upgrade" };
      setLoading(creative.id);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const imageUrl =
          creative.format_feed ?? creative.format_story ?? creative.format_square;
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-instance?action=send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session!.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone,
              imageUrl,
              caption: creative.caption ?? creative.template_name,
            }),
          }
        );
        return { blocked: false };
      } finally {
        setLoading(null);
      }
    },
    [can]
  );

  const approve = useCallback(
    async (creative: Creative, editedCaption?: string) => {
      if (!can.approveCreative()) return { blocked: true, reason: "upgrade" };
      setLoading(creative.id);
      try {
        const { error } = await supabase
          .from("creatives_gallery")
          .update({
            status: "approved",
            caption: editedCaption ?? creative.caption,
          })
          .eq("id", creative.id);
        if (!error) onSuccess?.();
        return { blocked: false, error };
      } finally {
        setLoading(null);
      }
    },
    [can, onSuccess]
  );

  const schedule = useCallback(
    async (creative: Creative, scheduledAt: Date) => {
      if (!can.scheduleCreative()) return { blocked: true, reason: "upgrade" };
      setLoading(creative.id);
      try {
        const { error } = await supabase
          .from("creatives_gallery")
          .update({
            status: "scheduled",
            scheduled_at: scheduledAt.toISOString(),
          })
          .eq("id", creative.id);
        if (!error) onSuccess?.();
        return { blocked: false, error };
      } finally {
        setLoading(null);
      }
    },
    [can, onSuccess]
  );

  const publishNow = useCallback(
    async (creative: Creative) => {
      if (!can.publishSocial()) return { blocked: true, reason: "upgrade" };
      setLoading(creative.id);
      try {
        const { error } = await supabase
          .from("creatives_gallery")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", creative.id);
        if (!error) onSuccess?.();
        return { blocked: false, error };
      } finally {
        setLoading(null);
      }
    },
    [can, onSuccess]
  );

  return { download, sendWhatsApp, approve, schedule, publishNow, loading };
}
