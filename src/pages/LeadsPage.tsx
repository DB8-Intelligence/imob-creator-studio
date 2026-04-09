import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Inbox, Mail, MailOpen, AlertCircle, Trash2, Users, Loader2, Phone, MessageCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  source_detail: string | null;
  status: string;
  assigned_to: string | null;
  read_at: string | null;
  created_at: string;
  properties?: { reference: string; type: string } | null;
}

const SIDEBAR_ITEMS = [
  { key: "all", label: "Caixa de entrada", icon: Inbox },
  { key: "unread", label: "Não lidos", icon: Mail },
  { key: "unattended", label: "Não atendidos", icon: AlertCircle },
  { key: "archived", label: "Lixeira", icon: Trash2 },
];

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*, properties(reference, type)")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter((l) => {
    if (section === "unread") return !l.read_at;
    if (section === "unattended") return l.status === "new";
    if (section === "archived") return l.status === "archived";
    return l.status !== "archived";
  }).filter((l) => filter === "" || l.name.toLowerCase().includes(filter.toLowerCase()));

  const counts = {
    unread: leads.filter((l) => !l.read_at).length,
    unattended: leads.filter((l) => l.status === "new").length,
  };

  const handleStartAttendance = async (lead: Lead) => {
    await supabase.from("leads").update({ status: "in_attendance", read_at: new Date().toISOString() }).eq("id", lead.id);
    await supabase.from("attendances").insert({
      workspace_id: lead.id, // placeholder — resolved by RLS
      lead_id: lead.id,
      assigned_to: (await supabase.auth.getUser()).data.user?.id,
      stage: "in_attendance",
    });
    toast({ title: "Atendimento iniciado!" });
    setSelected(null);
    fetchLeads();
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-56 border-r bg-gray-50/50 p-3 space-y-1 flex-shrink-0">
          <p className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2">Leads</p>
          {SIDEBAR_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                section === item.key ? "bg-white shadow-sm font-medium" : "text-gray-600 hover:bg-white/50"
              }`}>
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.key === "unread" && counts.unread > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-5 justify-center">{counts.unread}</Badge>
              )}
              {item.key === "unattended" && counts.unattended > 0 && (
                <Badge className="bg-amber-500 text-white text-[10px] h-5 min-w-5 justify-center">{counts.unattended}</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">{SIDEBAR_ITEMS.find((i) => i.key === section)?.label}</h1>
            <Input className="w-64" placeholder="Buscar lead..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(lead)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.read_at ? "bg-gray-300" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${lead.read_at ? "text-gray-600" : "font-semibold"}`}>{lead.name}</p>
                        {lead.properties?.reference && (
                          <Badge variant="outline" className="text-[10px]">{lead.properties.reference}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{lead.message ?? "Sem mensagem"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="secondary" className="text-[10px]">{lead.source_detail ?? lead.source}</Badge>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(lead.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lead detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              {selected.email && (
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-gray-400" />{selected.email}</div>
              )}
              {selected.phone && (
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-400" />{selected.phone}</div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{selected.source_detail ?? selected.source}</Badge>
                {selected.properties?.reference && <Badge variant="outline">{selected.properties.reference}</Badge>}
              </div>
              {selected.message && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-xs font-medium text-gray-500 mb-1">Mensagem</p>
                  <p className="whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
            <Button onClick={() => selected && handleStartAttendance(selected)} className="gap-2">
              <Play className="h-4 w-4" />Iniciar Atendimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
