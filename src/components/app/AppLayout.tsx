import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/app/NotificationBell";
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
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Coins,
  Plus,
  Plug,
  Home,
  HelpCircle,
  Calendar,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_NAV } from "@/config/dashboard-nav";
import { TOPBAR_TABS, isTabActive } from "@/config/topbar-tabs";
import { supabase } from "@/integrations/supabase/client";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { data: plan } = useUserPlan();
  const { workspaceName, workspaceRole } = useWorkspaceContext();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Até logo!", description: "Você saiu da sua conta." });
    navigate("/auth");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setIsAdmin(true); });
  }, [user]);

  const creditsRemaining = plan?.credits_remaining ?? 0;
  const creditsTotal = plan?.credits_total ?? 0;
  const isUnlimited = plan?.plan_slug === "max" || plan?.user_plan === "pro" || plan?.user_plan === "vip";
  const creditPct = creditsTotal > 0 ? Math.min((creditsRemaining / creditsTotal) * 100, 100) : 0;

  // Credit bar ref — sets width via CSS var pra evitar inline-style lint
  const creditBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    creditBarRef.current?.style.setProperty("width", `${creditPct}%`);
  }, [creditPct]);

  // Low-credit toast — fires once per session when credits drop to ≤ 5
  const lowCreditToastShown = useRef(false);
  useEffect(() => {
    if (!isUnlimited && plan && creditsRemaining <= 5 && creditsRemaining > 0 && !lowCreditToastShown.current) {
      lowCreditToastShown.current = true;
      toast({
        title: "Créditos quase acabando",
        description: `Você tem apenas ${creditsRemaining} crédito${creditsRemaining !== 1 ? "s" : ""} restante${creditsRemaining !== 1 ? "s" : ""}.`,
        variant: "destructive",
      });
    }
    if (!isUnlimited && plan && creditsRemaining === 0 && !lowCreditToastShown.current) {
      lowCreditToastShown.current = true;
      toast({
        title: "Sem créditos disponíveis",
        description: "Adquira um pacote de créditos para continuar.",
        variant: "destructive",
      });
    }
  }, [creditsRemaining, isUnlimited, plan, toast]);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of DASHBOARD_NAV) {
      const hasActivePath = section.items.some(
        (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
      );
      initial[section.id] = hasActivePath;
    }
    initial.home = true;
    return initial;
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const planLabel = plan?.plan_name || (plan?.plan_slug ? `Plano ${plan.plan_slug.toUpperCase()}` : "Plano CRÉDITOS");

  /* ──────────────────────────────────────────────────────────────
     TOPBAR em 2 linhas (estilo Univen)
     Linha 1 (h-14, bg-card): hamburger + busca global + créditos + ícones + avatar
     Linha 2 (h-11, bg #002B5B): 6 abas horizontais (Dashboard, Leads, etc.)
     ────────────────────────────────────────────────────────────── */
  const Topbar = (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40">
      {/* ─── Linha 1 ─── */}
      <div className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 lg:px-6">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Busca global (desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquise imóveis, leads ou clientes…"
              className="w-full h-9 pl-9 pr-3 rounded-full bg-muted/50 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#002B5B]/30 focus:bg-card transition-colors"
              aria-label="Busca global"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Ações à direita */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          {/* Créditos */}
          <button
            type="button"
            onClick={() => navigate("/configuracoes/plano")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
            title={isUnlimited ? "Operação expandida (créditos ilimitados)" : `${creditsRemaining} de ${creditsTotal} créditos`}
          >
            <Coins className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-foreground">
              {isUnlimited ? "∞" : creditsRemaining}
            </span>
            <span className="text-[11px] text-muted-foreground hidden lg:inline">
              {isUnlimited ? "ilimitado" : "créditos"}
            </span>
          </button>

          {!isUnlimited && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/configuracoes/plano")}
              className="hidden lg:inline-flex gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Comprar
            </Button>
          )}

          {/* Ícones rápidos: Home / Calendário / Bell / Ajuda */}
          <div className="hidden sm:flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/dashboard")}
              title="Início"
            >
              <Home className="w-[18px] h-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/calendario")}
              title="Calendário"
            >
              <Calendar className="w-[18px] h-[18px]" />
            </Button>
          </div>

          <NotificationBell />

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => window.open("https://nexoimobai.com.br/ajuda", "_blank")}
            title="Ajuda"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2 rounded-lg hover:bg-muted transition-colors p-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{profile?.full_name ?? "Usuário"}</p>
                <p className="text-xs text-muted-foreground font-normal">{planLabel}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleDarkMode}>
                {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {darkMode ? "Modo Claro" : "Modo Escuro"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                <Settings className="w-4 h-4 mr-2" />
                Perfil & Marca
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes/plano")}>
                <Coins className="w-4 h-4 mr-2" />
                Plano & Créditos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/integracoes")}>
                <Plug className="w-4 h-4 mr-2" />
                Integrações & APIs
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

      {/* ─── Linha 2: Abas horizontais ─── */}
      <nav className="h-11 bg-[#002B5B] flex items-stretch overflow-x-auto scrollbar-none">
        {TOPBAR_TABS.map((tab) => {
          const active = isTabActive(tab, location.pathname);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`
                relative shrink-0 px-4 lg:px-6 text-[11px] lg:text-xs font-semibold uppercase tracking-wider
                transition-colors
                ${active
                  ? "text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"}
              `}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-t" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {Topbar}

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
          {/* Logo compacto — linha superior */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="NexoImob AI" className="h-8 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Card (estilo Univen) — avatar + nome + email + empresa + SAIR */}
          <div className="bg-[#002B5B] text-white px-4 py-3.5 relative">
            <button
              type="button"
              onClick={handleLogout}
              className="absolute top-2.5 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/configuracoes")}
                className="relative shrink-0 group"
                title="Alterar foto / perfil"
              >
                <Avatar className="w-12 h-12 ring-2 ring-white/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded bg-white text-[#002B5B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Alterar
                </span>
              </button>
              <div className="min-w-0 flex-1 pr-8">
                <p className="text-sm font-semibold leading-tight truncate">
                  {profile?.full_name ?? "Usuário"}
                </p>
                <p className="text-[11px] text-white/70 truncate leading-snug">
                  {profile?.email ?? user?.email ?? ""}
                </p>
                <p className="text-[11px] text-white/60 truncate leading-snug mt-0.5">
                  {workspaceName || "—"}
                  {workspaceRole && (
                    <span className="ml-1 text-white/40">· {workspaceRole}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Nav — agora ocupa o espaço todo (antes estava dividindo com Créditos e User) */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {DASHBOARD_NAV.filter((section) => {
              if (section.id === "admin" && !isAdmin) return false;
              return true;
            }).map((section) => {
              const isExpanded = expandedSections[section.id] ?? false;
              const sectionHasActive = section.items.some(
                (item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/")
              );

              // Home section: render items directly
              if (section.id === "home") {
                return section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                        ${isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-sm">{item.label}</span>
                    </Link>
                  );
                });
              }

              // Sections com apenas 1 item: render direto sem collapsible header
              if (section.items.length === 1) {
                const item = section.items[0];
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              // Sections com múltiplos itens: collapsible
              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors mt-1
                      ${sectionHasActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                    `}
                  >
                    <span className="text-sm">{section.emoji}</span>
                    <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wide">
                      {section.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-2 space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                              ${isActive
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                            `}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground leading-none">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Progress bar de créditos (opcional, pequeno, só se limitado) */}
          {!isUnlimited && creditsTotal > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>Créditos</span>
                <span className="font-medium text-foreground">{creditsRemaining}/{creditsTotal}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  ref={creditBarRef}
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditPct > 50 ? "bg-accent" : creditPct > 20 ? "bg-amber-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main com padding-top pra acomodar topbar de 2 linhas (56+44 = 100px) */}
      <main className="lg:ml-64 min-h-screen pt-[100px]">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
