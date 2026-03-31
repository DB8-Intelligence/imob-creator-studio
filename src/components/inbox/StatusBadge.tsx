import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Espelha exatamente o PropertyStatus do backend (db8-engine)
export type PropertyStatus = "new" | "processing" | "ready" | "approved" | "published" | "error";

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  new:        { label: "Novo",        className: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
  processing: { label: "Em edição",   className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  ready:      { label: "Pronto",      className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  approved:   { label: "Aprovado",    className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  published:  { label: "Publicado",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  error:      { label: "Erro",        className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

interface StatusBadgeProps {
  status: PropertyStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
