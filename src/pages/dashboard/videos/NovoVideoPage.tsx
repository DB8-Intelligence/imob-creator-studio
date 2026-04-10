import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { VideoStyle, VideoFormat } from "@/types/video";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Upload,
  X,
  Film,
  Home,
  Loader2,
  ImageIcon,
  Music,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────────

type Duration = 15 | 30 | 60;
type Format = "reels" | "feed";
type MusicMood = "calmo" | "inspirador" | "energetico" | "elegante";

interface PropertyCard {
  id: string;
  reference: string;
  title?: string;
  type?: string | null;
  address?: Record<string, string>;
  photos?: string[];
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

// ── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  "Selecionar Imovel",
  "Estilo do Video",
  "Configuracoes",
  "Confirmar e Gerar",
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "text-white"
                    : "bg-gray-100 text-gray-400"
                )}
                style={active ? { backgroundColor: "#002B5B" } : undefined}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium text-center max-w-[80px] leading-tight",
                  active ? "text-[#002B5B]" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 rounded-full mb-5",
                  i < current ? "bg-green-400" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Style cards config ──────────────────────────────────────────────────────

const STYLE_OPTIONS: {
  id: VideoStyle;
  name: string;
  description: string;
  gradient: string;
}[] = [
  {
    id: "cinematic",
    name: "Cinematic",
    description:
      "Movimentos suaves de camera, transicoes elegantes. Ideal para imoveis de alto padrao.",
    gradient: "linear-gradient(135deg, #002B5B, #004E9A)",
  },
  {
    id: "moderno",
    name: "Moderno",
    description:
      "Ritmo dinamico, cortes rapidos e transicoes contemporaneas. Perfeito para apartamentos.",
    gradient: "linear-gradient(135deg, #4B5563, #1F2937)",
  },
  {
    id: "luxury",
    name: "Luxury",
    description:
      "Tons dourados, motion suave e detalhes refinados. Para imoveis exclusivos.",
    gradient: "linear-gradient(135deg, #FFD700, #B8960C)",
  },
];

// ── Music mood options ──────────────────────────────────────────────────────

const MUSIC_OPTIONS: { id: MusicMood; label: string; icon: typeof Music }[] = [
  { id: "calmo", label: "Calmo", icon: Music },
  { id: "inspirador", label: "Inspirador", icon: Sparkles },
  { id: "energetico", label: "Energetico", icon: Clock },
  { id: "elegante", label: "Elegante", icon: Film },
];

// ── Main Page ───────────────────────────────────────────────────────────────

const NovoVideoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const { toast } = useToast();

  // Wizard state
  const [step, setStep] = useState(0);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [useManualUpload, setUseManualUpload] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [style, setStyle] = useState<VideoStyle | null>(null);
  const [duration, setDuration] = useState<Duration>(30);
  const [format, setFormat] = useState<Format>("reels");
  const [musicMood, setMusicMood] = useState<MusicMood>("calmo");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading: propsLoading } = useQuery<
    PropertyCard[]
  >({
    queryKey: ["dashboard-video-properties", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, reference, type, address, photos")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as any[]) ?? [];
    },
    enabled: !!workspaceId && !!user,
  });

  // Photo upload handler
  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    },
    []
  );

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Can proceed to next step?
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return (
          selectedPropertyId !== null ||
          (useManualUpload && uploadedPhotos.length > 0)
        );
      case 1:
        return style !== null;
      case 2:
        return true;
      case 3:
        return !isGenerating;
      default:
        return false;
    }
  };

  // Generate video
  const handleGenerate = async () => {
    if (!workspaceId || !style) return;

    setIsGenerating(true);

    try {
      const photosCount = useManualUpload
        ? uploadedPhotos.length
        : properties.find((p) => p.id === selectedPropertyId)?.photos?.length ??
          0;

      const { error } = await supabase.from("video_jobs").insert({
        workspace_id: workspaceId,
        property_id: selectedPropertyId,
        title: useManualUpload
          ? "Video manual"
          : properties.find((p) => p.id === selectedPropertyId)?.reference ??
            "Novo video",
        style,
        format: format as VideoFormat,
        duration_seconds: duration,
        resolution: "1080p",
        status: "queued",
        photos_count: photosCount,
        credits_used: 1,
        metadata: {
          music_mood: musicMood,
          manual_upload: useManualUpload,
        },
        created_by: user?.id ?? null,
      });

      if (error) throw error;

      toast({
        title: "Video adicionado a fila!",
        description: "Seu video esta sendo processado.",
      });
      navigate("/dashboard/videos");
    } catch (err: any) {
      toast({
        title: "Erro ao criar video",
        description: err.message ?? "Tente novamente.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  // Selected property data
  const selectedProperty = properties.find(
    (p) => p.id === selectedPropertyId
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div
        className="max-w-3xl mx-auto"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard/videos")}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#002B5B] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para videos
        </button>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "#002B5B" }}
        >
          Criar Novo Video
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Siga os passos para gerar seu video imobiliario com IA.
        </p>

        <StepIndicator current={step} />

        {/* ── Step 1: Selecionar Imovel ──────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <h2
              className="text-lg font-semibold"
              style={{ color: "#002B5B" }}
            >
              Selecionar Imovel
            </h2>

            {/* Manual upload toggle */}
            <button
              onClick={() => {
                setUseManualUpload(!useManualUpload);
                setSelectedPropertyId(null);
              }}
              className={cn(
                "w-full rounded-xl border-2 border-dashed p-4 text-sm font-medium transition-colors text-center",
                useManualUpload
                  ? "border-[#002B5B] bg-[#002B5B]/5 text-[#002B5B]"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" />
              Upload manual de fotos
            </button>

            {/* Manual upload area */}
            {useManualUpload && (
              <div className="space-y-4">
                <div
                  className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-[#002B5B]/40 transition-colors"
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Arraste fotos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG ou WebP
                  </p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt=""
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Property grid */}
            {!useManualUpload && (
              <div>
                {propsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                    <Home className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Nenhum imovel ativo encontrado.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Use o upload manual de fotos acima.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {properties.map((prop) => {
                      const isSelected =
                        selectedPropertyId === prop.id;
                      const coverPhoto =
                        prop.photos && prop.photos.length > 0
                          ? prop.photos[0]
                          : null;
                      return (
                        <button
                          key={prop.id}
                          onClick={() =>
                            setSelectedPropertyId(
                              isSelected ? null : prop.id
                            )
                          }
                          className={cn(
                            "rounded-xl border-2 overflow-hidden text-left transition-all",
                            isSelected
                              ? "border-[#002B5B] shadow-md"
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div
                            className="h-20 bg-gray-100 flex items-center justify-center"
                            style={
                              coverPhoto
                                ? {
                                    background: `url(${coverPhoto}) center/cover no-repeat`,
                                  }
                                : undefined
                            }
                          >
                            {!coverPhoto && (
                              <Home className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-gray-700 truncate">
                              {prop.reference ?? prop.id.slice(0, 8)}
                            </p>
                            {prop.type && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {prop.type}
                              </p>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#002B5B] mt-1" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Estilo do Video ────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <h2
              className="text-lg font-semibold"
              style={{ color: "#002B5B" }}
            >
              Estilo do Video
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STYLE_OPTIONS.map((opt) => {
                const selected = style === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={cn(
                      "rounded-xl border-2 overflow-hidden text-left transition-all",
                      selected
                        ? "border-[#002B5B] shadow-lg"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    )}
                  >
                    <div
                      className="h-28 flex items-end p-4"
                      style={{ background: opt.gradient }}
                    >
                      <span className="text-white font-bold text-lg drop-shadow-sm">
                        {opt.name}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {opt.description}
                      </p>
                      {selected && (
                        <CheckCircle2 className="w-5 h-5 text-[#002B5B] mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Configuracoes ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-8">
            <h2
              className="text-lg font-semibold"
              style={{ color: "#002B5B" }}
            >
              Configuracoes
            </h2>

            {/* Duration */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Duracao
              </p>
              <div className="flex gap-3">
                {([15, 30, 60] as Duration[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "flex-1 rounded-xl border-2 py-3 text-center font-semibold text-sm transition-all",
                      duration === d
                        ? "border-[#002B5B] bg-[#002B5B] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Formato
              </p>
              <div className="flex gap-3">
                {(
                  [
                    { id: "reels" as Format, label: "Reels 9:16" },
                    { id: "feed" as Format, label: "Feed 1:1" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "flex-1 rounded-xl border-2 py-3 text-center font-semibold text-sm transition-all",
                      format === f.id
                        ? "border-[#002B5B] bg-[#002B5B] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Music mood */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Clima da musica
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MUSIC_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMusicMood(m.id)}
                    className={cn(
                      "rounded-xl border-2 py-3 px-2 text-center text-sm font-medium transition-all",
                      musicMood === m.id
                        ? "border-[#002B5B] bg-[#002B5B] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <m.icon className="w-4 h-4 mx-auto mb-1" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirmar e Gerar ──────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2
              className="text-lg font-semibold"
              style={{ color: "#002B5B" }}
            >
              Confirmar e Gerar
            </h2>

            {!isGenerating ? (
              <>
                <Card className="bg-white border-gray-100">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Imovel</p>
                        <p className="font-medium text-gray-700">
                          {useManualUpload
                            ? `Upload manual (${uploadedPhotos.length} fotos)`
                            : selectedProperty?.reference ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Estilo</p>
                        <p className="font-medium text-gray-700">
                          {STYLE_OPTIONS.find((s) => s.id === style)?.name ??
                            "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Duracao</p>
                        <p className="font-medium text-gray-700">
                          {duration} segundos
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Formato</p>
                        <p className="font-medium text-gray-700">
                          {format === "reels" ? "Reels 9:16" : "Feed 1:1"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">
                          Clima da musica
                        </p>
                        <p className="font-medium text-gray-700 capitalize">
                          {musicMood}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleGenerate}
                  className="w-full h-12 text-white font-bold text-base"
                  style={{ backgroundColor: "#002B5B" }}
                  size="lg"
                >
                  <Film className="w-5 h-5 mr-2" />
                  Gerar Video
                </Button>
              </>
            ) : (
              <div className="text-center py-12 space-y-5">
                <Loader2
                  className="w-12 h-12 mx-auto animate-spin"
                  style={{ color: "#002B5B" }}
                />
                <div>
                  <p
                    className="font-semibold text-lg"
                    style={{ color: "#002B5B" }}
                  >
                    Processando seu video...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Isso pode levar alguns minutos. Voce pode sair desta pagina.
                  </p>
                </div>
                {/* Indeterminate progress bar */}
                <div className="w-full max-w-sm mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]"
                    style={{
                      backgroundColor: "#002B5B",
                      width: "40%",
                      animation:
                        "indeterminate 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <style>{`
                  @keyframes indeterminate {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(150%); }
                    100% { transform: translateX(-100%); }
                  }
                `}</style>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation buttons ─────────────────────────────────────────── */}
        {!isGenerating && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => (step > 0 ? setStep(step - 1) : navigate("/dashboard/videos"))}
              className="text-gray-600"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="text-white font-semibold disabled:opacity-40"
                style={{ backgroundColor: "#002B5B" }}
              >
                Proximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NovoVideoPage;
