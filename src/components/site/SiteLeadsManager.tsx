import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { SiteLead } from "@/types/site";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Loader2,
  Download,
  MessageCircle,
  Trash2,
  Inbox,
  Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INTERESSE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "compra", label: "Compra" },
  { value: "aluguel", label: "Aluguel" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "outro", label: "Outro" },
];

const ORIGEM_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "site", label: "Site" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "indicacao", label: "Indicação" },
  { value: "portal", label: "Portal" },
];

const INTERESSE_COLORS: Record<string, string> = {
  compra: "bg-green-100 text-green-700 border-green-300",
  aluguel: "bg-blue-100 text-blue-700 border-blue-300",
  avaliacao: "bg-purple-100 text-purple-700 border-purple-300",
  outro: "bg-gray-100 text-gray-700 border-gray-300",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits;
}

function isThisWeek(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SiteLeadsManagerProps {
  siteId?: string;
}

export function SiteLeadsManager({ siteId }: SiteLeadsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [interesseFilter, setInteresseFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState("all");
  const [processadoFilter, setProcessadoFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* ---------- Fetch ---------- */

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("site_leads")
      .select("*")
      .eq("corretor_user_id", user.id)
      .order("created_at", { ascending: false });

    if (siteId) {
      query = query.eq("site_id", siteId);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Erro ao carregar leads", description: error.message, variant: "destructive" });
    }
    setLeads((data as unknown as SiteLead[]) ?? []);
    setLoading(false);
  }, [user, siteId, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* ---------- Filtered leads ---------- */

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (interesseFilter !== "all" && lead.interesse !== interesseFilter) return false;
      if (origemFilter !== "all" && lead.origem !== origemFilter) return false;
      if (processadoFilter === "processado" && !lead.processado) return false;
      if (processadoFilter === "nao_processado" && lead.processado) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(lead.created_at) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(lead.created_at) > to) return false;
      }
      return true;
    });
  }, [leads, interesseFilter, origemFilter, processadoFilter, dateFrom, dateTo]);

  /* ---------- Stats ---------- */

  const stats = useMemo(() => ({
    total: leads.length,
    naoProcessados: leads.filter((l) => !l.processado).length,
    estaSemana: leads.filter((l) => isThisWeek(l.created_at)).length,
  }), [leads]);

  /* ---------- Actions ---------- */

  const toggleProcessado = async (lead: SiteLead) => {
    const { error } = await supabase
      .from("site_leads")
      .update({ processado: !lead.processado } as never)
      .eq("id", lead.id);

    if (error) {
      toast({ title: "Erro ao atualizar lead", variant: "destructive" });
    } else {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id ? { ...l, processado: !l.processado } : l,
        ),
      );
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("site_leads").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir lead", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lead excluído" });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const openWhatsApp = (phone: string, nome: string) => {
    const digits = formatPhone(phone);
    const text = encodeURIComponent(`Olá ${nome}, tudo bem? Vi seu interesse em um dos nossos imóveis.`);
    window.open(`https://wa.me/${digits}?text=${text}`, "_blank");
  };

  /* ---------- CSV Export ---------- */

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast({ title: "Nenhum lead para exportar" });
      return;
    }

    const headers = ["Nome", "Telefone", "Email", "Interesse", "Origem", "Mensagem", "Processado", "Data"];
    const rows = filtered.map((l) => [
      l.nome,
      l.telefone,
      l.email ?? "",
      l.interesse,
      l.origem,
      (l.mensagem ?? "").replace(/"/g, '""'),
      l.processado ? "Sim" : "Não",
      formatDate(l.created_at),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-site-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: `${filtered.length} leads exportados!` });
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total de leads", value: stats.total, color: "text-gray-700" },
          { label: "Não processados", value: stats.naoProcessados, color: "text-orange-600" },
          { label: "Esta semana", value: stats.estaSemana, color: "text-blue-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={interesseFilter} onValueChange={setInteresseFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Interesse" />
          </SelectTrigger>
          <SelectContent>
            {INTERESSE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={origemFilter} onValueChange={setOrigemFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            {ORIGEM_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={processadoFilter} onValueChange={setProcessadoFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nao_processado">Não processados</SelectItem>
            <SelectItem value="processado">Processados</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Input
            type="date"
            className="w-[140px]"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-xs text-gray-400">até</span>
          <Input
            type="date"
            className="w-[140px]"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="ml-auto">
          <Button variant="outline" onClick={exportCSV} className="gap-1.5">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Nenhum lead encontrado</p>
            <p className="text-sm text-gray-400 mt-1">
              {leads.length === 0
                ? "Os leads aparecerão aqui quando visitantes entrarem em contato pelo site"
                : "Tente ajustar os filtros"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Interesse</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={lead.processado ? "opacity-60" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={lead.processado}
                      onCheckedChange={() => toggleProcessado(lead)}
                      title={lead.processado ? "Marcar como não processado" : "Marcar como processado"}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell>
                    {lead.telefone ? (
                      <a
                        href={`https://wa.me/${formatPhone(lead.telefone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {lead.telefone}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {lead.email ?? <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${INTERESSE_COLORS[lead.interesse] ?? ""}`}
                    >
                      {lead.interesse}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {lead.origem}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {lead.telefone && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                          onClick={() => openWhatsApp(lead.telefone, lead.nome)}
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        onClick={() => deleteLead(lead.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
