/**
 * ImovelLPPublico.tsx — Rota pública /imovel/:slug
 * Renderiza a Landing Page gerada pelo corretor. Sem auth.
 *
 * Fluxo:
 *  1. Busca a LP por slug (RLS garante apenas ativo + não expirado).
 *  2. Busca o imóvel relacionado.
 *  3. Busca dados do corretor (corretor_sites).
 *  4. Incrementa views_count.
 *  5. Renderiza via LPRenderer.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LPRenderer from "@/components/landing-pages/LPRenderer";
import type { LandingPage } from "@/types/landing-page";
import type { SiteImovel, CorretorSite } from "@/types/site";

interface Corretor {
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  creci?: string;
  foto_url?: string;
  logo_url?: string;
}

export default function ImovelLPPublico() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [imovel, setImovel] = useState<SiteImovel | null>(null);
  const [corretor, setCorretor] = useState<Corretor | null>(null);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);

      // 1. LP por slug (RLS já filtra ativo + expires_at)
      const { data: lpData, error: lpErr } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (lpErr || !lpData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const lpRow = lpData as unknown as LandingPage;
      setLp(lpRow);

      // 2+3 em paralelo: imóvel + corretor
      const [imovelRes, siteRes] = await Promise.all([
        supabase
          .from("site_imoveis")
          .select("*")
          .eq("id", lpRow.imovel_id)
          .maybeSingle(),
        supabase
          .from("corretor_sites")
          .select("nome_completo, telefone, whatsapp, email_contato, creci, foto_url, logo_url")
          .eq("user_id", lpRow.user_id)
          .maybeSingle(),
      ]);

      if (!imovelRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const imovelRow = imovelRes.data as unknown as SiteImovel;
      setImovel(imovelRow);

      const siteRow = siteRes.data as unknown as CorretorSite | null;
      setCorretor({
        nome: siteRow?.nome_completo || "Corretor",
        telefone: siteRow?.telefone || undefined,
        whatsapp: siteRow?.whatsapp || undefined,
        email: siteRow?.email_contato || undefined,
        creci: siteRow?.creci || undefined,
        foto_url: siteRow?.foto_url || undefined,
        logo_url: siteRow?.logo_url || undefined,
      });

      // Título do documento
      document.title = `${lpRow.headline || imovelRow.titulo || "Imóvel"} | ${siteRow?.nome_completo || "NexoImob"}`;

      // 4. incrementar views (best-effort, sem bloquear render)
      supabase
        .rpc("increment_lp_views", { lp_id: lpRow.id })
        .then(({ error }) => {
          if (error) {
            // fallback: update direto (se a RPC não existir)
            supabase
              .from("landing_pages")
              .update({ views_count: (lpRow.views_count || 0) + 1 })
              .eq("id", lpRow.id)
              .then(() => {});
          }
        });

      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !lp || !imovel || !corretor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-sm">
          <Home className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Página não encontrada
          </h1>
          <p className="text-sm text-gray-500">
            Esta landing page pode ter expirado ou foi removida pelo corretor.
          </p>
        </div>
      </div>
    );
  }

  return <LPRenderer imovel={imovel} lp={lp} corretor={corretor} />;
}
