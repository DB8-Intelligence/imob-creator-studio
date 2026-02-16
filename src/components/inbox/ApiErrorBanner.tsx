import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorBannerProps {
  error: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function isConnectionError(err: Error | null): boolean {
  if (!err) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("unavailable")
  );
}

const ApiErrorBanner = ({ error, onRetry, isRetrying }: ApiErrorBannerProps) => {
  const isOffline = isConnectionError(error);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        {isOffline ? (
          <WifiOff className="w-7 h-7 text-destructive" />
        ) : (
          <AlertCircle className="w-7 h-7 text-destructive" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">
        {isOffline ? "Servidor indisponível" : "Erro ao carregar dados"}
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mb-5">
        {isOffline
          ? "Não conseguimos conectar ao servidor. Verifique sua conexão ou tente novamente em alguns minutos."
          : error?.message || "Ocorreu um erro inesperado. Tente novamente."}
      </p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Tentando..." : "Tentar novamente"}
        </Button>
      )}
    </div>
  );
};

export default ApiErrorBanner;
