/**
 * GenerationStepper — controlador visual de fluxo de geração em 6 etapas.
 *
 * Etapas:
 *   1. Formato     — FormatPicker (formatos + quantidade)
 *   2. Fotos       — ImageUploader (1-3 imagens do imovel)
 *   3. Logo        — LogoManager (logo + identidade visual)
 *   4. Template    — TemplateCatalog (tema imobiliario)
 *   5. Textos      — TextEditor (titulo, preco, localizacao, destaque, CTA)
 *   6. Resultado   — CreativePreview (preview + download + agendar)
 *
 * Usado pela StudioPage como orquestrador central.
 */
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

interface Step {
  id:    StepId;
  label: string;
  short: string;
}

const STEPS: Step[] = [
  { id: 1, label: "Formato",   short: "Formato"   },
  { id: 2, label: "Fotos",     short: "Fotos"     },
  { id: 3, label: "Logo",      short: "Logo"      },
  { id: 4, label: "Template",  short: "Template"  },
  { id: 5, label: "Textos",    short: "Textos"    },
  { id: 6, label: "Resultado", short: "Resultado" },
];

interface GenerationStepperProps {
  currentStep: StepId;
  onStepClick?: (step: StepId) => void;
  completedSteps?: StepId[];
}

export function GenerationStepper({ currentStep, onStepClick, completedSteps = [] }: GenerationStepperProps) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div className="relative h-1 w-full rounded-full bg-[var(--ds-surface)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--ds-cyan)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step pills */}
      <nav aria-label="Etapas de geracao" className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isDone    = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = isDone && onStepClick;

          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
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
                             : "bg-[var(--ds-bg)] text-[var(--ds-fg-muted)]"
                )}>
                  {isDone ? <Check className="w-3 h-3" /> : step.id}
                </span>
                <span className="hidden sm:inline">{step.short}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "w-4 h-px mx-0.5 transition-colors",
                  completedSteps.includes(step.id) ? "bg-emerald-500/40" : "bg-[var(--ds-border)]"
                )} />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Step container com titulo ────────────────────────────────────────────────

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

// ─── Validacao entre steps ────────────────────────────────────────────────────

export interface StepValidation {
  canAdvance: boolean;
  message?:   string;
}

/** Verifica se os dados do step atual permitem avancar */
export function validateStep(step: StepId, data: StudioFormData): StepValidation {
  switch (step) {
    case 1:
      return data.formats.length > 0
        ? { canAdvance: true }
        : { canAdvance: false, message: "Selecione ao menos 1 formato" };
    case 2:
      return data.images.length > 0 && data.images.every((img) => img.publicUrl && !img.uploading)
        ? { canAdvance: true }
        : data.images.some((img) => img.uploading)
          ? { canAdvance: false, message: "Aguarde o upload terminar..." }
          : { canAdvance: false, message: "Adicione ao menos 1 foto do imovel" };
    case 3:
      // Logo is optional
      return { canAdvance: true };
    case 4:
      return data.templateId
        ? { canAdvance: true }
        : { canAdvance: false, message: "Escolha um template" };
    case 5:
      return data.textos.titulo.trim().length > 0
        ? { canAdvance: true }
        : { canAdvance: false, message: "Preencha ao menos o titulo do imovel" };
    case 6:
      return { canAdvance: true };
    default:
      return { canAdvance: true };
  }
}

// ─── Dados centrais do formulario ─────────────────────────────────────────────

import type { FormatId } from "./FormatPicker";
import type { UploadedImage } from "./ImageUploader";
import type { LogoConfig, SavedLogo } from "./LogoManager";

export interface TextosCriativo {
  titulo:    string;  // ex: "Casa 4 suites no Alphaville"
  preco:     string;  // ex: "R$ 1.200.000"
  localizacao: string; // ex: "Alphaville II — Salvador/BA"
  destaque:  string;  // ex: "Vista mar | Piscina privativa"
  cta:       string;  // ex: "Agende sua visita"
}

export interface StudioFormData {
  // Step 1
  formats:       FormatId[];
  // Step 2
  imageCount:    1 | 2 | 3;
  images:        UploadedImage[];
  // Step 3
  logoConfig:    LogoConfig;
  savedLogos:    SavedLogo[];
  // Step 4
  templateId:    string | null;
  // Step 5
  textos:        TextosCriativo;
}

export const INITIAL_FORM_DATA: StudioFormData = {
  formats:    [],
  imageCount: 1,
  images:     [],
  logoConfig: { logoUrl: null, position: "bottomRight", size: 15, opacity: 100 },
  savedLogos: [],
  templateId: null,
  textos: {
    titulo:      "",
    preco:       "",
    localizacao: "",
    destaque:    "",
    cta:         "Agende sua visita",
  },
};
