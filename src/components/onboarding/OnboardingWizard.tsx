/**
 * OnboardingWizard — Guided first-access wizard (DEV-34)
 *
 * 4-step modal flow:
 *   Step 0: Welcome (workspace auto-created)
 *   Step 1: Add first property (simplified)
 *   Step 2: Generate first content
 *   Step 3: Success + go to dashboard
 *
 * Renders as full-screen overlay on first login.
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Upload,
  Rocket,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { dispatchGeneration, subscribeToJob } from "@/services/generationApi";
import { trackEvent } from "@/services/analytics/eventTracker";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import type { OnboardingStepKey } from "@/hooks/useOnboardingProgress";

// ─── Step config ─────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 0, title: "Bem-vindo", icon: Rocket },
  { id: 1, title: "Seu imóvel", icon: Building2 },
  { id: 2, title: "Primeiro criativo", icon: Sparkles },
  { id: 3, title: "Pronto!", icon: CheckCircle2 },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { user, profile } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { markStep } = useOnboardingProgress();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state: property
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [propertyCity, setPropertyCity] = useState("");
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);

  // Step 2 state: generation
  const [generationType, setGenerationType] = useState("gerar_post");
  const [generationResult, setGenerationResult] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "done" | "error">("idle");

  const firstName = profile?.full_name?.split(" ")[0] ?? "Corretor";

  // ── Persist wizard step to DB ──────────────────────────────────────────────
  const persistStep = useCallback(async (stepNum: number) => {
    if (!user) return;
    await supabase.from("onboarding_progress").upsert({
      user_id: user.id,
      current_step: stepNum,
      wizard_started_at: stepNum === 0 ? new Date().toISOString() : undefined,
    }, { onConflict: "user_id" });
  }, [user]);

  // ── Step 1: Create property ────────────────────────────────────────────────
  const handleCreateProperty = async () => {
    if (!user || !workspaceId || !propertyTitle.trim()) return;
    setIsLoading(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      for (const file of propertyImages) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-media")
          .upload(path, file, { cacheControl: "3600" });
        if (!upErr) {
          const { data } = supabase.storage.from("property-media").getPublicUrl(path);
          imageUrls.push(data.publicUrl);
        }
      }

      // Create property via inbox-proxy
      const res = await supabase.functions.invoke("inbox-proxy", {
        method: "POST",
        body: {
          _method: "POST",
          _path: "/properties",
          title: propertyTitle,
          property_type: propertyType,
          city: propertyCity || null,
          workspace_id: workspaceId,
          images: imageUrls,
        },
      });

      if (res.error) throw new Error(res.error.message);

      const property = res.data;
      setCreatedPropertyId(property?.id ?? null);
      await markStep("property_uploaded");
      trackEvent(user.id, "onboarding_step_completed", { metadata: { step: "property_uploaded", wizard: true } });

      setStep(2);
      persistStep(2);
    } catch (err) {
      console.error("Property creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Generate content ───────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!user || !workspaceId) return;
    setGenerationStatus("generating");

    try {
      const response = await dispatchGeneration({
        workspace_id: workspaceId,
        generation_type: generationType as any,
        engine_id: "openai_gpt4o",
        property_id: createdPropertyId ?? undefined,
        callback_mode: "async",
        metadata: { onboarding: true },
      });

      if (!response.job_id) throw new Error("No job_id returned");

      // Subscribe to job updates
      const unsub = subscribeToJob(response.job_id, (job) => {
        if (job.status === "done") {
          setGenerationResult(job.result_url);
          setGenerationStatus("done");
          markStep("creative_generated");

          // Track first generation time
          if (user) {
            supabase.from("onboarding_progress").upsert({
              user_id: user.id,
              first_generation_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

            trackEvent(user.id, "creative_generated", {
              metadata: { onboarding: true, generation_type: generationType },
            });
          }

          unsub();
          setTimeout(() => { setStep(3); persistStep(3); }, 1500);
        } else if (job.status === "error") {
          setGenerationStatus("error");
          unsub();
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if (generationStatus === "generating") {
          setGenerationStatus("done");
          markStep("creative_generated");
          setStep(3);
          persistStep(3);
        }
      }, 60000);
    } catch (err) {
      console.error("Generation error:", err);
      setGenerationStatus("error");
    }
  };

  // ── File handler ───────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPropertyImages((prev) => [...prev, ...files].slice(0, 5));
  };

  // ── Handle complete ────────────────────────────────────────────────────────
  const handleComplete = () => {
    onComplete();
    navigate("/dashboard");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-accent text-accent-foreground"
                    : i === step
                    ? "bg-accent text-accent-foreground ring-2 ring-accent/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? "bg-accent" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Skip button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Pular por agora <X className="w-3 h-3" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 0: Welcome ──────────────────────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Olá, {firstName}!
                </h1>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Vou te guiar para criar seu primeiro conteúdo profissional em menos de 3 minutos.
                </p>
              </div>
              <div className="bg-card rounded-xl border p-4 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">1</div>
                  <span className="text-sm">Cadastrar um imóvel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">2</div>
                  <span className="text-sm">Gerar seu primeiro criativo com IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">3</div>
                  <span className="text-sm">Pronto para publicar!</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  setStep(1);
                  persistStep(1);
                  if (user) {
                    trackEvent(user.id, "onboarding_step_completed", { metadata: { step: "wizard_started", wizard: true } });
                  }
                }}
              >
                Começar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── Step 1: Property ─────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="property"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-display font-bold">Cadastre seu primeiro imóvel</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha o básico — você pode completar depois.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="ob-title">Nome do imóvel *</Label>
                  <Input
                    id="ob-title"
                    placeholder="Ex: Apartamento 3 quartos - Centro"
                    value={propertyTitle}
                    onChange={(e) => setPropertyTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ob-type">Tipo</Label>
                    <select
                      id="ob-type"
                      title="Tipo de imóvel"
                      className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                      <option value="cobertura">Cobertura</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ob-city">Cidade</Label>
                    <Input
                      id="ob-city"
                      placeholder="Ex: São Paulo"
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Fotos do imóvel (opcional)</Label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-sm">
                        {propertyImages.length > 0
                          ? `${propertyImages.length} foto(s) selecionada(s)`
                          : "Clique para adicionar fotos"}
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  onClick={handleCreateProperty}
                  disabled={!propertyTitle.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                  ) : (
                    <>Salvar e continuar <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>

              <button
                onClick={() => { setStep(2); persistStep(2); }}
                className="text-xs text-muted-foreground hover:text-foreground mx-auto block"
              >
                Pular este passo
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Generate ─────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-display font-bold">Gere seu primeiro criativo</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Escolha o tipo e a IA cria para você em segundos.
                </p>
              </div>

              {generationStatus === "idle" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "gerar_post", label: "Post Feed", desc: "Imagem 1:1 para Instagram" },
                      { id: "gerar_story", label: "Story", desc: "Vertical 9:16 para Stories" },
                      { id: "gerar_banner", label: "Banner", desc: "Para tráfego pago" },
                      { id: "gerar_arte_premium", label: "Arte Premium", desc: "Editorial de luxo" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGenerationType(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          generationType === opt.id
                            ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                            : "border-border/60 hover:border-accent/40"
                        }`}
                      >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  <Button onClick={handleGenerate} className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" /> Gerar com IA
                  </Button>
                </>
              )}

              {generationStatus === "generating" && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium">Gerando seu criativo...</p>
                    <p className="text-sm text-muted-foreground mt-1">Isso pode levar até 30 segundos.</p>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: "5%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 25, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {generationStatus === "done" && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-medium text-green-600">Criativo gerado!</p>
                  {generationResult && (
                    <img
                      src={generationResult}
                      alt="Primeiro criativo"
                      className="w-48 h-48 object-cover rounded-xl mx-auto border"
                    />
                  )}
                </div>
              )}

              {generationStatus === "error" && (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Não foi possível gerar agora. Você pode gerar depois no dashboard.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setStep(3); persistStep(3); }}
                  >
                    Continuar para o dashboard
                  </Button>
                </div>
              )}

              {generationStatus === "idle" && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Complete ─────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-display font-bold">Tudo pronto, {firstName}!</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Seu workspace está configurado e seu primeiro criativo foi gerado. Explore o dashboard para descobrir tudo que você pode fazer.
                </p>
              </div>

              <div className="bg-card rounded-xl border p-4 text-left space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximos passos</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent">1.</span> Configure seu Brand Kit em Configurações
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent">2.</span> Agende publicações no Calendário
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent">3.</span> Conecte Instagram em Integrações
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleComplete}>
                Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
