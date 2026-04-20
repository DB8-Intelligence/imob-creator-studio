import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SiteModelsDashboard from "@/components/site/SiteModelsDashboard";
import ThemeLaptopCard from "@/components/site/ThemeLaptopCard";
import type { CorretorSite, TemaCorr } from "@/types/site";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import SitePreviewFrame from "./SitePreviewFrame";

type ThemeKey = TemaCorr;

import {
  Paintbrush,
  Home,
  Share2,
  Search,
  Monitor,
  Smartphone,
  Plus,
  Rss,
  Settings,
  FileDown,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyRow {
  id: string;
  title: string;
  price: number | null;
  property_type: string | null;
  status: string | null;
}

interface PortalCard {
  key: string;
  name: string;
  emoji: string;
  enabled: boolean;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Theme metadata                                                     */
/* ------------------------------------------------------------------ */

const THEMES: { key: ThemeKey; label: string; description: string; palette: string }[] = [
  {
    key: "brisa",
    label: "Brisa",
    description: "Leve, arejado, turquesa",
    palette: "bg-gradient-to-r from-sky-400 to-cyan-300",
  },
  {
    key: "urbano",
    label: "Urbano",
    description: "Dark, moderno, laranja",
    palette: "bg-gradient-to-r from-gray-800 to-orange-500",
  },
  {
    key: "litoral",
    label: "Litoral",
    description: "Elegante, navy & gold",
    palette: "bg-gradient-to-r from-[#002B5B] to-[#D4AF37]",
  },
  {
    key: "nestland" as ThemeKey,
    label: "Nestland",
    description: "Elegante, minimalista, dourado",
    palette: "bg-gradient-to-r from-[#0f0f0f] to-[#b99755]",
  },
  {
    key: "nexthm" as ThemeKey,
    label: "NextHM",
    description: "Verde natureza, serifado",
    palette: "bg-gradient-to-r from-[#122122] to-[#2c686b]",
  },
  {
    key: "ortiz" as ThemeKey,
    label: "Ortiz",
    description: "Azul classico, slider hero",
    palette: "bg-gradient-to-r from-[#05344a] to-[#25a5de]",
  },
  {
    key: "quarter" as ThemeKey,
    label: "Quarter",
    description: "Moderno, dark, vermelho",
    palette: "bg-gradient-to-r from-[#071c1f] to-[#FF5A3C]",
  },
  {
    key: "rethouse" as ThemeKey,
    label: "Rethouse",
    description: "Limpo, azul royal, clean",
    palette: "bg-gradient-to-r from-[#1a2b6b] to-[#3454d1]",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DashboardSitePage = () => {
  const navigate = useNavigate();
  const { workspaceId, workspaceSlug } = useWorkspaceContext();
  const { toast } = useToast();

  // --- View mode: "modelos" (default) or "config" ---
  const [view, setView] = useState<"modelos" | "config">("modelos");

  // --- Site config state ---
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("brisa");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [creci, setCreci] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#0EA5E9");
  const [corSecundaria, setCorSecundaria] = useState("#FFD700");

  // --- Properties state ---
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  // --- Portals state ---
  const [portals, setPortals] = useState<PortalCard[]>([
    { key: "zap", name: "ZAP Imóveis", emoji: "🏠", enabled: false, color: "#FF5F00" },
    { key: "olx", name: "OLX", emoji: "📦", enabled: false, color: "#4E2D96" },
    { key: "vivareal", name: "VivaReal", emoji: "🌐", enabled: false, color: "#0059B3" },
    { key: "imovelweb", name: "ImovelWeb", emoji: "🏢", enabled: false, color: "#E63946" },
  ]);

  // --- SEO state ---
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // --- Advanced state ---
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [showPrices, setShowPrices] = useState(true);
  const [showFullAddress, setShowFullAddress] = useState(true);

  // --- Preview state ---
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // --- Fetch properties ---
  useEffect(() => {
    if (!workspaceId) return;
    setLoadingProps(true);
    supabase
      .from("properties")
      .select("id, title, price, property_type, status")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn("Erro ao buscar imóveis:", error.message);
        }
        setProperties((data as PropertyRow[]) ?? []);
        setLoadingProps(false);
      });
  }, [workspaceId]);

  // --- Derived preview site (synthetic CorretorSite for renderer) ---
  const previewSite = {
    id: "preview",
    user_id: "preview",
    nome_completo: nomeEmpresa,
    whatsapp,
    email_contato: email,
    cor_primaria: corPrimaria,
    cor_secundaria: corSecundaria,
    tema: selectedTheme,
    publicado: false,
  } as unknown as CorretorSite;

  // --- Portal toggle ---
  const togglePortal = (key: string) => {
    setPortals((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  // --- Handle theme selection from dashboard ---
  const handleSelectThemeFromDashboard = (themeId: TemaCorr) => {
    setSelectedTheme(themeId as ThemeKey);
    setView("config");
  };

  // --- Models dashboard view ---
  if (view === "modelos") {
    return (
      <AppLayout>
        <SiteModelsDashboard
          selectedTheme={selectedTheme as TemaCorr}
          onSelectTheme={handleSelectThemeFromDashboard}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-0 lg:flex-row">
        {/* ====================== LEFT — CONFIG PANEL ====================== */}
        <div className="w-full overflow-y-auto border-r border-gray-200 bg-white p-6 lg:w-[55%]">
          {/* Back to models button */}
          <button
            type="button"
            onClick={() => setView("modelos")}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#002B5B] hover:underline"
          >
            ← Voltar aos Modelos
          </button>
          <h1 className="mb-1 text-2xl font-bold text-[#002B5B] font-['Plus_Jakarta_Sans',sans-serif]">
            Meu Site
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Configure e visualize seu site imobiliário em tempo real.
          </p>

          <Tabs defaultValue="aparencia" className="w-full">
            <TabsList className="mb-4 w-full justify-start gap-1 bg-gray-100">
              <TabsTrigger value="aparencia" className="gap-1.5 text-xs">
                <Paintbrush className="h-3.5 w-3.5" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="imoveis" className="gap-1.5 text-xs">
                <Home className="h-3.5 w-3.5" />
                Imóveis
              </TabsTrigger>
              <TabsTrigger value="portais" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Portais
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5 text-xs">
                <Search className="h-3.5 w-3.5" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="avancado" className="gap-1.5 text-xs">
                <Settings className="h-3.5 w-3.5" />
                Avançado
              </TabsTrigger>
            </TabsList>

            {/* ============ TAB: Aparência ============ */}
            <TabsContent value="aparencia" className="space-y-6">
              {/* Theme selector — mini-previews estilo laptop */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[#002B5B]">
                    Tema do Site
                  </Label>
                  <button
                    type="button"
                    onClick={() => setView("modelos")}
                    className="text-xs font-medium text-[#002B5B] hover:underline"
                  >
                    Ver todos os modelos →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                  {THEMES.map((t) => (
                    <ThemeLaptopCard
                      key={t.key}
                      themeKey={t.key}
                      label={t.label}
                      description={t.description}
                      gradient={t.palette}
                      accentColor={corPrimaria}
                      isActive={selectedTheme === t.key}
                      onSelect={() => setSelectedTheme(t.key)}
                    />
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                  <Input
                    id="nome_empresa"
                    placeholder="Ex: Imobiliária Praia"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="creci">CRECI</Label>
                  <Input
                    id="creci"
                    placeholder="Ex: 12345-J"
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(11) 99999-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@imob.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="cor_primaria"
                      type="color"
                      title="Cor primária"
                      aria-label="Cor primária"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-xs text-gray-500">{corPrimaria}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="cor_secundaria"
                      type="color"
                      title="Cor secundária"
                      aria-label="Cor secundária"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-xs text-gray-500">
                      {corSecundaria}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ============ TAB: Imóveis ============ */}
            <TabsContent value="imoveis" className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-semibold text-[#002B5B]">
                  Imóveis do Workspace
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => navigate("/importar")}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Importar XML/Planilha
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#002B5B] hover:bg-[#001f42]"
                    onClick={() => navigate("/imoveis/upload")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Novo Imóvel
                  </Button>
                </div>
              </div>

              {/* Info card: destaca a opção de importar se o workspace ainda tá vazio */}
              {!loadingProps && properties.length === 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2 shrink-0">
                      <FileDown className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#002B5B]">Migrando de outra plataforma?</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Importe imóveis via XML (Tecimob, Jetimob, Univen, VRSync) ou planilha CSV em um clique.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/importar")}
                      className="shrink-0"
                    >
                      Importar agora
                    </Button>
                  </CardContent>
                </Card>
              )}

              {loadingProps ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  Carregando imóveis...
                </div>
              ) : properties.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-gray-500">
                    Nenhum imóvel cadastrado neste workspace.
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.title}
                          </TableCell>
                          <TableCell>{p.property_type ?? "-"}</TableCell>
                          <TableCell className="text-right">
                            {p.price
                              ? `R$ ${p.price.toLocaleString("pt-BR")}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                p.status === "published" || p.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {p.status === "published" || p.status === "available"
                                ? "Publicado"
                                : "Rascunho"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ============ TAB: Portais ============ */}
            <TabsContent value="portais" className="space-y-4">
              <h2 className="text-base font-semibold text-[#002B5B]">
                Portais Imobiliários
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {portals.map((portal) => (
                  <Card
                    key={portal.key}
                    className={`transition overflow-hidden ${
                      portal.enabled
                        ? "border-[#002B5B] shadow-sm"
                        : "border-gray-200"
                    }`}
                    style={{ borderLeftWidth: 4, borderLeftColor: portal.color }}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{portal.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {portal.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {portal.enabled ? "Conectado" : "Desativado"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={portal.enabled}
                        onCheckedChange={() => togglePortal(portal.key)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#F8FAFF] rounded-xl border border-[#E5E7EB]">
                <h4 className="font-semibold text-[#0A1628] mb-2">Feed XML para Portais</h4>
                <p className="text-xs text-[#6B7280] mb-3">Use este link para cadastrar seus imóveis em qualquer portal</p>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly aria-label="Feed XML URL" value={`https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/generate-xml-feed?workspace=${subdomain || "seu-workspace"}`}
                    className="flex-1 px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#374151] font-mono" />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(`https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/generate-xml-feed?workspace=${subdomain || "seu-workspace"}`); toast({ title: "Link copiado!" }); }}
                    className="px-3 py-2 bg-[#002B5B] text-white text-xs font-semibold rounded-lg">Copiar</button>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Configure a URL do feed no painel de cada portal para sincronizar
                seus imóveis automaticamente.
              </p>
            </TabsContent>

            {/* ============ TAB: SEO ============ */}
            <TabsContent value="seo" className="space-y-5">
              <h2 className="text-base font-semibold text-[#002B5B]">
                Otimização para Buscadores
              </h2>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    placeholder="Ex: Imóveis em Florianópolis | Imobiliária Praia"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Input
                    id="meta_description"
                    placeholder="Encontre apartamentos, casas e salas comerciais..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="og_image_url">OG Image URL</Label>
                  <Input
                    id="og_image_url"
                    placeholder="https://exemplo.com/og-image.jpg"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="gap-2 bg-[#FFD700] text-[#002B5B] hover:bg-[#e6c200] font-semibold"
                onClick={() =>
                  toast({
                    title: "SEO gerado!",
                    description:
                      "Os campos de SEO foram preenchidos automaticamente.",
                  })
                }
              >
                <Search className="h-4 w-4" />
                Gerar SEO automático
              </Button>

              {/* Google preview */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Preview no Google
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  <p className="text-base font-medium text-blue-700 truncate">
                    {metaTitle || "Título do seu site"}
                  </p>
                  <p className="text-xs text-green-700">
                    {workspaceSlug ?? "meu-site"}.nexoimobai.com.br
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {metaDescription ||
                      "Descrição do seu site aparecerá aqui nos resultados do Google."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ TAB: Avançado ============ */}
            <TabsContent value="avancado" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1 block">Subdomínio</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1 px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm" placeholder="minha-imobiliaria" />
                    <span className="text-sm text-[#6B7280]">.nexoimobai.com.br</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1 block">Domínio customizado</label>
                  <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm" placeholder="www.minhaImobiliaria.com.br (opcional)" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#002B5B]" />
                    <span className="text-sm text-[#374151]">Mostrar preços nos imóveis</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={showFullAddress} onChange={(e) => setShowFullAddress(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#002B5B]" />
                    <span className="text-sm text-[#374151]">Mostrar endereço completo</span>
                  </label>
                </div>
                <button type="button" onClick={() => toast({ title: "Configurações avançadas salvas!" })} className="w-full bg-[#002B5B] hover:bg-[#001d3d] text-white font-semibold py-2.5 rounded-lg text-sm">
                  Salvar Configurações
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ====================== RIGHT — PREVIEW ====================== */}
        <div className="flex w-full flex-col items-center gap-4 bg-gray-50 p-6 lg:w-[45%]">
          {/* Responsive toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "desktop" ? "default" : "outline"}
              className={
                viewMode === "desktop"
                  ? "gap-1.5 bg-[#002B5B] hover:bg-[#001f42]"
                  : "gap-1.5"
              }
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={viewMode === "mobile" ? "default" : "outline"}
              className={
                viewMode === "mobile"
                  ? "gap-1.5 bg-[#002B5B] hover:bg-[#001f42]"
                  : "gap-1.5"
              }
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </Button>
          </div>

          <SitePreviewFrame
            site={previewSite}
            slug={workspaceSlug ?? "meu-site"}
            viewMode={viewMode}
          />

          <p className="text-center text-xs text-gray-400">
            Preview em tempo real — as alterações aparecem conforme você edita.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardSitePage;
