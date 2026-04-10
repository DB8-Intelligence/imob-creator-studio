/**
 * DashboardCRMPage.tsx — Kanban pipeline + metric cards
 * Route: /dashboard/crm
 */
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Flame,
  CalendarCheck,
  Trophy,
  Plus,
  Search,
} from "lucide-react";
import { useLeads, useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import { useAppointments } from "@/hooks/useAppointments";
import type {
  Lead,
  LeadStatus,
  LeadInteresse,
  LeadFonte,
  LeadTemperatura,
  CreateLeadInput,
} from "@/types/lead";
import {
  PIPELINE_COLUMNS,
  TEMPERATURA_CONFIG,
} from "@/types/lead";

// ── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${accent}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#002B5B]">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const temp = TEMPERATURA_CONFIG[lead.temperatura];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md hover:border-[#FFD700]/40 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-[#002B5B] leading-tight line-clamp-1">
          {lead.nome}
        </p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${temp.color}`}>
          {temp.emoji}
        </span>
      </div>
      {lead.telefone && (
        <p className="text-xs text-gray-500 mb-1">{lead.telefone}</p>
      )}
      {lead.imovel_interesse_nome && (
        <p className="text-xs text-gray-400 line-clamp-1">{lead.imovel_interesse_nome}</p>
      )}
    </div>
  );
}

// ── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  leads,
  onCardClick,
}: {
  column: (typeof PIPELINE_COLUMNS)[number];
  leads: Lead[];
  onCardClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col min-w-[260px] w-[280px] rounded-xl border border-gray-100 bg-gray-50/60">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl border-b ${column.bgColor}`}>
        <span>{column.emoji}</span>
        <span className="text-sm font-semibold text-[#002B5B]">{column.label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {leads.length}
        </Badge>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)] transition-colors ${
              snapshot.isDraggingOver ? "bg-[#FFD700]/5" : ""
            }`}
          >
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-gray-400 text-center py-6">Nenhum lead</p>
            )}
            {leads.map((lead, idx) => (
              <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                  >
                    <KanbanCard
                      lead={lead}
                      onClick={() => onCardClick(lead.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ── New Lead Dialog ──────────────────────────────────────────────────────────

function NovoLeadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createLead = useCreateLead();

  const [form, setForm] = useState<CreateLeadInput>({
    nome: "",
    telefone: "",
    email: "",
    interesse_tipo: "compra",
    fonte: "whatsapp",
    temperatura: "morno",
    imovel_interesse_nome: "",
    valor_estimado: null,
    notas: "",
  });

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.nome.trim()) return;
    createLead.mutate(form, {
      onSuccess: () => {
        onClose();
        setForm({
          nome: "",
          telefone: "",
          email: "",
          interesse_tipo: "compra",
          fonte: "whatsapp",
          temperatura: "morno",
          imovel_interesse_nome: "",
          valor_estimado: null,
          notas: "",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white font-['Plus_Jakarta_Sans']">
        <DialogHeader>
          <DialogTitle className="text-[#002B5B]">Novo Lead</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Nome do lead"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.telefone ?? ""}
                onChange={(e) => set("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <Label>E-mail</Label>
            <Input
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Interesse</Label>
              <Select
                value={form.interesse_tipo}
                onValueChange={(v) => set("interesse_tipo", v as LeadInteresse)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="lancamento">Lancamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fonte</Label>
              <Select
                value={form.fonte}
                onValueChange={(v) => set("fonte", v as LeadFonte)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="indicacao">Indicacao</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Temperatura</Label>
              <Select
                value={form.temperatura ?? "morno"}
                onValueChange={(v) => set("temperatura", v as LeadTemperatura)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Imovel de interesse</Label>
              <Input
                value={form.imovel_interesse_nome ?? ""}
                onChange={(e) => set("imovel_interesse_nome", e.target.value)}
                placeholder="Apt. Jardins 3 quartos"
              />
            </div>
            <div>
              <Label>Valor estimado</Label>
              <Input
                type="number"
                value={form.valor_estimado ?? ""}
                onChange={(e) =>
                  set("valor_estimado", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="500000"
              />
            </div>
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={form.notas ?? ""}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Observacoes sobre o lead..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.nome.trim() || createLead.isPending}
            className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
          >
            {createLead.isPending ? "Salvando..." : "Criar Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardCRMPage() {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useLeads();
  const { data: appointments = [] } = useAppointments();
  const updateLead = useUpdateLead();
  const [search, setSearch] = useState("");
  const [tempFilter, setTempFilter] = useState("all");
  const [newLeadOpen, setNewLeadOpen] = useState(false);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalLeads = leads.length;
  const leadsQuentes = leads.filter((l) => l.temperatura === "quente").length;
  const visitasAgendadas = appointments.filter((a) => a.status === "agendado" || a.status === "confirmado").length;
  const fechados = leads.filter((l) => l.status === "fechado").length;

  // ── Filtered leads ─────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        (!search.trim() ||
          l.nome.toLowerCase().includes(q) ||
          l.telefone?.toLowerCase().includes(q) ||
          l.imovel_interesse_nome?.toLowerCase().includes(q)) &&
        (tempFilter === "all" || l.temperatura === tempFilter)
    );
  }, [leads, search, tempFilter]);

  // ── Kanban grouped ─────────────────────────────────────────────────────────
  const columnLeads = useCallback(
    (status: LeadStatus) => filteredLeads.filter((l) => l.status === status),
    [filteredLeads]
  );

  // ── Drag-end handler (@hello-pangea/dnd) ──────────────────────────────────
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const leadId = result.draggableId;
    if (newStatus === result.source.droppableId) return;
    // Optimistic update
    updateLead.mutate({ id: leadId, status: newStatus as any });
  };

  return (
    <AppLayout>
      <div className="space-y-6 font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#002B5B]">CRM Pipeline</h1>
            <p className="text-sm text-gray-500">Gerencie seus leads e oportunidades</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar lead..."
                className="pl-9 w-56"
              />
            </div>
            <div className="flex gap-2">
              {[{v:"all",l:"Todos"},{v:"quente",l:"\uD83D\uDD25 Quente"},{v:"morno",l:"\uD83C\uDF21\uFE0F Morno"},{v:"frio",l:"\u2744\uFE0F Frio"}].map(f => (
                <button key={f.v} type="button" onClick={() => setTempFilter(f.v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tempFilter === f.v ? "bg-[#002B5B] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {f.l}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setNewLeadOpen(true)}
              className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Leads" value={totalLeads} icon={Users} accent="bg-[#002B5B]/10 text-[#002B5B]" />
          <MetricCard label="Leads Quentes" value={leadsQuentes} icon={Flame} accent="bg-red-500/10 text-red-500" />
          <MetricCard label="Visitas Agendadas" value={visitasAgendadas} icon={CalendarCheck} accent="bg-purple-500/10 text-purple-500" />
          <MetricCard label="Fechados" value={fechados} icon={Trophy} accent="bg-emerald-500/10 text-emerald-500" />
        </div>

        {/* Kanban board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
              <div className="flex gap-4" style={{ minWidth: "fit-content" }}>
                {PIPELINE_COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    leads={columnLeads(col.id)}
                    onCardClick={(id) => navigate(`/dashboard/crm/lead/${id}`)}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      <NovoLeadDialog open={newLeadOpen} onClose={() => setNewLeadOpen(false)} />
    </AppLayout>
  );
}
