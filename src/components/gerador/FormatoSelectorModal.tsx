/**
 * FormatoSelectorModal.tsx — 3-state dialog for post generation:
 *   State 1: Format selection (Post, Story, Carrossel Post, Carrossel Story)
 *   State 2: Style selection (Dark Premium, Brisa, Minimalista, Litoral)
 *   State 3: Animated generation progress
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Smartphone,
  GalleryHorizontalEnd,
  GalleryVerticalEnd,
  Check,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PostFormato =
  | "post_instagram"
  | "story_instagram"
  | "carrossel_post"
  | "carrossel_story";

export type PostEstilo =
  | "dark_premium"
  | "brisa"
  | "minimalista"
  | "litoral";

interface FormatoCard {
  id: PostFormato;
  label: string;
  dimensions: string;
  icon: React.ElementType;
  carrossel: boolean;
}

interface EstiloCard {
  id: PostEstilo;
  label: string;
  preview: string; // tailwind bg classes
  accent: string;
}

interface GenerationStep {
  label: string;
  delayMs: number;
}

export interface FormatoSelectorModalProps {
  open: boolean;
  onClose: () => void;
  imovelId: string;
  onGenerated: (postId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const FORMATOS: FormatoCard[] = [
  {
    id: "post_instagram",
    label: "Post Instagram (quadrado)",
    dimensions: "1080 x 1080",
    icon: LayoutGrid,
    carrossel: false,
  },
  {
    id: "story_instagram",
    label: "Story Instagram",
    dimensions: "1080 x 1920",
    icon: Smartphone,
    carrossel: false,
  },
  {
    id: "carrossel_post",
    label: "Post Instagram carrossel",
    dimensions: "1080 x 1080",
    icon: GalleryHorizontalEnd,
    carrossel: true,
  },
  {
    id: "carrossel_story",
    label: "Story Instagram carrossel",
    dimensions: "1080 x 1920",
    icon: GalleryVerticalEnd,
    carrossel: true,
  },
];

const ESTILOS: EstiloCard[] = [
  {
    id: "dark_premium",
    label: "Dark Premium",
    preview: "bg-gradient-to-br from-[#0f172a] to-[#1e293b]",
    accent: "border-amber-400 text-amber-400",
  },
  {
    id: "brisa",
    label: "Brisa",
    preview: "bg-gradient-to-br from-sky-400 to-blue-600",
    accent: "border-white text-white",
  },
  {
    id: "minimalista",
    label: "Minimalista",
    preview: "bg-gradient-to-br from-white to-slate-100",
    accent: "border-[#0f172a] text-[#0f172a]",
  },
  {
    id: "litoral",
    label: "Litoral",
    preview: "bg-gradient-to-br from-amber-100 to-emerald-200",
    accent: "border-emerald-700 text-emerald-700",
  },
];

const GENERATION_STEPS: GenerationStep[] = [
  { label: "Analisando dados do imovel...", delayMs: 1000 },
  { label: "Criando legenda com IA...", delayMs: 3000 },
  { label: "Compondo o criativo visual...", delayMs: 6000 },
  { label: "Finalizando...", delayMs: 9000 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type ModalState = "formato" | "estilo" | "gerando";

export default function FormatoSelectorModal({
  open,
  onClose,
  imovelId,
  onGenerated,
}: FormatoSelectorModalProps) {
  const [state, setState] = useState<ModalState>("formato");
  const [selectedFormato, setSelectedFormato] = useState<PostFormato | null>(null);
  const [selectedEstilo, setSelectedEstilo] = useState<PostEstilo>("dark_premium");
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [cancelled, setCancelled] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* Reset when modal opens */
  useEffect(() => {
    if (open) {
      setState("formato");
      setSelectedFormato(null);
      setSelectedEstilo("dark_premium");
      setCompletedSteps(0);
      setCancelled(false);
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [open]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleFormatoSelect = (fmt: PostFormato) => {
    setSelectedFormato(fmt);
    setState("estilo");
  };

  const handleBackToFormato = () => {
    setState("formato");
  };

  const handleGenerate = useCallback(() => {
    setState("gerando");
    setCompletedSteps(0);
    setCancelled(false);

    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    GENERATION_STEPS.forEach((step, idx) => {
      const t = setTimeout(() => {
        setCompletedSteps((prev) => Math.max(prev, idx + 1));
      }, step.delayMs);
      timersRef.current.push(t);
    });

    // Completion — simulate a post ID after last step
    const completeTimer = setTimeout(() => {
      // Generate a fake post id; real impl will come from backend
      const postId = `post_${Date.now()}`;
      onGenerated(postId);
    }, 10_000);
    timersRef.current.push(completeTimer);
  }, [onGenerated]);

  const handleCancel = () => {
    setCancelled(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    onClose();
  };

  const preventClose = state === "gerando" && !cancelled;

  /* ── Render helpers ───────────────────────────────────────────── */

  const renderFormatoSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
          Crie posts para as redes sociais em segundos com IA
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
          Selecione o formato desejado para o criativo
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {FORMATOS.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <button
              key={fmt.id}
              onClick={() => handleFormatoSelect(fmt.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                "hover:border-[#0f172a] hover:shadow-md cursor-pointer",
                "border-border bg-card text-card-foreground"
              )}
            >
              {fmt.carrossel && (
                <span className="absolute top-2 right-2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5">
                  carrossel
                </span>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-6 w-6 text-[#0f172a]" />
              </div>
              <span className="text-sm font-semibold leading-tight text-center">
                {fmt.label}
              </span>
              <span className="text-xs text-muted-foreground">{fmt.dimensions}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderEstiloSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
          Escolha o estilo visual:
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
          O estilo define a paleta de cores e a identidade do criativo
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {ESTILOS.map((estilo) => (
          <button
            key={estilo.id}
            onClick={() => setSelectedEstilo(estilo.id)}
            className={cn(
              "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all cursor-pointer",
              selectedEstilo === estilo.id
                ? "border-[#0f172a] shadow-md ring-2 ring-[#0f172a]/20"
                : "border-border hover:border-[#0f172a]/50"
            )}
          >
            {/* Color preview swatch */}
            <div
              className={cn(
                "h-20 w-full rounded-lg flex items-center justify-center",
                estilo.preview
              )}
            >
              <span className={cn("text-xs font-bold uppercase tracking-wider", estilo.accent)}>
                Aa
              </span>
            </div>
            <span className="text-sm font-semibold">{estilo.label}</span>
            {selectedEstilo === estilo.id && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f172a]">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button variant="ghost" onClick={handleBackToFormato} className="flex-shrink-0">
          Voltar
        </Button>
        <Button
          onClick={handleGenerate}
          size="lg"
          className="flex-1 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-base"
        >
          Gerar post <Sparkles className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </>
  );

  const renderGenerating = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
          Gerando seu criativo...
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
          Seu post esta sendo criado. ~10-20 segundos.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 mt-6">
        {GENERATION_STEPS.map((step, idx) => {
          const done = completedSteps > idx;
          return (
            <div key={idx} className="flex items-center gap-3">
              {done ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <span
                className={cn(
                  "text-sm transition-colors",
                  done ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="ghost" onClick={handleCancel} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" /> Cancelar
        </Button>
      </div>
    </>
  );

  /* ── Main render ──────────────────────────────────────────────── */

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && preventClose) return; // block closing during generation
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-w-[600px] p-6"
        onPointerDownOutside={(e) => preventClose && e.preventDefault()}
        onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
      >
        {state === "formato" && renderFormatoSelection()}
        {state === "estilo" && renderEstiloSelection()}
        {state === "gerando" && renderGenerating()}
      </DialogContent>
    </Dialog>
  );
}
