import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Zap,
  Sparkles,
  Play,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = [
  {
    id: "cinematic",
    emoji: "🎬",
    label: "Cinematic",
    tagline: "Épico · Dramático · Narrativo",
    description:
      "Transições suaves e lentas, iluminação de alto contraste e trilha orquestral. Ideal para imóveis premium e lançamentos de alto padrão onde cada frame conta uma história.",
    features: ["Zoom lento e progressivo (Ken Burns)", "Crossfade com escurecimento", "Paleta dessaturada com contraste elevado", "Trilha cinematográfica épica"],
    palette: ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],
    bg: "from-slate-900 via-slate-800 to-slate-900",
    accent: "text-slate-300",
    ring: "ring-slate-500",
    badge: "bg-slate-700 text-slate-200",
    popular: false,
  },
  {
    id: "luxury",
    emoji: "✨",
    label: "Luxury",
    tagline: "Elegante · Sofisticado · Exclusivo",
    description:
      "Movimentos sutis e cadenciados, paleta quente dourada e trilha de piano ao vivo. Feito para imóveis de altíssimo padrão, penthouses e propriedades de luxo.",
    features: ["Zoom reverso (zoom out elegante)", "Fade dourado entre cenas", "Paleta âmbar e champagne", "Piano e cordas ao vivo"],
    palette: ["#1c1208", "#3d2b1f", "#8b6914", "#d4a017"],
    bg: "from-amber-950 via-yellow-950 to-amber-950",
    accent: "text-amber-300",
    ring: "ring-amber-500",
    badge: "bg-amber-900/60 text-amber-300",
    popular: true,
  },
  {
    id: "moderno",
    emoji: "⚡",
    label: "Moderno",
    tagline: "Dinâmico · Urbano · Direto",
    description:
      "Cortes rápidos e enérgicos, tipografia bold e trilha eletrônica. Perfeito para studios, apartamentos compactos e publicações de alta conversão em Reels e TikTok.",
    features: ["Cortes rápidos com snap", "Saturação elevada e vibrante", "Paleta alta em contraste", "Trilha eletrônica/pop"],
    palette: ["#0a0a0a", "#1a1a1a", "#00d4ff", "#ff006e"],
    bg: "from-zinc-900 via-zinc-800 to-zinc-900",
    accent: "text-cyan-400",
    ring: "ring-cyan-500",
    badge: "bg-zinc-700 text-cyan-300",
    popular: false,
  },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

// ── Formats ───────────────────────────────────────────────────────────────────
const FORMATS = [
  {
    id: "reels",
    label: "Reels / TikTok",
    ratio: "9:16",
    size: "1080 × 1920px",
    platforms: ["Instagram Reels", "TikTok", "YouTube Shorts"],
    w: 54,
    h: 96,
    color: "border-rose-500/40 bg-rose-500/5",
  },
  {
    id: "feed",
    label: "Feed Quadrado",
    ratio: "1:1",
    size: "1080 × 1080px",
    platforms: ["Instagram Feed", "Facebook", "LinkedIn"],
    w: 72,
    h: 72,
    color: "border-violet-500/40 bg-violet-500/5",
  },
  {
    id: "youtube",
    label: "YouTube / Landscape",
    ratio: "16:9",
    size: "1920 × 1080px",
    platforms: ["YouTube", "Sites", "Apresentações"],
    w: 96,
    h: 54,
    color: "border-red-500/40 bg-red-500/5",
  },
] as const;

// ── Durations ─────────────────────────────────────────────────────────────────
const DURATIONS = [
  { id: "15", label: "15s", ideal: "Reels rápido · Story vertical", tag: "Mais engajamento" },
  { id: "30", label: "30s", ideal: "Feed padrão · Anúncio curto", tag: "Mais escolhido" },
  { id: "60", label: "60s", ideal: "YouTube · Apresentação completa", tag: "Mais detalhes" },
];

// ── Style preview mockup ──────────────────────────────────────────────────────
const StyleMockup = ({ style, selected }: { style: typeof STYLES[number]; selected: boolean }) => (
  <div
    className={cn(
      "relative rounded-2xl aspect-video overflow-hidden bg-gradient-to-br",
      style.bg,
      "border-2 transition-all duration-300",
      selected ? `${style.ring} ring-2 border-transparent` : "border-border/40"
    )}
  >
    {/* Simulated video frame */}
    <div className="absolute inset-0 flex flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className={cn("h-2.5 w-32 rounded-full opacity-90", style.id === "luxury" ? "bg-amber-300/80" : "bg-white/60")} />
          <div className={cn("h-1.5 w-20 rounded-full opacity-60", style.id === "luxury" ? "bg-amber-200/50" : "bg-white/40")} />
        </div>
        <div className="flex gap-1">
          {style.palette.map((c, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className={cn("h-1.5 w-24 rounded-full opacity-50", "bg-white/30")} />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 text-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
    {/* Style label overlay */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <span className="text-3xl">{style.emoji}</span>
    </div>
    {style.popular && (
      <div className="absolute top-2 right-2">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", style.badge)}>
          Mais usado
        </span>
      </div>
    )}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const VideosStyleCatalogPage = () => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<StyleId>("luxury");
  const [selectedFormat, setSelectedFormat] = useState<"reels" | "feed" | "youtube">("reels");
  const [selectedDuration, setSelectedDuration] = useState("30");

  const active = STYLES.find((s) => s.id === selectedStyle)!;

  const handleCreate = () => {
    navigate("/video-creator", {
      state: { style: selectedStyle, format: selectedFormat, duration: selectedDuration },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wide">Catálogo</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Estilos de Vídeo</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Escolha a identidade estética do seu vídeo. Cada estilo define paleta de cores, ritmo de corte, efeito de câmera e trilha sonora.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            <Film className="w-4 h-4 mr-2" />
            Criar com {active.label}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Style selector */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Estilos visuais
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={cn(
                  "rounded-2xl border text-left p-5 transition-all hover:-translate-y-0.5",
                  selectedStyle === s.id
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border hover:border-accent/30"
                )}
              >
                <StyleMockup style={s} selected={selectedStyle === s.id} />
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{s.emoji}</span>
                    <span className="font-display font-bold text-foreground text-lg">{s.label}</span>
                    {s.popular && (
                      <Badge className="bg-accent/10 text-accent text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{s.tagline}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{s.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedStyle === s.id && (
                  <div className="mt-4 pt-3 border-t border-accent/20">
                    <span className="text-xs text-accent font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Estilo selecionado
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Format selector */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Formato de saída
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFormat(f.id as "reels" | "feed" | "youtube")}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5",
                  selectedFormat === f.id
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border hover:border-accent/30"
                )}
              >
                <div className={cn("inline-flex items-center justify-center rounded-xl border-2 mb-4", f.color)}
                  style={{ width: `${f.w * 0.6}px`, height: `${f.h * 0.6}px` }}
                >
                  <span className="text-xs font-mono text-muted-foreground">{f.ratio}</span>
                </div>
                <p className="font-semibold text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">{f.size}</p>
                <div className="flex flex-wrap gap-1">
                  {f.platforms.map((p) => (
                    <span key={p} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
                {selectedFormat === f.id && (
                  <div className="mt-3 pt-2.5 border-t border-accent/20">
                    <span className="text-xs text-accent font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Selecionado
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Duration */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Duração do vídeo
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDuration(d.id)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5",
                  selectedDuration === d.id
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border hover:border-accent/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-3xl font-bold text-foreground">{d.label}</span>
                  <Badge variant="outline" className="text-[10px]">{d.tag}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{d.ideal}</p>
                {selectedDuration === d.id && (
                  <div className="mt-3 pt-2.5 border-t border-accent/20">
                    <span className="text-xs text-accent font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Selecionado
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* CTA summary */}
        <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-accent text-accent-foreground">{active.emoji} {active.label}</Badge>
              <Badge variant="outline">{selectedFormat === "reels" ? "Reels 9:16" : selectedFormat === "feed" ? "Feed 1:1" : "YouTube 16:9"}</Badge>
              <Badge variant="outline">{selectedDuration}s</Badge>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Configuração selecionada</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Clique em "Criar vídeo" para ir direto ao wizard com estas preferências pré-selecionadas.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button variant="outline" onClick={() => navigate("/video-dashboard")}>
              Dashboard
            </Button>
            <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              <Film className="w-4 h-4 mr-2" />
              Criar vídeo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

// Missing import fix
const Palette = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export default VideosStyleCatalogPage;
