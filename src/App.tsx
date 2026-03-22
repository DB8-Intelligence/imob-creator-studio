import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
// VIDEO MODULE — mantido para implementação futura, não exposto na navegação
// import VideoCreatorPage from "./pages/VideoCreatorPage";
// import VideosDashboardPage from "./pages/VideosDashboardPage";
// import VideosPricingPage from "./pages/VideosPricingPage";
// import VideosStyleCatalogPage from "./pages/VideosStyleCatalogPage";
// import VideoLandingPage from "./pages/VideoLandingPage";
import IdeaCreativePage from "./pages/IdeaCreativePage";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreateCreativeHub /></ProtectedRoute>} />
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
              <Route path="/plano" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />

              {/* VIDEO MODULE — rotas mantidas para implementação futura */}
              {/* <Route path="/videos" element={<ProtectedRoute><VideoLandingPage /></ProtectedRoute>} /> */}
              {/* <Route path="/video-dashboard" element={<ProtectedRoute><VideosDashboardPage /></ProtectedRoute>} /> */}
              {/* <Route path="/video-creator" element={<ProtectedRoute><VideoCreatorPage /></ProtectedRoute>} /> */}
              {/* <Route path="/video-styles" element={<ProtectedRoute><VideosStyleCatalogPage /></ProtectedRoute>} /> */}
              {/* <Route path="/video-plans" element={<ProtectedRoute><VideosPricingPage /></ProtectedRoute>} /> */}

              <Route path="/termos" element={<TermsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
