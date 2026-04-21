/**
 * LPWizard.tsx — Modal em 4 steps para gerar LP de um imóvel.
 *
 * 1. Escolher template
 * 2. Escolher fotos (max 6)
 * 3. Customizar headline/subheadline/descrição (opcional)
 * 4. Publicar (HTML ativo) ou gerar PDF (+5 dias)
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LP_TEMPLATES,
  generateLPSlug,
  type LandingPage,
  type LPTemplate,
  type LPTipo,
} from "@/types/landing-page";
import type { SiteImovel } from "@/types/site";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  FileDown,
  Copy,
  ExternalLink,
  FileText,
} from "lucide-react";

const MAX_FOTOS = 6;

interface LPWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imovel: SiteImovel;
  userId: string;
  /**
   * Se presente, o wizard entra em MODO EDIÇÃO — pré-preenche tudo da LP
   * existente e, no submit, UPDATE em vez de INSERT. O tipo (html/pdf)
   * fica LOCKED (não pode trocar entre html e pdf ao editar).
   */
  initialLp?: LandingPage;
  /** Callback chamado após salvar com sucesso (listagem pode refresh). */
  onSaved?: () => void;
}

type Step = "template" | "fotos" | "texto" | "publicar" | "sucesso";

export default function LPWizard({
  open,
  onOpenChange,
  imovel,
  userId,
  initialLp,
  onSaved,
}: LPWizardProps) {
  const { toast } = useToast();
  const isEditMode = !!initialLp;

  const [step, setStep] = useState<Step>("template");
  const [template, setTemplate] = useState<LPTemplate>(
    (initialLp?.template as LPTemplate) || "ambar",
  );
  const [fotosSelecionadas, setFotosSelecionadas] = useState<string[]>(
    initialLp?.fotos_selecionadas && initialLp.fotos_selecionadas.length > 0
      ? initialLp.fotos_selecionadas
      : (imovel.fotos || []).slice(0, MAX_FOTOS),
  );
  const [headline, setHeadline] = useState(initialLp?.headline || imovel.titulo || "");
  const [subheadline, setSubheadline] = useState(initialLp?.subheadline || "");
  const [descricaoCustom, setDescricaoCustom] = useState(
    initialLp?.descricao_custom || "",
  );
  const [tipo, setTipo] = useState<LPTipo>(
    (initialLp?.tipo as LPTipo) || "html",
  );
  const [submitting, setSubmitting] = useState(false);

  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const fotosDisponiveis = imovel.fotos || [];

  function toggleFoto(url: string) {
    setFotosSelecionadas((prev) => {
      if (prev.includes(url)) return prev.filter((f) => f !== url);
      if (prev.length >= MAX_FOTOS) {
        toast({
          title: "Limite de fotos",
          description: `Selecione até ${MAX_FOTOS} fotos.`,
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, url];
    });
  }

  async function handlePublish() {
    setSubmitting(true);

    // Edit mode: mantem slug + expires_at originais; só atualiza campos.
    // Create mode: gera slug novo + expires_at pra PDFs.
    const slug = isEditMode
      ? initialLp!.slug
      : generateLPSlug(headline || imovel.titulo || "imovel");

    const { data: inserted, error } = isEditMode
      ? await supabase
          .from("landing_pages")
          .update({
            template,
            headline: headline || null,
            subheadline: subheadline || null,
            descricao_custom: descricaoCustom || null,
            fotos_selecionadas: fotosSelecionadas,
          })
          .eq("id", initialLp!.id)
          .select("id, slug")
          .single()
      : await supabase
          .from("landing_pages")
          .insert({
            user_id: userId,
            imovel_id: imovel.id,
            template,
            slug,
            tipo,
            headline: headline || null,
            subheadline: subheadline || null,
            descricao_custom: descricaoCustom || null,
            fotos_selecionadas: fotosSelecionadas,
            amenities_custom: [],
            ativo: true,
            expires_at:
              tipo === "pdf"
                ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                : null,
          })
          .select("id, slug")
          .single();

    setSubmitting(false);

    if (error || !inserted) {
      toast({
        title: isEditMode ? "Não foi possível salvar" : "Não foi possível criar a LP",
        description: error?.message || "Erro desconhecido",
        variant: "destructive",
      });
      return;
    }

    setCreatedSlug(slug);
    setStep("sucesso");
    onSaved?.();

    // Se for PDF, dispara a edge function pra gerar
    if (tipo === "pdf") {
      setPdfGenerating(true);
      setPdfError(null);
      try {
        const { data, error: invErr } = await supabase.functions.invoke(
          "generate-lp-pdf",
          { body: { lp_id: inserted.id } }
        );

        if (invErr) throw invErr;

        if (data?.error) {
          setPdfError(
            data.error === "pdf_provider_not_configured"
              ? "PDF ainda não habilitado. O administrador precisa configurar PDFSHIFT_API_KEY."
              : `Falha na geração: ${data.error}`
          );
        } else if (data?.pdf_url) {
          setPdfUrl(data.pdf_url);
        }
      } catch (e) {
        setPdfError(
          e instanceof Error ? e.message : "Falha ao gerar PDF"
        );
      } finally {
        setPdfGenerating(false);
      }
    }
  }

  function resetAndClose() {
    setStep("template");
    setCreatedSlug(null);
    setPdfUrl(null);
    setPdfGenerating(false);
    setPdfError(null);
    onOpenChange(false);
  }

  const publicUrl = createdSlug
    ? `${window.location.origin}/imovel/${createdSlug}`
    : "";

  function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({ title: "Link copiado!" });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "sucesso"
              ? isEditMode
                ? "Alterações salvas!"
                : "Landing Page criada!"
              : isEditMode
                ? "Editar Landing Page"
                : "Gerar Landing Page"}
          </DialogTitle>
          <DialogDescription>
            {step === "template" && "Escolha o modelo que mais combina com o imóvel"}
            {step === "fotos" && `Selecione até ${MAX_FOTOS} fotos do imóvel`}
            {step === "texto" && "Personalize o texto (opcional)"}
            {step === "publicar" &&
              (isEditMode
                ? "Confirme o tipo de publicação. Você não pode mudar entre HTML e PDF ao editar."
                : "Como você quer publicar a LP?")}
            {step === "sucesso" &&
              (isEditMode
                ? "Suas alterações foram salvas na LP existente."
                : "Sua LP está no ar e pronta pra compartilhar.")}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper visual */}
        {step !== "sucesso" && <StepIndicator current={step} />}

        <div className="py-4">
          {step === "template" && (
            <TemplateStep selected={template} onSelect={setTemplate} />
          )}

          {step === "fotos" && (
            <FotosStep
              fotosDisponiveis={fotosDisponiveis}
              selecionadas={fotosSelecionadas}
              onToggle={toggleFoto}
            />
          )}

          {step === "texto" && (
            <TextoStep
              headline={headline}
              subheadline={subheadline}
              descricao={descricaoCustom}
              onHeadline={setHeadline}
              onSubheadline={setSubheadline}
              onDescricao={setDescricaoCustom}
              imovelTitulo={imovel.titulo}
            />
          )}

          {step === "publicar" && (
            <PublicarStep selected={tipo} onSelect={setTipo} locked={isEditMode} />
          )}

          {step === "sucesso" && createdSlug && (
            <SucessoStep
              url={publicUrl}
              tipo={tipo}
              onCopy={copyLink}
              pdfUrl={pdfUrl}
              pdfGenerating={pdfGenerating}
              pdfError={pdfError}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          {step !== "sucesso" ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "template") resetAndClose();
                  else if (step === "fotos") setStep("template");
                  else if (step === "texto") setStep("fotos");
                  else if (step === "publicar") setStep("texto");
                }}
                disabled={submitting}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {step === "template" ? "Cancelar" : "Voltar"}
              </Button>

              {step !== "publicar" && (
                <Button
                  onClick={() => {
                    if (step === "template") setStep("fotos");
                    else if (step === "fotos") setStep("texto");
                    else if (step === "texto") setStep("publicar");
                  }}
                >
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              {step === "publicar" && (
                <Button onClick={handlePublish} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Salvando..." : "Publicando..."}
                    </>
                  ) : (
                    <>
                      {tipo === "html" ? (
                        <Globe className="mr-2 h-4 w-4" />
                      ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                      )}
                      {isEditMode
                        ? "Salvar alterações"
                        : tipo === "html"
                          ? "Publicar LP"
                          : "Gerar PDF"}
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <a href="/dashboard/minhas-lps">
                  <FileText className="mr-2 h-4 w-4" />
                  Minhas LPs
                </a>
              </Button>
              <Button onClick={resetAndClose}>Fechar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Sub-components ---------------- */

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "template", label: "Modelo" },
    { key: "fotos", label: "Fotos" },
    { key: "texto", label: "Texto" },
    { key: "publicar", label: "Publicar" },
  ];
  const activeIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i <= activeIdx
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < activeIdx ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={`text-xs font-medium ${
              i === activeIdx ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-px flex-1 ${
                i < activeIdx ? "bg-accent" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateStep({
  selected,
  onSelect,
}: {
  selected: LPTemplate;
  onSelect: (t: LPTemplate) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {LP_TEMPLATES.map((t) => {
        const active = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`group relative overflow-hidden rounded-lg border-2 text-left transition-all ${
              active
                ? "border-accent shadow-md"
                : "border-muted hover:border-muted-foreground/30"
            }`}
          >
            {/* Mini-preview com gradient do template */}
            <div
              className={`h-20 bg-gradient-to-br ${t.gradient} flex items-end p-3`}
            >
              <span className="rounded-sm bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-800">
                {t.tag}
              </span>
            </div>

            <div className="p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{t.label}</p>
                {active && (
                  <Check className="h-4 w-4 text-accent" />
                )}
              </div>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">
                {t.description}
              </p>
              {!available && (
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-accent/70">
                  Em breve
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FotosStep({
  fotosDisponiveis,
  selecionadas,
  onToggle,
}: {
  fotosDisponiveis: string[];
  selecionadas: string[];
  onToggle: (url: string) => void;
}) {
  if (fotosDisponiveis.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Este imóvel ainda não tem fotos cadastradas.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          A LP será criada com placeholders. Adicione fotos ao imóvel pra um
          resultado melhor.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        {selecionadas.length} / {MAX_FOTOS} fotos selecionadas
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {fotosDisponiveis.map((url, i) => {
          const active = selecionadas.includes(url);
          const order = selecionadas.indexOf(url) + 1;
          return (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => onToggle(url)}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                active
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              {active && (
                <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {order}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextoStep({
  headline,
  subheadline,
  descricao,
  onHeadline,
  onSubheadline,
  onDescricao,
  imovelTitulo,
}: {
  headline: string;
  subheadline: string;
  descricao: string;
  onHeadline: (v: string) => void;
  onSubheadline: (v: string) => void;
  onDescricao: (v: string) => void;
  imovelTitulo?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="lp-headline">Título principal (headline)</Label>
        <Input
          id="lp-headline"
          value={headline}
          onChange={(e) => onHeadline(e.target.value)}
          placeholder={imovelTitulo || "Nome do empreendimento"}
          maxLength={80}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Deixe em branco para usar o título do imóvel.
        </p>
      </div>

      <div>
        <Label htmlFor="lp-subheadline">Subtítulo (opcional)</Label>
        <Input
          id="lp-subheadline"
          value={subheadline}
          onChange={(e) => onSubheadline(e.target.value)}
          placeholder="Ex: Lançamento exclusivo"
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="lp-descricao">Descrição personalizada (opcional)</Label>
        <Textarea
          id="lp-descricao"
          value={descricao}
          onChange={(e) => onDescricao(e.target.value)}
          placeholder="Deixe em branco para usar a descrição do imóvel."
          rows={4}
          maxLength={500}
        />
      </div>
    </div>
  );
}

function PublicarStep({
  selected,
  onSelect,
  locked,
}: {
  selected: LPTipo;
  onSelect: (t: LPTipo) => void;
  /** Em edit mode, o tipo é locked (não pode mudar entre html e pdf). */
  locked?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <button
        type="button"
        onClick={() => !locked && onSelect("html")}
        disabled={locked && selected !== "html"}
        className={`rounded-lg border-2 p-6 text-left transition-all ${
          selected === "html"
            ? "border-accent bg-accent/5"
            : "border-muted hover:border-muted-foreground/30"
        } ${locked && selected !== "html" ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <Globe className="mb-3 h-8 w-8 text-accent" />
        <p className="mb-1 font-bold">Publicar LP online (HTML)</p>
        <p className="text-xs text-muted-foreground">
          URL pública que você pode compartilhar. Fica ativa pelo tempo que
          quiser.
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-accent">
          Limite: 5 LPs ativas por vez
        </p>
      </button>

      <button
        type="button"
        onClick={() => !locked && onSelect("pdf")}
        disabled={locked && selected !== "pdf"}
        className={`rounded-lg border-2 p-6 text-left transition-all ${
          selected === "pdf"
            ? "border-accent bg-accent/5"
            : "border-muted hover:border-muted-foreground/30"
        } ${locked && selected !== "pdf" ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <FileDown className="mb-3 h-8 w-8 text-accent" />
        <p className="mb-1 font-bold">Gerar PDF</p>
        <p className="text-xs text-muted-foreground">
          Baixe um PDF da LP para enviar por e-mail ou imprimir. Fica salvo na
          sua base por 5 dias.
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-accent">
          Limite: 5 PDFs armazenados
        </p>
      </button>
    </div>
  );
}

function SucessoStep({
  url,
  tipo,
  onCopy,
  pdfUrl,
  pdfGenerating,
  pdfError,
}: {
  url: string;
  tipo: LPTipo;
  onCopy: () => void;
  pdfUrl: string | null;
  pdfGenerating: boolean;
  pdfError: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-900">
          {tipo === "html"
            ? "Sua LP está no ar!"
            : pdfGenerating
              ? "Gerando PDF..."
              : pdfUrl
                ? "PDF pronto pra download!"
                : "LP criada. Processando PDF..."}
        </p>
        <p className="mt-1 text-xs text-emerald-800/80">
          {tipo === "html"
            ? "Compartilhe o link abaixo com seus leads."
            : "O PDF fica na sua base por 5 dias."}
        </p>
      </div>

      <div>
        <Label>URL pública</Label>
        <div className="mt-1 flex gap-2">
          <Input value={url} readOnly className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" asChild>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir landing page em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* PDF state */}
      {tipo === "pdf" && (
        <div>
          <Label>Arquivo PDF</Label>
          {pdfGenerating && (
            <div className="mt-1 flex items-center gap-2 rounded-md border border-muted bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando PDF a partir da página pública…
            </div>
          )}

          {pdfUrl && !pdfGenerating && (
            <div className="mt-1 flex gap-2">
              <Button type="button" asChild className="flex-1">
                <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                  <FileDown className="mr-2 h-4 w-4" />
                  Baixar PDF
                </a>
              </Button>
            </div>
          )}

          {pdfError && !pdfGenerating && (
            <div className="mt-1 space-y-2">
              <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                {pdfError}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir LP para imprimir como PDF"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir LP e usar "Imprimir → Salvar como PDF"
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
