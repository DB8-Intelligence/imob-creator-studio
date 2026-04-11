import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserPlanRow {
  status: string;
  addon_videos_ffmpeg: boolean;
  addon_videos_shotstack_credits: number;
  addon_whatsapp_pro: boolean;
  addon_social_autopilot: boolean;
  addon_portais_xml: boolean;
  addon_bundle: boolean;
  [key: string]: unknown;
}

export function useAddons() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlanRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setPlan(data as UserPlanRow | null);
        setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [user]);

  return {
    hasVideosFFmpeg: plan?.addon_videos_ffmpeg || plan?.addon_bundle || false,
    hasWhatsappPro: plan?.addon_whatsapp_pro || plan?.addon_bundle || false,
    hasSocialAutopilot: plan?.addon_social_autopilot || plan?.addon_bundle || false,
    hasPortaisXML: plan?.addon_portais_xml || plan?.addon_bundle || false,
    shotstackCredits: plan?.addon_videos_shotstack_credits || 0,
    planStatus: plan?.status || "inactive" as string,
    loading,
  };
}
