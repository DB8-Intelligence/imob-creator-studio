/**
 * AssistantFlow — Fluxo de assistente IA guiado para criação de criativos
 *
 * State machine: welcome → upload → theme → description → copy → confirm → generating → done
 *
 * A IA conduz o usuário passo a passo com mensagens, chips clicáveis e previews.
 * Ao confirmar, envia para a fila de geração (pipeline invisível).
 * O resultado NÃO aparece na tela — vai para "Minhas Criações".
 */
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Bot,
  User,
  Upload,
  X,
  Wand2,
  Loader2,
  CheckCircle2,
  PenLine,
  RefreshCw,
  ArrowRight,
  Library,
  Sparkles,
} from "lucide-react";
import {
  CREATIVE_CATALOG,
  CATEGORY_LABELS,
  type CatalogTemplate,
  type CreativeCategory,
} from "@/lib/creative-catalog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  AssistantStep,
  AssistantMessage,
  CreativeJobInput,
  CopyData,
  CreativeFormat,
} from "@/types/creative-job";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AssistantFlowProps {
  onSubmit: (input: CreativeJobInput & { inputFiles?: File[] }) => Promise<void>;
  isSubmitting: boolean;
  /** ID do job criado (para acompanhar status) */
  activeJobId: string | null;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

// ─── Theme chips ─────────────────────────────────────────────────────────────

const THEME_CATEGORIES: { label: string; category: CreativeCategory; emoji: string }[] = [
  { label: "Post Feed", category: "feed", emoji: "📸" },
  { label: "Story", category: "story", emoji: "📱" },
  { label: "Luxo", category: "luxo", emoji: "✨" },
  { label: "Popular", category: "popular", emoji: "🏘️" },
  { label: "Banner Ads", category: "banner", emoji: "🎯" },
  { label: "Institucional", category: "institucional", emoji: "🏢" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AssistantFlow({ onSubmit, isSubmitting, activeJobId }: AssistantFlowProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State machine
  const [step, setStep] = useState<AssistantStep>("welcome");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  // Collected data
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null);
  const [description, setDescription] = useState("");
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [cta, setCta] = useState("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  // ── Message helpers ────────────────────────────────────────────────────
  const addMessage = (role: "assistant" | "user", content: string, extra?: Partial<AssistantMessage>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now(),
        ...extra,
      },
    ]);
  };

  // ── Initialize welcome ─────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(
        "assistant",
        "Olá! 👋 Sou sua assistente de criação. Vou te guiar passo a passo para criar um criativo profissional.\n\nVamos começar? Envie as fotos do imóvel que você quer divulgar."
      );
      setStep("upload");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Templates for selected category ────────────────────────────────────
  const categoryTemplates = useMemo(() => {
    if (!selectedCategory) return [];
    return CREATIVE_CATALOG.filter(
      (t) => t.category === selectedCategory && t.status !== "coming_soon"
    );
  }, [selectedCategory]);

  // ── Step handlers ──────────────────────────────────────────────────────

  const handleImagesUploaded = () => {
    addMessage("user", `${images.length} imagem(ns) enviada(s)`);
    addMessage(
      "assistant",
      "Ótimas fotos! Agora escolha o tipo de criativo que quer criar:",
      {
        chips: THEME_CATEGORIES.map((c) => ({
          label: `${c.emoji} ${c.label}`,
          value: c.category,
        })),
      }
    );
    setStep("theme");
  };

  const handleCategorySelect = (category: CreativeCategory) => {
    setSelectedCategory(category);
    addMessage("user", `${CATEGORY_LABELS[category]}`);

    const templates = CREATIVE_CATALOG.filter(
      (t) => t.category === category && t.status !== "coming_soon"
    );

    if (templates.length > 0) {
      addMessage(
        "assistant",
        `Encontrei ${templates.length} templates para ${CATEGORY_LABELS[category]}. Escolha um:`,
        {
          chips: templates.map((t) => ({ label: t.name, value: t.id })),
        }
      );
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const tpl = CREATIVE_CATALOG.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplate(tpl);
    addMessage("user", tpl.name);
    addMessage(
      "assistant",
      `Excelente escolha! 🎨 Template "${tpl.name}" selecionado.\n\nAgora me conte: o que você está vendendo? Descreva o imóvel, seus diferenciais, localização, etc.`
    );
    setStep("description");
  };

  const handleDescriptionSubmit = () => {
    if (!descriptionInput.trim()) return;
    setDescription(descriptionInput.trim());
    addMessage("user", descriptionInput.trim());
    setDescriptionInput("");
    addMessage("assistant", "Perfeito! Vou gerar um texto profissional para o seu criativo. Um momento...");
    setStep("copy");
    generateCopy(descriptionInput.trim());
  };

  const generateCopy = async (desc: string) => {
    setIsGeneratingCopy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          description: desc,
          template: selectedTemplate?.name ?? "post imobiliário",
          format: "feed",
          style: selectedTemplate?.visual_style ?? "modern",
        },
      });
      if (error) throw error;

      const t = data?.titulo ?? data?.caption?.split("\n")[0] ?? "Imóvel em destaque";
      const s = data?.subtitulo ?? "";
      const c = data?.cta ?? "Saiba mais";
      setTitulo(t);
      setSubtitulo(s);
      setCta(c);

      addMessage("assistant", "Aqui está o texto que criei para você:", {
        preview: {
          type: "copy",
          data: { titulo: t, subtitulo: s, cta: c },
        },
      });
      setStep("confirm");
    } catch {
      addMessage("assistant", "Não consegui gerar o texto agora. Você pode digitar manualmente.");
      setStep("confirm");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleEditCopy = () => {
    addMessage("user", "Quero editar o texto");
    setStep("copy");
  };

  const handleRegenerateCopy = () => {
    addMessage("user", "Gerar outra versão");
    addMessage("assistant", "Gerando uma nova versão do texto...");
    generateCopy(description);
  };

  const handleConfirm = async () => {
    addMessage("user", "Gostei, criar o criativo!");
    addMessage("assistant", "Enviando para geração... Seu criativo aparecerá em **Minhas Criações** quando estiver pronto. ✨");
    setStep("generating");

    const copy: CopyData = { titulo, subtitulo, cta };

    try {
      await onSubmit({
        mode: "assistant",
        template_id: selectedTemplate?.id ?? "feed-modern-clean",
        formats: ["quadrado"] as CreativeFormat[],
        variation_count: 1,
        image_count: images.length as 1 | 2 | 3,
        input_images: [],
        inputFiles: images.map((i) => i.file),
        logo_url: null,
        use_brand_identity: false,
        style_id: selectedTemplate?.visual_style ?? null,
        user_description: description,
        generated_copy: copy,
        manual_copy: null,
      });

      addMessage(
        "assistant",
        "Pronto! Seu criativo foi enviado para a fila de geração. 🎉\n\nQuando ficar pronto, estará disponível em **Minhas Criações**."
      );
      setStep("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tente novamente.";
      addMessage("assistant", `Ops, houve um erro: ${msg}`);
      setStep("confirm");
    }
  };

  // ── Image upload ───────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: UploadedFile[] = files.slice(0, 3 - images.length).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[500px]">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[var(--ds-cyan)]/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[var(--ds-cyan)]" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-[var(--ds-surface)] border border-[var(--ds-border)] text-[var(--ds-fg)]"
                  : "bg-[var(--ds-cyan)]/15 text-[var(--ds-fg)]"
              }`}
            >
              {msg.content}

              {/* Chips */}
              {msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.chips.map((chip) => (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => {
                        if (step === "theme" && !selectedTemplate) {
                          // First click = category
                          if (!selectedCategory) {
                            handleCategorySelect(chip.value as CreativeCategory);
                          } else {
                            handleTemplateSelect(chip.value);
                          }
                        }
                      }}
                      disabled={
                        (step === "theme" && selectedTemplate !== null) ||
                        step === "generating" ||
                        step === "done"
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--ds-cyan)]/40 text-[var(--ds-cyan)] hover:bg-[var(--ds-cyan)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Copy preview */}
              {msg.preview?.type === "copy" && (
                <div className="mt-3 p-3 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-bg)] space-y-1">
                  <p className="font-medium text-[var(--ds-fg)]">
                    {(msg.preview.data as Record<string, string>).titulo}
                  </p>
                  {(msg.preview.data as Record<string, string>).subtitulo && (
                    <p className="text-[var(--ds-fg-muted)] text-xs">
                      {(msg.preview.data as Record<string, string>).subtitulo}
                    </p>
                  )}
                  {(msg.preview.data as Record<string, string>).cta && (
                    <p className="text-[var(--ds-cyan)] text-xs font-medium">
                      {(msg.preview.data as Record<string, string>).cta}
                    </p>
                  )}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[var(--ds-fg)]/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[var(--ds-fg-muted)]" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isGeneratingCopy && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--ds-cyan)]/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[var(--ds-cyan)]" />
            </div>
            <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--ds-cyan)]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--ds-border)] p-4 space-y-3">
        {/* Upload step */}
        {step === "upload" && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {images.map((img) => (
                <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--ds-border)]">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--ds-border)] flex items-center justify-center cursor-pointer hover:border-[var(--ds-cyan)]/50">
                  <Upload className="w-5 h-5 text-[var(--ds-fg-muted)]" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    multiple
                  />
                </label>
              )}
            </div>
            {images.length > 0 && (
              <Button
                onClick={handleImagesUploaded}
                className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
              >
                Continuar com {images.length} imagem(ns)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Description step */}
        {step === "description" && (
          <div className="flex gap-2">
            <Textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Descreva o imóvel, diferenciais, localização..."
              className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)] min-h-[60px] flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleDescriptionSubmit();
                }
              }}
            />
            <Button
              onClick={handleDescriptionSubmit}
              disabled={!descriptionInput.trim()}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90 self-end"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Copy editing step */}
        {step === "copy" && !isGeneratingCopy && (
          <div className="space-y-3">
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título"
              className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)]"
            />
            <Input
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Subtítulo (opcional)"
              className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)]"
            />
            <Input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="CTA — Ex: Agende sua visita"
              className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)]"
            />
            <Button
              onClick={() => {
                addMessage("user", `Título: ${titulo}`);
                addMessage("assistant", "Texto atualizado! Pronto para gerar?", {
                  preview: { type: "copy", data: { titulo, subtitulo, cta } },
                });
                setStep("confirm");
              }}
              disabled={!titulo.trim()}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Salvar texto
            </Button>
          </div>
        )}

        {/* Confirm step */}
        {step === "confirm" && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Gostei do texto, criar!
            </Button>
            <Button
              variant="outline"
              onClick={handleEditCopy}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
            >
              <PenLine className="w-4 h-4 mr-2" />
              Editar manualmente
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerateCopy}
              disabled={isGeneratingCopy}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Criar outra versão
            </Button>
          </div>
        )}

        {/* Generating step */}
        {step === "generating" && (
          <div className="flex items-center gap-3 text-sm text-[var(--ds-fg-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--ds-cyan)]" />
            Gerando seu criativo...
          </div>
        )}

        {/* Done step */}
        {step === "done" && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate("/library")}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              <Library className="w-4 h-4 mr-2" />
              Abrir Minhas Criações
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
                setMessages([]);
                setImages([]);
                setSelectedCategory(null);
                setSelectedTemplate(null);
                setDescription("");
                setTitulo("");
                setSubtitulo("");
                setCta("");
                addMessage(
                  "assistant",
                  "Vamos criar outro? Envie as fotos do próximo imóvel."
                );
              }}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Criar outro criativo
            </Button>
          </div>
        )}

        {/* Theme step — no input, user clicks chips in messages */}
        {step === "theme" && (
          <p className="text-xs text-[var(--ds-fg-muted)]">
            👆 Escolha um tema clicando nas opções acima
          </p>
        )}
      </div>
    </div>
  );
}
