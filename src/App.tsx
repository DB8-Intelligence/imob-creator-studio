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
import PlansPage from "./pages/PlansPage";
import IdeaCreativePage from "./pages/IdeaCreativePage";
import ReversePromptLabPage from "./pages/ReversePromptLabPage";
import UpscaleImagePage from "./pages/UpscaleImagePage";
import VirtualStagingPage from "./pages/VirtualStagingPage";
import RenovatePropertyPage from "./pages/RenovatePropertyPage";
import SketchRenderPage from "./pages/SketchRenderPage";
import EmptyLotPage from "./pages/EmptyLotPage";
import LandMarkingPage from "./pages/LandMarkingPage";
import AIAgentsPage from "./pages/AIAgentsPage";
import TermsPage from "./pages/TermsPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import AttributionPage from "./pages/AttributionPage";

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
              <Route path="/planos" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
              <Route path="/reverse-prompt-lab" element={<ProtectedRoute><ReversePromptLabPage /></ProtectedRoute>} />
              <Route path="/upscale" element={<ProtectedRoute><UpscaleImagePage /></ProtectedRoute>} />
              <Route path="/virtual-staging" element={<ProtectedRoute><VirtualStagingPage /></ProtectedRoute>} />
              <Route path="/renovate" element={<ProtectedRoute><RenovatePropertyPage /></ProtectedRoute>} />
              <Route path="/sketch-render" element={<ProtectedRoute><SketchRenderPage /></ProtectedRoute>} />
              <Route path="/empty-lot" element={<ProtectedRoute><EmptyLotPage /></ProtectedRoute>} />
              <Route path="/land-marking" element={<ProtectedRoute><LandMarkingPage /></ProtectedRoute>} />
              <Route path="/ai-agents" element={<ProtectedRoute><AIAgentsPage /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/attribution" element={<ProtectedRoute><AttributionPage /></ProtectedRoute>} />

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
