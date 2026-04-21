/**
 * MinhasLandingPagesPage.tsx — Listagem completa de LPs do corretor.
 *
 * 2 tabs:
 *  - HTML ativas (max 5)
 *  - PDFs guardados (max 5, expiram em 5 dias)
 *
 * Ações: copiar link, abrir pública, baixar PDF, desativar (HTML), deletar.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText, Globe, FileDown, Copy, ExternalLink, Eye, Users,
  Loader2, Trash2, Power, RefreshCw, Calendar, Home, CopyPlus, Pencil, QrCode,
} from "lucide-react";
import LPWizard from "@/components/landing-pages/LPWizard";
import LPQrCodeModal from "@/components/landing-pages/LPQrCodeModal";
import type { SiteImovel } from "@/types/site";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LP_TEMPLATES, generateLPSlug, type LandingPage, type LPTemplate } from "@/types/landing-page";

const QUOTA_LIMIT = 5;

interface LPWithImovel extends LandingPage {
  imovel?: { titulo: string | null; cidade: string | null; bairro: string | null };
}

export default function MinhasLandingPagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lps, setLps] = useState<LPWithImovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [editingLp, setEditingLp] = useState<LandingPage | null>(null);
  const [editingImovel, setEditingImovel] = useState<SiteImovel | null>(null);
  const [qrCodeLp, setQrCodeLp] = useState<LPWithImovel | null>(null);

  const fetchLps = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("landing_pages")
      .select("*, imovel:site_imoveis(titulo, cidade, bairro)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar LPs", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setLps((data as unknown as LPWithImovel[]) || []);
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => { fetchLps(); }, [fetchLps]);

  const { htmlAtivas, pdfsValidos, htmlHistorico } = useMemo(() => {
    const now = Date.now();
    const htmlAtivas = lps.filter((l) => l.tipo === "html" && l.ativo);
    const htmlHistorico = lps.filter((l) => l.tipo === "html" && !l.ativo);
    const pdfsValidos = lps.filter(
      (l) => l.tipo === "pdf" && (!l.expires_at || new Date(l.expires_at).getTime() > now)
    );
    return { htmlAtivas, pdfsValidos, htmlHistorico };
  }, [lps]);

  async function toggleAtivo(lp: LPWithImovel) {
    const { error } = await supabase
      .from("landing_pages")
      .update({ ativo: !lp.ativo })
      .eq("id", lp.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: lp.ativo ? "LP desativada" : "LP reativada",
      description: lp.ativo ? "Link público não funciona mais." : "Link público voltou ao ar.",
    });
    fetchLps();
  }

  async function deletar(lp: LPWithImovel) {
    const { error } = await supabase.from("landing_pages").delete().eq("id", lp.id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "LP removida" });
    fetchLps();
  }

  async function abrirEditor(lp: LPWithImovel) {
    // Busca o imovel completo pra passar ao wizard (precisa de fotos, specs, etc)
    const { data: imovelData, error: imovelErr } = await supabase
      .from("site_imoveis")
      .select("*")
      .eq("id", lp.imovel_id)
      .maybeSingle();

    if (imovelErr || !imovelData) {
      toast({
        title: "Imóvel não encontrado",
        description: "Esta LP aponta para um imóvel que foi removido.",
        variant: "destructive",
      });
      return;
    }

    setEditingImovel(imovelData as unknown as SiteImovel);
    setEditingLp(lp);
  }

  async function duplicar(lp: LPWithImovel) {
    if (!user?.id) return;

    // Gera slug novo (mesmo helper do wizard)
    const baseTitulo = lp.headline || lp.imovel?.titulo || "imovel";
    const newSlug = generateLPSlug(baseTitulo);

    // Mesmo tipo/template/template. PDF ganha novos 5 dias.
    const expiresAt =
      lp.tipo === "pdf"
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const { data: inserted, error } = await supabase
      .from("landing_pages")
      .insert({
        user_id: user.id,
        imovel_id: lp.imovel_id,
        template: lp.template,
        slug: newSlug,
        tipo: lp.tipo,
        headline: lp.headline ? `${lp.headline} (cópia)` : null,
        subheadline: lp.subheadline,
        descricao_custom: lp.descricao_custom,
        fotos_selecionadas: lp.fotos_selecionadas,
        amenities_custom: lp.amenities_custom,
        ativo: true,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error) {
      toast({
        title: "Não foi possível duplicar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Se for PDF, dispara geração (não bloqueia)
    if (lp.tipo === "pdf" && inserted?.id) {
      supabase.functions
        .invoke("generate-lp-pdf", { body: { lp_id: inserted.id } })
        .catch((e) => console.warn("lp_duplicate_pdf_gen_failed", e));
    }

    toast({ title: "LP duplicada" });
    fetchLps();
  }

  async function regenerarPdf(lp: LPWithImovel) {
    setRegeneratingId(lp.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-lp-pdf", {
        body: { lp_id: lp.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Falha", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "PDF regenerado" });
        fetchLps();
      }
    } catch (e) {
      toast({
        title: "Erro",
        description: e instanceof Error ? e.message : "Falha ao regenerar",
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/imovel/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Minhas Landing Pages</h1>
              <p className="text-sm text-muted-foreground">
                Até {QUOTA_LIMIT} LPs HTML ativas + {QUOTA_LIMIT} PDFs armazenados por 5 dias.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={fetchLps} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Quota cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuotaCard
            icon={<Globe className="h-5 w-5" />}
            label="LPs HTML ativas"
            used={htmlAtivas.length}
            limit={QUOTA_LIMIT}
            hint="Tempo indeterminado. Desative uma pra abrir slot."
          />
          <QuotaCard
            icon={<FileDown className="h-5 w-5" />}
            label="PDFs armazenados"
            used={pdfsValidos.length}
            limit={QUOTA_LIMIT}
            hint="Expiram automaticamente em 5 dias."
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="html">
          <TabsList>
            <TabsTrigger value="html" className="gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              HTML ativas
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {htmlAtivas.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-1.5">
              <FileDown className="h-3.5 w-3.5" />
              PDFs
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {pdfsValidos.length}
              </Badge>
            </TabsTrigger>
            {htmlHistorico.length > 0 && (
              <TabsTrigger value="historico" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Desativadas
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {htmlHistorico.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="html" className="mt-4">
            {loading ? (
              <LoadingCard />
            ) : htmlAtivas.length === 0 ? (
              <EmptyState message="Nenhuma LP HTML ativa. Crie uma a partir de um imóvel." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {htmlAtivas.map((lp) => (
                  <LPCard
                    key={lp.id}
                    lp={lp}
                    onCopy={() => copyLink(lp.slug)}
                    onToggle={() => toggleAtivo(lp)}
                    onDelete={() => deletar(lp)}
                    onDuplicate={() => duplicar(lp)}
                    onEdit={() => abrirEditor(lp)}
                    onShowQr={() => setQrCodeLp(lp)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pdf" className="mt-4">
            {loading ? (
              <LoadingCard />
            ) : pdfsValidos.length === 0 ? (
              <EmptyState message="Nenhum PDF gerado." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pdfsValidos.map((lp) => (
                  <LPCard
                    key={lp.id}
                    lp={lp}
                    onCopy={() => copyLink(lp.slug)}
                    onDelete={() => deletar(lp)}
                    onRegenerate={() => regenerarPdf(lp)}
                    onDuplicate={() => duplicar(lp)}
                    onEdit={() => abrirEditor(lp)}
                    onShowQr={() => setQrCodeLp(lp)}
                    regenerating={regeneratingId === lp.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {htmlHistorico.length > 0 && (
            <TabsContent value="historico" className="mt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {htmlHistorico.map((lp) => (
                  <LPCard
                    key={lp.id}
                    lp={lp}
                    onCopy={() => copyLink(lp.slug)}
                    onToggle={() => toggleAtivo(lp)}
                    onDelete={() => deletar(lp)}
                    onDuplicate={() => duplicar(lp)}
                    onEdit={() => abrirEditor(lp)}
                    onShowQr={() => setQrCodeLp(lp)}
                  />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modal: editar LP existente (reusa o wizard em edit mode) */}
      {editingLp && editingImovel && user && (
        <LPWizard
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLp(null);
              setEditingImovel(null);
            }
          }}
          userId={user.id}
          imovel={editingImovel}
          initialLp={editingLp}
          onSaved={() => fetchLps()}
        />
      )}

      {/* Modal: QR Code */}
      {qrCodeLp && (
        <LPQrCodeModal
          open={true}
          onOpenChange={(open) => !open && setQrCodeLp(null)}
          slug={qrCodeLp.slug}
          title={qrCodeLp.headline || qrCodeLp.imovel?.titulo || "Landing Page"}
        />
      )}
    </AppLayout>
  );
}

/* ----------------- Sub-components ----------------- */

function QuotaCard({
  icon, label, used, limit, hint,
}: { icon: React.ReactNode; label: string; used: number; limit: number; hint: string }) {
  const pct = Math.min((used / limit) * 100, 100);
  const isFull = used >= limit;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{used}</p>
            <p className="text-xs text-muted-foreground">de {limit} disponíveis</p>
          </div>
          {isFull && (
            <Badge variant="destructive" className="text-[10px]">
              Quota cheia
            </Badge>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-accent transition-all"
            data-pct={pct}
            ref={(el) => {
              if (el) el.style.width = `${pct}%`;
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function LPCard({
  lp, onCopy, onToggle, onDelete, onRegenerate, onDuplicate, onEdit, onShowQr, regenerating,
}: {
  lp: LPWithImovel;
  onCopy: () => void;
  onToggle?: () => void;
  onDelete: () => void;
  onRegenerate?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  onShowQr?: () => void;
  regenerating?: boolean;
}) {
  const template = LP_TEMPLATES.find((t) => t.id === (lp.template as LPTemplate));
  const daysLeft =
    lp.tipo === "pdf" && lp.expires_at
      ? Math.max(
          0,
          Math.ceil((new Date(lp.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
      : null;

  const title = lp.headline || lp.imovel?.titulo || "(sem título)";
  const location =
    [lp.imovel?.bairro, lp.imovel?.cidade].filter(Boolean).join(", ") || "—";

  return (
    <Card className="overflow-hidden">
      {/* Mini preview com gradient do template */}
      {template && (
        <div className={`h-16 bg-gradient-to-r ${template.gradient}`} />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/dashboard/minhas-lps/${lp.id}`}
              className="line-clamp-1 text-base font-semibold leading-tight transition hover:text-accent"
            >
              {title}
            </Link>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Home className="h-3 w-3" />
              {location}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {template?.label || lp.template}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats + status */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge variant="secondary" className="gap-1">
            <Eye className="h-3 w-3" />
            {lp.views_count} views
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {lp.leads_count} leads
          </Badge>

          {lp.tipo === "html" ? (
            <Badge
              variant={lp.ativo ? "default" : "outline"}
              className="gap-1"
            >
              <Globe className="h-3 w-3" />
              {lp.ativo ? "ativa" : "desativada"}
            </Badge>
          ) : (
            <Badge variant={daysLeft && daysLeft > 1 ? "default" : "destructive"} className="gap-1">
              <Calendar className="h-3 w-3" />
              {daysLeft ? `${daysLeft}d restantes` : "expirado"}
            </Badge>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {lp.ativo && lp.tipo === "html" && (
            <>
              <Button size="sm" variant="outline" onClick={onCopy} className="flex-1">
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copiar link
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`/imovel/${lp.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir LP em nova aba"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </>
          )}

          {lp.tipo === "pdf" && (
            <>
              {lp.pdf_url ? (
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <a href={lp.pdf_url} target="_blank" rel="noreferrer" download>
                    <FileDown className="mr-1 h-3.5 w-3.5" />
                    Baixar PDF
                  </a>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={regenerating}
                  className="flex-1"
                >
                  {regenerating ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  )}
                  {regenerating ? "Gerando..." : "Gerar PDF"}
                </Button>
              )}
            </>
          )}

          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              title="Editar esta LP"
              aria-label="Editar LP"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}

          {onShowQr && lp.tipo === "html" && lp.ativo && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onShowQr}
              title="QR Code da LP"
              aria-label="Ver QR Code"
            >
              <QrCode className="h-3.5 w-3.5" />
            </Button>
          )}

          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDuplicate}
              title="Duplicar esta LP"
              aria-label="Duplicar LP"
            >
              <CopyPlus className="h-3.5 w-3.5" />
            </Button>
          )}

          {onToggle && lp.tipo === "html" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
              title={lp.ativo ? "Desativar" : "Reativar"}
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
          )}

          <DeleteConfirm onConfirm={onDelete} title={title} />
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteConfirm({ onConfirm, title }: { onConfirm: () => void; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Deletar LP">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover esta LP?</AlertDialogTitle>
          <AlertDialogDescription>
            "{title}" será removida permanentemente. O link público para de
            funcionar. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LoadingCard() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-12 text-center">
      <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
