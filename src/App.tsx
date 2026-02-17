import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Marketing pages
import Home from "./pages/marketing/Home";
import ComoFunciona from "./pages/marketing/ComoFunciona";
import Planos from "./pages/marketing/Planos";
import Resultados from "./pages/marketing/Resultados";
import FAQ from "./pages/marketing/FAQ";
import Contato from "./pages/marketing/Contato";

// Auth
import Auth from "./pages/Auth";

// App pages (logged-in)
import AppDashboard from "./pages/app/AppDashboard";
import AppCreditos from "./pages/app/AppCreditos";
import AppAprovacoes from "./pages/app/AppAprovacoes";
import Inbox from "./pages/Inbox";
import Posts from "./pages/Posts";
import BrandTemplates from "./pages/BrandTemplates";
import PropertyEditor from "./pages/PropertyEditor";
import SettingsProfile from "./pages/SettingsProfile";
import SettingsPrompts from "./pages/SettingsPrompts";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import Templates from "./pages/Templates";
import Editor from "./pages/Editor";
import Export from "./pages/Export";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public marketing pages */}
            <Route path="/" element={<Home />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/resultados" element={<Resultados />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/auth" element={<Auth />} />

            {/* App (logged-in) routes */}
            <Route path="/app" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
            <Route path="/app/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/app/aprovacoes" element={<ProtectedRoute><AppAprovacoes /></ProtectedRoute>} />
            <Route path="/app/creditos" element={<ProtectedRoute><AppCreditos /></ProtectedRoute>} />
            <Route path="/app/templates" element={<ProtectedRoute><BrandTemplates /></ProtectedRoute>} />
            <Route path="/app/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/app/configuracoes/profile" element={<ProtectedRoute><SettingsProfile /></ProtectedRoute>} />
            <Route path="/app/configuracoes/prompts" element={<ProtectedRoute><SettingsPrompts /></ProtectedRoute>} />

            {/* Legacy/utility routes */}
            <Route path="/editor/:id" element={<ProtectedRoute><PropertyEditor /></ProtectedRoute>} />
            <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
            <Route path="/plano" element={<ProtectedRoute><AppCreditos /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/profile" element={<ProtectedRoute><SettingsProfile /></ProtectedRoute>} />
            <Route path="/settings/prompts" element={<ProtectedRoute><SettingsPrompts /></ProtectedRoute>} />
            <Route path="/brand-templates" element={<ProtectedRoute><BrandTemplates /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
