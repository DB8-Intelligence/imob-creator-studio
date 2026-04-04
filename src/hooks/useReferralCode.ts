/**
 * useReferralCode — get or create the current user's referral code,
 * and load their referral stats (clicks, signups, rewards).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { deriveReferralCode } from "@/lib/shareUtils";

export interface ReferralStats {
  code:        string;
  clickCount:  number;
  signups:     number;
  conversions: number;
  credits:     number;
  extraDays:   number;
}

export interface UseReferralCodeResult {
  stats:   ReferralStats | null;
  loading: boolean;
  error:   string | null;
  refresh: () => void;
}

export function useReferralCode(): UseReferralCodeResult {
  const { user }             = useAuth();
  const [stats,   setStats]  = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState<string | null>(null);
  const [rev,     setRev]    = useState(0);

  const refresh = () => setRev((r) => r + 1);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const derived = deriveReferralCode(user!.id);

        // Upsert: create if not exists, keep existing code
        const { error: upsertErr } = await supabase
          .from("referral_codes")
          .upsert({ user_id: user!.id, code: derived }, { onConflict: "user_id", ignoreDuplicates: true });

        if (upsertErr) throw upsertErr;

        // Fetch current row
        const { data: codeRow, error: codeErr } = await supabase
          .from("referral_codes")
          .select("code, click_count")
          .eq("user_id", user!.id)
          .single();

        if (codeErr) throw codeErr;

        // Fetch event counts
        const { data: events, error: eventsErr } = await supabase
          .from("referral_events")
          .select("event_type")
          .eq("referrer_user_id", user!.id);

        if (eventsErr) throw eventsErr;

        const signups     = events?.filter((e) => e.event_type === "signup").length     ?? 0;
        const conversions = events?.filter((e) => e.event_type === "converted").length  ?? 0;

        // Fetch rewards
        const { data: rewards, error: rewardsErr } = await supabase
          .from("referral_rewards")
          .select("reward_type, reward_value")
          .eq("user_id", user!.id);

        if (rewardsErr) throw rewardsErr;

        const credits   = rewards?.filter((r) => r.reward_type === "credits")   .reduce((s, r) => s + r.reward_value, 0) ?? 0;
        const extraDays = rewards?.filter((r) => r.reward_type === "extra_days").reduce((s, r) => s + r.reward_value, 0) ?? 0;

        if (!cancelled) {
          setStats({
            code:        codeRow.code,
            clickCount:  codeRow.click_count,
            signups,
            conversions,
            credits,
            extraDays,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [user, rev]);

  return { stats, loading, error, refresh };
}
