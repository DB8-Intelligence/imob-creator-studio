/**
 * LeadsPipelinePage.tsx — Página principal de Leads (CRM)
 *
 * Header: "Leads" + botão "Novo Lead" + busca
 * Abas: Kanban | Lista | Mapa
 * Kanban: DnD com PATCH automático no status
 */
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Plus, Search, Users, Columns3, List, MapPin } from "lucide-react";
import { useLeads, useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";
import { LeadsKanbanView } from "@/components/leads/LeadsKanbanView";
import { LeadsListView } from "@/components/leads/LeadsListView";
import { LeadsMapView } from "@/components/leads/LeadsMapView";
import { LeadFormSheet } from "@/components/leads/LeadFormSheet";
import { PIPELINE_COLUMNS, type Lead, type LeadStatus, type CreateLeadInput } from "@/types/lead";

export default function LeadsPipelinePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: leads, isLoading } = useLeads();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Filter by search
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.nome.toLowerCase().includes(q) ||
        l.telefone?.includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.imovel_interesse_nome?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  // Stats
  const stats = useMemo(() => {
    if (!leads) return { total: 0, quentes: 0, valorTotal: 0 };
    return {
      total: leads.length,
      quentes: leads.filter((l) => l.temperatura === "quente").length,
      valorTotal: leads.reduce((sum, l) => sum + (l.valor_estimado ?? 0), 0),
    };
  }, [leads]);

  // Handlers
  const handleMoveLead = useCallback((leadId: string, newStatus: LeadStatus) => {
    const lead = leads?.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    updateLeadMutation.mutate(
      { id: leadId, status: newStatus, ultimo_contato: new Date().toISOString() },
      {
        onSuccess: () => {
          const col = PIPELINE_COLUMNS.find((c) => c.id === newStatus);
          toast({ title: `${lead.nome} movido para ${col?.label ?? newStatus}` });
        },
      }
    );
  }, [leads, updateLeadMutation, toast]);

  const handleEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  }, []);

  const handleScheduleLead = useCallback((lead: Lead) => {
    navigate("/atendimentos/novo", { state: { leadId: lead.id, leadNome: lead.nome } });
  }, [navigate]);

  const handleNewLead = () => {
    setEditingLead(null);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: CreateLeadInput) => {
    if (editingLead) {
      updateLeadMutation.mutate(
        { id: editingLead.id, ...data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createLeadMutation.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px]">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Leads</h1>
              <p className="text-sm text-muted-foreground">
                {stats.total} leads &middot; {stats.quentes} quentes &middot;{" "}
                {stats.valorTotal > 0 ? stats.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "R$ 0"}
                {" "}em pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9 w-[220px] text-sm"
                placeholder="Buscar lead..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleNewLead} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Tabs: Kanban | Lista | Mapa */}
        {!isLoading && (
          <Tabs defaultValue="kanban">
            <TabsList>
              <TabsTrigger value="kanban" className="gap-1.5">
                <Columns3 className="w-4 h-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-1.5">
                <List className="w-4 h-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="mapa" className="gap-1.5">
                <MapPin className="w-4 h-4" />
                Mapa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kanban" className="mt-4">
              <LeadsKanbanView
                leads={filteredLeads}
                onMoveLead={handleMoveLead}
                onEditLead={handleEditLead}
                onScheduleLead={handleScheduleLead}
              />
            </TabsContent>

            <TabsContent value="lista" className="mt-4">
              <LeadsListView
                leads={filteredLeads}
                onEditLead={handleEditLead}
              />
            </TabsContent>

            <TabsContent value="mapa" className="mt-4">
              <LeadsMapView leads={filteredLeads} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Form Sheet (Create / Edit) */}
      <LeadFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSubmit={handleFormSubmit}
        isSubmitting={createLeadMutation.isPending || updateLeadMutation.isPending}
      />
    </AppLayout>
  );
}
