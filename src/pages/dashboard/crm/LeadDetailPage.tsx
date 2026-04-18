/**
 * LeadDetailPage.tsx — Full lead detail with info + activity timeline
 * Route: /dashboard/crm/lead/:id
 */
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  DollarSign,
  User,
  FileText,
  Clock,
  CalendarPlus,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useLeads, useUpdateLead } from "@/hooks/useLeads";
import {
  useLeadActivities,
  useCreateLeadActivity,
  useLeadActivitiesRealtime,
} from "@/hooks/useLeadActivities";
import type {
  Lead,
  LeadStatus,
  LeadInteresse,
  LeadFonte,
  LeadTemperatura,
  LeadActivityType,
  CreateLeadActivityInput,
} from "@/types/lead";
import {
  PIPELINE_COLUMNS,
  TEMPERATURA_CONFIG,
  FONTE_CONFIG,
  INTERESSE_LABEL,
  ACTIVITY_TYPE_CONFIG,
  RESULTADO_CONFIG,
} from "@/types/lead";

// ── Activity Timeline Item ───────────────────────────────────────────────────

function TimelineItem({ activity }: { activity: import("@/types/lead").LeadActivity }) {
  const cfg = ACTIVITY_TYPE_CONFIG[activity.tipo] ?? ACTIVITY_TYPE_CONFIG.outro;
  const resultado =
    activity.resultado && activity.resultado in RESULTADO_CONFIG
      ? RESULTADO_CONFIG[activity.resultado as keyof typeof RESULTADO_CONFIG]
      : null;

  return (
    <div className="flex gap-3">
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base ${cfg.iconBg}`}>
        {cfg.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6 border-l border-gray-100 pl-4 -ml-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
          {resultado && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resultado.color}`}>
              {resultado.emoji} {resultado.label}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
            {new Date(activity.created_at).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {activity.descricao && (
          <p className="text-sm text-gray-600 mt-1">{activity.descricao}</p>
        )}
        {activity.proximo_passo && (
          <p className="text-xs text-gray-400 mt-1">
            Proximo passo: <span className="text-gray-600">{activity.proximo_passo}</span>
          </p>
        )}
        {activity.usuario_nome && (
          <p className="text-xs text-gray-400 mt-0.5">por {activity.usuario_nome}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: activities = [], isLoading: activitiesLoading } = useLeadActivities(id ?? null);
  const createActivity = useCreateLeadActivity(id ?? null);
  const updateLead = useUpdateLead();

  // Realtime subscription for live updates
  useLeadActivitiesRealtime(id ?? null);

  const lead = useMemo(() => leads.find((l) => l.id === id), [leads, id]);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  const startEditing = () => {
    if (!lead) return;
    setEditForm({
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      imovel_interesse_nome: lead.imovel_interesse_nome,
      valor_estimado: lead.valor_estimado,
      corretor_responsavel: lead.corretor_responsavel,
      notas: lead.notas,
      status: lead.status,
      temperatura: lead.temperatura,
      interesse_tipo: lead.interesse_tipo,
      fonte: lead.fonte,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
  };

  const saveEditing = () => {
    if (!lead) return;
    updateLead.mutate(
      { id: lead.id, ...editForm },
      { onSuccess: () => setEditing(false) }
    );
  };

  // ── New activity form ──────────────────────────────────────────────────────
  const [actForm, setActForm] = useState<CreateLeadActivityInput>({
    tipo: "nota_adicionada",
    descricao: "",
  });

  const handleAddActivity = () => {
    if (!actForm.descricao.trim()) return;
    createActivity.mutate(actForm, {
      onSuccess: () => setActForm({ tipo: "nota_adicionada", descricao: "" }),
    });
  };

  // ── Loading / not found ────────────────────────────────────────────────────
  if (leadsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-20 space-y-4">
          <p className="text-gray-500">Lead nao encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard/crm")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao pipeline
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusCol = PIPELINE_COLUMNS.find((c) => c.id === lead.status);
  const temp = TEMPERATURA_CONFIG[lead.temperatura];
  const fonte = FONTE_CONFIG[lead.fonte];

  return (
    <AppLayout>
      <div className="space-y-6 font-['Plus_Jakarta_Sans'] max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/crm")}
            className="self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Pipeline
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#002B5B]">{lead.nome}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${temp.color}`}>
                {temp.emoji} {temp.label}
              </span>
              {statusCol && (
                <Badge className={`${statusCol.bgColor} border text-xs`}>
                  {statusCol.emoji} {statusCol.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Criado em{" "}
              {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            {!editing ? (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={saveEditing}
                  disabled={updateLead.isPending}
                  className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/crm/agenda")}
            >
              <CalendarPlus className="w-4 h-4 mr-1" />
              Agendar Visita
            </Button>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Info */}
          <Card className="lg:col-span-2 bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#002B5B] text-base">Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                /* Edit form */
                <div className="space-y-3">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={editForm.nome ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={editForm.telefone ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, telefone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editForm.email ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Imovel de interesse</Label>
                    <Input
                      value={editForm.imovel_interesse_nome ?? ""}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, imovel_interesse_nome: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Valor estimado</Label>
                    <Input
                      type="number"
                      value={editForm.valor_estimado ?? ""}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          valor_estimado: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Corretor responsavel</Label>
                    <Input
                      value={editForm.corretor_responsavel ?? ""}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, corretor_responsavel: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(v) =>
                          setEditForm((p) => ({ ...p, status: v as LeadStatus }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PIPELINE_COLUMNS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.emoji} {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Temperatura</Label>
                      <Select
                        value={editForm.temperatura}
                        onValueChange={(v) =>
                          setEditForm((p) => ({ ...p, temperatura: v as LeadTemperatura }))
                        }
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
                  <div>
                    <Label>Notas</Label>
                    <Textarea
                      value={editForm.notas ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, notas: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                /* Read-only view */
                <div className="space-y-3">
                  <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                  <InfoRow icon={Mail} label="Email" value={lead.email} />
                  <InfoRow icon={Home} label="Imovel" value={lead.imovel_interesse_nome} />
                  <InfoRow
                    icon={DollarSign}
                    label="Valor estimado"
                    value={
                      lead.valor_estimado
                        ? `R$ ${lead.valor_estimado.toLocaleString("pt-BR")}`
                        : null
                    }
                  />
                  <Separator />
                  <InfoRow
                    icon={User}
                    label="Corretor"
                    value={lead.corretor_responsavel}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-5 text-center">#</span>
                    <span className="text-gray-500 w-24">Fonte</span>
                    <Badge className={`${fonte.color} text-xs`}>{fonte.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-5 text-center">#</span>
                    <span className="text-gray-500 w-24">Interesse</span>
                    <span className="text-[#002B5B] font-medium">
                      {INTERESSE_LABEL[lead.interesse_tipo]}
                    </span>
                  </div>
                  {lead.notas && (
                    <>
                      <Separator />
                      <div className="flex gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600">{lead.notas}</p>
                      </div>
                    </>
                  )}
                  {lead.ultimo_contato && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Ultimo contato:</span>
                      <span className="text-[#002B5B]">
                        {new Date(lead.ultimo_contato).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Timeline + IA card */}
          <div className="lg:col-span-3 space-y-4">
            {lead.qualification_snapshot && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#002B5B] text-base flex items-center gap-2">
                    🤖 Qualificado pela Secretária Virtual
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {lead.qualification_snapshot.intent && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Interesse</p>
                        <p className="font-semibold text-[#002B5B] capitalize">{lead.qualification_snapshot.intent}</p>
                      </div>
                    )}
                    {lead.qualification_snapshot.budget && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Orçamento</p>
                        <p className="font-semibold text-[#002B5B]">{lead.qualification_snapshot.budget}</p>
                      </div>
                    )}
                    {lead.qualification_snapshot.region && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Região</p>
                        <p className="font-semibold text-[#002B5B]">{lead.qualification_snapshot.region}</p>
                      </div>
                    )}
                    {lead.qualification_snapshot.property_type && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Tipo</p>
                        <p className="font-semibold text-[#002B5B] capitalize">{lead.qualification_snapshot.property_type}</p>
                      </div>
                    )}
                    {lead.qualification_snapshot.urgency && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Urgência</p>
                        <p className="font-semibold text-[#002B5B] capitalize">{lead.qualification_snapshot.urgency}</p>
                      </div>
                    )}
                    {typeof lead.qualification_snapshot.confidence === "number" && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Confiança IA</p>
                        <p className="font-semibold text-[#002B5B]">{Math.round(lead.qualification_snapshot.confidence * 100)}%</p>
                      </div>
                    )}
                  </div>
                  {lead.qualification_snapshot.notes && (
                    <div className="mt-4 pt-3 border-t border-blue-100">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">Observações da IA</p>
                      <p className="text-gray-700 italic mt-1">"{lead.qualification_snapshot.notes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Right: Timeline */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#002B5B] text-base">Timeline de Atividades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add activity form */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={actForm.tipo}
                      onValueChange={(v) =>
                        setActForm((p) => ({ ...p, tipo: v as LeadActivityType }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ACTIVITY_TYPE_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            {cfg.emoji} {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-3">
                    <Label className="text-xs">Descricao</Label>
                    <div className="flex gap-2">
                      <Input
                        value={actForm.descricao}
                        onChange={(e) =>
                          setActForm((p) => ({ ...p, descricao: e.target.value }))
                        }
                        placeholder="O que aconteceu..."
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddActivity();
                        }}
                      />
                      <Button
                        onClick={handleAddActivity}
                        disabled={!actForm.descricao.trim() || createActivity.isPending}
                        className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white whitespace-nowrap"
                        size="sm"
                      >
                        {createActivity.isPending ? "..." : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {activitiesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-[#002B5B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="pt-2">
                  {activities.map((act) => (
                    <TimelineItem key={act.id} activity={act} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 w-24">{label}</span>
      <span className="text-[#002B5B] font-medium truncate">
        {value || <span className="text-gray-300">--</span>}
      </span>
    </div>
  );
}
