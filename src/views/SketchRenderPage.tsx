import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { PlanGate, userPlanToTier } from "@/components/app/PlanGate";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import { CREDIT_COSTS } from "@/lib/plan-rules";
import { toast } from "sonner";
import {
  Upload,
  PenTool,
  Loader2,
  Download,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type RenderStyle = "fotorealista" | "arquitetonico" | "conceitual" | "noturno" | "aereo";

interface StyleOption {
  id: RenderStyle;
  label: string;
  description: string;
  emoji: string;
}

const STYLES: StyleOption[] = [
  { id: "fotorealista", label: "Fotorrealista", description: "Render hiper-realista com texturas e iluminação real", emoji: "📸" },
  { id: "arquitetonico", label: "Arquitetônico", description: "Visualização técnica com materiais e acabamentos definidos", emoji: "📐" },
  { id: "conceitual", label: "Conceitual", description: "Visualização artística do conceito do projeto", emoji: "🎨" },
  { id: "noturno", label: "Noturno", description: "Render com iluminação noturna, luzes de destaque", emoji: "🌙" },
  { id: "aereo", label: "Vista Aérea", description: "Perspectiva aérea do empreendimento", emoji: "🛩️" },
];

const STYLE_PROMPTS: Record<RenderStyle, string> = {
  fotorealista:
    "Transform this architectural sketch/blueprint into a photorealistic 3D render. Add realistic materials (concrete, glass, wood, stone), natural lighting with sun and shadows, landscaping with trees and grass, realistic sky. The result should look like a professional real estate photograph of the completed building.",
  arquitetonico:
    "Transform this architectural sketch into a professional architectural visualization. Show defined materials and finishes, clean geometry, proper proportions. Include surrounding context like sidewalks and landscaping. Professional architectural presentation quality.",
  conceitual:
    "Transform this sketch into an artistic concept render. Use warm tones, soft lighting, watercolor-like atmosphere. Show the essence and feel of the space rather than exact details. Artistic, inspiring, conceptual presentation.",
  noturno:
    "Transform this architectural sketch into a night-time photorealistic render. Show the building illuminated with interior warm lights glowing through windows, exterior accent lighting, landscape lighting, dramatic dark sky with stars or city lights. Luxurious nighttime atmosphere.",
  aereo:
    "Transform this sketch/blueprint into an aerial perspective 3D render. Bird's eye view showing the full property, surrounding area, roads, landscaping, parking. Photorealistic aerial visualization as if photographed by a drone.",
};

const SketchRenderPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RenderStyle>("fotorealista");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const { data: plan } = useUserPlan();
  const consumeCredits = useConsumeCredits();
  const userTier = userPlanToTier(plan?.user_plan);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }
    setRenderedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setRenderedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) return;
    const creditCost = CREDIT_COSTS.sketch_render;
    if (plan && plan.credits_remaining < creditCost) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCost} créditos.`);
      return;
    }

    setIsGenerating(true);
    setRenderedImage(null);
    setShowComparison(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("virtual-staging", {
        body: {
          imageBase64: originalImage,
          style: "moderno",
          environmentType: "residencial",
          customPrompt: STYLE_PROMPTS[selectedStyle],
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar render");

      setRenderedImage(data.stagedImageUrl);
      setShowComparison(true);
      consumeCredits.mutate(creditCost);
      toast.success("Render gerado com sucesso!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!comparisonRef.current) return;
      const rect = comparisonRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    []
  );

  const handleReset = () => {
    setOriginalImage(null);
    setRenderedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    if (!renderedImage) return;
    try {
      const res = await fetch(renderedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `render-${selectedStyle}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <AppLayout>
      <PlanGate
        feature="sketchRender"
        userTier={userTier}
        featureLabel="Render de Esboços"
        featureDescription="Transforme esboços e plantas em renders fotorrealistas. Disponível a partir do plano Standard."
        minimumTier="standard"
      >
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PenTool className="w-6 h-6 text-violet-400" />
            Render de Esboços
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transforme esboços, plantas e rascunhos arquitetônicos em renders fotorrealistas com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Estilo do render</label>
              <div className="grid grid-cols-1 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedStyle === s.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${selectedStyle === s.id ? "text-violet-400" : "text-foreground"}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!originalImage || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Renderizando...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Gerar render ({CREDIT_COSTS.sketch_render} créditos)</>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!originalImage && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all min-h-[400px]"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Arraste um esboço ou planta aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">Aceita rascunhos, plantas baixas, sketches</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {originalImage && showComparison && renderedImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />Esboço / Render
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20">
                      <Download className="w-3 h-3" />Baixar
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                      <RotateCcw className="w-3 h-3" />Novo esboço
                    </button>
                  </div>
                </div>
                <div
                  ref={comparisonRef}
                  className="relative rounded-2xl overflow-hidden cursor-col-resize select-none"
                  style={{ aspectRatio: "16/10" }}
                  onMouseMove={(e) => { if (e.buttons === 1) handleSliderMove(e); }}
                  onTouchMove={handleSliderMove}
                >
                  <img src={renderedImage} alt="Render" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                    <img src={originalImage} alt="Esboço" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${comparisonRef.current?.offsetWidth || 800}px`, maxWidth: "none" }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-muted/80 text-foreground text-xs font-bold">ESBOÇO</span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-500/80 text-white text-xs font-bold">RENDER</span>
                </div>
              </div>
            )}

            {originalImage && !showComparison && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Esboço original</h3>
                  <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                    <RotateCcw className="w-3 h-3" />Trocar
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={originalImage} alt="Original" className="w-full h-auto rounded-2xl" />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                      <p className="text-white text-sm font-medium">Renderizando estilo {STYLES.find((s) => s.id === selectedStyle)?.label}...</p>
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

export default SketchRenderPage;
