/**
 * SiteOnboardingWizard.tsx — Wizard de onboarding em 4 etapas para o Site Imobiliário.
 * Exibido automaticamente quando o site existe, publicado=false e updated_at === created_at.
 * Dialog 640px, não fecha ao clicar fora.
 */
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  PartyPopper,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSite, useUpdateSite, usePublishSite } from "@/hooks/useCorretorSite";
import { supabase } from "@/integrations/supabase/client";
import { TEMAS, type TemaCorr } from "@/types/site";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const THEME_GRADIENTS: Record<TemaCorr, string> = {
  brisa: "from-sky-400 to-cyan-300",
  urbano: "from-gray-800 to-orange-500",
  litoral: "from-[#002B5B] to-[#D4AF37]",
  "dark-premium": "from-[#1E3A8A] to-[#D4AF37]",
  nestland: "from-[#0f0f0f] to-[#b99755]",
  nexthm: "from-[#122122] to-[#2c686b]",
  ortiz: "from-[#05344a] to-[#25a5de]",
  quarter: "from-[#071c1f] to-[#FF5A3C]",
  rethouse: "from-[#1a2b6b] to-[#3454d1]",
};

const STEPS = [
  { title: "Escolha seu tema", description: "Selecione o visual do seu site" },
  { title: "Seus dados", description: "Informações essenciais de contato" },
  { title: "Endereço do site", description: "Escolha a URL do seu site" },
  { title: "Tudo pronto!", description: "Seu site está configurado" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SiteOnboardingWizard() {
  const { user, profile } = useAuth();
  const { data: site } = useSite();
  const { mutateAsync: updateSite, isPending: isSaving } = useUpdateSite();
  const { mutateAsync: publishSite, isPending: isPublishing } = usePublishSite();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Form state
  const [tema, setTema] = useState<TemaCorr>("brisa");
  const [nome, setNome] = useState("");
  const [creci, setCreci] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const slugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show wizard when site is brand new
  useEffect(() => {
    if (
      site &&
      !site.publicado &&
      site.created_at === site.updated_at
    ) {
      setOpen(true);
      setTema(site.tema || "brisa");

      // Pre-fill from profile if available
      setNome(site.nome_completo || profile?.full_name || "");
      setCreci(site.creci || "");
      setWhatsapp(site.whatsapp || "");
      setTelefone(site.telefone || "");
      setEmail(site.email_contato || user?.email || "");
    }
  }, [site, profile, user]);

  /* ---------------------------------------------------------------- */
  /*  Slug uniqueness check                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    if (slugCheckRef.current) clearTimeout(slugCheckRef.current);

    slugCheckRef.current = setTimeout(async () => {
      setCheckingSlug(true);
      const { data, error } = await supabase
        .from("corretor_sites")
        .select("id")
        .eq("slug", slug)
        .neq("user_id", user?.id ?? "")
        .maybeSingle();

      setSlugAvailable(!data && !error);
      setCheckingSlug(false);
    }, 500);

    return () => {
      if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
    };
  }, [slug, user?.id]);

  /* ---------------------------------------------------------------- */
  /*  Navigation between steps                                         */
  /* ---------------------------------------------------------------- */

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return Boolean(tema);
      case 1:
        return Boolean(nome && creci && whatsapp);
      case 2:
        return Boolean(slug && slug.length >= 3 && slugAvailable !== false);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const saveStepAndAdvance = async () => {
    try {
      switch (step) {
        case 0:
          await updateSite({ tema });
          break;
        case 1:
          await updateSite({
            nome_completo: nome,
            creci,
            whatsapp,
            telefone,
            email_contato: email,
          });
          break;
        case 2:
          await updateSite({ slug });
          break;
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      // Error handled by the hook's onError
    }
  };

  const handlePublishNow = async () => {
    try {
      await publishSite(true);
      setOpen(false);
    } catch {
      // Error handled by the hook's onError
    }
  };

  const handleCustomizeFirst = () => {
    setOpen(false);
  };

  /* ---------------------------------------------------------------- */
  /*  Step renderers                                                   */
  /* ---------------------------------------------------------------- */

  const renderStep0 = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TEMAS.map((t) => {
        const selected = tema === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTema(t.id)}
            className={`group relative rounded-xl border-2 p-3 text-left transition ${
              selected
                ? "border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]/30"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`mb-2 h-14 w-full rounded-lg bg-gradient-to-r ${THEME_GRADIENTS[t.id]}`}
            />
            <p className="text-sm font-semibold text-gray-800">{t.label}</p>
            <p className="text-xs text-gray-500">{t.preview}</p>
            {selected && (
              <CheckCircle2 className="absolute -right-2 -top-2 h-5 w-5 text-[#D4AF37]" />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wiz_nome">
          Nome Completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="wiz_nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome completo"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wiz_creci">
            CRECI <span className="text-red-500">*</span>
          </Label>
          <Input
            id="wiz_creci"
            value={creci}
            onChange={(e) => setCreci(e.target.value)}
            placeholder="12345-F"
          />
        </div>
        <div>
          <Label htmlFor="wiz_whatsapp">
            WhatsApp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="wiz_whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-0000"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wiz_telefone">Telefone</Label>
          <Input
            id="wiz_telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 3000-0000"
          />
        </div>
        <div>
          <Label htmlFor="wiz_email">E-mail</Label>
          <Input
            id="wiz_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@exemplo.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wiz_slug">Endereço do site</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            id="wiz_slug"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              )
            }
            placeholder="seu-nome"
            className="flex-1"
          />
          <span className="whitespace-nowrap text-sm text-gray-500">
            .nexoimobai.com.br
          </span>
        </div>
      </div>

      {/* Slug status */}
      {slug && slug.length >= 3 && (
        <div className="flex items-center gap-2 text-sm">
          {checkingSlug ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-gray-400">Verificando disponibilidade...</span>
            </>
          ) : slugAvailable ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Disponível!</span>
            </>
          ) : slugAvailable === false ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Este endereço já está em uso</span>
            </>
          ) : null}
        </div>
      )}

      {/* Live URL preview */}
      {slug && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-xs text-gray-500 mb-1">Seu site ficará em:</p>
          <p className="flex items-center gap-1.5 text-sm font-medium text-blue-600">
            <ExternalLink className="h-3.5 w-3.5" />
            https://{slug}.nexoimobai.com.br
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col items-center py-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <PartyPopper className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-800">
        Seu site está pronto!
      </h3>
      <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
        Configure mais detalhes ou publique agora para torná-lo visível.
      </p>

      {/* Preview card */}
      <div className="w-full max-w-sm rounded-xl border bg-white p-4 shadow-sm">
        <div
          className={`mb-3 h-20 w-full rounded-lg bg-gradient-to-r ${THEME_GRADIENTS[tema]}`}
        />
        <p className="text-sm font-semibold text-gray-800">{nome}</p>
        <p className="text-xs text-gray-500">CRECI {creci}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-blue-600">
          <ExternalLink className="h-3 w-3" />
          {slug}.nexoimobai.com.br
        </p>
      </div>

      <div className="mt-6 flex w-full gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCustomizeFirst}
        >
          Personalizar primeiro
        </Button>
        <Button
          className="flex-1 gap-1.5"
          onClick={handlePublishNow}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Publicar agora
        </Button>
      </div>
    </div>
  );

  const STEP_RENDERERS = [renderStep0, renderStep1, renderStep2, renderStep3];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Permite fechar só via X (DialogClose), não por click fora / ESC.
        // click-fora e ESC já são bloqueados pelos preventDefault abaixo;
        // quando chega aqui com nextOpen=false, foi pelo botão X.
        if (!nextOpen) setOpen(false);
      }}
    >
      <DialogContent
        className="max-w-[640px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{STEPS[step].title}</DialogTitle>
          <DialogDescription>{STEPS[step].description}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 rounded ${
                    i < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[260px] py-2">
          {STEP_RENDERERS[step]()}
        </div>

        {/* Navigation (not shown on final step — it has its own buttons) */}
        {step < 3 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                disabled={step === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-muted-foreground"
                title="Pular e configurar depois usando as abas"
              >
                Pular por agora
              </Button>
            </div>
            <Button
              size="sm"
              onClick={saveStepAndAdvance}
              disabled={!canAdvance() || isSaving}
              className="gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
