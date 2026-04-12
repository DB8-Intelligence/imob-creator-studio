/**
 * SiteModelsDashboard.tsx — Dashboard dark-style para seleção de modelos de site.
 * Baseado no design do DashboardAgentes do intermetrix-site.
 * Exibe os 10 temas em cards visuais com preview no modal fullscreen.
 */
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  Eye,
  Globe,
  Palette,
  LayoutTemplate,
  Smartphone,
  Monitor,
  Zap,
  Star,
} from "lucide-react";
import { TEMAS, type TemaCorr } from "@/types/site";
import ThemePreviewModal from "./ThemePreviewModal";

/* ------------------------------------------------------------------ */
/*  Theme metadata enriched for dashboard cards                        */
/* ------------------------------------------------------------------ */

interface ThemeCard {
  id: TemaCorr;
  label: string;
  description: string;
  longDescription: string;
  icon: string;
  gradient: string;
  color: string;
  features: string[];
  isNew: boolean;
  isPremium: boolean;
  category: string;
}

const THEME_CARDS: ThemeCard[] = [
  {
    id: "brisa", label: "Brisa", description: "Azul claro, praia, leve",
    longDescription: "Layout arejado com tons de azul celeste, ideal para imoveis litoraneos e praias.",
    icon: "🏖️", gradient: "linear-gradient(135deg, #0284C7, #38BDF8)", color: "#0284C7",
    features: ["Hero com busca", "Cards de imoveis", "Formulario WhatsApp"],
    isNew: false, isPremium: false, category: "Classico",
  },
  {
    id: "urbano", label: "Urbano", description: "Cinza escuro, moderno",
    longDescription: "Design contemporaneo com tons escuros e laranja, perfeito para imoveis urbanos.",
    icon: "🏙️", gradient: "linear-gradient(135deg, #374151, #F97316)", color: "#374151",
    features: ["Estilo moderno", "Hero impactante", "Grid responsivo"],
    isNew: false, isPremium: false, category: "Classico",
  },
  {
    id: "litoral", label: "Litoral", description: "Navy e dourado, elegante",
    longDescription: "Elegancia em navy e dourado, para corretores que atendem alto padrao litoraneo.",
    icon: "⚓", gradient: "linear-gradient(135deg, #002B5B, #D4AF37)", color: "#002B5B",
    features: ["Paleta sofisticada", "Depoimentos premium", "SEO otimizado"],
    isNew: false, isPremium: false, category: "Classico",
  },
  {
    id: "dark-premium", label: "Dark Premium", description: "Navy e dourado, luxo",
    longDescription: "Tema escuro com acentos dourados para imoveis de luxo e alto padrao.",
    icon: "✨", gradient: "linear-gradient(135deg, #1E3A8A, #D4AF37)", color: "#1E3A8A",
    features: ["Design premium", "Fundo escuro", "Acentos dourados"],
    isNew: false, isPremium: true, category: "Premium",
  },
  {
    id: "hamilton", label: "Hamilton Classic", description: "Profissional, topbar",
    longDescription: "Layout classico com topbar profissional e barra de busca integrada.",
    icon: "🏛️", gradient: "linear-gradient(135deg, #003d4d, #1685b6)", color: "#1685b6",
    features: ["Topbar completo", "Busca integrada", "Layout profissional"],
    isNew: false, isPremium: false, category: "Classico",
  },
  {
    id: "nestland", label: "Nestland", description: "Elegante, minimalista, dourado",
    longDescription: "Minimalismo sofisticado com preto e dourado. Fontes serifadas e espacamento generoso.",
    icon: "🏡", gradient: "linear-gradient(135deg, #0f0f0f, #b99755)", color: "#b99755",
    features: ["Minimalista", "Fontes serifadas", "Hero split-screen"],
    isNew: true, isPremium: true, category: "Premium",
  },
  {
    id: "nexthm", label: "NextHM", description: "Verde natureza, serifado",
    longDescription: "Inspirado na natureza com verde teal e dourado. Perfeito para condominios verdes.",
    icon: "🌿", gradient: "linear-gradient(135deg, #122122, #2c686b)", color: "#2c686b",
    features: ["Tema natureza", "Playfair Display", "Busca centralizada"],
    isNew: true, isPremium: false, category: "Moderno",
  },
  {
    id: "ortiz", label: "Ortiz", description: "Azul classico, slider hero",
    longDescription: "Template classico imobiliario com slider de propriedades no hero e busca completa.",
    icon: "🏠", gradient: "linear-gradient(135deg, #05344a, #25a5de)", color: "#25a5de",
    features: ["Slider hero", "Busca avancada", "Catalogo completo"],
    isNew: true, isPremium: false, category: "Classico",
  },
  {
    id: "quarter", label: "Quarter", description: "Moderno, dark, vermelho",
    longDescription: "Design moderno com topbar dark e acentos em vermelho. Completo e profissional.",
    icon: "🔥", gradient: "linear-gradient(135deg, #071c1f, #FF5A3C)", color: "#FF5A3C",
    features: ["Topbar social", "CTA vermelho", "Multi-secoes"],
    isNew: true, isPremium: true, category: "Premium",
  },
  {
    id: "rethouse", label: "Rethouse", description: "Limpo, azul royal, clean",
    longDescription: "Interface limpa e moderna com azul royal. Otimizado para conversao de leads.",
    icon: "💎", gradient: "linear-gradient(135deg, #1a2b6b, #3454d1)", color: "#3454d1",
    features: ["Ultra clean", "Azul royal", "Foco em leads"],
    isNew: true, isPremium: false, category: "Moderno",
  },
];

/* ------------------------------------------------------------------ */
/*  Activity items                                                     */
/* ------------------------------------------------------------------ */

interface ActivityItem {
  id: string;
  icon: string;
  action: string;
  timestamp: Date;
}

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "1", icon: "🏖️", action: "Tema Brisa aplicado ao site de Maria Silva", timestamp: new Date(Date.now() - 15 * 60 * 1000) },
  { id: "2", icon: "🔥", action: "Novo tema Quarter disponibilizado", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "3", icon: "🏡", action: "Tema Nestland adicionado a plataforma", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: "4", icon: "💎", action: "Tema Rethouse recebeu atualizacao de design", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SiteModelsDashboardProps {
  onSelectTheme?: (themeId: TemaCorr) => void;
  selectedTheme?: TemaCorr;
}

export default function SiteModelsDashboard({ onSelectTheme, selectedTheme }: SiteModelsDashboardProps) {
  const [previewTheme, setPreviewTheme] = useState<ThemeCard | null>(null);
  const [activity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);

  const totalModels = THEME_CARDS.length;
  const premiumModels = THEME_CARDS.filter((t) => t.isPremium).length;
  const newModels = THEME_CARDS.filter((t) => t.isNew).length;
  const classicModels = THEME_CARDS.filter((t) => t.category === "Classico").length;

  const formatRelativeTime = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min atras`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atras`;
    return `${Math.floor(diff / 86400)}d atras`;
  };

  // Auto-refresh relative times
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="min-h-screen text-white"
        style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1424 50%, #0a1628 100%)" }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
          />
          <div
            className="absolute -right-40 top-1/3 h-96 w-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", opacity: 0.08 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
              >
                <LayoutTemplate className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Modelos de Site Imobiliario
                </h1>
                <p className="text-sm text-white/50">
                  Escolha o tema perfeito para o site da sua imobiliaria
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* ── Main content: theme grid ─────────────────────── */}
            <div className="space-y-6 lg:col-span-3">
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total de Modelos", value: totalModels.toString(), icon: <LayoutTemplate className="h-4 w-4" />, color: "#3b82f6" },
                  { label: "Novos", value: newModels.toString(), icon: <Sparkles className="h-4 w-4" />, color: "#10b981" },
                  { label: "Premium", value: premiumModels.toString(), icon: <Star className="h-4 w-4" />, color: "#f59e0b" },
                  { label: "Classicos", value: classicModels.toString(), icon: <Globe className="h-4 w-4" />, color: "#8b5cf6" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/5 p-4"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", backdropFilter: "blur(10px)" }}
                  >
                    <div className="mb-2 flex items-center gap-2" style={{ color: stat.color }}>
                      {stat.icon}
                      <span className="text-xs text-white/50">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Features bar */}
              <div
                className="rounded-xl border border-white/5 p-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", backdropFilter: "blur(10px)" }}
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-white/60">Recursos Inclusos em Todos os Modelos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <Smartphone className="h-3 w-3" />, label: "Responsivo" },
                    { icon: <Globe className="h-3 w-3" />, label: "SEO Automatico" },
                    { icon: <Zap className="h-3 w-3" />, label: "WhatsApp Integrado" },
                    { icon: <Palette className="h-3 w-3" />, label: "Cores Personalizaveis" },
                    { icon: <Monitor className="h-3 w-3" />, label: "Preview em Tempo Real" },
                    { icon: <TrendingUp className="h-3 w-3" />, label: "Analytics" },
                  ].map((f) => (
                    <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                      {f.icon} {f.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Theme cards grid */}
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Modelos Disponiveis
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {THEME_CARDS.map((theme) => {
                    const isSelected = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setPreviewTheme(theme)}
                        className={`group text-left rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl ${
                          isSelected
                            ? "border-white/30 shadow-lg"
                            : "border-white/5 hover:border-white/20"
                        }`}
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)", backdropFilter: "blur(10px)" }}
                      >
                        {/* Icon + badges */}
                        <div className="mb-4 flex items-start justify-between">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-lg"
                            style={{ background: theme.gradient }}
                          >
                            {theme.icon}
                          </div>
                          <div className="flex gap-1.5">
                            {theme.isNew && (
                              <Badge className="border-emerald-500/30 bg-emerald-500/20 text-[10px] text-emerald-300">
                                Novo
                              </Badge>
                            )}
                            {theme.isPremium && (
                              <Badge className="border-amber-500/30 bg-amber-500/20 text-[10px] text-amber-300">
                                Premium
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge className="border-blue-500/30 bg-blue-500/20 text-[10px] text-blue-300">
                                Ativo
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Name + description */}
                        <h3 className="mb-0.5 font-semibold text-white transition-colors group-hover:text-white">
                          {theme.label}
                        </h3>
                        <p className="mb-2 text-xs font-medium" style={{ color: theme.color }}>
                          {theme.category}
                        </p>
                        <p className="line-clamp-2 text-xs leading-relaxed text-white/50">
                          {theme.longDescription}
                        </p>

                        {/* Features */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {theme.features.map((f) => (
                            <span key={f} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* Preview button */}
                        <div className="mt-3 flex items-center justify-end">
                          <span className="mr-1 text-xs text-white/30 transition-colors group-hover:text-white/60">
                            Visualizar
                          </span>
                          <Eye className="h-3 w-3 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-white/60" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Activity feed */}
              <div
                className="overflow-hidden rounded-2xl border border-white/5"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", backdropFilter: "blur(10px)" }}
              >
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                  <Activity className="h-4 w-4 text-white/40" />
                  <h3 className="text-sm font-semibold text-white/70">Novidades</h3>
                </div>
                <ScrollArea className="h-[320px]">
                  <div className="space-y-3 p-4">
                    {activity.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3"
                      >
                        <span className="mt-0.5 flex-shrink-0 text-lg">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs leading-relaxed text-white/50">
                            {item.action}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-white/25">
                            <Clock className="h-2.5 w-2.5" />
                            {formatRelativeTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Tip card */}
              <div
                className="rounded-2xl border border-blue-500/20 p-4"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))" }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-300">Dica</span>
                </div>
                <p className="text-xs leading-relaxed text-white/50">
                  Clique em qualquer modelo para ver uma <strong className="text-white/70">preview completa</strong> do
                  site renderizado. Voce pode navegar entre as secoes usando as setas ou o filmstrip de miniaturas.
                </p>
              </div>

              {/* Plan info */}
              <div
                className="rounded-2xl border border-white/5 p-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/70">Seu Plano</span>
                  <Badge className="border-blue-500/30 bg-blue-500/20 text-xs text-blue-300">
                    Pro
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-white/50">
                  <div className="flex justify-between">
                    <span>Modelos disponiveis</span>
                    <span className="font-medium text-white/70">{totalModels} temas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sites ativos</span>
                    <span className="font-medium text-white/70">Ilimitado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dominio customizado</span>
                    <span className="font-medium text-white/70">Incluido</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SSL / HTTPS</span>
                    <span className="font-medium text-white/70">Automatico</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-white/10 py-2 text-xs text-white/50 transition-all hover:border-white/30 hover:text-white"
                >
                  Fazer upgrade para Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal
          open={!!previewTheme}
          onClose={() => setPreviewTheme(null)}
          themeId={previewTheme.id}
          themeName={previewTheme.label}
          onSelectTheme={onSelectTheme}
        />
      )}
    </>
  );
}
