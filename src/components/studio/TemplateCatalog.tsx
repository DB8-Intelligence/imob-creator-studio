/**
 * TemplateCatalog — grade filtrável de templates do catálogo.
 * Suporta filtro por categoria, estilo visual e busca textual.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import {
  CREATIVE_CATALOG,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  STYLE_LABELS,
  type CatalogTemplate,
  type CreativeCategory,
  type VisualStyle,
} from "@/lib/creative-catalog";

interface TemplateCatalogProps {
  selectedId?:      string;
  onSelect:         (t: CatalogTemplate) => void;
  lockedEngines?:   string[];
  compact?:         boolean;
  initialCategory?: CreativeCategory | "all";
}

const ALL_STYLES: VisualStyle[] = ["luxury", "modern", "minimal", "corporate", "popular", "editorial", "dark"];

export function TemplateCatalog({ selectedId, onSelect, lockedEngines = [], compact, initialCategory }: TemplateCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<CreativeCategory | "all">(initialCategory ?? "all");
  const [activeStyle,    setActiveStyle]    = useState<VisualStyle | "all">("all");
  const [query,          setQuery]          = useState("");

  const filtered = useMemo(() => {
    return CREATIVE_CATALOG.filter((t) => {
      if (t.status === "coming_soon") return false;
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (activeStyle    !== "all" && t.visual_style !== activeStyle) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q)) ||
          t.recommended_for.some((r) => r.includes(q))
        );
      }
      return true;
    });
  }, [activeCategory, activeStyle, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-fg-muted)]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar template... (luxo, story, banner, corretor...)"
          className="pl-9 bg-[var(--ds-surface)] border-[var(--ds-border)] text-[var(--ds-fg)] placeholder:text-[var(--ds-fg-subtle)]"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-[var(--ds-cyan)] text-black"
              : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
          }`}
        >
          Todos ({CREATIVE_CATALOG.filter((t) => t.status !== "coming_soon").length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = CREATIVE_CATALOG.filter((t) => t.category === cat && t.status !== "coming_soon").length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--ds-cyan)] text-black"
                  : "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-border-2)]"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Style filter (hidden in compact mode) */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveStyle("all")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              activeStyle === "all"
                ? "bg-[var(--ds-bg-subtle)] text-[var(--ds-fg)] border border-[var(--ds-border-2)]"
                : "text-[var(--ds-fg-subtle)] hover:text-[var(--ds-fg-muted)]"
            }`}
          >
            Todos os estilos
          </button>
          {ALL_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => setActiveStyle(style)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                activeStyle === style
                  ? "bg-[var(--ds-bg-subtle)] text-[var(--ds-fg)] border border-[var(--ds-border-2)]"
                  : "text-[var(--ds-fg-subtle)] hover:text-[var(--ds-fg-muted)]"
              }`}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {query && (
        <p className="text-xs text-[var(--ds-fg-muted)]">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[var(--ds-fg-subtle)]">
          <p className="text-sm">Nenhum template encontrado para "{query}"</p>
          <button
            onClick={() => { setQuery(""); setActiveCategory("all"); setActiveStyle("all"); }}
            className="mt-2 text-xs text-[var(--ds-cyan)] hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              locked={lockedEngines.includes(t.primary_engine)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
