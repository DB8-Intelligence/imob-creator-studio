/**
 * FormFlow — Fluxo de formulário direto para criação de criativos
 *
 * Etapas:
 * 1. Formato + quantidade + imagens
 * 2. Tema/template + descrição + copy
 * 3. Confirmação → geração
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Wand2,
  Loader2,
  Square,
  RectangleVertical,
  Monitor,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import {
  CREATIVE_CATALOG,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  type CatalogTemplate,
  type CreativeCategory,
} from "@/lib/creative-catalog";
import { getTemplateConfig } from "@/lib/template-engine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  CreativeFormat,
  CreativeJobInput,
  CopyData,
} from "@/types/creative-job";
import { FORMAT_LABELS, FORMAT_TO_RATIO } from "@/types/creative-job";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormFlowProps {
  onSubmit: (input: CreativeJobInput & { inputFiles?: File[] }) => Promise<void>;
  isSubmitting: boolean;
}

type FormStep = 1 | 2 | 3;

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

const FORMAT_ICONS: Record<CreativeFormat, React.ElementType> = {
  quadrado: Square,
  feed: RectangleVertical,
  stories: RectangleVertical,
  paisagem: Monitor,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function FormFlow({ onSubmit, isSubmitting }: FormFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>(1);

  // Step 1
  const [formats, setFormats] = useState<CreativeFormat[]>(["quadrado"]);
  const [variationCount, setVariationCount] = useState<1 | 5>(1);
  const [imageCount, setImageCount] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [logoFile, setLogoFile] = useState<UploadedFile | null>(null);
  const [useBrandIdentity, setUseBrandIdentity] = useState(false);
  const [autoRestore, setAutoRestore] = useState(true);

  // Step 2
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CreativeCategory | null>(null);
  const [description, setDescription] = useState("");
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [cta, setCta] = useState("");
  const [useAiCopy, setUseAiCopy] = useState(true);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // ── Format toggle ──────────────────────────────────────────────────────
  const toggleFormat = (f: CreativeFormat) => {
    setFormats((prev) =>
      prev.includes(f)
        ? prev.length > 1 ? prev.filter((x) => x !== f) : prev
        : prev.length < 3 ? [...prev, f] : prev
    );
  };

  // ── Image upload ───────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = imageCount - images.length;
    const toAdd = files.slice(0, remaining);
    const newItems: UploadedFile[] = toAdd.map((f) => ({
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoFile) URL.revokeObjectURL(logoFile.preview);
    setLogoFile({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  // ── Template filtering ────────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    return CREATIVE_CATALOG.filter((t) => {
      if (t.status === "coming_soon") return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      return true;
    });
  }, [categoryFilter]);

  // ── AI Copy generation ────────────────────────────────────────────────
  const handleGenerateCopy = async () => {
    if (!description.trim()) {
      toast({ title: "Descreva o que você vende primeiro", variant: "destructive" });
      return;
    }
    setIsGeneratingCopy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          description,
          template: selectedTemplate?.name ?? "post imobiliário",
          format: formats[0],
          style: selectedTemplate?.visual_style ?? "modern",
        },
      });
      if (error) throw error;
      if (data?.caption) {
        setTitulo(data.titulo ?? data.caption.split("\n")[0] ?? "");
        setSubtitulo(data.subtitulo ?? "");
        setCta(data.cta ?? "Saiba mais");
      }
      toast({ title: "Copy gerado pela IA!" });
    } catch {
      toast({ title: "Erro ao gerar copy", variant: "destructive" });
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────
  const canAdvance1 = formats.length > 0 && images.length > 0;
  const canAdvance2 = selectedTemplate !== null && description.trim().length > 0;
  const canSubmit = canAdvance2 && (useAiCopy || titulo.trim().length > 0);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const copy: CopyData | null = titulo.trim()
      ? { titulo, subtitulo, cta }
      : null;

    await onSubmit({
      mode: "form",
      template_id: selectedTemplate!.id,
      formats,
      variation_count: variationCount,
      image_count: imageCount,
      input_images: [],
      inputFiles: images.map((i) => i.file),
      logo_url: null,
      use_brand_identity: useBrandIdentity,
      style_id: selectedTemplate!.visual_style,
      user_description: description,
      generated_copy: useAiCopy ? copy : null,
      manual_copy: !useAiCopy ? copy : null,
      metadata: {
        logo_file: logoFile ? true : false,
        auto_restore: autoRestore,
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? "bg-[var(--ds-cyan)]" : "bg-[var(--ds-border)]"
            }`}
          />
        ))}
      </div>

      {/* ═══════ STEP 1: Formato + Imagens ═══════ */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ds-fg)]">Configuração do criativo</h2>
            <p className="text-sm text-[var(--ds-fg-muted)]">Formatos, quantidade e imagens</p>
          </div>

          {/* Formatos */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Formatos</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["quadrado", "feed", "stories", "paisagem"] as CreativeFormat[]).map((f) => {
                const Icon = FORMAT_ICONS[f];
                const selected = formats.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFormat(f)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      selected
                        ? "border-[var(--ds-cyan)] bg-[var(--ds-cyan)]/10 text-[var(--ds-cyan)]"
                        : "border-[var(--ds-border)] bg-[var(--ds-bg)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)]/40"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{FORMAT_LABELS[f]}</span>
                    <span className="text-[10px] opacity-70">{FORMAT_TO_RATIO[f]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quantidade */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Variações</Label>
            <div className="flex gap-2">
              {([1, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVariationCount(n)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    variationCount === n
                      ? "border-[var(--ds-cyan)] bg-[var(--ds-cyan)]/10 text-[var(--ds-cyan)]"
                      : "border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)]/40"
                  }`}
                >
                  {n} {n === 1 ? "versão" : "versões"}
                </button>
              ))}
            </div>
          </section>

          {/* Nº de imagens */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Imagens de entrada</Label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setImageCount(n)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    imageCount === n
                      ? "border-[var(--ds-cyan)] bg-[var(--ds-cyan)]/10 text-[var(--ds-cyan)]"
                      : "border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)]/40"
                  }`}
                >
                  {n} {n === 1 ? "imagem" : "imagens"}
                </button>
              ))}
            </div>
          </section>

          {/* Upload imagens */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Upload das imagens</Label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img) => (
                <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--ds-border)]">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < imageCount && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-[var(--ds-border)] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[var(--ds-cyan)]/50 transition-colors">
                  <Upload className="w-5 h-5 text-[var(--ds-fg-muted)]" />
                  <span className="text-[10px] text-[var(--ds-fg-muted)]">Imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    multiple={imageCount - images.length > 1}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Upload logo */}
          <section className="space-y-3">
            <Label className="text-sm font-medium">Logomarca (opcional)</Label>
            <div className="flex items-center gap-3">
              {logoFile ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--ds-border)]">
                  <img src={logoFile.preview} alt="Logo" className="w-full h-full object-contain bg-white" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(logoFile.preview);
                      setLogoFile(null);
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--ds-border)] flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-[var(--ds-cyan)]/50 transition-colors">
                  <ImageIcon className="w-4 h-4 text-[var(--ds-fg-muted)]" />
                  <span className="text-[9px] text-[var(--ds-fg-muted)]">Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
              <div className="flex items-center gap-2">
                <Switch checked={useBrandIdentity} onCheckedChange={setUseBrandIdentity} />
                <span className="text-xs text-[var(--ds-fg-muted)]">Usar identidade visual personalizada</span>
              </div>
            </div>
          </section>

          {/* Auto-restore toggle */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch checked={autoRestore} onCheckedChange={setAutoRestore} />
              <span className="text-sm text-[var(--ds-fg)]">Restaurar qualidade automaticamente</span>
            </div>
            <p className="text-[11px] text-[var(--ds-fg-muted)] ml-11">
              Remove ruido e melhora resolucao de fotos com qualidade baixa/media (denoise + upscale via Gemini).
            </p>
          </section>

          {/* Next */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setStep(2)}
              disabled={!canAdvance1}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2: Template + Copy ═══════ */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ds-fg)]">Tema e texto</h2>
            <p className="text-sm text-[var(--ds-fg-muted)]">Escolha o template e descreva o que vende</p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !categoryFilter
                  ? "bg-[var(--ds-cyan)]/20 text-[var(--ds-cyan)] border border-[var(--ds-cyan)]/40"
                  : "border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)]/30"
              }`}
            >
              Todos
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-[var(--ds-cyan)]/20 text-[var(--ds-cyan)] border border-[var(--ds-cyan)]/40"
                    : "border border-[var(--ds-border)] text-[var(--ds-fg-muted)] hover:border-[var(--ds-cyan)]/30"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredTemplates.map((t) => {
              const selected = selectedTemplate?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t)}
                  className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    selected
                      ? "border-[var(--ds-cyan)] bg-[var(--ds-cyan)]/5 ring-1 ring-[var(--ds-cyan)]"
                      : "border-[var(--ds-border)] bg-[var(--ds-bg)] hover:border-[var(--ds-cyan)]/40"
                  }`}
                >
                  {selected && (
                    <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-[var(--ds-cyan)]" />
                  )}
                  <div className={`w-full h-14 rounded-lg mb-2 bg-gradient-to-br ${t.preview_gradient}`} />
                  <p className="text-xs font-medium text-[var(--ds-fg)] truncate w-full">{t.name}</p>
                  <p className="text-[10px] text-[var(--ds-fg-muted)]">
                    {CATEGORY_LABELS[t.category]} · {t.aspect_ratio}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Descrição */}
          <section className="space-y-2">
            <Label className="text-sm font-medium">Descrição do que você vende</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Apartamento de 3 quartos no Jardim Europa, 120m², vista para o parque, acabamento premium..."
              className="bg-[var(--ds-bg)] border-[var(--ds-border)] text-[var(--ds-fg)] min-h-[80px]"
            />
          </section>

          {/* Copy toggle */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={useAiCopy} onCheckedChange={setUseAiCopy} />
              <span className="text-sm text-[var(--ds-fg)]">IA gera o copy automaticamente</span>
            </div>

            {!useAiCopy && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título principal"
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
              </div>
            )}

            {useAiCopy && description.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCopy}
                disabled={isGeneratingCopy}
                className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
              >
                {isGeneratingCopy ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                Pré-visualizar copy
              </Button>
            )}

            {titulo && useAiCopy && (
              <div className="p-3 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-bg)] text-sm space-y-1">
                <p className="font-medium text-[var(--ds-fg)]">{titulo}</p>
                {subtitulo && <p className="text-[var(--ds-fg-muted)]">{subtitulo}</p>}
                {cta && <p className="text-[var(--ds-cyan)] text-xs font-medium">{cta}</p>}
              </div>
            )}
          </section>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canAdvance2}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3: Confirmação ═══════ */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ds-fg)]">Confirmar e gerar</h2>
            <p className="text-sm text-[var(--ds-fg-muted)]">Revise as configurações antes de gerar</p>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-bg)]">
            <SummaryRow label="Formatos" value={formats.map((f) => FORMAT_LABELS[f]).join(", ")} />
            <SummaryRow label="Variações" value={`${variationCount}`} />
            <SummaryRow label="Imagens" value={`${images.length} arquivo(s)`} />
            <SummaryRow label="Template" value={selectedTemplate?.name ?? "—"} />
            <SummaryRow label="Descrição" value={description.slice(0, 100) + (description.length > 100 ? "..." : "")} />
            {titulo && <SummaryRow label="Título" value={titulo} />}
            {logoFile && <SummaryRow label="Logo" value="Incluído" />}
            <SummaryRow label="Identidade visual" value={useBrandIdentity ? "Sim" : "Padrão"} />
            <SummaryRow label="Restaurar qualidade" value={autoRestore ? "Sim (auto)" : "Nao"} />
          </div>

          {/* Preview images */}
          {images.length > 0 && (
            <div className="flex gap-2">
              {images.map((img) => (
                <div key={img.id} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--ds-border)]">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(2)}
              className="border-[var(--ds-border)] text-[var(--ds-fg-muted)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-[var(--ds-cyan)] text-black hover:bg-[var(--ds-cyan)]/90 min-w-[160px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar criativo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-[var(--ds-fg-muted)] shrink-0">{label}</span>
      <span className="text-xs text-[var(--ds-fg)] text-right">{value}</span>
    </div>
  );
}
