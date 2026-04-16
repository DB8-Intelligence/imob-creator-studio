import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { PlanGate, userPlanToTier } from "@/components/app/PlanGate";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import { CREDIT_COSTS } from "@/lib/plan-rules";
import { toast } from "sonner";
import {
  Upload,
  Building2,
  Loader2,
  Download,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type BusinessType =
  | "residencial"
  | "comercial"
  | "misto"
  | "galpao"
  | "condominio";

interface BusinessOption {
  id: BusinessType;
  label: string;
  description: string;
  emoji: string;
}

const BUSINESS_TYPES: BusinessOption[] = [
  { id: "residencial", label: "Residencial", description: "Casa ou prédio residencial moderno", emoji: "🏠" },
  { id: "comercial", label: "Comercial", description: "Loja, escritório ou ponto comercial", emoji: "🏪" },
  { id: "misto", label: "Uso Misto", description: "Comércio no térreo e residencial nos andares", emoji: "🏢" },
  { id: "galpao", label: "Galpão / Industrial", description: "Galpão logístico ou industrial", emoji: "🏭" },
  { id: "condominio", label: "Condomínio", description: "Condomínio fechado com várias unidades", emoji: "🏘️" },
];

const BUSINESS_PROMPTS: Record<BusinessType, string> = {
  residencial:
    "Transform this empty lot photo into a photorealistic visualization of a modern residential building or house built on this exact land. Show a contemporary 2-3 story home with modern architecture, landscaping, driveway, and surrounding improvements. Keep the surrounding environment and perspective identical. The building should look realistic and professionally rendered as if it was already constructed.",
  comercial:
    "Transform this empty lot photo into a photorealistic visualization of a modern commercial building (retail shop, office space, or commercial point) built on this exact land. Show a sleek storefront with glass facades, signage area, parking spaces, and professional landscaping. Keep the surrounding environment identical. The result should look like a real photograph of the completed commercial property.",
  misto:
    "Transform this empty lot photo into a photorealistic visualization of a mixed-use building on this exact land. The ground floor should have commercial storefronts with glass facades, and upper floors (2-4 stories) should be residential apartments with balconies. Modern architecture, parking, landscaping. Keep surrounding environment identical.",
  galpao:
    "Transform this empty lot photo into a photorealistic visualization of a modern industrial warehouse/logistics facility built on this exact land. Show a large metal-clad warehouse with loading docks, truck access, security fencing, and paved yard. Professional industrial architecture. Keep surrounding environment identical.",
  condominio:
    "Transform this empty lot photo into a photorealistic visualization of a gated residential condominium built on this exact land. Show multiple townhouses or small buildings within a walled perimeter, with a main entrance gate, internal roads, shared green areas, playground, and pool. Modern residential architecture. Keep surrounding environment identical.",
};

const EmptyLotPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<BusinessType>("residencial");
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
    setGeneratedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setGeneratedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) return;
    const creditCost = CREDIT_COSTS.empty_lot;
    if (plan && plan.credits_remaining < creditCost) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCost} créditos.`);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setShowComparison(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("image-restoration", {
        body: {
          imageBase64: originalImage,
          style: "moderno",
          environmentType: "residencial",
          customPrompt: BUSINESS_PROMPTS[selectedType],
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw new Error(response.error.message);
      const data = response.data;
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar visualização");

      setGeneratedImage(data.stagedImageUrl);
      setShowComparison(true);
      consumeCredits.mutate(creditCost);
      toast.success("Visualização gerada com sucesso!");
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
    setGeneratedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `terreno-${selectedType}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <AppLayout>
      <PlanGate
        feature="maxBusinessTypesEmptyLot"
        userTier={userTier}
        featureLabel="Visualização de Terreno Vazio"
        featureDescription="Visualize como ficaria uma construção em um terreno vazio. Disponível em todos os planos."
        minimumTier="starter"
      >
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Visualização de Terreno Vazio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie a foto de um terreno vazio e visualize como ficaria com diferentes tipos de construção.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de construção</label>
              <div className="grid grid-cols-1 gap-2">
                {BUSINESS_TYPES.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => setSelectedType(bt.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedType === bt.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <span className="text-lg">{bt.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${selectedType === bt.id ? "text-emerald-400" : "text-foreground"}`}>
                        {bt.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{bt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!originalImage || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Gerando visualização...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Visualizar construção ({CREDIT_COSTS.empty_lot} créditos)</>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!originalImage && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all min-h-[400px]"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Arraste uma foto do terreno aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {originalImage && showComparison && generatedImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />Terreno / Construção
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
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
                  <img src={generatedImage} alt="Construção" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                    <img src={originalImage} alt="Terreno" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${comparisonRef.current?.offsetWidth || 800}px`, maxWidth: "none" }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-muted/80 text-foreground text-xs font-bold">TERRENO</span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-bold">CONSTRUÇÃO</span>
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
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                      <p className="text-white text-sm font-medium">Construindo {BUSINESS_TYPES.find((bt) => bt.id === selectedType)?.label}...</p>
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

export default EmptyLotPage;
