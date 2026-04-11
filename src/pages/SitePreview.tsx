/**
 * SitePreview.tsx — Rota pública /site-preview
 * Exibe uma preview do site do corretor com banner amarelo no topo.
 * Recebe ?user_id= como query param. Sem auth.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye } from "lucide-react";
import ThemeRenderer from "@/components/site-themes/ThemeRenderer";
import type { SiteThemeConfig } from "@/components/site-themes/TemaBreza";
import type { CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SitePreview() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");

  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<CorretorSite | null>(null);
  const [imoveis, setImoveis] = useState<SiteImovel[]>([]);
  const [depoimentos, setDepoimentos] = useState<SiteDepoimento[]>([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Fetch site config
      const { data: siteData, error: siteErr } = await supabase
        .from("corretor_sites")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (siteErr || !siteData) {
        setLoading(false);
        return;
      }

      const siteRow = siteData as unknown as CorretorSite;
      setSite(siteRow);

      // Fetch imoveis + depoimentos in parallel
      const [imoveisRes, depoimentosRes] = await Promise.all([
        supabase
          .from("site_imoveis")
          .select("*")
          .eq("site_id", siteRow.id)
          .order("ordem_exibicao", { ascending: true }),
        supabase
          .from("site_depoimentos")
          .select("*")
          .eq("site_id", siteRow.id)
          .eq("ativo", true)
          .order("ordem", { ascending: true }),
      ]);

      setImoveis((imoveisRes.data ?? []) as unknown as SiteImovel[]);
      setDepoimentos(
        (depoimentosRes.data ?? []) as unknown as SiteDepoimento[],
      );
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  /* ---------------------------------------------------------------- */
  /*  No user_id                                                       */
  /* ---------------------------------------------------------------- */

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Eye className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="text-xl font-bold text-gray-800">
            Nenhum site para visualizar
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Informe o parâmetro <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">?user_id=</code> na URL para carregar a preview.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Site not found                                                   */
  /* ---------------------------------------------------------------- */

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">
            Site não encontrado
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Nenhum site configurado para este usuário.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Build theme config                                               */
  /* ---------------------------------------------------------------- */

  const themeConfig: SiteThemeConfig = {
    nome_empresa: site.nome_completo || "Corretor",
    whatsapp: site.whatsapp || "",
    email: site.email_contato || "",
    cor_primaria: site.cor_primaria || "#0284C7",
    cor_secundaria: site.cor_secundaria || "#F59E0B",
    properties: imoveis.map((im) => ({
      id: im.id,
      title: im.titulo,
      price: im.preco ?? null,
      property_type: im.tipo,
      status: im.status,
    })),
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen">
      {/* Yellow preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-900">
        <Eye className="h-4 w-4" />
        MODO PREVIEW — Assim seu site ficará para os visitantes
      </div>

      {/* Theme render */}
      <ThemeRenderer
        config={themeConfig}
        theme={site.tema || "brisa"}
      />
    </div>
  );
}
