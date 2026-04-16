import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { PlanGate, userPlanToTier } from "@/components/app/PlanGate";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import { CREDIT_COSTS } from "@/lib/plan-rules";
import { toast } from "sonner";
import {
  Upload,
  MapPin,
  Loader2,
  Download,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type MarkingMode = "demarcacao" | "medidas" | "divisao" | "topografia" | "3d";

interface ModeOption {
  id: MarkingMode;
  label: string;
  description: string;
  emoji: string;
  requires3D?: boolean;
}

const MODES: ModeOption[] = [
  { id: "demarcacao", label: "Demarcação Visual", description: "Linhas de contorno e limites do terreno", emoji: "📍" },
  { id: "medidas", label: "Com Medidas", description: "Limites do terreno com cotas e dimensões estimadas", emoji: "📏" },
  { id: "divisao", label: "Divisão de Lotes", description: "Subdivida o terreno em lotes menores", emoji: "🔲" },
  { id: "topografia", label: "Topografia", description: "Curvas de nível e análise do relevo", emoji: "🗺️" },
  { id: "3d", label: "Visualização 3D", description: "Maquete 3D do terreno com demarcação", emoji: "🧊", requires3D: true },
];

const MODE_PROMPTS: Record<MarkingMode, string> = {
  demarcacao:
    "Analyze this aerial/ground photo of a land plot and add clear visual demarcation lines. Draw bright colored boundary lines (yellow or red) outlining the property perimeter. Add corner markers/pins at each vertex of the property. The lines should follow the apparent property boundaries. Keep the original photo intact and overlay the demarcation clearly. Professional surveying/real estate style.",
  medidas:
    "Analyze this aerial/ground photo of a land plot and add property boundary demarcation with estimated measurements. Draw bright colored boundary lines outlining the property perimeter. Add dimension lines with approximate measurements in meters along each edge. Include corner markers and total area estimate. Professional surveying/real estate measurement overlay style.",
  divisao:
    "Analyze this aerial/ground photo of a land plot and visualize it subdivided into smaller lots. Draw the overall property boundary, then divide the interior into 4-6 equal smaller lots with dotted division lines. Label each lot (Lote 1, Lote 2, etc.) and show approximate dimensions. Use different subtle colors for each lot. Professional land subdivision visualization.",
  topografia:
    "Analyze this aerial/ground photo of a land plot and add topographic analysis overlay. Draw contour lines showing elevation changes across the terrain. Use color gradients (green for lower areas, yellow/brown for higher). Add elevation markers and slope direction arrows. Show the property boundary as well. Professional topographic survey visualization style.",
  "3d":
    "Transform this aerial/ground photo of a land plot into a 3D perspective visualization. Create a 3D terrain model/maquette showing the property with realistic elevation, ground texture, and clear boundary markers with posts/fences at the corners. Add a slight isometric perspective to show the terrain in 3D. Include surrounding context. Professional architectural 3D site model presentation.",
};

const LandMarkingPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [markedImage, setMarkedImage] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<MarkingMode>("demarcacao");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const { data: plan } = useUserPlan();
  const consumeCredits = useConsumeCredits();
  const userTier = userPlanToTier(plan?.user_plan);

  const is3DMode = selectedMode === "3d";
  const creditCost = is3DMode ? CREDIT_COSTS.land_marking_3d : CREDIT_COSTS.land_marking;

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }
    setMarkedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setMarkedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) return;
    if (plan && plan.credits_remaining < creditCost) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCost} créditos.`);
      return;
    }

    // Check 3D access
    if (is3DMode) {
      const has3D = userTier === "plus" || userTier === "premium";
      if (!has3D) {
        toast.error("Visualização 3D requer plano Plus ou superior.");
        return;
      }
    }

    setIsGenerating(true);
    setMarkedImage(null);
    setShowComparison(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("image-restoration", {
        body: {
          imageBase64: originalImage,
          style: "moderno",
          environmentType: "residencial",
          customPrompt: MODE_PROMPTS[selectedMode],
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar demarcação");

      setMarkedImage(data.stagedImageUrl);
      setShowComparison(true);
      consumeCredits.mutate(creditCost);
      toast.success("Demarcação gerada com sucesso!");
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
    setMarkedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    if (!markedImage) return;
    try {
      const res = await fetch(markedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `demarcacao-${selectedMode}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <AppLayout>
      <PlanGate
        feature="landMarking"
        userTier={userTier}
        featureLabel="Demarcação de Terreno"
        featureDescription="Demarque limites, medidas e divisões de terrenos com IA. Disponível a partir do plano Standard."
        minimumTier="standard"
      >
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-400" />
            Demarcação de Terreno
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie uma foto aérea ou do terreno e gere demarcações visuais, medidas e divisões de lotes com IA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de demarcação</label>
              <div className="grid grid-cols-1 gap-2">
                {MODES.map((m) => {
                  const locked = m.requires3D && userTier !== "plus" && userTier !== "premium";
                  return (
                    <button
                      key={m.id}
                      onClick={() => !locked && setSelectedMode(m.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        locked
                          ? "border-border/20 opacity-50 cursor-not-allowed"
                          : selectedMode === m.id
                          ? "border-rose-500 bg-rose-500/10"
                          : "border-border/40 hover:border-border"
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <div>
                        <p className={`text-sm font-medium ${selectedMode === m.id ? "text-rose-400" : "text-foreground"}`}>
                          {m.label}
                          {locked && <span className="ml-1 text-[10px] text-muted-foreground">(Plus+)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!originalImage || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Gerando demarcação...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Demarcar terreno ({creditCost} créditos)</>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!originalImage && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/5 transition-all min-h-[400px]"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Arraste uma foto do terreno aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">Foto aérea (drone) ou do nível do solo</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {originalImage && showComparison && markedImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />Original / Demarcado
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors">
                      <Download className="w-3 h-3" />Baixar
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                      <RotateCcw className="w-3 h-3" />Nova foto
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
                  <img src={markedImage} alt="Demarcado" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                    <img src={originalImage} alt="Original" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${comparisonRef.current?.offsetWidth || 800}px`, maxWidth: "none" }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-muted/80 text-foreground text-xs font-bold">ORIGINAL</span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-rose-500/80 text-white text-xs font-bold">DEMARCADO</span>
                </div>
              </div>
            )}

            {originalImage && !showComparison && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Foto do terreno</h3>
                  <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                    <RotateCcw className="w-3 h-3" />Trocar foto
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={originalImage} alt="Original" className="w-full h-auto rounded-2xl" />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
                      <p className="text-white text-sm font-medium">Gerando {MODES.find((m) => m.id === selectedMode)?.label}...</p>
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

export default LandMarkingPage;
