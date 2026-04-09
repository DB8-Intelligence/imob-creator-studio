import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AsaasCheckoutResult {
  subscription_id: string;
  checkout_url: string;
  payment_id: string;
}

export function useAsaasSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (
      moduleId: string,
      planSlug: string,
      cpfCnpj?: string,
      phone?: string
    ): Promise<AsaasCheckoutResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Usuário não autenticado");

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-asaas-subscription`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              module_id: moduleId,
              plan_slug: planSlug,
              cpf_cnpj: cpfCnpj ?? "",
              phone: phone ?? "",
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? "Erro ao criar assinatura");
        }

        window.open(data.checkout_url, "_blank");

        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { subscribe, loading, error };
}
