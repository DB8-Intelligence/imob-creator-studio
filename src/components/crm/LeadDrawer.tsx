/**
 * LeadDrawer.tsx — Sheet drawer for lead details/create with 3 tabs
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { MessageCircle, Save, UserCheck, Plus, Clock } from "lucide-react";
import { useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import { useLeadActivities, useCreateLeadActivity } from "@/hooks/useLeadActivities";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { useConvertLeadToCliente } from "@/hooks/useCrmClientes";
import { useToast } from "@/hooks/use-toast";
import type { Lead, LeadStatus, LeadFonte, LeadInteresse, LeadTemperatura, LeadActivityType } from "@/types/lead";
import { TEMPERATURA_CONFIG, FONTE_CONFIG, INTERESSE_LABEL, ACTIVITY_TYPE_CONFIG, PIPELINE_COLUMNS } from "@/types/lead";

interface LeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null; // null = create mode
}

const DEFAULT_FORM = {
  nome: "",
  telefone: "",
  email: "",
  whatsapp: "",
  fonte: "outro" as LeadFonte,
  interesse_tipo: "compra" as LeadInteresse,
  imovel_interesse_nome: "",
  valor_estimado: "",
  temperatura: "morno" as LeadTemperatura,
  status: "novo" as LeadStatus,
  notas: "",
  corretor_responsavel: "",
};

const LeadDrawer: React.FC<LeadDrawerProps> = ({ open, onOpenChange, lead }) => {
  const isEdit = Boolean(lead);
  const [tab, setTab] = useState("detalhes");
  const [form, setForm] = useState(DEFAULT_FORM);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const convertLead = useConvertLeadToCliente();
  const { toast } = useToast();

  // Activities
  const { data: activities } = useLeadActivities(lead?.id ?? null);
  const createActivity = useCreateLeadActivity(lead?.id ?? null);
  const [activityTipo, setActivityTipo] = useState<LeadActivityType>("nota_adicionada");
  const [activityDesc, setActivityDesc] = useState("");

  // Appointments
  const { data: allAppointments } = useAppointments();
  const createAppointment = useCreateAppointment();
  const leadAppointments = (allAppointments ?? []).filter((a) => a.lead_id === lead?.id);

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setForm({
        nome: lead.nome,
        telefone: lead.telefone ?? "",
        email: lead.email ?? "",
        whatsapp: lead.telefone ?? "",
        fonte: lead.fonte,
        interesse_tipo: lead.interesse_tipo,
        imovel_interesse_nome: lead.imovel_interesse_nome ?? "",
        valor_estimado: lead.valor_estimado ? String(lead.valor_estimado) : "",
        temperatura: lead.temperatura,
        status: lead.status,
        notas: lead.notas ?? "",
        corretor_responsavel: lead.corretor_responsavel ?? "",
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setTab("detalhes");
  }, [lead, open]);

  // Auto-save debounce for edit mode
  const autoSave = useCallback(() => {
    if (!isEdit || !lead) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateLead.mutate({
        id: lead.id,
        nome: form.nome,
        telefone: form.telefone || null,
        email: form.email || null,
        fonte: form.fonte,
        interesse_tipo: form.interesse_tipo,
        imovel_interesse_nome: form.imovel_interesse_nome || null,
        valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
        temperatura: form.temperatura,
        status: form.status,
        notas: form.notas || null,
        corretor_responsavel: form.corretor_responsavel || null,
      });
    }, 1000);
  }, [form, isEdit, lead, updateLead]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (isEdit) autoSave();
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatorio", variant: "destructive" });
      return;
    }
    if (isEdit && lead) {
      updateLead.mutate({
        id: lead.id,
        nome: form.nome,
        telefone: form.telefone || null,
        email: form.email || null,
        fonte: form.fonte,
        interesse_tipo: form.interesse_tipo,
        imovel_interesse_nome: form.imovel_interesse_nome || null,
        valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
        temperatura: form.temperatura,
        status: form.status,
        notas: form.notas || null,
        corretor_responsavel: form.corretor_responsavel || null,
      });
      toast({ title: "Lead atualizado" });
    } else {
      createLead.mutate({
        nome: form.nome,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        fonte: form.fonte,
        interesse_tipo: form.interesse_tipo,
        imovel_interesse_nome: form.imovel_interesse_nome || null,
        valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
        temperatura: form.temperatura,
        status: form.status,
        notas: form.notas || undefined,
        corretor_responsavel: form.corretor_responsavel || null,
      });
    }
    onOpenChange(false);
  };

  const handleConvert = () => {
    if (!lead) return;
    convertLead.mutate({ id: lead.id, nome: lead.nome, telefone: lead.telefone, email: lead.email });
    onOpenChange(false);
  };

  const handleAddActivity = () => {
    if (!activityDesc.trim()) return;
    createActivity.mutate({ tipo: activityTipo, descricao: activityDesc });
    setActivityDesc("");
    setActivityTipo("nota_adicionada");
  };

  const handleScheduleVisit = () => {
    if (!lead) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    createAppointment.mutate({
      lead_id: lead.id,
      lead_nome: lead.nome,
      lead_telefone: lead.telefone,
      data_hora: tomorrow.toISOString(),
      duracao: "1h",
      tipo: "visita_presencial",
    });
  };

  const formatWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    const num = clean.startsWith("55") ? clean : `55${clean}`;
    return `https://wa.me/${num}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] sm:max-w-[520px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>{isEdit ? `Lead: ${lead?.nome}` : "Novo Lead"}</SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mb-2">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            {isEdit && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
            {isEdit && <TabsTrigger value="agenda">Agenda</TabsTrigger>}
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            {/* ─── Detalhes Tab ─── */}
            <TabsContent value="detalhes" className="mt-0 space-y-4 pb-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => updateField("nome", e.target.value)} placeholder="Nome do lead" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => updateField("telefone", e.target.value)} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select value={form.fonte} onValueChange={(v) => updateField("fonte", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FONTE_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interesse</Label>
                  <Select value={form.interesse_tipo} onValueChange={(v) => updateField("interesse_tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTERESSE_LABEL).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Imovel de interesse</Label>
                <Input value={form.imovel_interesse_nome} onChange={(e) => updateField("imovel_interesse_nome", e.target.value)} placeholder="Nome ou endereco do imovel" />
              </div>
              <div className="space-y-2">
                <Label>Orcamento estimado (R$)</Label>
                <Input type="number" value={form.valor_estimado} onChange={(e) => updateField("valor_estimado", e.target.value)} placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <div className="flex gap-2">
                  {(Object.entries(TEMPERATURA_CONFIG) as [LeadTemperatura, typeof TEMPERATURA_CONFIG[LeadTemperatura]][]).map(([key, cfg]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={form.temperatura === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateField("temperatura", key)}
                      className="flex-1"
                    >
                      {cfg.emoji} {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PIPELINE_COLUMNS.map((col) => (
                        <SelectItem key={col.id} value={col.id}>{col.emoji} {col.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Textarea value={form.notas} onChange={(e) => updateField("notas", e.target.value)} placeholder="Anotacoes sobre o lead..." rows={3} />
              </div>
            </TabsContent>

            {/* ─── Timeline Tab ─── */}
            <TabsContent value="timeline" className="mt-0 space-y-4 pb-4">
              {/* Quick add activity */}
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex gap-2">
                  <Select value={activityTipo} onValueChange={(v) => setActivityTipo(v as LeadActivityType)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTIVITY_TYPE_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Descreva a atividade..."
                  rows={2}
                />
                <Button size="sm" onClick={handleAddActivity} disabled={!activityDesc.trim()}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Registrar
                </Button>
              </div>

              {/* Activity list */}
              <div className="space-y-3">
                {(activities ?? []).map((act) => {
                  const cfg = ACTIVITY_TYPE_CONFIG[act.tipo] ?? ACTIVITY_TYPE_CONFIG.outro;
                  return (
                    <div key={act.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${cfg.iconBg}`}>
                        {cfg.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(act.created_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {act.descricao && (
                          <p className="text-sm text-gray-700 mt-0.5">{act.descricao}</p>
                        )}
                        {act.usuario_nome && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">por {act.usuario_nome}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!activities || activities.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade registrada</p>
                )}
              </div>
            </TabsContent>

            {/* ─── Agenda Tab ─── */}
            <TabsContent value="agenda" className="mt-0 space-y-4 pb-4">
              <Calendar
                mode="single"
                className="rounded-md border"
              />
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Agendamentos</h4>
                <Button size="sm" variant="outline" onClick={handleScheduleVisit}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agendar visita
                </Button>
              </div>
              <div className="space-y-2">
                {leadAppointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{apt.tipo === "visita_presencial" ? "Visita presencial" : apt.tipo === "visita_virtual" ? "Visita virtual" : "Reuniao"}</span>
                      <Badge variant="secondary" className="text-[10px]">{apt.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(apt.data_hora).toLocaleString("pt-BR")}
                    </div>
                    {apt.notas && <p className="text-xs text-muted-foreground mt-1">{apt.notas}</p>}
                  </div>
                ))}
                {leadAppointments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum agendamento</p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t flex gap-2">
          {isEdit && lead?.status === "fechado" && (
            <Button variant="outline" onClick={handleConvert} className="mr-auto">
              <UserCheck className="h-4 w-4 mr-1" /> Converter em cliente
            </Button>
          )}
          {isEdit && lead?.telefone && (
            <a
              href={formatWhatsAppLink(lead.telefone)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDrawer;
