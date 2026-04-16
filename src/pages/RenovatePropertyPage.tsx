import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { PlanGate, userPlanToTier } from "@/components/app/PlanGate";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan, useConsumeCredits } from "@/hooks/useUserPlan";
import { CREDIT_COSTS } from "@/lib/plan-rules";
import { toast } from "sonner";
import {
  Upload,
  Hammer,
  Loader2,
  Download,
  ArrowLeftRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type RenovationStyle =
  | "moderna"
  | "premium"
  | "economica"
  | "sustentavel"
  | "comercial";

interface StyleOption {
  id: RenovationStyle;
  label: string;
  description: string;
  emoji: string;
}

const STYLES: StyleOption[] = [
  { id: "moderna", label: "Reforma Moderna", description: "Atualização completa com design contemporâneo", emoji: "🏗️" },
  { id: "premium", label: "Alto Padrão", description: "Acabamentos premium, mármores, iluminação de luxo", emoji: "💎" },
  { id: "economica", label: "Reforma Econômica", description: "Melhorias visuais com custo acessível", emoji: "💰" },
  { id: "sustentavel", label: "Sustentável", description: "Materiais ecológicos, jardim vertical, energia solar", emoji: "🌱" },
  { id: "comercial", label: "Reforma Comercial", description: "Otimização para escritórios e espaços comerciais", emoji: "🏢" },
];

const STYLE_PROMPTS: Record<RenovationStyle, string> = {
  moderna:
    "Renovate this property with a modern contemporary renovation. Update the flooring to polished concrete or modern tiles, repaint walls in modern neutral tones, install modern lighting fixtures, update kitchen/bathroom if visible with modern finishes. Make it look freshly renovated and move-in ready.",
  premium:
    "Renovate this property to high-end luxury standard. Add marble or premium stone flooring, designer lighting fixtures, high-end finishes throughout. If kitchen/bathroom is visible, upgrade to premium materials. Crown molding, premium hardware, luxury atmosphere.",
  economica:
    "Apply a cost-effective renovation to this property. Fresh paint in appealing neutral colors, clean and refinished floors, updated light fixtures, minor cosmetic improvements that maximize visual impact on a budget. Make it look refreshed and well-maintained.",
  sustentavel:
    "Renovate this property with sustainable, eco-friendly design. Add natural wood elements, indoor plants and vertical garden features, energy-efficient LED lighting, bamboo or reclaimed wood flooring, large windows for natural light. Green, healthy, modern eco-design.",
  comercial:
    "Renovate this commercial property for modern business use. Add modern office-appropriate flooring, professional lighting, clean painted walls, reception area improvements if applicable. Professional, productive, modern commercial atmosphere.",
};

const RenovatePropertyPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [renovatedImage, setRenovatedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<RenovationStyle>("moderna");
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
    setRenovatedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setRenovatedImage(null);
    setShowComparison(false);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) return;
    const creditCost = CREDIT_COSTS.renovate_property;
    if (plan && plan.credits_remaining < creditCost) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCost} créditos.`);
      return;
    }

    setIsGenerating(true);
    setRenovatedImage(null);
    setShowComparison(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke("image-restoration", {
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
      if (!data?.success) throw new Error(data?.error || "Erro ao gerar reforma");

      setRenovatedImage(data.stagedImageUrl);
      setShowComparison(true);
      consumeCredits.mutate(creditCost);
      toast.success("Reforma visualizada com sucesso!");
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
    setRenovatedImage(null);
    setShowComparison(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async () => {
    if (!renovatedImage) return;
    try {
      const res = await fetch(renovatedImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reforma-${selectedStyle}-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  return (
    <AppLayout>
      <PlanGate
        feature="renovateProperty"
        userTier={userTier}
        featureLabel="Reformar e Valorizar Imóveis"
        featureDescription="Visualize reformas no imóvel com IA. Disponível a partir do plano Standard."
        minimumTier="standard"
      >
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Hammer className="w-6 h-6 text-amber-400" />
            Reformar e Valorizar Imóveis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize como ficaria uma reforma no imóvel antes de gastar. Apresente ao cliente o potencial de valorização.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de reforma</label>
              <div className="grid grid-cols-1 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedStyle === s.id
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border/40 hover:border-border"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className={`text-sm font-medium ${selectedStyle === s.id ? "text-amber-400" : "text-foreground"}`}>
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
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Gerando reforma...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Visualizar reforma ({CREDIT_COSTS.renovate_property} créditos)</>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            {!originalImage && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all min-h-[400px]"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-foreground font-medium">Arraste uma foto do imóvel aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {originalImage && showComparison && renovatedImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />Antes / Depois da Reforma
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors">
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
                  <img src={renovatedImage} alt="Depois" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                    <img src={originalImage} alt="Antes" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${comparisonRef.current?.offsetWidth || 800}px`, maxWidth: "none" }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-gray-800" />
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-bold">ANTES</span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-bold">DEPOIS</span>
                </div>
              </div>
            )}

            {originalImage && !showComparison && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Foto original</h3>
                  <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                    <RotateCcw className="w-3 h-3" />Trocar foto
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={originalImage} alt="Original" className="w-full h-auto rounded-2xl" />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                      <p className="text-white text-sm font-medium">Aplicando reforma {STYLES.find((s) => s.id === selectedStyle)?.label}...</p>
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

export default RenovatePropertyPage;
