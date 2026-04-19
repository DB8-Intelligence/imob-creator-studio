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
  {
    id: "leads",
    label: "Leads",
    emoji: "👥",
    items: [
      { icon: Users, label: "Pipeline Kanban", path: "/leads" },
      { icon: UserPlus, label: "Cadastro de Lead", path: "/leads/novo" },
      { icon: History, label: "Histórico do Lead", path: "/leads/historico" },
    ],
  },

  // ── Atendimentos ──
  {
    id: "atendimentos",
    label: "Atendimentos",
    emoji: "📅",
    items: [
      { icon: CalendarDays, label: "Calendário de Visitas", path: "/atendimentos" },
      { icon: CalendarPlus, label: "Novo Agendamento", path: "/atendimentos/novo" },
      { icon: CalendarClock, label: "Histórico", path: "/atendimentos/historico" },
    ],
  },

  // ── Imóveis ──
  {
    id: "imoveis",
    label: "Imóveis",
    emoji: "🏠",
    items: [
      { icon: List, label: "Listagem / Inbox", path: "/imoveis" },
      { icon: PenSquare, label: "Editor de Imóvel", path: "/imoveis/editor" },
      { icon: Upload, label: "Upload de Imóvel", path: "/imoveis/upload" },
      { icon: FileDown, label: "Importar Dados", path: "/importar" },
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
      { icon: PlusCircle, label: "Novo Criativo", path: "/dashboard/criativos/novo" },
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
      { icon: Workflow, label: "Fluxos Ativos", path: "/automacoes" },
      { icon: GitBranch, label: "Construtor de Fluxo", path: "/automacoes/construtor" },
      { icon: Send, label: "Histórico de Disparos", path: "/automacoes/historico" },
    ],
  },

  // ── Calendário ──
  {
    id: "calendario",
    label: "Calendário",
    emoji: "📆",
    items: [
      { icon: CalendarRange, label: "Mensal / Semanal", path: "/calendario" },
      { icon: Rss, label: "Feed de Conteúdo", path: "/calendario/feed" },
      { icon: Calendar, label: "Publicações", path: "/calendario/publicacoes" },
    ],
  },

  // ── Book Agente ──
  {
    id: "book",
    label: "Book Agente",
    emoji: "📚",
    items: [
      { icon: FileDown, label: "PDF de Apresentação", path: "/book" },
      { icon: Briefcase, label: "Portfólio de Imóveis", path: "/book/portfolio" },
      { icon: SettingsIcon, label: "Configurações do Book", path: "/book/config" },
    ],
  },

  // ── Agentes de IA ──
  {
    id: "agentes",
    label: "Agentes de IA",
    emoji: "🧠",
    items: [
      { icon: Bot, label: "Agentes Ativos", path: "/agentes" },
      { icon: PlusCircle, label: "Criar Agente", path: "/agentes/criar" },
      { icon: ScrollText, label: "Logs de Execução", path: "/agentes/logs" },
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
      { icon: UserCog, label: "Lista de Usuários", path: "/usuarios" },
      { icon: Shield, label: "Permissões", path: "/usuarios/permissoes" },
    ],
  },

  // ── Configurações ──
  {
    id: "configuracoes",
    label: "Configurações",
    emoji: "⚙️",
    items: [
      { icon: UserCircle, label: "Perfil & Marca", path: "/configuracoes" },
      { icon: SlidersHorizontal, label: "Prompts Customizados", path: "/configuracoes/prompts" },
      { icon: CreditCard, label: "Plano & Faturamento", path: "/configuracoes/plano" },
      { icon: Zap, label: "Módulos & Assinatura", path: "/configuracoes/modulos" },
    ],
  },

  // ── Integrações ──
  {
    id: "integracoes",
    label: "Integrações",
    emoji: "🔌",
    items: [
      { icon: Plug, label: "APIs Conectadas", path: "/integracoes" },
      { icon: Webhook, label: "Webhooks", path: "/integracoes/webhooks" },
    ],
  },

  // ── Biblioteca de Arquivos ──
  {
    id: "biblioteca",
    label: "Biblioteca",
    emoji: "📁",
    items: [
      { icon: Image, label: "Fotos", path: "/biblioteca" },
      { icon: Film, label: "Vídeos", path: "/biblioteca/videos" },
      { icon: FileArchive, label: "Documentos", path: "/biblioteca/documentos" },
    ],
  },

  // ── Relatórios ──
  {
    id: "relatorios",
    label: "Relatórios",
    emoji: "📈",
    items: [
      { icon: TrendingUp, label: "Performance de Conteúdo", path: "/relatorios" },
      { icon: BarChart3, label: "Analytics de Conteúdo", path: "/relatorios/analytics" },
      { icon: Target, label: "Conversão de Leads", path: "/relatorios/conversao" },
      { icon: PieChart, label: "ROI Geral", path: "/relatorios/roi" },
    ],
  },
  // ── Admin (visível apenas para super_admin) ──
  {
    id: "admin",
    label: "Admin",
    emoji: "🛡️",
    items: [
      { icon: Shield, label: "Painel Admin", path: "/admin/diagnosticos" },
      { icon: BarChart3, label: "Diagnósticos", path: "/admin/diagnosticos" },
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
