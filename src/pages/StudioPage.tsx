/**
 * StudioPage — orquestrador principal do fluxo de geração visual.
 * Rota: /studio
 *
 * Fluxo de 3 etapas:
 *   1. Categoria (tipo de peça)
 *   2. Template  (escolha visual)
 *   3. O que criar (motor de IA → navega para o fluxo existente)
 *
 * Aceita state de navegação vindo do Showcase:
 *   { preselect_category, preselect_template }
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { GenerationStepper, StepContainer, type StepId } from "@/components/studio/GenerationStepper";
import { TemplateCatalog } from "@/components/studio/TemplateCatalog";
import { AIEnginePicker } from "@/components/studio/AIEnginePicker";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  CREATIVE_CATALOG,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type CreativeCategory,
  type CatalogTemplate,
  type AIEngineId,
} from "@/lib/creative-catalog";
import {
  USE_CASE_ROUTES,
  AI_ENGINES,
  type UseCaseId,
  type UseCaseDefinition,
} from "@/lib/ai-engines";
import { downloadImage } from "@/lib/downloadUtils";

// ─── Ícones de categoria ──────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<CreativeCategory, string> = {
  feed:          "📸",
  story:         "📱",
  reels:         "🎬",
  banner:        "🎯",
  landing:       "🏠",
  luxo:          "✨",
  popular:       "🏘️",
  institucional: "🏢",
};

const StudioPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [step,           setStep]      = useState<StepId>(1);
  const [completedSteps, setCompleted] = useState<StepId[]>([]);
  const [selectedCategory, setCategory]  = useState<CreativeCategory | null>(null);
  const [selectedTemplate, setTemplate]  = useState<CatalogTemplate | null>(null);
  const [selectedUseCase,  setUseCase]   = useState<UseCaseDefinition | null>(null);

  // ── Resultado vindo de um flow ────────────────────────────────────────────
  const [resultUrl,      setResultUrl]      = useState<string | null>(null);
  const [resultStatus,   setResultStatus]   = useState<"idle" | "done" | "error">("idle");
  const [resultEngineId, setResultEngineId] = useState<AIEngineId | null>(null);

  const markDone = (s: StepId) =>
    setCompleted((prev) => (prev.includes(s) ? prev : [...prev, s]));

  // ── Leitura do state de navegação ────────────────────────────────────────
  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (!state) return;

    // ── Resultado vindo de um flow (/create/ideia, /virtual-staging, etc.) ─
    const resUrl    = state.result_url as string | undefined;
    const resEngine = state.engine_id  as AIEngineId | undefined;
    const resTplId  = state.template_id as string | undefined;

    if (state.from_studio && resUrl) {
      setResultUrl(resUrl);
      setResultStatus(state.status === "error" ? "error" : "done");
      if (resEngine) setResultEngineId(resEngine);

      // Restaurar template/categoria a partir do payload
      if (resTplId) {
        const found = CREATIVE_CATALOG.find((t) => t.id === resTplId);
        if (found) {
          setTemplate(found);
          setCategory(found.category);
        }
      }

      markDone(1);
      markDone(2);
      markDone(3);
      setStep(4);
      return;
    }

    // ── Preselect vindo do Showcase ───────────────────────────────────────
    const cat = state.preselect_category as CreativeCategory | undefined;
    const tid = state.preselect_template as string | undefined;

    if (cat) {
      setCategory(cat);
      markDone(1);

      if (tid) {
        const found = CREATIVE_CATALOG.find((t) => t.id === tid);
        if (found) {
          setTemplate(found);
          markDone(2);
          setStep(3);
          return;
        }
      }
      setStep(2);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navegação entre etapas ────────────────────────────────────────────────

  const handleCategorySelect = (cat: CreativeCategory) => {
    setCategory(cat);
    markDone(1);
    setStep(2);
  };

  const handleTemplateSelect = (t: CatalogTemplate) => {
    setTemplate(t);
    markDone(2);
    setStep(3);
  };

  const handleEngineSelect = (uc: UseCaseDefinition) => {
    setUseCase(uc);
    markDone(3);
    const route = USE_CASE_ROUTES[uc.id] ?? "/create";
    navigate(route, {
      state: {
        from_studio:      true,
        template_id:      selectedTemplate?.id,
        template_name:    selectedTemplate?.name,
        category:         selectedCategory,
        engine_id:        uc.default_engine,
        use_case_id:      uc.id,
        prompt_base:      selectedTemplate?.prompt_base,
        aspect_ratio:     selectedTemplate?.aspect_ratio,
        visual_style:     selectedTemplate?.visual_style,
        editable_fields:  selectedTemplate?.editable_fields,
      },
    });
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as StepId);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ds-fg)]">Studio Visual</h1>
            <p className="text-sm text-[var(--ds-fg-muted)] mt-1">
              Escolha categoria, template e o que quer criar — a IA cuida do resto.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/showcase")}
            className="border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver amostras
          </Button>
        </div>

        {/* Stepper */}
        <GenerationStepper
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={(s) => { if (completedSteps.includes(s)) setStep(s); }}
        />

        {/* Step content */}
        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">

          {/* ETAPA 1 — Categoria */}
          {step === 1 && (
            <StepContainer
              step={1}
              title="Que tipo de peça você quer criar?"
              description="Escolha o formato e destino do criativo"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-bg)] hover:border-[var(--ds-cyan)] hover:bg-[rgba(0,242,255,0.04)] transition-all text-left group"
                  >
                    <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ds-fg)] group-hover:text-[var(--ds-cyan)] transition-colors">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <p className="text-[11px] text-[var(--ds-fg-subtle)] mt-0.5 leading-snug">
                        {CATEGORY_DESCRIPTIONS[cat]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {/* ETAPA 2 — Template */}
          {step === 2 && selectedCategory && (
            <StepContainer
              step={2}
              title={`Templates para ${CATEGORY_LABELS[selectedCategory]}`}
              description="Clique no template que mais combina com seu objetivo"
            >
              <TemplateCatalog
                selectedId={selectedTemplate?.id}
                onSelect={handleTemplateSelect}
                initialCategory={selectedCategory}
                compact
              />
            </StepContainer>
          )}

          {/* ETAPA 3 — O que criar */}
          {step === 3 && selectedTemplate && (
            <StepContainer
              step={3}
              title="O que você quer criar?"
              description="Selecione o tipo de geração. O sistema escolhe o motor mais adequado."
            >
              {/* Template selecionado */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-bg)] mb-4">
                {selectedTemplate.preview_image ? (
                  <img
                    src={selectedTemplate.preview_image}
                    alt={selectedTemplate.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedTemplate.preview_gradient} shrink-0`} />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--ds-fg)]">{selectedTemplate.name}</p>
                  <p className="text-xs text-[var(--ds-fg-muted)]">
                    {selectedTemplate.aspect_ratio} · {selectedTemplate.credit_cost} crédito{selectedTemplate.credit_cost !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="ml-auto text-xs text-[var(--ds-cyan)] hover:underline"
                >
                  Trocar
                </button>
              </div>

              <AIEnginePicker
                inline
                selected={selectedUseCase?.id as UseCaseId | undefined}
                onSelect={handleEngineSelect}
              />
            </StepContainer>
          )}

          {/* ETAPA 4 — Resultado */}
          {step === 4 && (
            <StepContainer
              step={4}
              title="Criativo gerado"
              description="Resultado da geração pela IA"
            >
              {resultStatus === "done" && resultUrl ? (
                <div className="space-y-4">
                  {/* Contexto: template + engine */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-bg)]">
                    {selectedTemplate?.preview_image ? (
                      <img
                        src={selectedTemplate.preview_image}
                        alt={selectedTemplate.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : selectedTemplate ? (
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTemplate.preview_gradient} shrink-0`} />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--ds-fg)] truncate">
                        {selectedTemplate?.name ?? "Template"}
                      </p>
                      <p className="text-xs text-[var(--ds-fg-muted)]">
                        {selectedTemplate?.aspect_ratio}
                        {resultEngineId && ` · ${AI_ENGINES[resultEngineId]?.label ?? resultEngineId}`}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Gerado
                    </span>
                  </div>

                  {/* Imagem gerada */}
                  <div className="rounded-2xl overflow-hidden border border-[var(--ds-border)]">
                    <img
                      src={resultUrl}
                      alt="Criativo gerado"
                      className="w-full object-cover"
                    />
                  </div>

                  {/* Ações */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
                      onClick={() => downloadImage(resultUrl!, `criativo-${selectedTemplate?.id ?? "imobcreator"}.png`)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
                      onClick={() => {
                        setResultUrl(null);
                        setResultStatus("idle");
                        setStep(3);
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Gerar variação
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
                      onClick={() => {
                        setResultUrl(null);
                        setResultStatus("idle");
                        setResultEngineId(null);
                        setTemplate(null);
                        setCategory(null);
                        setUseCase(null);
                        setCompleted([]);
                        setStep(1);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Nova criação
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="border-[var(--ds-border)] text-[var(--ds-fg-subtle)] opacity-50 cursor-not-allowed"
                    >
                      Editor (em breve)
                    </Button>
                  </div>
                </div>
              ) : resultStatus === "error" ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <div className="text-center">
                    <p className="font-medium text-[var(--ds-fg)]">Falha na geração</p>
                    <p className="text-sm text-[var(--ds-fg-muted)] mt-0.5">Algo deu errado. Tente novamente.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[var(--ds-border)]"
                    onClick={() => { setResultStatus("idle"); setStep(3); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-12 h-12 text-[var(--ds-cyan)] animate-spin" />
                  <p className="text-sm text-[var(--ds-fg-muted)]">Aguardando resultado da geração...</p>
                </div>
              )}
            </StepContainer>
          )}

        </div>

        {/* Navigation */}
        {step > 1 && step < 4 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goBack}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            {step === 2 && selectedTemplate && (
              <Button size="sm" onClick={() => { markDone(2); setStep(3); }}
                className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudioPage;
