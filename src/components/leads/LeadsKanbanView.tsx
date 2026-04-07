/**
 * LeadsKanbanView.tsx — Kanban drag-and-drop com HTML5 DnD
 *
 * Colunas do pipeline: Novo → Contato Feito → Visita → Proposta → Fechado / Perdido
 * Drag: HTML5 native (dragstart / dragover / drop)
 * Drop: PATCH automático no status do lead
 */
import { useState, useCallback } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LeadCard } from "./LeadCard";
import { PIPELINE_COLUMNS, type Lead, type LeadStatus } from "@/types/lead";
import { cn } from "@/lib/utils";

interface LeadsKanbanViewProps {
  leads: Lead[];
  onMoveLead: (leadId: string, newStatus: LeadStatus) => void;
  onEditLead: (lead: Lead) => void;
  onScheduleLead: (lead: Lead) => void;
}

export function LeadsKanbanView({ leads, onMoveLead, onEditLead, onScheduleLead }: LeadsKanbanViewProps) {
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: LeadStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      onMoveLead(leadId, columnId);
    }
  }, [onMoveLead]);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-[1200px]">
        {PIPELINE_COLUMNS.map((column) => {
          const columnLeads = leads.filter((l) => l.status === column.id);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={cn(
                "flex-1 min-w-[220px] max-w-[280px] rounded-xl border p-3 transition-colors",
                isDragOver
                  ? "border-accent bg-accent/5"
                  : column.bgColor
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{column.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{column.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                  {columnLeads.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 min-h-[100px]">
                {columnLeads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      Arraste leads aqui
                    </p>
                  </div>
                )}
                {columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={onEditLead}
                    onSchedule={onScheduleLead}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
