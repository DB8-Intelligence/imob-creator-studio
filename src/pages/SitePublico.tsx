/**
 * SitePublico.tsx — Rota pública /c/:slug
 * Renderiza o site do corretor para visitantes. Sem auth.
 * Inclui formulário de contato (insere em site_leads) e botão flutuante WhatsApp.
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageCircle, Send, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ThemeRenderer from "@/components/site-themes/ThemeRenderer";
import type { SiteThemeConfig } from "@/components/site-themes/TemaBreza";
import type {
  CorretorSite,
  SiteImovel,
  SiteDepoimento,
  SiteLead,
} from "@/types/site";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SitePublico() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<CorretorSite | null>(null);
  const [imoveis, setImoveis] = useState<SiteImovel[]>([]);
  const [depoimentos, setDepoimentos] = useState<SiteDepoimento[]>([]);

  // Contact form state
  const [leadNome, setLeadNome] = useState("");
  const [leadTelefone, setLeadTelefone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMensagem, setLeadMensagem] = useState("");
  const [sendingLead, setSendingLead] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Fetch published site by slug
      const { data: siteData, error: siteErr } = await supabase
        .from("corretor_sites")
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();

      if (siteErr || !siteData) {
        setLoading(false);
        return;
      }

      const siteRow = siteData as unknown as CorretorSite;
      setSite(siteRow);

      // Dynamic document title
      document.title = siteRow.meta_titulo
        ? siteRow.meta_titulo
        : `${siteRow.nome_completo} | Corretor de Imóveis`;

      // Fetch imoveis + depoimentos in parallel
      const [imoveisRes, depoimentosRes] = await Promise.all([
        supabase
          .from("site_imoveis")
          .select("*")
          .eq("site_id", siteRow.id)
          .eq("status", "disponivel")
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
  }, [slug]);

  /* ---------------------------------------------------------------- */
  /*  Contact form submit                                              */
  /* ---------------------------------------------------------------- */

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || !leadNome || !leadTelefone) return;

    setSendingLead(true);

    const leadData: Omit<SiteLead, "id" | "created_at"> = {
      site_id: site.id,
      corretor_user_id: site.user_id,
      nome: leadNome,
      email: leadEmail || undefined,
      telefone: leadTelefone,
      mensagem: leadMensagem,
      interesse: "compra",
      origem: `site-publico:${slug}`,
      processado: false,
    };

    const { error } = await supabase
      .from("site_leads")
      .insert(leadData as never);

    setSendingLead(false);

    if (!error) {
      setLeadSent(true);
      setLeadNome("");
      setLeadTelefone("");
      setLeadEmail("");
      setLeadMensagem("");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading                                                          */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  404 — Site not found                                             */
  /* ---------------------------------------------------------------- */

  if (!site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-6">
        <Building2 className="mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Site não encontrado
        </h1>
        <p className="mb-6 max-w-md text-center text-sm text-gray-500">
          Este endereço não corresponde a nenhum site publicado. Pode ter sido
          removido ou o endereço está incorreto.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Criar seu site grátis com NexoImob AI
          <ArrowRight className="h-4 w-4" />
        </Link>
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

  const whatsappNumber = (site.whatsapp || "").replace(/\D/g, "");

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative min-h-screen">
      {/* Theme render */}
      <ThemeRenderer config={themeConfig} theme={site.tema || "brisa"} />

      {/* ── Depoimentos Section ─────────────────────────────────── */}
      {depoimentos.length > 0 && (
        <section className="bg-gray-50 px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
              O que dizem sobre mim
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {depoimentos.map((dep) => (
                <div
                  key={dep.id}
                  className="rounded-xl bg-white p-5 shadow-sm border border-gray-100"
                >
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="text-sm"
                        style={{
                          color: i < dep.avaliacao ? "#f5a623" : "#e5e7eb",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-3 text-sm italic text-gray-600">
                    "{dep.texto}"
                  </p>
                  <div className="flex items-center gap-3">
                    {dep.foto_url && (
                      <img
                        src={dep.foto_url}
                        alt={dep.nome_cliente}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {dep.nome_cliente}
                      </p>
                      {dep.tipo_negocio && (
                        <p className="text-xs text-gray-400">
                          {dep.tipo_negocio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact Form Section ────────────────────────────────── */}
      <section className="bg-white px-6 py-12" id="contato">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">
            Entre em Contato
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500">
            Preencha o formulário abaixo e retornarei o mais breve possível.
          </p>

          {leadSent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-800">
                Mensagem enviada!
              </h3>
              <p className="mt-1 text-sm text-green-600">
                Entrarei em contato em breve. Obrigado pelo interesse!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setLeadSent(false)}
              >
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <Label htmlFor="lead_nome">Nome *</Label>
                <Input
                  id="lead_nome"
                  required
                  value={leadNome}
                  onChange={(e) => setLeadNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_telefone">Telefone *</Label>
                  <Input
                    id="lead_telefone"
                    required
                    value={leadTelefone}
                    onChange={(e) => setLeadTelefone(e.target.value)}
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="lead_email">E-mail</Label>
                  <Input
                    id="lead_email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lead_mensagem">Mensagem</Label>
                <Textarea
                  id="lead_mensagem"
                  rows={4}
                  value={leadMensagem}
                  onChange={(e) => setLeadMensagem(e.target.value)}
                  placeholder="Estou interessado em..."
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={sendingLead}
              >
                {sendingLead ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar mensagem
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer credit ───────────────────────────────────────── */}
      <div className="bg-gray-900 py-3 text-center text-xs text-gray-500">
        Powered by{" "}
        <a
          href="https://nexoimobai.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline hover:text-white"
        >
          NexoImob AI
        </a>
      </div>

      {/* ── Floating WhatsApp Button ────────────────────────────── */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            "Olá! Vim pelo seu site e gostaria de mais informações.",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
