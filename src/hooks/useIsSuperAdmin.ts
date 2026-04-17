import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsSuperAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-super-admin", user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      if (error) {
        console.warn("[useIsSuperAdmin] lookup failed:", error.message);
        return false;
      }
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}
