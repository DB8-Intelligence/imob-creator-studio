/**
 * AIEnginePicker — seletor de motor de IA por caso de uso.
 *
 * O usuário vê "O que quer fazer?" em linguagem simples.
 * Internamente mapeamos para o engine correto.
 *
 * DEV-15: Adicionado filtro por templateCategory, badges de output type e tempo estimado.
 */
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  USE_CASES,
  USE_CASE_CATEGORIES,
  USE_CASE_ROUTES,
  AI_ENGINES,
  getUseCasesByCategory,
  type UseCaseId,
  type UseCaseDefinition,
} from "@/lib/ai-engines";
import { Badge } from "@/components/ui/badge";
import {
  getMatrixEntry,
  getUseCasesForTemplate,
  OUTPUT_TYPE_LABELS,
  OUTPUT_TYPE_ICONS,
} from "@/lib/generation-matrix";

interface AIEnginePickerProps {
  /** Modo inline: ao selecionar, chama onSelect em vez de navegar */
  inline?:    boolean;
  onSelect?:  (uc: UseCaseDefinition) => void;
  selected?:  UseCaseId;
  /** Oculta categorias específicas */
  hideCategories?: Array<keyof typeof USE_CASE_CATEGORIES>;
  /** Filtra use cases compatíveis com a categoria do template selecionado */
  templateCategory?: string;
}

export function AIEnginePicker({
  inline,
  onSelect,
  selected,
  hideCategories = [],
  templateCategory,
}: AIEnginePickerProps) {
  const navigate = useNavigate();

  // Se templateCategory é fornecido, filtrar use cases compatíveis
  const compatibleUseCaseIds = templateCategory
    ? new Set(getUseCasesForTemplate(templateCategory).map((e) => e.use_case_id))
    : null;

  const handleSelect = (uc: UseCaseDefinition) => {
    if (inline && onSelect) {
      onSelect(uc);
      return;
    }
    const route = USE_CASE_ROUTES[uc.id];
    if (route) navigate(route);
  };

  const categories = (Object.keys(USE_CASE_CATEGORIES) as Array<keyof typeof USE_CASE_CATEGORIES>)
    .filter((cat) => !hideCategories.includes(cat));

  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat) => {
        let useCases = getUseCasesByCategory(cat);

        // Filtrar por compatibilidade com o template
        if (compatibleUseCaseIds) {
          useCases = useCases.filter((uc) => compatibleUseCaseIds.has(uc.id));
        }

        if (!useCases.length) return null;

        return (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ds-fg-subtle)] mb-3">
              {USE_CASE_CATEGORIES[cat]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {useCases.map((uc) => {
                const engine = AI_ENGINES[uc.default_engine];
                const matrixEntry = getMatrixEntry(uc.id);
                const isSelected = selected === uc.id;

                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => handleSelect(uc)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all duration-200",
                      isSelected
                        ? "border-[var(--ds-cyan)] bg-[rgba(0,242,255,0.06)] shadow-[0_0_0_1px_var(--ds-cyan)]"
                        : "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-2)] hover:bg-[rgba(255,255,255,0.03)]"
                    )}
                  >
                    <span className="text-2xl leading-none">{uc.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[var(--ds-fg)] leading-tight">
                        {uc.label}
                      </span>
                      <span className="text-[11px] text-[var(--ds-fg-muted)] leading-snug">
                        {uc.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-auto pt-1 flex-wrap">
                      {matrixEntry && (
                        <span className="text-[10px] text-[var(--ds-fg-subtle)]">
                          {OUTPUT_TYPE_ICONS[matrixEntry.output_type]} {OUTPUT_TYPE_LABELS[matrixEntry.output_type]}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--ds-fg-subtle)]">
                        {matrixEntry ? `~${matrixEntry.avg_time_seconds}s` : ""}
                      </span>
                      {engine.badge && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-[var(--ds-border)]">
                          {engine.badge}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
