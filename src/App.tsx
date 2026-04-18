import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ModuleProtectedRoute } from "@/components/auth/ModuleProtectedRoute";
import { RouteTracker } from "@/components/app/RouteTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import Dashboard from "./pages/Dashboard";
import CreateCreativeHub from "./pages/CreateCreativeHub";
import CreateSequencePage from "./pages/CreateSequencePage";
import CreateThumbnailPage from "./pages/CreateThumbnailPage";
import AnimateCreativePage from "./pages/AnimateCreativePage";
import Upload from "./pages/Upload";
import Templates from "./pages/Templates";
import Editor from "./pages/Editor";
import PropertyEditor from "./pages/PropertyEditor";
import Export from "./pages/Export";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import SettingsProfile from "./pages/SettingsProfile";
import SettingsPrompts from "./pages/SettingsPrompts";
import NotFound from "./pages/NotFound";
import Inbox from "./pages/Inbox";
import Posts from "./pages/Posts";
import BrandTemplates from "./pages/BrandTemplates";
import PlanPage from "./pages/PlanPage";
import PlansPage from "./pages/PlansPage";
import IdeaCreativePage from "./pages/IdeaCreativePage";
import ReversePromptLabPage from "./pages/ReversePromptLabPage";
import UpscaleImagePage from "./pages/UpscaleImagePage";
import ImageRestorationPage from "./pages/ImageRestorationPage";
import RenovatePropertyPage from "./pages/RenovatePropertyPage";
import SketchRenderPage from "./pages/SketchRenderPage";
import EmptyLotPage from "./pages/EmptyLotPage";
import LandMarkingPage from "./pages/LandMarkingPage";
import AIAgentsPage from "./pages/AIAgentsPage";
import TermsPage from "./pages/TermsPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import AttributionPage from "./pages/AttributionPage";
import ReferralPage from "./pages/ReferralPage";
import CampaignBuilderPage from "./pages/CampaignBuilderPage";
import FunnelDashboardPage from "./pages/FunnelDashboardPage";
import BusinessMetricsPage from "./pages/BusinessMetricsPage";
import StudioPage from "./pages/StudioPage";
import CreativeStudioPage from "./pages/CreativeStudioPage";
import ShowcasePage from "./pages/ShowcasePage";
import VideoCreatorPage from "./pages/VideoCreatorPage";
import VideoLandingPage from "./pages/VideoLandingPage";
import VideosDashboardPage from "./pages/VideosDashboardPage";
import VideosPricingPage from "./pages/VideosPricingPage";
import VideosStyleCatalogPage from "./pages/VideosStyleCatalogPage";
import ParaCorretoresPage from "./pages/ParaCorretoresPage";
import ParaImobiliariasPage from "./pages/ParaImobiliariasPage";
import ParaEquipesPage from "./pages/ParaEquipesPage";
import CriarPostsImoveisPage from "./pages/lp/CriarPostsImoveisPage";
import VideoImobiliarioPage from "./pages/lp/VideoImobiliarioPage";
import AutomacaoImobiliariaPage from "./pages/lp/AutomacaoImobiliariaPage";
import SecretariaVirtualLpPage from "./pages/lp/SecretariaVirtualLpPage";
import SecretariaVirtualPublicPage from "./pages/lp/SecretariaVirtualPublicPage";
import CriativosLpPage from "./pages/lp/CriativosPage";
import VideosLpPage from "./pages/lp/VideosPage";
import SiteLpPage from "./pages/lp/SitePage";
import CrmLpPage from "./pages/lp/CrmPage";
import WhatsappLpPage from "./pages/lp/WhatsappPage";
import SocialLpPage from "./pages/lp/SocialPage";
import PrecosPage from "./pages/public/Precos";
import DiagnosticoPage from "./pages/public/Diagnostico";
import SobrePage from "./pages/SobrePage";
import ContatoPage from "./pages/ContatoPage";

// ── Dashboard MAX pages (lazy-loaded for code splitting) ────────────────────
const LeadsPipelinePage = lazy(() => import("./pages/max/LeadsPipelinePage"));
const LeadsCadastroPage = lazy(() => import("./pages/max/LeadsCadastroPage"));
const LeadsHistoricoPage = lazy(() => import("./pages/max/LeadsHistoricoPage"));
const AtendimentosCalendarioPage = lazy(() => import("./pages/max/AtendimentosCalendarioPage"));
const AtendimentosNovoPage = lazy(() => import("./pages/max/AtendimentosNovoPage"));
const AtendimentosHistoricoPage = lazy(() => import("./pages/max/AtendimentosHistoricoPage"));
const ImoveisListagemPage = lazy(() => import("./pages/max/ImoveisListagemPage"));
const ImoveisEditorPage = lazy(() => import("./pages/max/ImoveisEditorPage"));
const ImoveisUploadPage = lazy(() => import("./pages/max/ImoveisUploadPage"));
const CreativesGalleryPage = lazy(() => import("./pages/CreativesGalleryPage"));
const CriativosPostsPage = lazy(() => import("./pages/max/CriativosPostsPage"));
const CriativosVideosPage = lazy(() => import("./pages/max/CriativosVideosPage"));
const CriativosTemplatesPage = lazy(() => import("./pages/max/CriativosTemplatesPage"));
const AutomacoesFluxosPage = lazy(() => import("./pages/max/AutomacoesFluxosPage"));
const AutomacoesConstrutorPage = lazy(() => import("./pages/max/AutomacoesConstrutorPage"));
const AutomacoesHistoricoPage = lazy(() => import("./pages/max/AutomacoesHistoricoPage"));
const CalendarioPage = lazy(() => import("./pages/max/CalendarioPage"));
const CalendarioFeedPage = lazy(() => import("./pages/max/CalendarioFeedPage"));
const CalendarioPublicacoesPage = lazy(() => import("./pages/max/CalendarioPublicacoesPage"));
const BookApresentacaoPage = lazy(() => import("./pages/max/BookApresentacaoPage"));
const BookPortfolioPage = lazy(() => import("./pages/max/BookPortfolioPage"));
const BookConfigPage = lazy(() => import("./pages/max/BookConfigPage"));
const AgentesAtivosPage = lazy(() => import("./pages/max/AgentesAtivosPage"));
const AgentesCriarPage = lazy(() => import("./pages/max/AgentesCriarPage"));
const AgentesLogsPage = lazy(() => import("./pages/max/AgentesLogsPage"));
const FinanceiroReceitasPage = lazy(() => import("./pages/max/FinanceiroReceitasPage"));
const FinanceiroComissoesPage = lazy(() => import("./pages/max/FinanceiroComissoesPage"));
const FinanceiroRelatorioPage = lazy(() => import("./pages/max/FinanceiroRelatorioPage"));
const UsuariosListaPage = lazy(() => import("./pages/max/UsuariosListaPage"));
const UsuariosPermissoesPage = lazy(() => import("./pages/max/UsuariosPermissoesPage"));
const ConfigPerfilPage = lazy(() => import("./pages/max/ConfigPerfilPage"));
const ConfigPromptsPage = lazy(() => import("./pages/max/ConfigPromptsPage"));
const ConfigPlanoPage = lazy(() => import("./pages/max/ConfigPlanoPage"));
const IntegracoesApisPage = lazy(() => import("./pages/max/IntegracoesApisPage"));
const IntegracoesWebhooksPage = lazy(() => import("./pages/max/IntegracoesWebhooksPage"));
const BibliotecaFotosPage = lazy(() => import("./pages/max/BibliotecaFotosPage"));
const BibliotecaVideosPage = lazy(() => import("./pages/max/BibliotecaVideosPage"));
const BibliotecaDocumentosPage = lazy(() => import("./pages/max/BibliotecaDocumentosPage"));
const RelatoriosPerformancePage = lazy(() => import("./pages/max/RelatoriosPerformancePage"));
const ContentAnalyticsPage = lazy(() => import("./pages/max/ContentAnalyticsPage"));
const SiteConfigPage = lazy(() => import("./pages/SiteConfigPage"));
const AttendancesPage = lazy(() => import("./pages/AttendancesPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const AttendanceDetailPage = lazy(() => import("./pages/AttendanceDetailPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const ModulesPage = lazy(() => import("./pages/ModulesPage"));
const RelatoriosConversaoPage = lazy(() => import("./pages/max/RelatoriosConversaoPage"));
const RelatoriosRoiPage = lazy(() => import("./pages/max/RelatoriosRoiPage"));
const MeuPlanoPage = lazy(() => import("./pages/MeuPlano"));

// ── Admin Pages ──────────────────────────────────────────────────────────────
const AdminDiagnosticosPage = lazy(() => import("./pages/admin/AdminDiagnosticos"));
const AdminFunnelAnalyticsPage = lazy(() => import("./pages/admin/AdminFunnelAnalytics"));

// ── Gerador de Posts ──────────────────────────────────────────────────────────
const GerarPostsPage = lazy(() => import("./pages/GerarPosts"));
const GerarPostsImovelPage = lazy(() => import("./pages/GerarPostsImovel"));

// ── Dashboard Module Pages (lazy-loaded) ──────────────────────────────────────
const GaleriaCriativosPage = lazy(() => import("./pages/dashboard/criativos/GaleriaCriativosPage"));
const CriativoDetailPage = lazy(() => import("./pages/dashboard/criativos/CriativoDetailPage"));
const NovoCriativoPage = lazy(() => import("./pages/dashboard/criativos/NovoCriativoPage"));
const DashboardVideosPage = lazy(() => import("./pages/dashboard/videos/DashboardVideosPage"));
const NovoVideoPage = lazy(() => import("./pages/dashboard/videos/NovoVideoPage"));
const VideoPlayerPage = lazy(() => import("./pages/dashboard/videos/VideoPlayerPage"));
const DashboardCRMPage = lazy(() => import("./pages/dashboard/crm/DashboardCRMPage"));
const LeadDetailPage = lazy(() => import("./pages/dashboard/crm/LeadDetailPage"));
const ClientesCRMPage = lazy(() => import("./pages/dashboard/crm/ClientesPage"));
const AgendaCRMPage = lazy(() => import("./pages/dashboard/crm/AgendaPage"));
const ImportarLeadsCRMPage = lazy(() => import("./pages/dashboard/crm/ImportarLeadsPage"));
const DashboardSitePage = lazy(() => import("./pages/dashboard/site/DashboardSitePage"));
const WhatsAppSetupPage = lazy(() => import("./pages/dashboard/whatsapp/WhatsAppSetupPage"));
const WhatsAppInboxPage = lazy(() => import("./pages/dashboard/whatsapp/WhatsAppInboxPage"));
const WhatsAppFluxosPage = lazy(() => import("./pages/dashboard/whatsapp/WhatsAppFluxosPage"));
const WhatsAppFlowBuilderPage = lazy(() => import("./pages/dashboard/whatsapp/WhatsAppFlowBuilderPage"));
const WhatsAppAiConfigPage = lazy(() => import("./pages/dashboard/whatsapp/WhatsAppAiConfigPage"));
const JobStatusPage = lazy(() => import("./pages/dashboard/JobStatusPage"));
const SocialConnectPage = lazy(() => import("./pages/dashboard/social/SocialConnectPage"));
const SocialCalendarioPage = lazy(() => import("./pages/dashboard/social/CalendarioPublicacoesPage"));
const SocialCallbackPage = lazy(() => import("./pages/dashboard/social/SocialCallbackPage"));

// ── Site Imobiliário ──────────────────────────────────────────────────────────
const SiteImobiliarioPage = lazy(() => import("./pages/SiteImobiliario"));
const SiteLeadsPage = lazy(() => import("./pages/SiteLeads"));
import SitePreview from "./pages/SitePreview";
import SitePublico from "./pages/SitePublico";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/site-preview" element={<SitePreview />} />
              <Route path="/c/:slug" element={<SitePublico />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/studio"   element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
              <Route path="/showcase" element={<ProtectedRoute><ShowcasePage /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreateCreativeHub /></ProtectedRoute>} />
              <Route path="/create/studio" element={<ProtectedRoute><CreativeStudioPage /></ProtectedRoute>} />
              <Route path="/create/ideia" element={<ProtectedRoute><IdeaCreativePage /></ProtectedRoute>} />
              <Route path="/create/sequence" element={<ProtectedRoute><CreateSequencePage /></ProtectedRoute>} />
              <Route path="/create/thumbnail" element={<ProtectedRoute><CreateThumbnailPage /></ProtectedRoute>} />
              <Route path="/create/animate" element={<ProtectedRoute><AnimateCreativePage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
              <Route path="/editor/:id" element={<ProtectedRoute><PropertyEditor /></ProtectedRoute>} />
              <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><SettingsProfile /></ProtectedRoute>} />
              <Route path="/settings/prompts" element={<ProtectedRoute><SettingsPrompts /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
              <Route path="/brand-templates" element={<ProtectedRoute><BrandTemplates /></ProtectedRoute>} />
              <Route path="/plano" element={<ProtectedRoute><MeuPlanoPage /></ProtectedRoute>} />
              <Route path="/planos" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
              <Route path="/reverse-prompt-lab" element={<ProtectedRoute><ReversePromptLabPage /></ProtectedRoute>} />
              <Route path="/upscale" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><UpscaleImagePage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/image-restoration" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><ImageRestorationPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/renovate" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><RenovatePropertyPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/sketch-render" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><SketchRenderPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/empty-lot" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><EmptyLotPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/land-marking" element={<ProtectedRoute><ModuleProtectedRoute requires="criativos"><LandMarkingPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/ai-agents" element={<ProtectedRoute><AIAgentsPage /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/attribution" element={<ProtectedRoute><AttributionPage /></ProtectedRoute>} />
              <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
              <Route path="/dashboard/campaigns" element={<ProtectedRoute><CampaignBuilderPage /></ProtectedRoute>} />
              <Route path="/dashboard/funnel"    element={<ProtectedRoute><FunnelDashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/metrics"   element={<ProtectedRoute><BusinessMetricsPage /></ProtectedRoute>} />

              {/* ── Módulo de Vídeo ─────────────────────────────────────────── */}
              <Route path="/video"            element={<VideoLandingPage />} />
              <Route path="/video-creator"    element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><VideoCreatorPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/video-dashboard"  element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><VideosDashboardPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/video-plans"      element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><VideosPricingPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/video-styles"     element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><VideosStyleCatalogPage /></ModuleProtectedRoute></ProtectedRoute>} />

              {/* ── Dashboard MAX ──────────────────────────────────────────── */}
              {/* Leads */}
              <Route path="/leads"              element={<ProtectedRoute><LeadsPipelinePage /></ProtectedRoute>} />
              <Route path="/leads/novo"         element={<ProtectedRoute><LeadsCadastroPage /></ProtectedRoute>} />
              <Route path="/leads/historico"    element={<ProtectedRoute><LeadsHistoricoPage /></ProtectedRoute>} />
              <Route path="/leads/:id"          element={<ProtectedRoute><LeadsHistoricoPage /></ProtectedRoute>} />
              {/* Atendimentos */}
              <Route path="/atendimentos"              element={<ProtectedRoute><AtendimentosCalendarioPage /></ProtectedRoute>} />
              <Route path="/atendimentos/novo"         element={<ProtectedRoute><AtendimentosNovoPage /></ProtectedRoute>} />
              <Route path="/atendimentos/historico"    element={<ProtectedRoute><AtendimentosHistoricoPage /></ProtectedRoute>} />
              {/* Imóveis */}
              <Route path="/imoveis"              element={<ProtectedRoute><ImoveisListagemPage /></ProtectedRoute>} />
              <Route path="/imoveis/editor"       element={<ProtectedRoute><ImoveisEditorPage /></ProtectedRoute>} />
              <Route path="/imoveis/editor/:id"   element={<ProtectedRoute><ImoveisEditorPage /></ProtectedRoute>} />
              <Route path="/imoveis/upload"       element={<ProtectedRoute><ImoveisUploadPage /></ProtectedRoute>} />
              {/* Criativos (dashboard MAX) */}
              <Route path="/max/criativos"              element={<ProtectedRoute><CriativosPostsPage /></ProtectedRoute>} />
              <Route path="/max/criativos/galeria"      element={<ProtectedRoute><CreativesGalleryPage /></ProtectedRoute>} />
              <Route path="/max/criativos/videos"       element={<ProtectedRoute><CriativosVideosPage /></ProtectedRoute>} />
              <Route path="/max/criativos/templates"    element={<ProtectedRoute><CriativosTemplatesPage /></ProtectedRoute>} />
              {/* Automações */}
              <Route path="/automacoes"              element={<ProtectedRoute><AutomacoesFluxosPage /></ProtectedRoute>} />
              <Route path="/automacoes/construtor"   element={<ProtectedRoute><AutomacoesConstrutorPage /></ProtectedRoute>} />
              <Route path="/automacoes/historico"    element={<ProtectedRoute><AutomacoesHistoricoPage /></ProtectedRoute>} />
              {/* Calendário */}
              <Route path="/calendario"              element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
              <Route path="/calendario/feed"          element={<ProtectedRoute><CalendarioFeedPage /></ProtectedRoute>} />
              <Route path="/calendario/publicacoes"  element={<ProtectedRoute><CalendarioPublicacoesPage /></ProtectedRoute>} />
              {/* Book Agente */}
              <Route path="/book"              element={<ProtectedRoute><BookApresentacaoPage /></ProtectedRoute>} />
              <Route path="/book/portfolio"    element={<ProtectedRoute><BookPortfolioPage /></ProtectedRoute>} />
              <Route path="/book/config"       element={<ProtectedRoute><BookConfigPage /></ProtectedRoute>} />
              {/* Agentes de IA */}
              <Route path="/agentes"           element={<ProtectedRoute><AgentesAtivosPage /></ProtectedRoute>} />
              <Route path="/agentes/criar"     element={<ProtectedRoute><AgentesCriarPage /></ProtectedRoute>} />
              <Route path="/agentes/logs"      element={<ProtectedRoute><AgentesLogsPage /></ProtectedRoute>} />
              {/* Financeiro */}
              <Route path="/financeiro"              element={<ProtectedRoute><FinanceiroReceitasPage /></ProtectedRoute>} />
              <Route path="/financeiro/comissoes"    element={<ProtectedRoute><FinanceiroComissoesPage /></ProtectedRoute>} />
              <Route path="/financeiro/relatorio"    element={<ProtectedRoute><FinanceiroRelatorioPage /></ProtectedRoute>} />
              {/* Usuários */}
              <Route path="/usuarios"              element={<ProtectedRoute><UsuariosListaPage /></ProtectedRoute>} />
              <Route path="/usuarios/permissoes"   element={<ProtectedRoute><UsuariosPermissoesPage /></ProtectedRoute>} />
              {/* Configurações */}
              <Route path="/configuracoes"              element={<ProtectedRoute><ConfigPerfilPage /></ProtectedRoute>} />
              <Route path="/configuracoes/prompts"      element={<ProtectedRoute><ConfigPromptsPage /></ProtectedRoute>} />
              <Route path="/configuracoes/plano"        element={<ProtectedRoute><ConfigPlanoPage /></ProtectedRoute>} />
              <Route path="/configuracoes/modulos"      element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
              {/* Site */}
              <Route path="/site"                     element={<ProtectedRoute><SiteConfigPage /></ProtectedRoute>} />
              {/* Import */}
              <Route path="/importar"                  element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
              {/* CRM */}
              <Route path="/crm/atendimentos"         element={<ProtectedRoute><AttendancesPage /></ProtectedRoute>} />
              <Route path="/crm/atendimentos/:id"     element={<ProtectedRoute><AttendanceDetailPage /></ProtectedRoute>} />
              <Route path="/crm/leads"                element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
              {/* ── Dashboard Módulos ────────────────────────────────────── */}
              {/* Criativos */}
              <Route path="/dashboard/criativos"          element={<ProtectedRoute><GaleriaCriativosPage /></ProtectedRoute>} />
              <Route path="/dashboard/criativos/novo"     element={<ProtectedRoute><NovoCriativoPage /></ProtectedRoute>} />
              <Route path="/dashboard/criativos/:id"      element={<ProtectedRoute><CriativoDetailPage /></ProtectedRoute>} />
              {/* Vídeos */}
              <Route path="/dashboard/videos"             element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><DashboardVideosPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/videos/novo"        element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><NovoVideoPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/videos/:id"         element={<ProtectedRoute><ModuleProtectedRoute requires="videos"><VideoPlayerPage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* CRM */}
              <Route path="/dashboard/crm"                element={<ProtectedRoute><ModuleProtectedRoute requires="crm"><DashboardCRMPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/crm/lead/:id"       element={<ProtectedRoute><ModuleProtectedRoute requires="crm"><LeadDetailPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/crm/clientes"       element={<ProtectedRoute><ModuleProtectedRoute requires="crm"><ClientesCRMPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/crm/agenda"         element={<ProtectedRoute><ModuleProtectedRoute requires="crm"><AgendaCRMPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/crm/importar"       element={<ProtectedRoute><ModuleProtectedRoute requires="crm"><ImportarLeadsCRMPage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* Site + Portais */}
              <Route path="/dashboard/site"               element={<ProtectedRoute><ModuleProtectedRoute requires="site"><DashboardSitePage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* Site Imobiliário */}
              <Route path="/site-imobiliario"             element={<ProtectedRoute><ModuleProtectedRoute requires="site"><SiteImobiliarioPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/site-leads"                   element={<ProtectedRoute><ModuleProtectedRoute requires="site"><SiteLeadsPage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* WhatsApp */}
              <Route path="/dashboard/whatsapp"           element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppSetupPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/whatsapp/inbox"     element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppInboxPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/whatsapp/ai-config" element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppAiConfigPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/whatsapp/fluxos"    element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppFluxosPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/whatsapp/fluxos/novo" element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppFlowBuilderPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/whatsapp/fluxos/:id"  element={<ProtectedRoute><ModuleProtectedRoute requires="whatsapp"><WhatsAppFlowBuilderPage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* Job Status */}
              <Route path="/dashboard/job/:jobId"          element={<ProtectedRoute><JobStatusPage /></ProtectedRoute>} />
              {/* Social */}
              <Route path="/dashboard/social/conectar"    element={<ProtectedRoute><ModuleProtectedRoute requires="social"><SocialConnectPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/social/calendario"  element={<ProtectedRoute><ModuleProtectedRoute requires="social"><SocialCalendarioPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/dashboard/social/callback"    element={<ProtectedRoute><SocialCallbackPage /></ProtectedRoute>} />

              {/* Integrações */}
              <Route path="/integracoes"              element={<ProtectedRoute><ModuleProtectedRoute requires="portais"><IntegracoesApisPage /></ModuleProtectedRoute></ProtectedRoute>} />
              <Route path="/integracoes/webhooks"     element={<ProtectedRoute><ModuleProtectedRoute requires="portais"><IntegracoesWebhooksPage /></ModuleProtectedRoute></ProtectedRoute>} />
              {/* Biblioteca */}
              <Route path="/biblioteca"              element={<ProtectedRoute><BibliotecaFotosPage /></ProtectedRoute>} />
              <Route path="/biblioteca/videos"       element={<ProtectedRoute><BibliotecaVideosPage /></ProtectedRoute>} />
              <Route path="/biblioteca/documentos"   element={<ProtectedRoute><BibliotecaDocumentosPage /></ProtectedRoute>} />
              {/* Relatórios */}
              <Route path="/relatorios"              element={<ProtectedRoute><RelatoriosPerformancePage /></ProtectedRoute>} />
              <Route path="/relatorios/analytics"     element={<ProtectedRoute><ContentAnalyticsPage /></ProtectedRoute>} />
              <Route path="/relatorios/conversao"    element={<ProtectedRoute><RelatoriosConversaoPage /></ProtectedRoute>} />
              <Route path="/relatorios/roi"          element={<ProtectedRoute><RelatoriosRoiPage /></ProtectedRoute>} />
              {/* Gerador de Posts */}
              <Route path="/gerar-posts"              element={<ProtectedRoute><GerarPostsPage /></ProtectedRoute>} />
              <Route path="/gerar-posts/:imovelId"    element={<ProtectedRoute><GerarPostsImovelPage /></ProtectedRoute>} />

              {/* ── Landing Pages Produto (públicas) ────────────────────── */}
              <Route path="/criativos" element={<CriativosLpPage />} />
              <Route path="/videos"    element={<VideosLpPage />} />
              <Route path="/site-imobiliario"      element={<SiteLpPage />} />
              <Route path="/crm-imobiliario"       element={<CrmLpPage />} />
              <Route path="/secretaria-virtual"    element={<SecretariaVirtualPublicPage />} />
              <Route path="/whatsapp-imobiliario"   element={<WhatsappLpPage />} />
              <Route path="/publicacao-social"      element={<SocialLpPage />} />
              <Route path="/precos"                 element={<PrecosPage />} />
              <Route path="/diagnostico"           element={<DiagnosticoPage />} />
              <Route path="/sobre"                  element={<SobrePage />} />
              <Route path="/contato"                element={<ContatoPage />} />

              <Route path="/para-corretores"       element={<ParaCorretoresPage />} />
              <Route path="/para-imobiliarias"    element={<ParaImobiliariasPage />} />
              <Route path="/para-equipes"         element={<ParaEquipesPage />} />
              {/* Campaign LPs — paid traffic, no nav distractions */}
              <Route path="/lp/criar-posts-imoveis"   element={<CriarPostsImoveisPage />} />
              <Route path="/lp/video-imobiliario"      element={<VideoImobiliarioPage />} />
              <Route path="/lp/automacao-imobiliaria"  element={<AutomacaoImobiliariaPage />} />
              <Route path="/lp/secretaria-virtual"     element={<SecretariaVirtualLpPage />} />
              {/* ── Admin ────────────────────────────────────────────── */}
              <Route path="/admin" element={<Navigate to="/admin/diagnosticos" replace />} />
              <Route path="/admin/diagnosticos" element={<ProtectedRoute><AdminDiagnosticosPage /></ProtectedRoute>} />
              <Route path="/admin/funnel-analytics" element={<ProtectedRoute><AdminFunnelAnalyticsPage /></ProtectedRoute>} />

              <Route path="/termos" element={<TermsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
