/**
 * ShowcasePage — biblioteca pública de amostras visuais do ImobCreator AI.
 * Rota: /showcase
 *
 * Mostra exemplos por categoria para:
 *   1. Validar produto no site público
 *   2. Servir como referência de estilo para usuários
 *   3. Inspirar usuários na escolha de template
 *
 * Como funciona: usa os metadados do CREATIVE_CATALOG para exibir
 * cards com preview_gradient + dados do template. Quando preview_image
 * for preenchido com imagens reais, substitui automaticamente o gradiente.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import {
  CREATIVE_CATALOG,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  STYLE_LABELS,
  getPopularTemplates,
  type CreativeCategory,
  type CatalogTemplate,
} from "@/lib/creative-catalog";

// ─── Ícones de categoria ──────────────────────────────────────────────────────
const CAT_ICONS: Record<CreativeCategory, string> = {
  feed:          "📸",
  story:         "📱",
  reels:         "🎬",
  banner:        "🎯",
  landing:       "🏠",
  luxo:          "✨",
  popular:       "🏘️",
  institucional: "🏢",
};

// ─── Card de amostra visual ───────────────────────────────────────────────────

function SampleCard({ template, onUse }: { template: CatalogTemplate; onUse: () => void }) {
  const ASPECT: Record<string, string> = {
    "1:1":    "aspect-square",
    "4:5":    "aspect-[4/5]",
    "9:16":   "aspect-[9/16] max-h-48",
    "16:9":   "aspect-[16/9]",
    "1.91:1": "aspect-[1.91/1]",
  };
  const aspectClass = ASPECT[template.aspect_ratio] ?? "aspect-square";

  return (
    <div className="group flex flex-col rounded-2xl border border-[var(--ds-border)] overflow-hidden bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)] hover:-translate-y-0.5 transition-all duration-200">
      {/* Preview */}
      <div className={`relative w-full overflow-hidden ${aspectClass}`}>
        {template.preview_image ? (
          <img src={template.preview_image} alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${template.preview_gradient} flex items-end p-3`}>
            <div className="w-full">
              {/* Simulated layout skeleton */}
              <div className="h-1.5 rounded bg-white/20 w-3/4 mb-1.5" />
              <div className="h-1 rounded bg-white/15 w-1/2 mb-3" />
              <div className="h-5 rounded-full bg-white/25 w-1/3 text-[9px] font-bold text-white/70 flex items-center justify-center">
                CTA
              </div>
            </div>
          </div>
        )}
        {/* Preview type badge */}
        <div className="absolute bottom-2 right-2">
          {template.preview_image ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[9px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-2 h-2 text-emerald-400" />
              Exemplo real
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 text-white/70 text-[9px] font-medium backdrop-blur-sm">
              Modelo base
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--ds-fg)] leading-tight">{template.name}</p>
            <p className="text-[11px] text-[var(--ds-fg-muted)] mt-0.5 leading-snug line-clamp-2">
              {template.recommended_for.join(" · ")}
            </p>
          </div>
          {(template.is_popular || template.is_new) && (
            <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              template.is_new ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}>
              {template.is_new ? "Novo" : "🔥"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[var(--ds-border)]">
            {STYLE_LABELS[template.visual_style]}
          </Badge>
          <span className="text-[10px] font-mono text-[var(--ds-fg-subtle)]">{template.aspect_ratio}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onUse}
          className="w-full h-7 text-xs mt-1 border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)] hover:text-[var(--ds-cyan)]"
        >
          Usar este template
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const ShowcasePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CreativeCategory | "popular">("popular");

  const displayed = activeCategory === "popular"
    ? getPopularTemplates()
    : CREATIVE_CATALOG.filter((t) => t.category === activeCategory && t.status !== "coming_soon");

  const handleUseTemplate = (t: CatalogTemplate) => {
    navigate("/studio", {
      state: { preselect_category: t.category, preselect_template: t.id },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">

        {/* Hero */}
        <div className="rounded-2xl border border-[var(--ds-border)] bg-gradient-to-br from-[var(--ds-surface)] to-[var(--ds-bg)] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[var(--ds-cyan)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--ds-cyan)]">
                Biblioteca Visual
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--ds-fg)]">
              Amostras de Criativos Imobiliários
            </h1>
            <p className="text-sm text-[var(--ds-fg-muted)] mt-1 max-w-lg">
              Explore exemplos reais gerados pela IA. Escolha o estilo e use como referência
              ou ponto de partida para sua criação.
            </p>
          </div>
          <Button
            onClick={() => navigate("/studio")}
            className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90 shrink-0"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Criar agora
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("popular")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === "popular"
                ? "bg-[var(--ds-cyan)] text-black"
                : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
            }`}
          >
            🔥 Mais usados
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = CREATIVE_CATALOG.filter((t) => t.category === cat && t.status !== "coming_soon").length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-[var(--ds-cyan)] text-black"
                    : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
                }`}
              >
                {CAT_ICONS[cat]} {CATEGORY_LABELS[cat]}
                <span className={`text-[10px] px-1.5 py-0 rounded-full ${
                  activeCategory === cat ? "bg-black/20" : "bg-[var(--ds-bg-subtle)]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category description */}
        {activeCategory !== "popular" && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
            <span className="text-2xl">{CAT_ICONS[activeCategory]}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--ds-fg)]">{CATEGORY_LABELS[activeCategory]}</p>
              <p className="text-xs text-[var(--ds-fg-muted)]">{CATEGORY_DESCRIPTIONS[activeCategory]}</p>
            </div>
          </div>
        )}

        {/* Samples grid */}
        {displayed.length === 0 ? (
          <div className="py-16 text-center text-[var(--ds-fg-subtle)]">
            <p>Nenhuma amostra disponível para esta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((t) => (
              <SampleCard
                key={t.id}
                template={t}
                onUse={() => handleUseTemplate(t)}
              />
            ))}
          </div>
        )}

        {/* CTA footer */}
        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[var(--ds-fg)]">Pronto para criar o seu?</p>
            <p className="text-sm text-[var(--ds-fg-muted)] mt-0.5">
              Escolha um template e a IA gera o criativo personalizado para o seu imóvel.
            </p>
          </div>
          <Button onClick={() => navigate("/studio")}
            className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90 shrink-0">
            Ir para o Studio
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShowcasePage;
