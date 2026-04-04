/**
 * GenerationStepper — controlador visual de fluxo de geração em 5 etapas.
 *
 * Etapas:
 *   1. Categoria      — tipo de peça (feed, story, banner...)
 *   2. Template       — escolha do template visual
 *   3. Motor de IA    — qual engine usar
 *   4. Dados          — preencher campos editáveis (título, imagem, etc.)
 *   5. Resultado      — preview do criativo gerado
 *
 * Usado pela StudioPage como orquestrador central.
 */
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepId = 1 | 2 | 3 | 4;

interface Step {
  id:    StepId;
  label: string;
  short: string;
}

const STEPS: Step[] = [
  { id: 1, label: "Categoria",   short: "Categoria" },
  { id: 2, label: "Template",    short: "Template"  },
  { id: 3, label: "O que criar", short: "Criar"     },
  { id: 4, label: "Resultado",   short: "Resultado" },
];

interface GenerationStepperProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;   // permite navegar para etapas anteriores
  completedSteps?: StepId[];
}

export function GenerationStepper({ currentStep, onStepClick, completedSteps = [] }: GenerationStepperProps) {
  return (
    <nav aria-label="Etapas de geração" className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isDone    = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isClickable = isDone && onStepClick;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step bubble */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                isCurrent
                  ? "bg-[var(--ds-cyan)] text-black"
                  : isDone
                    ? "bg-emerald-500/20 text-emerald-400 cursor-pointer hover:bg-emerald-500/30"
                    : "bg-[var(--ds-surface)] text-[var(--ds-fg-subtle)] border border-[var(--ds-border)]"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                isCurrent  ? "bg-black/20 text-black"
                : isDone   ? "bg-emerald-500 text-white"
                           : "bg-[var(--ds-bg-subtle)] text-[var(--ds-fg-muted)]"
              )}>
                {isDone ? <Check className="w-3 h-3" /> : step.id}
              </span>
              <span className="hidden sm:inline">{step.short}</span>
            </button>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "w-6 h-px mx-1 transition-colors",
                completedSteps.includes(step.id) ? "bg-emerald-500/40" : "bg-[var(--ds-border)]"
              )} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Step container com título ────────────────────────────────────────────────

interface StepContainerProps {
  step:        StepId;
  title:       string;
  description?: string;
  children:    React.ReactNode;
}

export function StepContainer({ step, title, description, children }: StepContainerProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-[var(--ds-cyan)] text-black flex items-center justify-center text-sm font-bold shrink-0">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--ds-fg)]">{title}</h2>
          {description && (
            <p className="text-xs text-[var(--ds-fg-muted)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
