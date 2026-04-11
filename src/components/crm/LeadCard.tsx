/**
 * LeadCard.tsx — Compact lead card for kanban board
 */
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal, Phone, MessageCircle, Pencil, UserCheck, ArrowRight, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lead, LeadTemperatura } from "@/types/lead";
import { TEMPERATURA_CONFIG, FONTE_CONFIG, INTERESSE_LABEL } from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  index: number;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatCurrency(value: number | null): string {
  if (!value) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWhatsAppLink(phone: string | null): string {
  if (!phone) return "#";
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("55") ? clean : `55${clean}`;
  return `https://wa.me/${num}`;
}

const TEMP_EMOJI: Record<LeadTemperatura, string> = {
  quente: "\uD83D\uDD25",
  morno: "\uD83C\uDF21\uFE0F",
  frio: "\u2744\uFE0F",
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, index, onEdit, onConvert, onDelete }) => {
  const tempCfg = TEMPERATURA_CONFIG[lead.temperatura];
  const fonteCfg = FONTE_CONFIG[lead.fonte];

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : "shadow-sm hover:shadow-md"
          }`}
        >
          {/* Header: avatar + name + temp + menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {getInitials(lead.nome)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{lead.nome}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${tempCfg.color}`}>
                    {TEMP_EMOJI[lead.temperatura]} {tempCfg.label}
                  </Badge>
                  {fonteCfg && (
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${fonteCfg.color}`}>
                      {fonteCfg.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConvert(lead)}>
                  <UserCheck className="h-3.5 w-3.5 mr-2" /> Converter em cliente
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-red-600">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Interest + price */}
          {(lead.interesse_tipo || lead.valor_estimado) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              {lead.interesse_tipo && (
                <span>{INTERESSE_LABEL[lead.interesse_tipo]}</span>
              )}
              {lead.valor_estimado && (
                <span className="font-medium text-gray-700">{formatCurrency(lead.valor_estimado)}</span>
              )}
            </div>
          )}

          {lead.imovel_interesse_nome && (
            <p className="text-xs text-muted-foreground truncate mb-1.5">
              {lead.imovel_interesse_nome}
            </p>
          )}

          {/* Footer: phone + WA */}
          <div className="flex items-center justify-between pt-1.5 border-t">
            {lead.telefone ? (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{lead.telefone}</span>
                <a
                  href={formatWhatsAppLink(lead.telefone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Sem telefone</span>
            )}
            {lead.ultimo_contato && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(lead.ultimo_contato).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default LeadCard;
