/**
 * BugReporterWidget — botão flutuante global pra reportar bugs in-app.
 *
 * Gate: apenas super_admin vê o widget (restringe a staff DB8 durante
 * fase de testes internos). Quando o produto for pra beta externo, dá pra
 * remover o gate ou trocar por feature flag.
 *
 * Usa o helper submitBug (lib/bugReporter) que captura screenshot do
 * viewport via html-to-image, upload no bucket bug-screenshots, e grava
 * em bug_reports com context completo.
 */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bug, Check, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { getApiLog } from "@/lib/apiLogBuffer";
import { submitBug } from "@/lib/bugReporter";
import {
  SEVERITY_LABELS,
  type BugSeverity,
} from "@/types/bug-report";

export default function BugReporterWidget() {
  const { user } = useAuth();
  const { data: isAdmin = false } = useIsSuperAdmin();
  const location = useLocation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("bug");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Gate: só super_admin vê o widget
  if (!user || !isAdmin) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast({
        title: "Título curto demais",
        description: "Descreva em pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (title.length > 200 || description.length > 4000) {
      toast({
        title: "Texto muito longo",
        description: "Título até 200 caracteres, descrição até 4000.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const result = await submitBug({
      userId: user!.id,
      title,
      description,
      severity,
    });

    setSubmitting(false);

    if (!result.success) {
      toast({
        title: "Não foi possível enviar",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => {
        setSubmitted(false);
        setTitle("");
        setDescription("");
        setSeverity("bug");
      }, 300);
    }, 1400);
  }

  return (
    <>
      {/* Botão flutuante — data-bug-widget marca pra ser excluído do screenshot */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Reportar bug"
        data-bug-widget="true"
        className="fixed bottom-4 right-4 z-50 flex h-12 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Reportar bug</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" data-bug-widget="true">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-amber-500" />
              Reportar bug ou sugestão
            </DialogTitle>
            <DialogDescription>
              Descreva o que aconteceu. Screenshot do viewport, URL, últimas
              chamadas de rede e navegador vão junto automaticamente.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-semibold text-foreground">Recebido!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Valeu por ajudar a melhorar o sistema.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Severidade
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(SEVERITY_LABELS) as BugSeverity[]).map((sev) => {
                    const meta = SEVERITY_LABELS[sev];
                    const active = severity === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 text-xs font-semibold transition ${
                          active
                            ? meta.color
                            : "border-muted bg-transparent text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <span className="text-lg">{meta.emoji}</span>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="bug-title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bug-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Botão Salvar não funciona em Firefox"
                  maxLength={200}
                  required
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="bug-description">Descrição (opcional)</Label>
                <Textarea
                  id="bug-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Como reproduzir, o que esperava, etc."
                  rows={4}
                  maxLength={4000}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {description.length}/4000
                </p>
              </div>

              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                📸 Será enviado: screenshot do viewport, URL ({location.pathname}),
                navegador, tela e últimas{" "}
                {getApiLog().length} chamadas de rede.
              </p>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
