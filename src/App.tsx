import { lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Páginas carregadas de imediato (críticas para o primeiro render)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Demais páginas com lazy loading — carregadas apenas quando acessadas
const Dashboard          = lazy(() => import("./pages/Dashboard"));
const CreateCreativeHub  = lazy(() => import("./pages/CreateCreativeHub"));
const IdeaCreativePage   = lazy(() => import("./pages/IdeaCreativePage"));
const CreateSequencePage = lazy(() => import("./pages/CreateSequencePage"));
const CreateThumbnailPage = lazy(() => import("./pages/CreateThumbnailPage"));
const AnimateCreativePage = lazy(() => import("./pages/AnimateCreativePage"));
const Upload             = lazy(() => import("./pages/Upload"));
const Templates          = lazy(() => import("./pages/Templates"));
const Editor             = lazy(() => import("./pages/Editor"));
const PropertyEditor     = lazy(() => import("./pages/PropertyEditor"));
const Export             = lazy(() => import("./pages/Export"));
const Library            = lazy(() => import("./pages/Library"));
const Settings           = lazy(() => import("./pages/Settings"));
const SettingsProfile    = lazy(() => import("./pages/SettingsProfile"));
const SettingsPrompts    = lazy(() => import("./pages/SettingsPrompts"));
const Inbox              = lazy(() => import("./pages/Inbox"));
const Posts              = lazy(() => import("./pages/Posts"));
const BrandTemplates     = lazy(() => import("./pages/BrandTemplates"));
const PlanPage           = lazy(() => import("./pages/PlanPage"));
const ProPlusLandingPage = lazy(() => import("./pages/ProPlusLandingPage"));
const TermsPage          = lazy(() => import("./pages/TermsPage"));
const ReversePromptLabPage = lazy(() => import("./pages/ReversePromptLabPage"));
const UpscaleImagePage   = lazy(() => import("./pages/UpscaleImagePage"));

// VIDEO MODULE — mantido para implementação futura, não exposto na navegação
// const VideoCreatorPage      = lazy(() => import("./pages/VideoCreatorPage"));
// const VideosDashboardPage   = lazy(() => import("./pages/VideosDashboardPage"));
// const VideosPricingPage     = lazy(() => import("./pages/VideosPricingPage"));
// const VideosStyleCatalogPage = lazy(() => import("./pages/VideosStyleCatalogPage"));
// const VideoLandingPage      = lazy(() => import("./pages/VideoLandingPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
  </div>
);

const queryClient = new QueryClient();

const SentryFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-background">
    <p className="text-lg font-semibold text-foreground">Algo deu errado</p>
    <p className="text-sm text-muted-foreground max-w-md">
      Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
    </p>
    <button
      className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
      onClick={() => window.location.reload()}
    >
      Recarregar página
    </button>
  </div>
);

const App = () => (
  <Sentry.ErrorBoundary fallback={<SentryFallback />} showDialog={false}>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create"            element={<ProtectedRoute><CreateCreativeHub /></ProtectedRoute>} />
                <Route path="/create/ideia"      element={<ProtectedRoute><IdeaCreativePage /></ProtectedRoute>} />
                <Route path="/create/sequence"   element={<ProtectedRoute><CreateSequencePage /></ProtectedRoute>} />
                <Route path="/create/thumbnail"  element={<ProtectedRoute><CreateThumbnailPage /></ProtectedRoute>} />
                <Route path="/create/animate"    element={<ProtectedRoute><AnimateCreativePage /></ProtectedRoute>} />
                <Route path="/upload"            element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/templates"         element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                <Route path="/editor"            element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/editor/:id"        element={<ProtectedRoute><PropertyEditor /></ProtectedRoute>} />
                <Route path="/export"            element={<ProtectedRoute><Export /></ProtectedRoute>} />
                <Route path="/library"           element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/settings"          element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/settings/profile"  element={<ProtectedRoute><SettingsProfile /></ProtectedRoute>} />
                <Route path="/settings/prompts"  element={<ProtectedRoute><SettingsPrompts /></ProtectedRoute>} />
                <Route path="/inbox"             element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/posts"             element={<ProtectedRoute><Posts /></ProtectedRoute>} />
                <Route path="/brand-templates"   element={<ProtectedRoute><BrandTemplates /></ProtectedRoute>} />
                <Route path="/plano"             element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                <Route path="/reverse-prompt-lab" element={<ProtectedRoute><ReversePromptLabPage /></ProtectedRoute>} />
                <Route path="/upscale"           element={<ProtectedRoute><UpscaleImagePage /></ProtectedRoute>} />

                {/* VIDEO MODULE — rotas mantidas para implementação futura */}
                {/* <Route path="/videos"          element={<ProtectedRoute><VideoLandingPage /></ProtectedRoute>} /> */}
                {/* <Route path="/video-dashboard" element={<ProtectedRoute><VideosDashboardPage /></ProtectedRoute>} /> */}
                {/* <Route path="/video-creator"   element={<ProtectedRoute><VideoCreatorPage /></ProtectedRoute>} /> */}
                {/* <Route path="/video-styles"    element={<ProtectedRoute><VideosStyleCatalogPage /></ProtectedRoute>} /> */}
                {/* <Route path="/video-plans"     element={<ProtectedRoute><VideosPricingPage /></ProtectedRoute>} /> */}

                <Route path="/plano-pro" element={<ProPlusLandingPage />} />
                <Route path="/termos"    element={<TermsPage />} />
                <Route path="*"          element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

  </Sentry.ErrorBoundary>
);

export default App;
