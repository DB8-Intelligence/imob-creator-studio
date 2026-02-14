import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PropertyStatus = "pending" | "editing" | "approved" | "published" | "error" | "rejected";

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  pending: { label: "Novo", className: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
  editing: { label: "Em edição", className: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  approved: { label: "Aprovado", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  published: { label: "Postado", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  error: { label: "Erro", className: "bg-red-500/15 text-red-700 border-red-500/30" },
  rejected: { label: "Rejeitado", className: "bg-gray-500/15 text-gray-600 border-gray-500/30" },
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
