/**
 * LPAnalyticsPage — estatísticas detalhadas de uma LP específica.
 * Rota: /dashboard/minhas-lps/:id
 *
 * Mostra:
 *  - Header com título, template, URL pública, ações (editar, QR, abrir)
 *  - 3 cards: views, leads, conversão
 *  - Lista de leads capturados pela LP (via utm_campaign=slug)
 */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Eye, Users, TrendingUp, ExternalLink, QrCode, Pencil,
  Loader2, FileText, Calendar, Mail, Phone, MessageSquare, Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LP_TEMPLATES, type LandingPage, type LPTemplate,
} from "@/types/landing-page";
import type { SiteImovel } from "@/types/site";
import LPQrCodeModal from "@/components/landing-pages/LPQrCodeModal";
import LPWizard from "@/components/landing-pages/LPWizard";
import { useAuth } from "@/hooks/useAuth";

interface LeadRow {
  id: string;
  nome: string;
  email: string | null;
  telefone: string;
  mensagem: string | null;
  created_at: string;
}

interface LPWithRelations extends LandingPage {
  imovel?: SiteImovel | null;
}

export default function LPAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [lp, setLp] = useState<LPWithRelations | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);

      const { data: lpData, error: lpErr } = await supabase
        .from("landing_pages")
        .select("*, imovel:site_imoveis(*)")
        .eq("id", id)
        .maybeSingle();

      if (lpErr || !lpData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const lpRow = lpData as unknown as LPWithRelations;
      setLp(lpRow);

      // Busca leads capturados especificamente por esta LP (via utm_campaign = slug)
      const { data: leadsData } = await supabase
        .from("site_leads")
        .select("id, nome, email, telefone, mensagem, created_at")
        .eq("utm_campaign", lpRow.slug)
        .order("created_at", { ascending: false })
        .limit(50);

      setLeads((leadsData as LeadRow[]) || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (notFound || !lp) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="mb-2 text-xl font-bold">LP não encontrada</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Esta landing page foi removida ou você não tem permissão pra ver.
          </p>
          <Button asChild>
            <Link to="/dashboard/minhas-lps">Voltar</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const template = LP_TEMPLATES.find((t) => t.id === (lp.template as LPTemplate));
  const publicUrl = `${window.location.origin}/imovel/${lp.slug}`;
  const views = lp.views_count || 0;
  const leadsCount = lp.leads_count || leads.length;
  const ctr = views > 0 ? Math.round((leadsCount / views) * 1000) / 10 : 0;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({ title: "Link copiado!" });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/dashboard/minhas-lps"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Minhas LPs
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Analytics</span>
        </div>

        {/* Header */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {template && (
            <div className={`h-16 bg-gradient-to-r ${template.gradient}`} />
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {template?.label || lp.template}
                  </Badge>
                  <Badge variant={lp.ativo ? "default" : "secondary"} className="text-[10px]">
                    {lp.ativo ? "Ativa" : "Desativada"}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {lp.tipo === "html" ? "HTML" : "PDF"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {lp.headline || lp.imovel?.titulo || "(sem título)"}
                </h1>
                {lp.imovel && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[lp.imovel.bairro, lp.imovel.cidade].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Copiar link
                </Button>
                {lp.tipo === "html" && lp.ativo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrOpen(true)}
                  >
                    <QrCode className="mr-1 h-3.5 w-3.5" />
                    QR Code
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button size="sm" asChild>
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    Abrir LP
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            icon={<Eye className="h-5 w-5" />}
            label="Visualizações"
            value={views}
            hint={views === 0 ? "Ainda sem acessos" : `${views} pessoa${views !== 1 ? "s" : ""} abriram a LP`}
          />
          <KpiCard
            icon={<Users className="h-5 w-5" />}
            label="Leads capturados"
            value={leadsCount}
            hint={leadsCount === 0 ? "Ainda sem leads" : `${leadsCount} form${leadsCount !== 1 ? "s" : ""} preenchido${leadsCount !== 1 ? "s" : ""}`}
          />
          <KpiCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Conversão"
            value={ctr}
            suffix="%"
            hint={views === 0 ? "—" : `${leadsCount}/${views} visitantes viraram lead`}
          />
        </div>

        {/* Leads capturados */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold">Leads capturados</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Contatos que preencheram o formulário desta LP
            </p>
          </div>

          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhum lead capturado ainda. Compartilhe o link ou o QR Code pra começar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between gap-4 p-5 transition hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{lead.nome}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {lead.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.telefone}
                        </span>
                      )}
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {lead.mensagem && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-2">{lead.mensagem}</span>
                      </p>
                    )}
                  </div>
                  {lead.telefone && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://wa.me/${lead.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Responder
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {qrOpen && (
        <LPQrCodeModal
          open={qrOpen}
          onOpenChange={setQrOpen}
          slug={lp.slug}
          title={lp.headline || lp.imovel?.titulo || "Landing Page"}
        />
      )}

      {editOpen && lp.imovel && user && (
        <LPWizard
          open={editOpen}
          onOpenChange={setEditOpen}
          userId={user.id}
          imovel={lp.imovel}
          initialLp={lp}
          onSaved={() => {
            // Re-fetch pra ver as mudanças
            navigate(0);
          }}
        />
      )}
    </AppLayout>
  );
}

/* ---------------- KpiCard ---------------- */

function KpiCard({
  icon, label, value, suffix, hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wider">
            {label}
          </span>
        </div>
        <p className="text-3xl font-bold text-foreground">
          {value}
          {suffix}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
