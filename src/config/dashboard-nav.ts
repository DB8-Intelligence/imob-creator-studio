/**
 * dashboard-nav.ts — Configuração de navegação do Dashboard MAX
 *
 * Define toda a estrutura de sidebar do dashboard:
 * seções, itens, sub-rotas, ícones e badges.
 *
 * Separado do AppLayout para facilitar manutenção e extensão.
 */
import {
  Home,
  Users,
  UserPlus,
  History,
  CalendarDays,
  CalendarPlus,
  CalendarClock,
  Building2,
  List,
  PenSquare,
  Upload,
  Palette,
  FileText,
  Video,
  LayoutGrid,
  Bot,
  MessageCircle,
  GitBranch,
  Workflow,
  Send,
  Calendar,
  CalendarRange,
  BookOpen,
  FileDown,
  Briefcase,
  Settings as SettingsIcon,
  Brain,
  Zap,
  PlusCircle,
  ScrollText,
  DollarSign,
  Receipt,
  PiggyBank,
  BarChart3,
  UserCog,
  Shield,
  Cog,
  UserCircle,
  SlidersHorizontal,
  CreditCard,
  Plug,
  Link2,
  Webhook,
  FolderOpen,
  Image,
  Film,
  FileArchive,
  TrendingUp,
  Target,
  PieChart,
  Rss,
  Globe,
  Mic,
  type LucideIcon,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  emoji: string;
  items: NavItem[];
}

// ─── Sections ──────────────────────────────────────────────────────────────

export const DASHBOARD_NAV: NavSection[] = [
  // ── Home ──
  {
    id: "home",
    label: "Home",
    emoji: "📊",
    items: [
      { icon: Home, label: "Visão Geral", path: "/dashboard" },
    ],
  },

  // ── Leads ──
  // Pipeline, cadastro e histórico ficam como tabs/botões dentro da página principal
  {
    id: "leads",
    label: "Leads",
    emoji: "👥",
    items: [
      { icon: Users, label: "Leads", path: "/leads" },
    ],
  },

  // ── Atendimentos ──
  // Calendário, novo agendamento e histórico são abas dentro da página
  {
    id: "atendimentos",
    label: "Atendimentos",
    emoji: "📅",
    items: [
      { icon: CalendarDays, label: "Atendimentos", path: "/atendimentos" },
    ],
  },

  // ── Imóveis ──
  {
    id: "imoveis",
    label: "Imóveis",
    emoji: "🏠",
    items: [
      { icon: List, label: "Imóveis", path: "/imoveis" },
      { icon: FileText, label: "Landing Pages", path: "/dashboard/minhas-lps" },
      { icon: FileDown, label: "Importar XML/Planilha", path: "/importar" },
    ],
  },

  // ── Conteúdo ──
  {
    id: "conteudo",
    label: "Conteúdo",
    emoji: "🎨",
    items: [
      { icon: Zap, label: "Gerar Posts", path: "/gerar-posts", badge: "AI" },
      { icon: FolderOpen, label: "Galeria", path: "/dashboard/criativos" },
      { icon: Video, label: "Vídeos", path: "/dashboard/videos", badge: "IA" },
    ],
  },

  // ── Site & Portais ──
  {
    id: "site",
    label: "Site & Portais",
    emoji: "🌐",
    items: [
      { icon: Globe, label: "Meu Site", path: "/dashboard/site-imobiliario" },
      { icon: Rss, label: "Portais XML", path: "/dashboard/portais" },
    ],
  },

  // ── CRM ──
  {
    id: "crm",
    label: "CRM",
    emoji: "🤝",
    items: [
      { icon: Users, label: "CRM Kanban", path: "/dashboard/crm" },
    ],
  },

  // ── Automações (WhatsApp) ──
  {
    id: "automacoes",
    label: "Automações",
    emoji: "🤖",
    items: [
      { icon: Bot, label: "Secretária Virtual", path: "/dashboard/secretaria" },
      { icon: Mic, label: "Voz Clonada", path: "/dashboard/whatsapp/voz", badge: "Plus" },
      { icon: Workflow, label: "Fluxos de Disparos", path: "/automacoes" },
    ],
  },

  // ── Calendário ──
  {
    id: "calendario",
    label: "Calendário",
    emoji: "📆",
    items: [
      { icon: CalendarRange, label: "Calendário", path: "/calendario" },
    ],
  },

  // ── Book Agente ──
  {
    id: "book",
    label: "Book Agente",
    emoji: "📚",
    items: [
      { icon: FileDown, label: "PDF de Apresentação", path: "/book" },
    ],
  },

  // ── Agentes de IA ──
  {
    id: "agentes",
    label: "Agentes de IA",
    emoji: "🧠",
    items: [
      { icon: Bot, label: "Agentes", path: "/agentes" },
    ],
  },

  // ── Financeiro ──
  {
    id: "financeiro",
    label: "Financeiro",
    emoji: "💰",
    items: [
      { icon: Receipt, label: "Receitas & Despesas", path: "/financeiro" },
      { icon: PiggyBank, label: "Comissões", path: "/financeiro/comissoes" },
      { icon: BarChart3, label: "Relatório Financeiro", path: "/financeiro/relatorio" },
    ],
  },

  // ── Usuários ──
  {
    id: "usuarios",
    label: "Usuários",
    emoji: "👤",
    items: [
      { icon: UserCog, label: "Usuários & Permissões", path: "/usuarios" },
    ],
  },

  // ── Configurações ──
  {
    id: "configuracoes",
    label: "Configurações",
    emoji: "⚙️",
    items: [
      { icon: UserCircle, label: "Perfil & Marca", path: "/configuracoes" },
      { icon: CreditCard, label: "Plano & Faturamento", path: "/configuracoes/plano" },
    ],
  },

  // ── Biblioteca de Arquivos ──
  {
    id: "biblioteca",
    label: "Biblioteca",
    emoji: "📁",
    items: [
      { icon: FolderOpen, label: "Biblioteca", path: "/biblioteca" },
    ],
  },

  // ── Relatórios ──
  {
    id: "relatorios",
    label: "Relatórios",
    emoji: "📈",
    items: [
      { icon: TrendingUp, label: "Relatórios", path: "/relatorios" },
    ],
  },
  // ── Admin (visível apenas para super_admin) ──
  {
    id: "admin",
    label: "Admin",
    emoji: "🛡️",
    items: [
      { icon: BarChart3, label: "Admin Dashboard", path: "/admin" },
      { icon: FileText, label: "Bug Reports", path: "/admin/bugs" },
      { icon: Shield, label: "Diagnósticos", path: "/admin/diagnosticos" },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** All paths flattened for route checking */
export const ALL_NAV_PATHS = DASHBOARD_NAV.flatMap((s) => s.items.map((i) => i.path));

/** Find section by ID */
export function getNavSection(id: string): NavSection | undefined {
  return DASHBOARD_NAV.find((s) => s.id === id);
}
