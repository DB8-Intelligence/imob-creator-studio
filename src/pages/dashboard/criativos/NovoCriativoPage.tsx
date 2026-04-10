import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Building2, Palette, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Property {
  id: string;
  title: string;
  type: string | null;
  address: string | null;
}

interface Template {
  slug: string;
  name: string;
  gradient: string;
}

/* ------------------------------------------------------------------ */
/*  Hardcoded templates                                                */
/* ------------------------------------------------------------------ */

const TEMPLATES: Template[] = [
  { slug: "dark-premium",      name: "Dark Premium",       gradient: "from-[#0d0d0d] to-[#1a1a2e]" },
  { slug: "ia-express",        name: "IA Express",         gradient: "from-[#002B5B] to-[#0055a5]" },
  { slug: "imobiliario-top",   name: "Imobiliario Top",    gradient: "from-[#002B5B] via-[#1a3a6b] to-[#FFD700]" },
  { slug: "classico-elegante", name: "Classico Elegante",  gradient: "from-[#2c2c2c] to-[#4a4a4a]" },
  { slug: "black-gold-tower",  name: "Black Gold Tower",   gradient: "from-[#0d0d0d] via-[#1a1a2e] to-[#FFD700]" },
  { slug: "captacao-express",  name: "Captacao Express",   gradient: "from-[#FFD700] via-[#f5c200] to-[#002B5B]" },
];

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

const STEPS = [
  { num: 1, label: "Selecionar Imovel", icon: Building2 },
  { num: 2, label: "Escolher Template", icon: Palette },
  { num: 3, label: "Confirmar e Gerar", icon: Sparkles },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, idx) => {
        const isActive = step.num === current;
        const isDone = step.num < current;
        const Icon = step.icon;

        return (
          <div key={step.num} className="flex items-center gap-2 sm:gap-3">
            {idx > 0 && (
              <div
                className={`hidden sm:block w-12 h-0.5 ${
                  isDone ? "bg-[#002B5B]" : "bg-gray-200"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#002B5B] text-white"
                    : isDone
                      ? "bg-[#002B5B] text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  isActive ? "text-[#002B5B]" : isDone ? "text-[#002B5B]" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function NovoCriativoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  /* Step 1 state */
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [propSearch, setPropSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  /* Step 2 state */
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  /* Step 3 state */
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ---- Fetch properties ---- */
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoadingProps(true);
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, type, address")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar imoveis:", error);
      } else {
        setProperties((data ?? []) as Property[]);
      }
      setLoadingProps(false);
    }

    load();
  }, [user]);

  const filteredProps = properties.filter(
    (p) =>
      !propSearch ||
      p.title?.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.address?.toLowerCase().includes(propSearch.toLowerCase())
  );

  /* ---- Generate creative ---- */
  const handleGenerate = async () => {
    if (!user || !selectedProperty || !selectedTemplate) return;
    setGenerating(true);
    setProgress(0);

    // Insert into creatives_gallery with status "generating"
    const { data: inserted, error } = await supabase
      .from("creatives_gallery")
      .insert({
        user_id: user.id,
        template_name: selectedTemplate.name,
        template_slug: selectedTemplate.slug,
        status: "generating",
        property_id: selectedProperty.id,
        credits_used: 1,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar criativo", description: error.message, variant: "destructive" });
      setGenerating(false);
      return;
    }

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    // After 3s simulated delay: update to "ready" and navigate
    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      if (inserted) {
        await supabase
          .from("creatives_gallery")
          .update({ status: "ready" })
          .eq("id", inserted.id);
      }

      toast({ title: "Criativo gerado com sucesso!" });

      setTimeout(() => {
        navigate("/dashboard/criativos");
      }, 500);
    }, 3000);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-gray-600 hover:text-[#002B5B]"
          onClick={() => navigate("/dashboard/criativos")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Galeria
        </Button>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-[#002B5B]">Novo Criativo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Siga os passos para gerar um novo criativo imobiliario
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* ============================================================ */}
        {/* STEP 1 — Selecionar Imovel                                   */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[#002B5B]">Selecione um imovel</h2>

            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por titulo ou endereco..."
                value={propSearch}
                onChange={(e) => setPropSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingProps ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-gray-100 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : filteredProps.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">Nenhum imovel encontrado</p>
                <p className="text-sm mt-1">Cadastre imoveis para comecar a criar criativos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProps.map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  return (
                    <Card
                      key={prop.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-[#002B5B] shadow-md bg-[#002B5B]/5"
                          : "border border-gray-200 hover:border-[#002B5B]/40 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedProperty(prop)}
                    >
                      <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm text-[#002B5B] line-clamp-1">
                            {prop.title}
                          </h3>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#002B5B] flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        {prop.type && (
                          <p className="text-xs text-gray-500">{prop.type}</p>
                        )}
                        {prop.address && (
                          <p className="text-xs text-gray-400 line-clamp-1">{prop.address}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                className="bg-[#002B5B] hover:bg-[#001d3d] text-white px-8"
                disabled={!selectedProperty}
                onClick={() => setStep(2)}
              >
                Proximo
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2 — Escolher Template                                   */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-[#002B5B]">Escolha um template</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate?.slug === tpl.slug;
                return (
                  <Card
                    key={tpl.slug}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "ring-2 ring-[#002B5B] shadow-lg"
                        : "border border-gray-200 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTemplate(tpl)}
                  >
                    {/* Gradient preview */}
                    <div
                      className={`h-36 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center relative`}
                    >
                      <span className="text-white/80 text-sm font-semibold tracking-wide">
                        {tpl.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#002B5B]" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{tpl.name}</span>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className={
                          isSelected
                            ? "bg-[#002B5B] text-white text-xs"
                            : "text-xs border-gray-300"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(tpl);
                        }}
                      >
                        {isSelected ? "Selecionado" : "Selecionar"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button
                className="bg-[#002B5B] hover:bg-[#001d3d] text-white px-8"
                disabled={!selectedTemplate}
                onClick={() => setStep(3)}
              >
                Proximo
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3 — Confirmar e Gerar                                   */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#002B5B]">Confirme e gere seu criativo</h2>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Selected property */}
              <Card className="border border-gray-200">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Imovel Selecionado
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#002B5B]/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#002B5B]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedProperty?.title}
                      </p>
                      {selectedProperty?.type && (
                        <p className="text-xs text-gray-500">{selectedProperty.type}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected template */}
              <Card className="border border-gray-200">
                <CardContent className="p-5 space-y-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Template Selecionado
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTemplate?.gradient ?? "from-gray-300 to-gray-400"}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedTemplate?.name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedTemplate?.slug}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generating state */}
            {generating ? (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[#FFD700] animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-[#002B5B]">
                    Gerando seu criativo...
                  </p>
                  <p className="text-xs text-gray-500">
                    Isso pode levar alguns segundos
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Cost info */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#FFD700]/10 p-3 rounded-lg border border-[#FFD700]/30">
                  <Sparkles className="h-4 w-4 text-[#FFD700]" />
                  <span>
                    Este criativo consumira <strong className="text-[#002B5B]">1 credito</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700"
                    onClick={() => setStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="bg-[#002B5B] hover:bg-[#001d3d] text-white px-10 py-3 text-base font-semibold gap-2"
                    onClick={handleGenerate}
                  >
                    <Sparkles className="h-5 w-5" />
                    Gerar Criativo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
