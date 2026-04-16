import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Creative {
  id: string;
  template_name: string;
  template_slug: string;
  status: "generating" | "ready" | "approved" | "scheduled" | "published" | "expired";
  format_feed: string | null;
  format_story: string | null;
  format_square: string | null;
  format_reel?: string | null;
  caption: string | null;
  hashtags: string | null;
  cta_text: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  expires_at: string;
  created_at: string;
  restoration_applied?: boolean;
  original_image_url?: string | null;
}

export type GalleryTab = "images" | "sequences" | "videos";

export function useCreativesGallery() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<GalleryTab>("images");

  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("creatives_gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCreatives(data as Creative[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  const counts = {
    images: creatives.filter((c) => c.format_feed || c.format_story || c.format_square).length,
    sequences: 0,
    videos: creatives.filter((c) => c.format_reel).length,
  };

  const getFormats = (c: Creative) => {
    const f: { label: string; url: string }[] = [];
    if (c.format_feed) f.push({ label: "Feed 4:5", url: c.format_feed });
    if (c.format_story) f.push({ label: "Stories 9:16", url: c.format_story });
    if (c.format_square) f.push({ label: "Quadrado 1:1", url: c.format_square });
    return f;
  };

  const getTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h restantes` : `${mins}min restantes`;
  };

  const updateCreative = useCallback(
    async (id: string, updates: Partial<Creative>) => {
      const { error } = await supabase
        .from("creatives_gallery")
        .update(updates)
        .eq("id", id);
      if (!error) fetchCreatives();
      return !error;
    },
    [fetchCreatives]
  );

  return {
    creatives,
    loading,
    tab,
    setTab,
    counts,
    getFormats,
    getTimeLeft,
    updateCreative,
    refetch: fetchCreatives,
  };
}
