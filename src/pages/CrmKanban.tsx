/**
 * CrmKanban.tsx — Pipeline de Leads (Kanban CRM page)
 * Route: /crm
 */
import React, { useState, useMemo } from "react";
import { Plus, Search, Users, TrendingUp, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KanbanBoard from "@/components/crm/KanbanBoard";
import LeadDrawer from "@/components/crm/LeadDrawer";
import { useLeads, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useConvertLeadToCliente } from "@/hooks/useCrmClientes";
import type { Lead, LeadStatus, LeadTemperatura, LeadFonte } from "@/types/lead";

const CrmKanban: React.FC = () => {
  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLeadToCliente();

  const [search, setSearch] = useState("");
  const [tempFilter, setTempFilter] = useState<LeadTemperatura | "all">("all");
  const [fonteFilter, setFonteFilter] = useState<LeadFonte | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.nome.toLowerCase().includes(q) ||
          l.telefone?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }
    if (tempFilter !== "all") {
      result = result.filter((l) => l.temperatura === tempFilter);
    }
    if (fonteFilter !== "all") {
      result = result.filter((l) => l.fonte === fonteFilter);
    }
    return result;
  }, [leads, search, tempFilter, fonteFilter]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = leads.length;
    const emNegociacao = leads.filter((l) =>
      ["contato_feito", "visita_agendada", "proposta_enviada"].includes(l.status)
    ).length;
    const fechadosMes = leads.filter(
      (l) => l.status === "fechado" && new Date(l.updated_at) >= startOfMonth
    ).length;
    const taxaConversao = total > 0 ? Math.round((fechadosMes / total) * 100) : 0;

    return { total, emNegociacao, fechadosMes, taxaConversao };
  }, [leads]);

  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    updateLead.mutate({ id: leadId, status: newStatus });
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleConvertLead = (lead: Lead) => {
    convertLead.mutate({ id: lead.id, nome: lead.nome, telefone: lead.telefone, email: lead.email });
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLead.mutate(leadId);
  };

  const handleNewLead = () => {
    setSelectedLead(null);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Leads</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads pelo funil de vendas</p>
        </div>
        <Button onClick={handleNewLead}>
          <Plus className="h-4 w-4 mr-1" /> Novo Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total de leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.emNegociacao}</p>
              <p className="text-xs text-muted-foreground">Em negociacao</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.fechadosMes}</p>
              <p className="text-xs text-muted-foreground">Fechados no mes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <BarChart3 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.taxaConversao}%</p>
              <p className="text-xs text-muted-foreground">Taxa de conversao</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="pl-9"
          />
        </div>
        <Select value={tempFilter} onValueChange={(v) => setTempFilter(v as LeadTemperatura | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Temperatura" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="quente">Quente</SelectItem>
            <SelectItem value="morno">Morno</SelectItem>
            <SelectItem value="frio">Frio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fonteFilter} onValueChange={(v) => setFonteFilter(v as LeadFonte | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="site">Site</SelectItem>
            <SelectItem value="indicacao">Indicacao</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <KanbanBoard
          leads={filteredLeads}
          onUpdateStatus={handleUpdateStatus}
          onEditLead={handleEditLead}
          onConvertLead={handleConvertLead}
          onDeleteLead={handleDeleteLead}
        />
      )}

      {/* Lead drawer */}
      <LeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        lead={selectedLead}
      />
    </div>
  );
};

export default CrmKanban;
