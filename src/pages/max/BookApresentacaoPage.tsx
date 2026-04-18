/**
 * BookApresentacaoPage.tsx — Book do Corretor (PDF)
 *
 * 2-panel layout:
 *  Left (35%)  — Config tabs (Conteudo, Estilo, Dados)
 *  Right (65%) — Live PDF preview + download/share actions
 *
 * Uses @react-pdf/renderer for PDF generation.
 */
import { useState, useEffect, useMemo, lazy, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Lazy load the heavy @react-pdf/renderer module — cached after first call
let pdfModulePromise: Promise<typeof import("@react-pdf/renderer")> | null = null;
const loadPdfModule = () => {
  if (!pdfModulePromise) pdfModulePromise = import("@react-pdf/renderer");
  return pdfModulePromise;
};

import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  BookOpen,
  Download,
  Share2,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/hooks/useCorretorSite";
import { useSiteImoveis } from "@/hooks/useSiteImoveis";

import type { CorretorSite, SiteImovel, SiteDepoimento } from "@/types/site";
import BookDocument from "@/components/book/BookDocument";

// Lazy-load PDFViewer — shares the same chunk as loadPdfModule()
const PDFViewer = lazy(() => loadPdfModule().then((m) => ({ default: m.PDFViewer })));

// ─── Section toggles ────────────────────────────────────────────────────────

interface SectionToggles {
  capa: boolean;
  sobre: boolean;
  portfolio: boolean;
  depoimentos: boolean;
  servicos: boolean;
  contato: boolean;
}

const DEFAULT_TOGGLES: SectionToggles = {
  capa: true,
  sobre: true,
  portfolio: true,
  depoimentos: true,
  servicos: true,
  contato: true,
};

// ─── Theme presets ──────────────────────────────────────────────────────────

type ThemeKey = "navy-gold" | "gray-white" | "white-blue";

const THEMES: Record<ThemeKey, { label: string; description: string }> = {
  "navy-gold": { label: "Navy + Dourado", description: "Classico e elegante" },
  "gray-white": { label: "Cinza + Branco", description: "Moderno e limpo" },
  "white-blue": { label: "Branco + Azul", description: "Leve e profissional" },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function BookApresentacaoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Data hooks
  const { data: site, isLoading: loadingSite } = useSite();
  const { data: allImoveis, isLoading: loadingImoveis } = useSiteImoveis(site?.id);

  // Depoimentos fetched directly (no dedicated hook)
  const [depoimentos, setDepoimentos] = useState<SiteDepoimento[]>([]);
  const [loadingDepo, setLoadingDepo] = useState(false);

  useEffect(() => {
    if (!site?.id) return;
    setLoadingDepo(true);
    supabase
      .from("site_depoimentos")
      .select("*")
      .eq("site_id", site.id)
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .limit(4)
      .then(({ data }) => {
        setDepoimentos((data as unknown as SiteDepoimento[]) ?? []);
        setLoadingDepo(false);
      });
  }, [site?.id]);

  // Filter destaque properties, limit 6
  const imoveisDestaque = useMemo(
    () => (allImoveis ?? []).filter((im) => im.destaque).slice(0, 6),
    [allImoveis]
  );

  // Config state
  const [sections, setSections] = useState<SectionToggles>(DEFAULT_TOGGLES);
  const [theme, setTheme] = useState<ThemeKey>("navy-gold");
  const [fontFamily] = useState("Helvetica");
  const [showLogo, setShowLogo] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [pdfViewerSupported, setPdfViewerSupported] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = useMemo(() => {
    let count = 0;
    if (sections.capa) count++;
    if (sections.sobre) count++;
    if (sections.portfolio) count += Math.max(1, Math.ceil(imoveisDestaque.length / 2));
    if (sections.depoimentos) count++;
    if (sections.servicos) count++;
    if (sections.contato) count++;
    return Math.max(1, count);
  }, [sections, imoveisDestaque.length]);

  // Generate blob URL for iframe preview
  const generatePreviewBlob = useCallback(async () => {
    if (!site) return;
    try {
      setGenerating(true);
      const { pdf } = await loadPdfModule();
      const blob = await pdf(
        <BookDocument
          site={site}
          imoveis={imoveisDestaque}
          depoimentos={depoimentos}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("PDF preview generation error:", err);
      setPdfViewerSupported(false);
    } finally {
      setGenerating(false);
    }
  }, [site, imoveisDestaque, depoimentos]);

  // Auto-generate preview when data is ready
  useEffect(() => {
    if (site && !loadingImoveis && !loadingDepo) {
      generatePreviewBlob();
    }
  }, [site, loadingImoveis, loadingDepo, generatePreviewBlob, refreshKey]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!site) return;
    try {
      setGenerating(true);
      const { pdf } = await loadPdfModule();
      const blob = await pdf(
        <BookDocument
          site={site}
          imoveis={imoveisDestaque}
          depoimentos={depoimentos}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `book_${site.nome_completo?.replace(/\s+/g, "_") || "corretor"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "PDF baixado com sucesso!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao gerar PDF", description: String(err), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!site || !user) return;
    try {
      setSharing(true);

      // 1. Generate PDF blob
      const { pdf } = await loadPdfModule();
      const blob = await pdf(
        <BookDocument
          site={site}
          imoveis={imoveisDestaque}
          depoimentos={depoimentos}
        />
      ).toBlob();

      // 2. Upload to Supabase Storage
      const timestamp = Date.now();
      const version = 1;
      const filePath = `${user.id}/book_v${version}_${timestamp}.pdf`;

      const { error: uploadErr } = await supabase.storage
        .from("books")
        .upload(filePath, blob, { contentType: "application/pdf", upsert: true });

      if (uploadErr) throw uploadErr;

      // 3. Get public URL
      const { data: urlData } = supabase.storage.from("books").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // 4. Insert record into corretor_books
      await supabase.from("corretor_books" as never).insert({
        user_id: user.id,
        site_id: site.id,
        url: publicUrl,
        storage_path: filePath,
        version,
        created_at: new Date().toISOString(),
      } as never);

      // 5. Copy to clipboard
      await navigator.clipboard.writeText(publicUrl);

      toast({
        title: "Link copiado!",
        description: "O link do seu Book foi copiado para a area de transferencia.",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const waUrl = `https://wa.me/?text=${encodeURIComponent(
                `Confira meu Book do Corretor: ${publicUrl}`
              )}`;
              window.open(waUrl, "_blank");
            }}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            WhatsApp
          </Button>
        ),
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao compartilhar",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  // ─── Loading / insufficient data ─────────────────────────────────────────

  const isLoading = loadingSite || loadingImoveis || loadingDepo;

  const dataInsufficient =
    site &&
    (!site.nome_completo && !site.bio && imoveisDestaque.length === 0);

  // ─── Toggle helper ────────────────────────────────────────────────────────

  const toggleSection = (key: keyof SectionToggles) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    setRefreshKey((k) => k + 1);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="space-y-4 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Book do Corretor</h1>
              <p className="text-sm text-muted-foreground">
                Gere seu PDF profissional e compartilhe com clientes
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={generating || !site}>
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Baixar PDF
            </Button>
            <Button
              onClick={handleShare}
              disabled={sharing || !site}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Salvar e Compartilhar
            </Button>
          </div>
        </div>

        {/* Insufficient data banner */}
        {dataInsufficient && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Complete seu perfil para gerar um Book mais completo
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Adicione foto, bio, imoveis em destaque e depoimentos.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/dashboard/site-imobiliario")}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Editar Site
            </Button>
          </div>
        )}

        {/* Main 2-panel layout */}
        <div className="grid lg:grid-cols-[35%_65%] gap-6">
          {/* ── Left: Config tabs ─────────────────────────────────── */}
          <div className="space-y-4">
            <Tabs defaultValue="conteudo" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="conteudo">Conteudo</TabsTrigger>
                <TabsTrigger value="estilo">Estilo</TabsTrigger>
                <TabsTrigger value="dados">Dados</TabsTrigger>
              </TabsList>

              {/* Tab: Conteudo */}
              <TabsContent value="conteudo" className="space-y-3 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Secoes do Book</h3>
                    {(
                      [
                        ["capa", "Capa"],
                        ["sobre", "Sobre Mim"],
                        ["portfolio", "Portfolio"],
                        ["depoimentos", "Depoimentos"],
                        ["servicos", "Servicos"],
                        ["contato", "Contato"],
                      ] as [keyof SectionToggles, string][]
                    ).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{label}</Label>
                        <Switch
                          checked={sections[key]}
                          onCheckedChange={() => toggleSection(key)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Property selector */}
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Imoveis no Portfolio
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Mostrando {imoveisDestaque.length} imoveis marcados como destaque (max 6).
                    </p>
                    {imoveisDestaque.map((im) => (
                      <div
                        key={im.id}
                        className="flex items-center gap-2 text-xs border rounded-md p-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="flex-1 truncate">{im.titulo}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {im.tipo}
                        </Badge>
                      </div>
                    ))}
                    {imoveisDestaque.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Nenhum imovel em destaque. Marque imoveis como destaque no seu site.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Testimonial selector */}
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">Depoimentos</h3>
                    <p className="text-xs text-muted-foreground">
                      {depoimentos.length} depoimentos ativos (max 4).
                    </p>
                    {depoimentos.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center gap-2 text-xs border rounded-md p-2"
                      >
                        <span className="text-amber-400">
                          {"\u2605".repeat(dep.avaliacao)}
                        </span>
                        <span className="flex-1 truncate">{dep.nome_cliente}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Estilo */}
              <TabsContent value="estilo" className="space-y-3 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label className="text-sm">Tema de cores</Label>
                      <Select
                        value={theme}
                        onValueChange={(v) => {
                          setTheme(v as ThemeKey);
                          setRefreshKey((k) => k + 1);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(
                            ([key, t]) => (
                              <SelectItem key={key} value={key}>
                                {t.label} - {t.description}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Fonte</Label>
                      <Select value={fontFamily} disabled>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Mais fontes em breve
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Mostrar logo</Label>
                      <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">QR Code na capa</Label>
                      <Switch checked={showQR} onCheckedChange={setShowQR} />
                      {showQR && (
                        <Badge variant="secondary" className="text-[10px]">Em breve</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Dados */}
              <TabsContent value="dados" className="space-y-3 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Dados utilizados no Book
                    </h3>
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando dados...
                      </div>
                    ) : site ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Nome</span>
                          <span className="font-medium">{site.nome_completo || "-"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">CRECI</span>
                          <span className="font-medium">{site.creci || "-"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Experiencia</span>
                          <span className="font-medium">{site.anos_experiencia} anos</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Especialidades</span>
                          <span className="font-medium">
                            {site.especialidades?.join(", ") || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Imoveis destaque</span>
                          <span className="font-medium">{imoveisDestaque.length}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Depoimentos</span>
                          <span className="font-medium">{depoimentos.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefone</span>
                          <span className="font-medium">{site.telefone || "-"}</span>
                        </div>
                      </div>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate("/dashboard/site-imobiliario")}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Editar dados do site
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right: Preview ────────────────────────────────────── */}
          <div className="space-y-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Preview header */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                  <span className="text-xs text-muted-foreground font-medium">
                    Pre-visualizacao do Book
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                      {currentPage} de {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* PDF area */}
                <div className="bg-muted/10 min-h-[600px] flex items-center justify-center">
                  {isLoading || generating ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm">
                        {isLoading ? "Carregando dados..." : "Gerando PDF..."}
                      </span>
                    </div>
                  ) : previewUrl ? (
                    <iframe
                      src={`${previewUrl}#page=${currentPage}`}
                      className="w-full h-[700px] border-0"
                      title="Book Preview"
                    />
                  ) : pdfViewerSupported && site ? (
                    <Suspense
                      fallback={
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-sm">Carregando visualizador...</span>
                        </div>
                      }
                    >
                      <PDFViewer width="100%" height={700} showToolbar={false}>
                        <BookDocument
                          site={site}
                          imoveis={imoveisDestaque}
                          depoimentos={depoimentos}
                        />
                      </PDFViewer>
                    </Suspense>
                  ) : (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Pre-visualizacao indisponivel
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clique em &ldquo;Baixar PDF&rdquo; para ver o resultado.
                        </p>
                      </div>
                      <Button onClick={handleDownload} disabled={generating || !site}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick action bar */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRefreshKey((k) => k + 1);
                }}
              >
                Atualizar Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!previewUrl) return;
                  try {
                    await navigator.clipboard.writeText(previewUrl);
                    toast({ title: "Link copiado!" });
                  } catch {
                    toast({
                      title: "Nao foi possivel copiar",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={!previewUrl}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copiar Link Local
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
