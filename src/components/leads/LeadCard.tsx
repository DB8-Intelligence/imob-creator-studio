/**
 * LeadCard.tsx — Card de lead para o Kanban
 *
 * Mostra: nome, avatar, tipo interesse, imóvel, valor, data último contato,
 * fonte, temperatura, botões rápidos (WhatsApp, Agendar, Editar)
 *
 * Suporta HTML5 drag (draggable) para mover entre colunas.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, CalendarPlus, Pencil, Building2 } from "lucide-react";
import {
  TEMPERATURA_CONFIG,
  FONTE_CONFIG,
  INTERESSE_LABEL,
  type Lead,
} from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onSchedule: (lead: Lead) => void;
}

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Sem contato";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  return `${days}d atrás`;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function LeadCard({ lead, onEdit, onSchedule }: LeadCardProps) {
  const temp = TEMPERATURA_CONFIG[lead.temperatura];
  const fonte = FONTE_CONFIG[lead.fonte];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const whatsappUrl = lead.telefone
    ? `https://wa.me/55${lead.telefone.replace(/\D/g, "")}`
    : null;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      {/* Header: avatar + name + temperatura */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
          {getInitials(lead.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{lead.nome}</p>
          <p className="text-[11px] text-muted-foreground">{INTERESSE_LABEL[lead.interesse_tipo]}</p>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${temp.color}`}>
          {temp.emoji} {temp.label}
        </span>
      </div>

      {/* Imóvel de interesse */}
      {lead.imovel_interesse_nome && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.imovel_interesse_nome}</span>
        </div>
      )}

      {/* Valor + Data */}
      <div className="flex items-center justify-between mb-2.5">
        {lead.valor_estimado ? (
          <span className="text-xs font-semibold text-foreground">{formatCurrency(lead.valor_estimado)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Sem valor</span>
        )}
        <span className="text-[10px] text-muted-foreground">{timeAgo(lead.ultimo_contato)}</span>
      </div>

      {/* Fonte badge */}
      <div className="mb-2.5">
        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${fonte.color}`}>
          {fonte.label}
        </Badge>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {whatsappUrl && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
            onClick={(e) => { e.stopPropagation(); window.open(whatsappUrl, "_blank"); }}
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); onSchedule(lead); }}
          title="Agendar visita"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
