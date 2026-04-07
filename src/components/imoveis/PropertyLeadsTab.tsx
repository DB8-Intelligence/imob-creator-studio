/**
 * PropertyLeadsTab.tsx — Aba "Leads Interessados" no editor de imóvel
 *
 * Lista de leads vinculados, status na pipeline, botão notificar todos.
 */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MessageCircle, Users, Bell, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  PIPELINE_COLUMNS,
  TEMPERATURA_CONFIG,
} from "@/types/lead";
import type { PropertyLeadSummary } from "@/hooks/usePropertyMAX";

interface PropertyLeadsTabProps {
  leads: PropertyLeadSummary[];
  propertyNome: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${days}d atrás`;
}

export function PropertyLeadsTab({ leads, propertyNome }: PropertyLeadsTabProps) {
  const navigate = useNavigate();

  const handleNotifyAll = () => {
    const phones = leads.filter((l) => l.telefone).map((l) => l.telefone);
    // TODO: dispatch n8n webhook for bulk WhatsApp
    alert(`Notificar ${phones.length} lead(s) sobre ${propertyNome} via WhatsApp (n8n webhook)`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">{leads.length} lead{leads.length !== 1 ? "s" : ""} interessado{leads.length !== 1 ? "s" : ""}</h3>
        </div>
        {leads.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleNotifyAll}>
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Notificar todos
          </Button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum lead vinculado a este imóvel.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Lead</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Temp.</TableHead>
                <TableHead className="text-xs">Contato</TableHead>
                <TableHead className="text-xs w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const statusCol = PIPELINE_COLUMNS.find((c) => c.id === lead.status);
                const temp = TEMPERATURA_CONFIG[lead.temperatura as keyof typeof TEMPERATURA_CONFIG];
                const whatsappUrl = lead.telefone
                  ? `https://wa.me/55${lead.telefone.replace(/\D/g, "")}`
                  : null;

                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{lead.nome}</p>
                      {lead.telefone && <p className="text-[11px] text-muted-foreground">{lead.telefone}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {statusCol?.emoji} {statusCol?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {temp && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", temp.color)}>
                          {temp.emoji}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(lead.ultimo_contato)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {whatsappUrl && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500" title="WhatsApp" onClick={() => window.open(whatsappUrl, "_blank")}>
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Ver lead" onClick={() => navigate(`/leads/${lead.id}`)}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
