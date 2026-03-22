import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Upload,
  LayoutGrid,
  Edit3,
  Library,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Moon,
  Sun,
  Film,
  LayoutDashboard,
  Palette,
  CreditCard,
  ImagePlay,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Coins } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  // ── Criativos ──
  { divider: true, label: "Criativos" },
  { icon: Wand2, label: "Criar Criativo", path: "/create" },
  { icon: LayoutGrid, label: "Templates", path: "/templates" },
  { icon: Edit3, label: "Editor", path: "/editor" },
  { icon: Library, label: "Biblioteca", path: "/library" },
  // ── Vídeos IA ──
  { divider: true, label: "Vídeos IA" },
  { icon: ImagePlay, label: "Visão Geral", path: "/videos", badge: "Novo" },
  { icon: Film, label: "Criar Vídeo", path: "/video-creator" },
  { icon: LayoutDashboard, label: "Meus Vídeos", path: "/video-dashboard" },
  { icon: CreditCard, label: "Planos", path: "/video-plans" },
  // ────────────────
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: plan } = useUserPlan();
  const { workspaceName, workspaceRole, workspaceId, workspaces, setActiveWorkspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
    navigate("/auth");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const creditsRemaining = plan?.credits_remaining ?? 0;
  const creditsTotal = plan?.credits_total ?? 0;
  const isUnlimited = plan?.user_plan === "pro" || plan?.user_plan === "vip";
  const creditPct = creditsTotal > 0 ? Math.min((creditsRemaining / creditsTotal) * 100, 100) : 0;

  // Low-credit toast — fires once per session when credits drop to ≤ 5
  const lowCreditToastShown = useRef(false);
  useEffect(() => {
    if (!isUnlimited && plan && creditsRemaining <= 5 && creditsRemaining > 0 && !lowCreditToastShown.current) {
      lowCreditToastShown.current = true;
      toast({
        title: "Créditos quase acabando",
        description: `Você tem apenas ${creditsRemaining} crédito${creditsRemaining !== 1 ? "s" : ""} restante${creditsRemaining !== 1 ? "s" : ""}. Adquira mais para continuar criando.`,
        variant: "destructive",
      });
    }
    if (!isUnlimited && plan && creditsRemaining === 0 && !lowCreditToastShown.current) {
      lowCreditToastShown.current = true;
      toast({
        title: "Sem créditos disponíveis",
        description: "Adquira um pacote de créditos para continuar gerando criativos.",
        variant: "destructive",
      });
    }
  }, [creditsRemaining, isUnlimited, plan, toast]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ImobCreator AI" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/plano")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-foreground">{isUnlimited ? "∞" : creditsRemaining}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">créditos</span>
          </button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="min-h-16 flex items-start justify-between px-4 py-3 border-b border-border">
            <div>
              <Link to="/dashboard" className="flex items-center gap-2">
                <img src="/logo.png" alt="ImobCreator AI" className="h-10 w-auto" />
              </Link>
              <div className="mt-2 pl-12">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Workspace ativo</p>
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {workspaceName || "Workspace não carregado"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {workspaceRole ? `Role: ${workspaceRole}` : "Sem role definida"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-0.5">
            {navItems.map((item, idx) => {
              if ("divider" in item && item.divider) {
                return (
                  <div key={`divider-${idx}`} className="pt-4 pb-1 px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      {item.label}
                    </p>
                  </div>
                );
              }
              if (!("path" in item)) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Créditos</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isUnlimited ? "ilimitado" : `${creditsRemaining}/${creditsTotal}`}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-0.5">
                {isUnlimited ? "∞" : creditsRemaining}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {isUnlimited ? "operação expandida" : "créditos disponíveis"}
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",
                    creditPct > 50 ? "bg-accent" : creditPct > 20 ? "bg-amber-500" : "bg-red-500",
                  ].join(" ")}
                  style={{ width: `${isUnlimited ? 100 : creditPct}%` }}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/plano")}>
                Comprar créditos
              </Button>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{profile?.full_name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">
                      Plano {plan?.user_plan?.toUpperCase?.() || "CRÉDITOS"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {darkMode ? "Modo Claro" : "Modo Escuro"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
