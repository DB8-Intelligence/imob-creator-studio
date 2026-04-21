/**
 * SiteImobiliario.tsx — Editor principal do Site Imobiliário do corretor.
 * Layout 2 painéis: config (40%) + preview (60%).
 *
 * Página consolidada: unifica o editor (este arquivo) com funcionalidades
 * que antes viviam em DashboardSitePage.tsx — seletor visual de tema
 * (ThemeLaptopCard), modal "Ver todos os modelos" (SiteModelsDashboard),
 * tab Imóveis com importação XML e tab Portais com feed XML.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Paintbrush,
  ImageIcon,
  Globe,
  Search,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Upload,
  X,
  Info,
  ExternalLink,
  ShieldCheck,
  Home as HomeIcon,
  Share2,
  FileDown,
  Plus,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useSite, useUpdateSite, usePublishSite } from "@/hooks/useCorretorSite";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { supabase } from "@/integrations/supabase/client";
import { TEMAS, type CorretorSite, type TemaCorr } from "@/types/site";
import ThemeRenderer from "@/components/site-temas/ThemeRenderer";
import { SiteOnboardingWizard } from "@/components/site/SiteOnboardingWizard";
import ThemeLaptopCard, { THEME_VARIANT_MAP } from "@/components/site/ThemeLaptopCard";
import SiteModelsDashboard from "@/components/site/SiteModelsDashboard";
import SiteSectionsEditor from "@/components/site/SiteSectionsEditor";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ESPECIALIDADES_OPTIONS = [
  "Apartamentos",
  "Casas",
  "Terrenos",
  "Comercial",
  "Luxo",
  "Lançamentos",
  "Aluguel",
  "Investimentos",
  "Litoral",
  "Rural",
];

const THEME_GRADIENTS: Record<TemaCorr, string> = {
  brisa: "from-sky-400 to-cyan-300",
  urbano: "from-gray-800 to-orange-500",
  litoral: "from-[#002B5B] to-[#D4AF37]",
  "dark-premium": "from-[#1E3A8A] to-[#D4AF37]",
  nestland: "from-[#0f0f0f] to-[#b99755]",
  nexthm: "from-[#122122] to-[#2c686b]",
  ortiz: "from-[#05344a] to-[#25a5de]",
  quarter: "from-[#071c1f] to-[#FF5A3C]",
  rethouse: "from-[#1a2b6b] to-[#3454d1]",
  capital: "from-[#002E5E] to-[#CC0000]",
  horizonte: "from-[#1E3A5F] to-[#F39200]",
  prisma: "from-[#0F172A] to-[#3B82F6]",
  eixo: "from-[#1E40AF] to-[#10B981]",
  vitrine: "from-[#0066CC] to-[#059669]",
  onix: "from-[#1A1A1A] to-[#B8860B]",
  farol: "from-[#0099CC] to-[#0D9488]",
  aurora: "from-[#1A3A52] to-[#F59E0B]",
  sereno: "from-[#065F46] to-[#D4A574]",
  portico: "from-[#1D4ED8] to-[#64748B]",
};

/** Gradient como classe Tailwind completa (pro ThemeLaptopCard) */
const THEME_BG_GRADIENTS: Record<TemaCorr, string> = {
  brisa: "bg-gradient-to-r from-sky-400 to-cyan-300",
  urbano: "bg-gradient-to-r from-gray-800 to-orange-500",
  litoral: "bg-gradient-to-r from-[#002B5B] to-[#D4AF37]",
  "dark-premium": "bg-gradient-to-r from-[#1E3A8A] to-[#D4AF37]",
  nestland: "bg-gradient-to-r from-[#0f0f0f] to-[#b99755]",
  nexthm: "bg-gradient-to-r from-[#122122] to-[#2c686b]",
  ortiz: "bg-gradient-to-r from-[#05344a] to-[#25a5de]",
  quarter: "bg-gradient-to-r from-[#071c1f] to-[#FF5A3C]",
  rethouse: "bg-gradient-to-r from-[#1a2b6b] to-[#3454d1]",
  capital: "bg-gradient-to-r from-[#002E5E] to-[#CC0000]",
  horizonte: "bg-gradient-to-r from-[#1E3A5F] to-[#F39200]",
  prisma: "bg-gradient-to-r from-[#0F172A] to-[#3B82F6]",
  eixo: "bg-gradient-to-r from-[#1E40AF] to-[#10B981]",
  vitrine: "bg-gradient-to-r from-[#0066CC] to-[#059669]",
  onix: "bg-gradient-to-r from-[#1A1A1A] to-[#B8860B]",
  farol: "bg-gradient-to-r from-[#0099CC] to-[#0D9488]",
  aurora: "bg-gradient-to-r from-[#1A3A52] to-[#F59E0B]",
  sereno: "bg-gradient-to-r from-[#065F46] to-[#D4A574]",
  portico: "bg-gradient-to-r from-[#1D4ED8] to-[#64748B]",
};

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

const INITIAL_PORTALS: PortalCard[] = [
  { key: "zap", name: "ZAP Imóveis", emoji: "🏠", enabled: false, color: "#FF5F00" },
  { key: "olx", name: "OLX", emoji: "📦", enabled: false, color: "#4E2D96" },
  { key: "vivareal", name: "VivaReal", emoji: "🌐", enabled: false, color: "#0059B3" },
  { key: "imovelweb", name: "ImovelWeb", emoji: "🏢", enabled: false, color: "#E63946" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SiteImobiliario() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspaceId } = useWorkspaceContext();
  const { data: site, isLoading } = useSite();
  const { mutate: updateSite, isPending: isSaving } = useUpdateSite();
  const { mutate: publishSite, isPending: isPublishing } = usePublishSite();

  // Local draft state (mirrors DB row, synced via auto-save)
  const [draft, setDraft] = useState<Partial<CorretorSite>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);

  // View: "editor" (default) ou "modelos" (grid fullscreen de todos os temas)
  const [view, setView] = useState<"editor" | "modelos">("editor");

  // Imóveis do workspace (tab Imóveis)
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  // Portais (tab Portais) — state local, toggle visual
  const [portals, setPortals] = useState<PortalCard[]>(INITIAL_PORTALS);
  const [sectionsEditorOpen, setSectionsEditorOpen] = useState(false);
  const { data: isAdmin = false } = useIsSuperAdmin();

  // Fetch imóveis do workspace
  useEffect(() => {
    if (!workspaceId) return;
    setLoadingProps(true);
    supabase
      .from("properties")
      .select("id, title, price, property_type, status")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.warn("Erro ao buscar imóveis:", error.message);
        setProperties((data as PropertyRow[]) ?? []);
        setLoadingProps(false);
      });
  }, [workspaceId]);

  const togglePortal = (key: string) => {
    setPortals((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  // Seed draft from query
  useEffect(() => {
    if (site && firstLoad.current) {
      setDraft(site);
      firstLoad.current = false;
    }
  }, [site]);

  // Auto-save with 1200ms debounce
  const patchDraft = useCallback(
    (field: keyof CorretorSite, value: unknown) => {
      setDraft((prev) => {
        const next = { ...prev, [field]: value };

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          updateSite({ [field]: value });
        }, 1200);

        return next;
      });
    },
    [updateSite],
  );

  // Chip toggle for especialidades
  const toggleEspecialidade = (esp: string) => {
    const current = (draft.especialidades ?? []) as string[];
    const next = current.includes(esp)
      ? current.filter((e) => e !== esp)
      : [...current, esp];
    patchDraft("especialidades", next);
  };

  // Publish/unpublish
  const handlePublish = () => {
    if (!site) return;
    publishSite(!site.publicado);
  };

  // Show onboarding if brand-new site
  const showOnboarding =
    site &&
    !site.publicado &&
    site.created_at === site.updated_at;

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  View "modelos" — grid fullscreen dark dos 9 temas                */
  /* ---------------------------------------------------------------- */
  if (view === "modelos") {
    return (
      <AppLayout>
        <SiteModelsDashboard
          selectedTheme={(draft.tema as TemaCorr) ?? "brisa"}
          onSelectTheme={(themeId) => {
            patchDraft("tema", themeId);
            setView("editor");
          }}
        />
      </AppLayout>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Preview site (live draft → CorretorSite shape)                   */
  /* ---------------------------------------------------------------- */

  const previewSite = {
    ...(site ?? {}),
    ...draft,
    nome_completo: draft.nome_completo || "Seu Nome",
    cor_primaria: draft.cor_primaria || "#0284C7",
    cor_secundaria: draft.cor_secundaria || "#F59E0B",
    tema: (draft.tema as TemaCorr) || "brisa",
  } as CorretorSite;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <AppLayout>
      {/* Onboarding Wizard */}
      {showOnboarding && <SiteOnboardingWizard />}

      <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* =================== LEFT — CONFIG PANEL (40%) =================== */}
        <div className="w-full overflow-y-auto border-r border-border bg-card p-6 lg:w-[40%]">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meu Site</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure seu site profissional
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={site?.publicado ? "default" : "secondary"}
                className="text-xs"
              >
                {site?.publicado ? "Publicado" : "Rascunho"}
              </Badge>
              {/* Apenas super_admin tem acesso à edição de layout das seções */}
              {site && isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSectionsEditorOpen(true)}
                  className="gap-1.5"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Editar layout
                </Button>
              )}
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isPublishing}
                variant={site?.publicado ? "outline" : "default"}
                className="gap-1.5"
              >
                {isPublishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : site?.publicado ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {site?.publicado ? "Despublicar" : "Publicar"}
              </Button>
            </div>
          </div>

          {/* Auto-save indicator */}
          {isSaving && (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="mb-4 w-full justify-start gap-1 bg-muted">
              <TabsTrigger value="perfil" className="gap-1.5 text-xs">
                <User className="h-3.5 w-3.5" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="gap-1.5 text-xs">
                <Paintbrush className="h-3.5 w-3.5" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="hero" className="gap-1.5 text-xs">
                <ImageIcon className="h-3.5 w-3.5" />
                Hero
              </TabsTrigger>
              <TabsTrigger value="imoveis" className="gap-1.5 text-xs">
                <HomeIcon className="h-3.5 w-3.5" />
                Imóveis
              </TabsTrigger>
              <TabsTrigger value="portais" className="gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Portais
              </TabsTrigger>
              <TabsTrigger value="dominio" className="gap-1.5 text-xs">
                <Globe className="h-3.5 w-3.5" />
                Domínio
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5 text-xs">
                <Search className="h-3.5 w-3.5" />
                SEO
              </TabsTrigger>
            </TabsList>

            {/* ============ TAB: Perfil ============ */}
            <TabsContent value="perfil" className="space-y-5">
              {/* Foto upload */}
              <div>
                <Label className="mb-2 block text-sm font-semibold">
                  Foto de Perfil
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center">
                    {draft.foto_url ? (
                      <img
                        src={draft.foto_url}
                        alt="Foto"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>JPG ou PNG, max 2MB</p>
                    <p>Recomendado: 400x400px</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    value={draft.nome_completo ?? ""}
                    onChange={(e) => patchDraft("nome_completo", e.target.value)}
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="creci">CRECI</Label>
                  <Input
                    id="creci"
                    value={draft.creci ?? ""}
                    onChange={(e) => patchDraft("creci", e.target.value)}
                    placeholder="Ex: 12345-F"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="bio">Bio</Label>
                  <span className="text-xs text-muted-foreground">
                    {(draft.bio ?? "").length}/300
                  </span>
                </div>
                <Textarea
                  id="bio"
                  rows={3}
                  maxLength={300}
                  value={draft.bio ?? ""}
                  onChange={(e) => patchDraft("bio", e.target.value)}
                  placeholder="Conte um pouco sobre você e sua experiência..."
                />
              </div>

              {/* Especialidades — chips */}
              <div>
                <Label className="mb-2 block">Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES_OPTIONS.map((esp) => {
                    const selected = (draft.especialidades ?? []).includes(esp);
                    return (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => toggleEspecialidade(esp)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {esp}
                        {selected && <X className="ml-1.5 inline h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anos_experiencia">Anos de Experiência</Label>
                  <Input
                    id="anos_experiencia"
                    type="number"
                    min={0}
                    value={draft.anos_experiencia ?? 0}
                    onChange={(e) =>
                      patchDraft("anos_experiencia", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={draft.telefone ?? ""}
                    onChange={(e) => patchDraft("telefone", e.target.value)}
                    placeholder="(11) 3000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={draft.whatsapp ?? ""}
                    onChange={(e) => patchDraft("whatsapp", e.target.value)}
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email_contato">E-mail</Label>
                  <Input
                    id="email_contato"
                    type="email"
                    value={draft.email_contato ?? ""}
                    onChange={(e) => patchDraft("email_contato", e.target.value)}
                    placeholder="contato@exemplo.com"
                  />
                </div>
              </div>

              {/* Social handles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={draft.instagram ?? ""}
                    onChange={(e) => patchDraft("instagram", e.target.value)}
                    placeholder="@seuperfil"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={draft.facebook ?? ""}
                    onChange={(e) => patchDraft("facebook", e.target.value)}
                    placeholder="facebook.com/seuperfil"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={draft.linkedin ?? ""}
                    onChange={(e) => patchDraft("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/seuperfil"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={draft.youtube ?? ""}
                    onChange={(e) => patchDraft("youtube", e.target.value)}
                    placeholder="youtube.com/@seucanal"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ============ TAB: Aparência ============ */}
            <TabsContent value="aparencia" className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">Tema do Site</Label>
                  <button
                    type="button"
                    onClick={() => setView("modelos")}
                    className="text-xs font-medium text-[#002B5B] hover:underline"
                  >
                    Ver todos os modelos →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                  {TEMAS.map((t) => (
                    <ThemeLaptopCard
                      key={t.id}
                      themeKey={t.id}
                      label={t.label}
                      description={t.preview}
                      gradient={THEME_BG_GRADIENTS[t.id]}
                      accentColor={t.cor}
                      variant={THEME_VARIANT_MAP[t.id] ?? "classic"}
                      isActive={draft.tema === t.id}
                      onSelect={() => patchDraft("tema", t.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="cor_primaria"
                      type="color"
                      value={draft.cor_primaria ?? "#0284C7"}
                      onChange={(e) => patchDraft("cor_primaria", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      {draft.cor_primaria}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="cor_secundaria"
                      type="color"
                      value={draft.cor_secundaria ?? "#F59E0B"}
                      onChange={(e) =>
                        patchDraft("cor_secundaria", e.target.value)
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      {draft.cor_secundaria}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ============ TAB: Hero ============ */}
            <TabsContent value="hero" className="space-y-5">
              {/* Banner upload */}
              <div>
                <Label className="mb-2 block text-sm font-semibold">
                  Imagem do Banner
                </Label>
                <div className="flex h-36 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted">
                  {draft.banner_hero_url ? (
                    <img
                      src={draft.banner_hero_url}
                      alt="Banner"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Clique ou arraste para enviar (1200x400px recomendado)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="banner_hero_titulo">Título do Hero</Label>
                <Input
                  id="banner_hero_titulo"
                  value={draft.banner_hero_titulo ?? ""}
                  onChange={(e) =>
                    patchDraft("banner_hero_titulo", e.target.value)
                  }
                  placeholder="Encontre o imóvel dos seus sonhos"
                />
              </div>

              <div>
                <Label htmlFor="banner_hero_subtitulo">Subtítulo do Hero</Label>
                <Input
                  id="banner_hero_subtitulo"
                  value={draft.banner_hero_subtitulo ?? ""}
                  onChange={(e) =>
                    patchDraft("banner_hero_subtitulo", e.target.value)
                  }
                  placeholder="Especialista em imóveis na sua região"
                />
              </div>
            </TabsContent>

            {/* ============ TAB: Imóveis ============ */}
            <TabsContent value="imoveis" className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Imóveis do Workspace
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Os imóveis cadastrados aparecem automaticamente no seu site.
                  </p>
                </div>
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

              {/* Call-to-action para migração se workspace vazio */}
              {!loadingProps && properties.length === 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2 shrink-0">
                      <FileDown className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Migrando de outra plataforma?
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Carregando imóveis...
                </div>
              ) : properties.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum imóvel cadastrado neste workspace.
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-lg border border-border">
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
                                p.status === "published" ||
                                p.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {p.status === "published" ||
                              p.status === "available"
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
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Portais Imobiliários
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sincronize seus imóveis com os principais portais do mercado.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {portals.map((portal) => (
                  <Card
                    key={portal.key}
                    className={`relative transition overflow-hidden pl-1 ${
                      portal.enabled
                        ? "border-[#002B5B] shadow-sm"
                        : "border-border"
                    }`}
                  >
                    {/* Accent stripe (esquerda) com a cor do portal */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 w-1"
                      data-portal-color={portal.color}
                      ref={(el) => {
                        if (el) el.style.backgroundColor = portal.color;
                      }}
                    />
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{portal.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {portal.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
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

              {/* Feed XML URL */}
              <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                <h4 className="font-semibold text-foreground mb-1">
                  Feed XML para Portais
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Use este link para cadastrar seus imóveis em qualquer portal.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    aria-label="Feed XML URL"
                    value={`https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/generate-xml-feed?workspace=${draft.slug || "seu-workspace"}`}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/generate-xml-feed?workspace=${draft.slug || "seu-workspace"}`,
                      );
                      toast({ title: "Link copiado!" });
                    }}
                    className="px-3 py-2 bg-[#002B5B] text-white text-xs font-semibold rounded-lg"
                  >
                    Copiar
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Configure a URL do feed no painel de cada portal para sincronizar seus imóveis automaticamente.
                </p>
              </div>
            </TabsContent>

            {/* ============ TAB: Domínio ============ */}
            <TabsContent value="dominio" className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Endereço do Site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        id="slug"
                        value={draft.slug ?? ""}
                        onChange={(e) =>
                          patchDraft(
                            "slug",
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        placeholder="seu-nome"
                      />
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        .nexoimobai.com.br
                      </span>
                    </div>
                    {draft.slug && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        https://{draft.slug}.nexoimobai.com.br
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Domínio Customizado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dominio_customizado">Domínio</Label>
                    <Input
                      id="dominio_customizado"
                      className="mt-1"
                      value={draft.dominio_customizado ?? ""}
                      onChange={(e) =>
                        patchDraft("dominio_customizado", e.target.value)
                      }
                      placeholder="www.seunome.com.br"
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Info className="h-3.5 w-3.5" />
                      Configuração DNS necessária
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-mono">
                      <span>CNAME</span>
                      <span>www</span>
                      <span>cname.vercel-dns.com</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-mono">
                      <span>A</span>
                      <span>@</span>
                      <span>76.76.21.21</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={!draft.dominio_customizado}
                    onClick={() =>
                      toast({
                        title: "Verificação iniciada",
                        description:
                          "Estamos verificando as entradas DNS do seu domínio.",
                      })
                    }
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verificar DNS
                  </Button>

                  {site?.dominio_verificado && (
                    <Badge variant="default" className="text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Domínio verificado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============ TAB: SEO ============ */}
            <TabsContent value="seo" className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="meta_titulo">Meta Título</Label>
                  <span className="text-xs text-muted-foreground">
                    {(draft.meta_titulo ?? "").length}/60
                  </span>
                </div>
                <Input
                  id="meta_titulo"
                  maxLength={60}
                  value={draft.meta_titulo ?? ""}
                  onChange={(e) => patchDraft("meta_titulo", e.target.value)}
                  placeholder="Ex: Imóveis em Salvador | João da Silva Corretor"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="meta_descricao">Meta Descrição</Label>
                  <span className="text-xs text-muted-foreground">
                    {(draft.meta_descricao ?? "").length}/160
                  </span>
                </div>
                <Textarea
                  id="meta_descricao"
                  rows={3}
                  maxLength={160}
                  value={draft.meta_descricao ?? ""}
                  onChange={(e) => patchDraft("meta_descricao", e.target.value)}
                  placeholder="Descrição que aparecerá nos resultados do Google..."
                />
              </div>

              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  value={draft.google_analytics_id ?? ""}
                  onChange={(e) =>
                    patchDraft("google_analytics_id", e.target.value)
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              {/* Google snippet preview */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Preview no Google
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  <p className="text-base font-medium text-blue-700 truncate">
                    {draft.meta_titulo || "Título do seu site"}
                  </p>
                  <p className="text-xs text-green-700">
                    {draft.slug
                      ? `${draft.slug}.nexoimobai.com.br`
                      : "meu-site.nexoimobai.com.br"}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {draft.meta_descricao ||
                      "Descrição do seu site aparecerá aqui nos resultados do Google."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* =================== RIGHT — PREVIEW (60%) =================== */}
        <div className="hidden w-full flex-col items-center bg-muted/30 p-6 lg:flex lg:w-[60%]">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1.5">
              <Eye className="h-3 w-3" />
              Preview ao vivo
            </Badge>
          </div>

          {/* Scaled-down preview container */}
          <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground border border-border">
                {draft.slug || "meu-site"}.nexoimobai.com.br
              </div>
            </div>

            {/* Theme render */}
            <div className="relative overflow-hidden" style={{ height: 720 }}>
              <div
                style={{
                  width: 1280,
                  transformOrigin: "top left",
                  transform: "scale(0.5)",
                }}
              >
                <ThemeRenderer site={previewSite} imoveis={[]} depoimentos={[]} />
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Preview em tempo real — as alterações aparecem conforme você edita.
          </p>
        </div>
      </div>

      {/* Modal: editar layout das seções do site (só admin) */}
      {site && isAdmin && (
        <SiteSectionsEditor
          open={sectionsEditorOpen}
          onOpenChange={setSectionsEditorOpen}
          site={site}
          onSaved={(newConfig) => {
            // Atualiza o draft local pra refletir no preview imediatamente
            setDraft((prev) => ({ ...prev, sections_config: newConfig }));
          }}
        />
      )}
    </AppLayout>
  );
}
