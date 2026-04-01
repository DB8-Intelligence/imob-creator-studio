import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useCreateVideoJob, useReleaseVideoCredit, useUpdateVideoJobStatus, useVideoModuleOverview } from "@/hooks/useVideoModule";
import { createVideoJobSegments, renderVideoJob } from "@/services/videoModuleApi";
import { dispatchN8nEvent } from "@/services/n8nBridgeApi";
import { getUploadSummary, getVideoPlanRule, resolveVideoPlanTier } from "@/lib/video-plan-rules";
import { getDefaultVideoMotionPreset, getVideoMotionPresetConfig } from "@/lib/video-motion-presets";
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Film,
  Sliders,
  Download,
  Zap,
  Lock,
  Crown,
  Star,
  CheckCircle2,
  Loader2,
  ImageIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Style = "cinematic" | "moderno" | "luxury" | "drone" | "walkthrough";
type Format = "reels" | "feed" | "youtube";
interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STYLES: { id: Style; label: string; description: string; emoji: string }[] = [
  { id: "cinematic", label: "Cinematic", description: "Transições suaves, iluminação dramática, trilha épica", emoji: "🎬" },
  { id: "moderno", label: "Moderno", description: "Cortes rápidos, tipografia bold, energia urbana", emoji: "⚡" },
  { id: "luxury", label: "Luxury", description: "Movimentos lentos, paleta dourada, elegância sofisticada", emoji: "✨" },
  { id: "drone", label: "Drone Aéreo", description: "Vista aérea, sobrevoo suave, perspectiva panorâmica", emoji: "🚁" },
  { id: "walkthrough", label: "Tour Virtual", description: "Primeira pessoa, passeio pelo imóvel, visita virtual", emoji: "🚶" },
];

const FORMATS: { id: Format; label: string; ratio: string; platforms: string }[] = [
  { id: "reels", label: "Reels / TikTok", ratio: "9:16", platforms: "Instagram · TikTok" },
  { id: "feed", label: "Feed Quadrado", ratio: "1:1", platforms: "Instagram · Facebook" },
  { id: "youtube", label: "YouTube / TV", ratio: "16:9", platforms: "YouTube · Stories Landscape" },
];

const STEPS = ["Upload de fotos", "Estilo & formato", "Gerar vídeo"];

// ── Plan Gate ─────────────────────────────────────────────────────────────────

const PlanGate = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-accent" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-3">
        Geração de vídeo disponível nos planos Plus e Premium
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Este módulo transforma fotos de imóveis em vídeos profissionais com IA, respeitando os limites comerciais de Standard, Plus e Premium.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">Plus</span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ 600 créditos por mês</li>
            <li>✓ Até 15 fotos por vídeo</li>
            <li>✓ Resolução 1080p Full HD</li>
            <li>✓ Até 75s por vídeo</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">Premium</span>
            <Badge className="bg-amber-500/10 text-amber-600 text-xs">4K + prioridade</Badge>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ 800 créditos por mês</li>
            <li>✓ Até 20 fotos por vídeo</li>
            <li>✓ 4K Ultra HD</li>
            <li>✓ Renderização prioritária</li>
          </ul>
        </div>
      </div>
      <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/plano")}>
        Ver planos e fazer upgrade
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const VideoCreatorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as { style?: Style; format?: Format };
  const { toast } = useToast();
  const { data: plan } = useUserPlan();
  const { workspaceId } = useWorkspaceContext();
  const { data: overview } = useVideoModuleOverview(workspaceId);
  const createVideoJobMutation = useCreateVideoJob(workspaceId);
  const updateVideoJobStatusMutation = useUpdateVideoJobStatus(workspaceId);
  const releaseVideoCreditMutation = useReleaseVideoCredit(workspaceId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [style, setStyle] = useState<Style>(locationState.style ?? "cinematic");
  const [format, setFormat] = useState<Format>(locationState.format ?? "reels");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Plan gate: Credits users can't access
  const hasVideoAccess = plan?.user_plan === "pro" || plan?.user_plan === "vip";
  const activeAddonType = resolveVideoPlanTier(overview?.addOn?.addon_type ?? (plan?.user_plan === "vip" ? "premium" : plan?.user_plan === "pro" ? "plus" : "standard"));
  const planRule = getVideoPlanRule(activeAddonType);
  const uploadSummary = getUploadSummary(photos.length, activeAddonType);
  const motionPreset = getDefaultVideoMotionPreset();
  const motionPresetConfig = getVideoMotionPresetConfig(motionPreset);
  const maxPhotosAllowed = planRule.maxUploadImages;
  const maxDurationAllowed = planRule.maxDurationSeconds;
  const resolutionLabel = planRule.resolution;
  const computedDurationSeconds = uploadSummary.computedDurationSeconds;

  if (plan && !hasVideoAccess) {
    return (
      <AppLayout>
        <PlanGate />
      </AppLayout>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20 - photos.length);

    const newPhotos: UploadedPhoto[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, maxPhotosAllowed));
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!workspaceId) {
      toast({
        title: "Workspace não disponível",
        description: "Carregue o workspace antes de gerar o vídeo.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);

    let jobId: string | null = null;

    try {
      const createdJob = await createVideoJobMutation.mutateAsync({
        title: `Vídeo ${FORMATS.find((f) => f.id === format)?.label ?? format}`,
        style,
        format,
        durationSeconds: computedDurationSeconds,
        photosCount: photos.length,
        resolution: resolutionLabel,
        motionPreset,
        metadata: {
          source: "video-creator-page",
          photoNames: photos.map((photo) => photo.file.name),
          motion_preset: motionPreset,
          motion_preset_config: motionPresetConfig,
        },
      });
      jobId = createdJob.id;

      await createVideoJobSegments({
        videoJobId: jobId,
        workspaceId,
        imageNames: photos.map((photo) => photo.file.name),
        renderedSegments: uploadSummary.renderedSegments,
      });

      await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "processing" });

      const result = await renderVideoJob({
        workspaceId,
        videoJobId: jobId,
        title: `Vídeo ${FORMATS.find((f) => f.id === format)?.label ?? format}`,
        style,
        format,
        duration: String(computedDurationSeconds),
        addonType: activeAddonType,
        photos: photos.map((photo) => photo.file),
      });

      setVideoUrl(result.videoUrl);
      setGenerated(true);

      await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "completed", outputUrl: result.videoUrl });
      await dispatchN8nEvent("video_completed", {
        workspace_id: workspaceId,
        video_job_id: jobId,
        output_url: result.videoUrl,
        status: "completed",
        addon_type: activeAddonType,
      });
      toast({ title: "Vídeo gerado com sucesso!", description: "Seu vídeo foi salvo no storage, registrado na biblioteca e enviado para automação." });
    } catch (e: unknown) {
      if (jobId) {
        try {
          await updateVideoJobStatusMutation.mutateAsync({ id: jobId, status: "failed" });
        } catch {
          // noop
        }
      } else if (workspaceId) {
        try {
          await releaseVideoCreditMutation.mutateAsync();
        } catch {
          // noop
        }
      }
      if (workspaceId) {
        await dispatchN8nEvent("video_failed", {
          workspace_id: workspaceId,
          video_job_id: jobId,
          status: "failed",
          error_type: "render_or_pipeline",
          message: e instanceof Error ? e.message : "Tente novamente.",
        });
      }
      toast({
        title: "Erro ao gerar vídeo",
        description: e instanceof Error ? e.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const canProceedStep0 = photos.length >= 6;
  const canProceedStep1 = true;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-card to-muted/40 p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-3">Novo módulo</Badge>
              <h1 className="text-3xl font-display font-bold text-foreground">Criador de Vídeos IA</h1>
              <p className="text-muted-foreground mt-1 max-w-xl">
                Transforme fotos do imóvel em vídeos profissionais para Reels, YouTube e Feed com regras claras por plano, duração e resolução.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "< 3 min", label: "por vídeo" },
                { value: resolutionLabel, label: "resolução do plano" },
                { value: `${computedDurationSeconds || 0}s`, label: "duração estimada" },
                { value: motionPresetConfig.label, label: "movimento padrão IA" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                  <p className="text-base font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={[
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  i === step
                    ? "bg-accent text-accent-foreground"
                    : i < step
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Photo upload ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Suba as fotos do imóvel</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mínimo recomendado 6 fotos · máximo {maxPhotosAllowed} fotos neste plano · formatos JPG, PNG, WEBP · max 200MB por arquivo
                  </p>
                </div>

                {/* Content prohibition notice */}
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 flex gap-3">
                  <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">Conteúdo proibido — leia antes de fazer upload</p>
                    <p>
                      Não envie fotos com <strong>pessoas identificáveis</strong> (rosto/corpo), <strong>documentos</strong> (CPF, RG, CNH, contratos), <strong>dados pessoais/sensíveis</strong> ou qualquer conteúdo ilegal/ofensivo.
                      Violações podem resultar em suspensão da conta sem reembolso.{" "}
                      <a href="/termos" target="_blank" className="underline text-accent hover:text-accent/80">
                        Ver Termos de Uso
                      </a>
                    </p>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={[
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors",
                    dragging
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50 hover:bg-muted/40",
                  ].join(" ")}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">Arraste e solte ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">Até {maxPhotosAllowed} fotos neste plano</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </div>

                {/* Photo grid */}
                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">
                        {photos.length}/{maxPhotosAllowed} fotos {photos.length < 6 && <span className="text-amber-500">(mínimo recomendado 6)</span>}
                      </p>
                      <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => setPhotos([])}>
                        Remover todas
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {photos.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={p.preview} alt="" className="w-full h-full object-cover" />
                          <button
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {photos.length < maxPhotosAllowed && (
                        <button
                          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                size="lg"
              >
                Próximo: escolher estilo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Style & format ───────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-7">
                {/* Style */}
                <div>
                  <Label className="text-base font-semibold">Estilo visual</Label>
                  <p className="text-sm text-muted-foreground mb-4">Define a identidade estética do vídeo gerado pela IA.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          style === s.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <span className="text-2xl mb-2 block">{s.emoji}</span>
                        <p className="font-semibold text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <Label className="text-base font-semibold">Formato de saída</Label>
                  <p className="text-sm text-muted-foreground mb-4">Escolha as proporções ideais para a rede social alvo.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FORMATS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={[
                          "rounded-xl border p-4 text-left transition-all",
                          format === f.id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/40",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-foreground">{f.label}</p>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                            {f.ratio}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{f.platforms}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <Label className="text-base font-semibold">Duração calculada automaticamente</Label>
                  <p className="text-sm text-muted-foreground mb-4">Cada imagem gera 5 segundos. Seu plano atual permite até {maxPhotosAllowed} fotos enviadas, até {planRule.maxRenderedSegments} segmentos renderizados e saída em {resolutionLabel}.</p>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Imagens enviadas</span>
                      <span className="font-semibold text-foreground">{photos.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Segmentos usados na montagem</span>
                      <span className="font-semibold text-foreground">{uploadSummary.renderedSegments}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duração estimada final</span>
                      <span className="font-semibold text-foreground">{computedDurationSeconds}s</span>
                    </div>
                    {uploadSummary.hasOptimization && (
                      <p className="text-xs text-amber-600 pt-2 border-t border-border">Seu plano permite enviar {maxPhotosAllowed} imagens, mas a montagem final usa até {planRule.maxRenderedSegments} segmentos para respeitar o teto de {planRule.maxDurationSeconds}s.</p>
                    )}
                    {!uploadSummary.hasOptimization && photos.length < 6 && (
                      <p className="text-xs text-amber-600 pt-2 border-t border-border">Recomendamos pelo menos 6 imagens para uma narrativa visual mais completa.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <Button onClick={() => setStep(2)} size="lg">
                Próximo: gerar vídeo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Generate ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              {/* Summary */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <h2 className="text-xl font-semibold text-foreground">Resumo do vídeo</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Fotos</p>
                      <p className="font-semibold text-foreground">{photos.length} fotos selecionadas</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Estilo</p>
                      <p className="font-semibold text-foreground">{STYLES.find((s) => s.id === style)?.label}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Formato</p>
                      <p className="font-semibold text-foreground">{FORMATS.find((f) => f.id === format)?.label}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Duração</p>
                      <p className="font-semibold text-foreground">{computedDurationSeconds}s calculados automaticamente</p>
                    </div>
                  </div>

                  {/* Mini photo preview */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fotos incluídas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {photos.slice(0, 12).map((p) => (
                        <img key={p.id} src={p.preview} alt="" className="w-10 h-10 rounded object-cover" />
                      ))}
                      {photos.length > 12 && (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                          +{photos.length - 12}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} disabled={generating}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Editar configurações
                    </Button>
                    {!generated && (
                      <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        size="lg"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando vídeo…
                          </>
                        ) : (
                          <>
                            <Film className="w-4 h-4 mr-2" />
                            Gerar vídeo com IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status panel */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-border/60 bg-gradient-to-br from-accent/10 to-transparent">
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">Status da geração</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {!generating && !generated && (
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground min-h-[200px] flex flex-col justify-between shadow-elevated">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-accent text-primary">{computedDurationSeconds}s</Badge>
                          <Badge variant="secondary" className="bg-white/10 text-primary-foreground border-white/10">
                            {STYLES.find((s) => s.id === style)?.label}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-primary-foreground/60">Pronto para gerar</p>
                          <p className="font-display text-lg font-bold mt-1">
                            {FORMATS.find((f) => f.id === format)?.label}
                          </p>
                          <p className="text-xs text-primary-foreground/40 mt-1">{photos.length} fotos · {resolutionLabel}</p>
                        </div>
                      </div>
                    )}

                    {generating && (
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground min-h-[200px] flex flex-col items-center justify-center gap-4 shadow-elevated">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <div className="text-center">
                          <p className="font-semibold">Renderizando com IA…</p>
                          <p className="text-sm text-primary-foreground/60 mt-1">Isso pode levar alguns segundos</p>
                        </div>
                        <div className="w-full bg-primary-foreground/10 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-accent rounded-full animate-pulse w-3/5" />
                        </div>
                      </div>
                    )}

                    {generated && (
                      <div className="space-y-3">
                        {videoUrl && (
                          <video
                            src={videoUrl}
                            controls
                            className="w-full rounded-xl bg-black"
                          />
                        )}
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white flex items-center gap-3 shadow-elevated">
                          <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                          <div>
                            <p className="font-display font-bold">Vídeo pronto!</p>
                            <p className="text-sm text-white/70">
                              {computedDurationSeconds}s · {FORMATS.find((f) => f.id === format)?.label} · {resolutionLabel}
                            </p>
                          </div>
                        </div>
                        {videoUrl ? (
                          <a href={videoUrl} download={`video-imob-${format}-${computedDurationSeconds}s.mp4`} className="block">
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar vídeo
                            </Button>
                          </a>
                        ) : (
                          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar vídeo
                          </Button>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => navigate("/library")}>
                          Ver na Biblioteca
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-sm"
                          onClick={() => {
                            if (videoUrl) URL.revokeObjectURL(videoUrl);
                            setVideoUrl(null);
                            setGenerated(false);
                            setPhotos([]);
                            setStep(0);
                          }}
                        >
                          Criar outro vídeo
                        </Button>
                      </div>
                    )}

                    {!generated && (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-border/60 p-3 bg-muted/30 text-xs text-muted-foreground flex gap-2">
                          <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>
                            Cada vídeo consome créditos do add-on ativo. Starter libera vídeos curtos, Pro amplia duração e volume, e Enterprise desbloqueia 90s, 4K e operação premium.
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-1">
                          Ao gerar, você confirma que possui os direitos sobre as fotos enviadas e que elas não contêm pessoas identificáveis, documentos ou dados pessoais/sensíveis, conforme os{" "}
                          <a href="/termos" target="_blank" className="underline hover:text-accent transition-colors">
                            Termos de Uso
                          </a>.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VideoCreatorPage;
