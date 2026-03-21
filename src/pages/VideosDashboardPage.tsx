import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useVideoModuleOverview } from "@/hooks/useVideoModule";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import {
  Film,
  Plus,
  Download,
  Clock,
  TrendingUp,
  Zap,
  Play,
  Lock,
  Crown,
  Star,
  ChevronRight,
  Palette,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_VIDEOS = [
  {
    id: "1",
    title: "Apartamento Vila Mariana",
    format: "reels",
    style: "cinematic",
    duration_seconds: 30,
    created_at: "2026-03-20T14:30:00Z",
    thumbnail_color: "from-slate-800 to-slate-900",
    status: "completed",
  },
  {
    id: "2",
    title: "Casa Alphaville 420m²",
    format: "youtube",
    style: "luxury",
    duration_seconds: 60,
    created_at: "2026-03-19T10:15:00Z",
    thumbnail_color: "from-amber-900 to-amber-950",
    status: "completed",
  },
  {
    id: "3",
    title: "Studio Moema — Lançamento",
    format: "feed",
    style: "moderno",
    duration_seconds: 15,
    created_at: "2026-03-18T09:00:00Z",
    thumbnail_color: "from-zinc-800 to-zinc-900",
    status: "completed",
  },
];

const FORMAT_LABEL: Record<string, string> = {
  reels: "Reels 9:16",
  feed: "Feed 1:1",
  youtube: "YouTube 16:9",
};
const FORMAT_COLOR: Record<string, string> = {
  reels: "bg-rose-500/15 text-rose-400",
  feed: "bg-violet-500/15 text-violet-400",
  youtube: "bg-red-500/15 text-red-400",
};
const STYLE_COLOR: Record<string, string> = {
  cinematic: "bg-slate-500/15 text-slate-400",
  luxury: "bg-amber-500/15 text-amber-400",
  moderno: "bg-cyan-500/15 text-cyan-400",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Hoje";
  if (d === 1) return "Ontem";
  return `${d} dias atrás`;
}

// ── Plan Gate ─────────────────────────────────────────────────────────────────
const PlanGate = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-accent" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Módulo de Vídeo disponível no Pro e VIP
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Gere vídeos cinematográficos em 4K para Reels, Feed e YouTube com IA. A partir do plano Pro.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Pro</span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ 20 vídeos/mês</li>
            <li>✓ 4K Ultra HD</li>
            <li>✓ 3 estilos visuais</li>
            <li>✓ Reels, Feed e YouTube</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">VIP</span>
            <Badge className="bg-amber-500/10 text-amber-600 text-xs">Ilimitado</Badge>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ Vídeos ilimitados</li>
            <li>✓ 4K garantido</li>
            <li>✓ Todos os formatos</li>
            <li>✓ Suporte dedicado</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/plano")}>
          Ver planos e fazer upgrade
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/video-plans")}>
          <CreditCard className="w-4 h-4 mr-2" />
          Ver preços do módulo vídeo
        </Button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const VideosDashboardPage = () => {
  const { data: plan } = useUserPlan();
  const { workspaceId } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "reels" | "feed" | "youtube">("all");

  const hasVideoAccess = plan?.user_plan === "pro" || plan?.user_plan === "vip";

  if (plan && !hasVideoAccess) {
    return (
      <AppLayout>
        <PlanGate />
      </AppLayout>
    );
  }

  const videos = useMemo(() => {
    const dbVideos = overview?.jobs ?? [];
    if (dbVideos.length > 0) {
      return dbVideos.map((video) => ({
        ...video,
        thumbnail_color:
          video.style === "luxury"
            ? "from-amber-900 to-amber-950"
            : video.style === "moderno"
            ? "from-zinc-800 to-zinc-900"
            : "from-slate-800 to-slate-900",
      }));
    }
    return FALLBACK_VIDEOS;
  }, [overview?.jobs]);

  const videoLimit = overview?.addOn?.credits_total ?? (plan?.user_plan === "vip" ? null : 20);
  const videosUsed = overview?.addOn?.credits_used ?? videos.length;
  const pct = videoLimit ? Math.min((videosUsed / videoLimit) * 100, 100) : 0;

  const filtered = videos.filter((v) => activeTab === "all" || v.format === activeTab);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Vídeos IA</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus vídeos gerados e monitore o consumo do módulo.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/video-styles")}>
              <Palette className="w-4 h-4 mr-2" />
              Ver estilos
            </Button>
            <Button
              size="sm"
              disabled={videoLimit !== null && videosUsed >= videoLimit}
              className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              onClick={() => navigate("/video-creator")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar vídeo
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quota */}
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Film className="w-4 h-4 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">Vídeos este mês</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {videosUsed}
                {videoLimit && (
                  <span className="text-lg text-muted-foreground font-normal">/{videoLimit}</span>
                )}
                {!videoLimit && (
                  <span className="text-lg text-amber-500 font-normal ml-1">∞</span>
                )}
              </p>
              {videoLimit && (
                <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-amber-500" : "bg-accent")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {videoLimit ? `${Math.max(videoLimit - videosUsed, 0)} restantes` : "VIP — ilimitado"}
              </p>
            </CardContent>
          </Card>

          {[
            { icon: Clock, label: "Minutos renderizados", value: "2h 45min", sub: "este mês" },
            { icon: TrendingUp, label: "Formatos usados", value: "3 de 3", sub: "Reels · Feed · YouTube" },
            { icon: Zap, label: "Qualidade máxima", value: "4K Ultra HD", sub: "disponível no plano atual" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Film,
              title: "Criar novo vídeo",
              desc: "Sobe fotos, escolhe estilo e gera em < 3 min",
              href: "/video-creator",
              accent: true,
            },
            {
              icon: Palette,
              title: "Catálogo de estilos",
              desc: "Cinematic, Moderno e Luxury com preview visual",
              href: "/video-styles",
              accent: false,
            },
            {
              icon: CreditCard,
              title: "Planos de vídeo",
              desc: "Ver add-ons, upgrade e volume enterprise",
              href: "/video-plans",
              accent: false,
            },
          ].map((a) => (
            <Link key={a.href} to={a.href}>
              <div
                className={cn(
                  "rounded-2xl border p-5 h-full transition-all hover:-translate-y-0.5 hover:shadow-md",
                  a.accent
                    ? "border-accent/40 bg-accent/5 hover:bg-accent/10"
                    : "border-border bg-card hover:bg-muted/50"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", a.accent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                  <a.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent videos */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-foreground">Vídeos recentes</h2>
            <div className="flex gap-1">
              {(["all", "reels", "feed", "youtube"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    activeTab === t
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "all" ? "Todos" : FORMAT_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-medium text-foreground">Nenhum vídeo gerado ainda</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Crie seu primeiro vídeo imobiliário com IA em menos de 3 minutos.
              </p>
              <Button onClick={() => navigate("/video-creator")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro vídeo
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((v) => (
                <Card key={v.id} className="overflow-hidden group hover:-translate-y-0.5 transition-all hover:shadow-md">
                  {/* Thumbnail */}
                  <div className={cn("relative aspect-video bg-gradient-to-br", v.thumbnail_color)}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", FORMAT_COLOR[v.format])}>
                        {FORMAT_LABEL[v.format]}
                      </span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STYLE_COLOR[v.style])}>
                        {v.style}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">{v.duration_seconds}s</span>
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground text-sm line-clamp-1">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(v.created_at)}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create new card */}
              <button
                onClick={() => navigate("/video-creator")}
                className="rounded-2xl border-2 border-dashed border-border hover:border-accent/50 p-8 flex flex-col items-center justify-center gap-3 text-center transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Criar novo vídeo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fotos → Estilo → 4K pronto</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default VideosDashboardPage;
