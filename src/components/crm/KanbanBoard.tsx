/**
 * KanbanBoard.tsx — 6-column drag-and-drop kanban board for leads
 */
import React from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeadCard from "./LeadCard";
import type { Lead, LeadStatus } from "@/types/lead";
import { PIPELINE_COLUMNS } from "@/types/lead";

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onEditLead: (lead: Lead) => void;
  onConvertLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onUpdateStatus,
  onEditLead,
  onConvertLead,
  onDeleteLead,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as LeadStatus;
    const lead = leads.find((l) => l.id === draggableId);
    if (!lead || lead.status === newStatus) return;

    onUpdateStatus(draggableId, newStatus);
  };

  const leadsByStatus = (status: LeadStatus) =>
    leads.filter((l) => l.status === status);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-280px)]">
        {PIPELINE_COLUMNS.map((col) => {
          const columnLeads = leadsByStatus(col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col min-w-[280px] w-[280px] rounded-xl ${col.bgColor} border`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {columnLeads.length}
                </Badge>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    }`}
                  >
                    <ScrollArea className="h-full max-h-[calc(100vh-340px)]">
                      {columnLeads.map((lead, idx) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          index={idx}
                          onEdit={onEditLead}
                          onConvert={onConvertLead}
                          onDelete={onDeleteLead}
                        />
                      ))}
                      {columnLeads.length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          Arraste leads aqui
                        </div>
                      )}
                      {provided.placeholder}
                    </ScrollArea>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
