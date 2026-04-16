import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { PlanGate, userPlanToTier } from "@/components/app/PlanGate";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan, useConsumeCredits, USER_PLAN_KEY } from "@/hooks/useUserPlan";
import { CREDIT_COSTS } from "@/lib/plan-rules";
import { dispatchGeneration, pollJobUntilDone, uploadGenerationInput } from "@/services/generationApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  Sofa,
  Building2,
  Home,
  Loader2,
  Download,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type StagingStyle =
  | "corporativo"
  | "escandinavo"
  | "luxo"
  | "moderno"
  | "minimalista"
  | "industrial"
  | "classico";

type EnvironmentType = "residencial" | "comercial";

interface StyleOption {
  id: StagingStyle;
  label: string;
  description: string;
  emoji: string;
}

const STYLES: StyleOption[] = [
  { id: "moderno", label: "Moderno", description: "Linhas limpas, neutro e minimalista", emoji: "🏢" },
  { id: "escandinavo", label: "Escandinavo", description: "Madeira clara, plantas, aconchegante", emoji: "🌿" },
  { id: "luxo", label: "Luxo", description: "Lustre, veludo, dourado, premium", emoji: "✨" },
  { id: "corporativo", label: "Corporativo", description: "Escritório profissional, sóbrio", emoji: "💼" },
  { id: "minimalista", label: "Minimalista", description: "Essencial, zen, muito clean", emoji: "⬜" },
  { id: "industrial", label: "Industrial", description: "Tijolo, metal, vintage urbano", emoji: "🏭" },
  { id: "classico", label: "Clássico", description: "Tradicional, elegante, atemporal", emoji: "🏛️" },
];

// Mapa visual_style do Studio → StagingStyle local
const VISUAL_TO_STAGING: Record<string, StagingStyle> = {
  luxury:    "luxo",
  modern:    "moderno",
  minimal:   "minimalista",
  corporate: "corporativo",
  editorial: "moderno",
  dark:      "moderno",
  popular:   "moderno",
};

const ImageRestorationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StagingStyle>("moderno");
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>("residencial");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [studioContext, setStudioContext] = useState<{ template_name?: string; template_id?: string } | null>(null);

  const { data: plan } = useUserPlan();
  const consumeCredits = useConsumeCredits();
  const userTier = userPlanToTier(plan?.user_plan);
  const queryClient = useQueryClient();

  // ── Leitura do estado vindo do Studio ──────────────────────────────────────
  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (!state?.from_studio) return;

    // Pré-selecionar estilo de mobiliário com base no visual_style do template
    if (typeof state.visual_style === "string") {
      const mapped = VISUAL_TO_STAGING[state.visual_style];
      if (mapped) setSelectedStyle(mapped);
    }

    // Guardar contexto para o banner e retorno
    if (typeof state.template_name === "string" || typeof state.template_id === "string") {
      setStudioContext({
        template_name: state.template_name as string | undefined,
        template_id:   state.template_id   as string | undefined,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Plan gate: check if commercial staging is needed
  const canCommercial = environmentType === "comercial";
  const featureKey = canCommercial ? "stagingCommercial" : "stagingResidential";

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }

    setOriginalFile(file);
    setStagedImage(null);
    setShowComparison(false);

    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setOriginalFile(file);
    setStagedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage || !originalFile) {
      toast.error("Envie uma foto do ambiente primeiro");
      return;
    }

    const creditCost = CREDIT_COSTS.image_restoration;
    if (plan && plan.credits_remaining < creditCost) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCost} créditos.`);
      return;
    }

    setIsGenerating(true);
    setStagedImage(null);
    setShowComparison(false);

    try {
      // 1. Upload da imagem local → URL pública no bucket
      const imageUrl = await uploadGenerationInput(originalFile, "staging-inputs");

      // 2. Enviar payload padrão para generate-dispatch (async → n8n router)
      const response = await dispatchGeneration({
        generation_type: "image_restoration",
        engine_id:       "image_restoration",
        from_studio:     !!studioContext,
        template_id:     studioContext?.template_id,
        template_name:   studioContext?.template_name,
        image_urls:      [imageUrl],
        style:           selectedStyle,
        editable_fields: { roomType: environmentType === "comercial" ? "office" : "living" },
        callback_mode:   "async",
        credit_cost:     creditCost,
      });

      // 3. Poll até o job terminar
      const job = await pollJobUntilDone(response.job_id, { timeoutMs: 150_000 });

      if (!job || job.status === "error") {
        throw new Error(job?.error_message ?? "Staging falhou. Tente novamente.");
      }

      const resultUrl = (job.result_url as string | null) ?? null;
      if (!resultUrl) throw new Error("Staging não retornou imagem.");

      setStagedImage(resultUrl);
      setShowComparison(true);

      // Atualiza créditos no cache local (já debitados server-side)
      queryClient.invalidateQueries({ queryKey: USER_PLAN_KEY });

      toast.success("Ambiente mobilado com sucesso!");

      // Retornar ao Studio com o resultado se veio de lá
      if (studioContext && resultUrl) {
        navigate("/studio", {
          state: {
            from_studio:   true,
            result_url:    resultUrl,
            template_id:   studioContext.template_id,
            template_name: studioContext.template_name,
            engine_id:     "image_restoration",
            status:        "done",
          },
        });
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(message);
      console.error("Image restoration error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!comparisonRef.current) return;
      const rect = comparisonRef.current.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    []
  );

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setStagedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    if (!stagedImage) return;
    try {
      const res = await fetch(stagedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staging-${selectedStyle}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <AppLayout>
      <PlanGate
        feature={featureKey as keyof import("@/lib/plan-rules").PlanFeatures}
        userTier={userTier}
        featureLabel="Mobiliar Ambientes"
        featureDescription={
          canCommercial
            ? "Mobiliar ambientes comerciais está disponível a partir do plano Standard."
            : "Mobiliar ambientes residenciais está disponível a partir do plano Starter."
        }
        minimumTier={canCommercial ? "standard" : "starter"}
      >
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Studio context banner */}
        {studioContext && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-foreground">
              Template <span className="font-semibold text-emerald-400">{studioContext.template_name}</span> — estilo pré-selecionado via Studio
            </span>
            <button
              type="button"
              title="Fechar"
              onClick={() => setStudioContext(null)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sofa className="w-6 h-6 text-emerald-400" />
            Mobiliar Ambientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transforme ambientes vazios em espaços decorados com IA.
            Múltiplos estilos com uma única foto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload & Controls */}
          <div className="space-y-5">
            {/* Environment type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tipo de ambiente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEnvironmentType("residencial")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    environmentType === "residencial"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Residencial
                </button>
                <button
                  onClick={() => setEnvironmentType("comercial")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    environmentType === "comercial"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Comercial
                </button>
              </div>
            </div>

            {/* Style selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Estilo de decoração
              </label>
              <div className="grid grid-cols-1 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedStyle === s.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          selectedStyle === s.id
                            ? "text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!originalImage || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Mobiliar ambiente ({CREDIT_COSTS.image_restoration} créditos)
                </>
              )}
            </button>
          </div>

          {/* Right: Preview area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload zone */}
            {!originalImage && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all min-h-[400px]"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-foreground font-medium">
                    Arraste uma foto do ambiente aqui
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para selecionar · JPG, PNG, WebP · Máx. 10MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Before/After comparison */}
            {originalImage && showComparison && stagedImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    Comparação ANTES / DEPOIS
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Baixar
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Nova foto
                    </button>
                  </div>
                </div>

                {/* Slider comparison */}
                <div
                  ref={comparisonRef}
                  className="relative rounded-2xl overflow-hidden cursor-col-resize select-none"
                  style={{ aspectRatio: "16/10" }}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) handleSliderMove(e);
                  }}
                  onTouchMove={handleSliderMove}
                >
                  {/* After (full) */}
                  <img
                    src={stagedImage}
                    alt="Depois"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Before (clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={originalImage}
                      alt="Antes"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        width: `${comparisonRef.current?.offsetWidth || 800}px`,
                        maxWidth: "none",
                      }}
                    />
                  </div>
                  {/* Slider line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                  {/* Labels */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-bold">
                    ANTES
                  </span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-bold">
                    DEPOIS
                  </span>
                  {/* Style label */}
                  <span className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/60 text-white text-xs font-medium">
                    {STYLES.find((s) => s.id === selectedStyle)?.label}
                  </span>
                </div>
              </div>
            )}

            {/* Original only (no staged yet) */}
            {originalImage && !showComparison && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    Foto original
                  </h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Trocar foto
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto rounded-2xl"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                      <p className="text-white text-sm font-medium">
                        Mobilizando em estilo {STYLES.find((s) => s.id === selectedStyle)?.label}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </PlanGate>
    </AppLayout>
  );
};

export default ImageRestorationPage;
