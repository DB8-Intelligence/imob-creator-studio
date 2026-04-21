/**
 * GlobalErrorBoundary — intercepta crashes React e:
 *  1. Mostra tela de erro amigável (sem stack trace cru)
 *  2. Envia automaticamente um bug_report com severity='blocker' e
 *     stack + componente que crashou no context
 *  3. Oferece botão "Tentar novamente" (reseta o boundary)
 *
 * Só reporta automaticamente se houver usuário logado (precisa user_id
 * pro RLS). Anônimo vê a tela mas sem envio.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { submitBug } from "@/lib/bugReporter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  reportSent: boolean;
  reporting: boolean;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    reportSent: false,
    reporting: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GlobalErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo, reporting: true });

    // Tenta enviar report automático. Ignora silenciosamente se falhar
    // (anônimo, sem rede, etc) — o importante é mostrar a tela de erro.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        this.setState({ reporting: false });
        return;
      }

      const title = `Crash: ${error.name}: ${(error.message || "").slice(0, 120)}`;
      const result = await submitBug({
        userId: user.id,
        title,
        description:
          `App crashou automaticamente.\n\n` +
          `Erro: ${error.message}\n\n` +
          `Componente/stack:\n${errorInfo.componentStack?.slice(0, 1500) || "(sem stack)"}`,
        severity: "blocker",
        extraContext: {
          error_stack: error.stack?.slice(0, 4000),
          component_stack: errorInfo.componentStack?.slice(0, 4000),
        },
      });

      this.setState({ reporting: false, reportSent: result.success });
    } catch (e) {
      console.warn("auto_bug_report_failed", e);
      this.setState({ reporting: false });
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      reportSent: false,
      reporting: false,
    });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          <h1 className="mb-2 text-xl font-bold text-foreground">
            Algo deu errado
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            O app teve um erro inesperado nessa tela.
            {this.state.reporting
              ? " Estou enviando um relatório automaticamente..."
              : this.state.reportSent
                ? " Um relatório foi enviado automaticamente pra equipe técnica."
                : ""}
          </p>

          {/* Mensagem técnica resumida */}
          <div className="mb-5 rounded-md bg-muted/30 p-3 font-mono text-[11px] text-muted-foreground">
            {this.state.error?.name}: {this.state.error?.message}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </Button>
            <Button onClick={this.reset} className="flex-1">
              {this.state.reporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </>
              )}
            </Button>
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Se o erro persistir, atualize a página ou contate o suporte.
          </p>
        </div>
      </div>
    );
  }
}
