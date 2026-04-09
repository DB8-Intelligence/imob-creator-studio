import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Phone, MessageCircle, Mail, Thermometer, User, Clock,
  StickyNote, Home, ListChecks, Send, Loader2, CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppointmentModal } from "@/components/crm/AppointmentModal";

const STAGE_LABELS: Record<string, string> = {
  waiting: "Em espera",
  awaiting_return: "Aguardando retorno",
  in_attendance: "Em atendimento",
  visit_scheduled: "Visita agendada",
  proposal: "Em proposta",
  contract: "Em contrato",
  finished: "Finalizado",
  canceled: "Cancelado",
};

export default function AttendanceDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Record<string, unknown> | null>(null);
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("attendances").select("*, leads(name, phone, email), clients(name, phone_mobile)").eq("id", id).maybeSingle(),
      supabase.from("attendance_activities").select("*").eq("attendance_id", id).order("created_at", { ascending: false }),
    ]).then(([{ data: att }, { data: acts }]) => {
      setAttendance(att);
      setActivities((acts as Record<string, unknown>[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim() || !id) return;
    setSavingNote(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("attendance_activities").insert({
      attendance_id: id,
      type: "note",
      content: newNote,
      created_by: user?.id,
    });
    setNewNote("");
    const { data } = await supabase.from("attendance_activities").select("*").eq("attendance_id", id).order("created_at", { ascending: false });
    setActivities((data as Record<string, unknown>[]) ?? []);
    setSavingNote(false);
    toast({ title: "Anotação adicionada" });
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  if (!attendance) return <AppLayout><div className="text-center py-20 text-gray-400">Atendimento não encontrado</div></AppLayout>;

  const lead = attendance.leads as Record<string, string> | null;
  const client = attendance.clients as Record<string, string> | null;
  const contactName = lead?.name ?? client?.name ?? "Sem nome";
  const contactPhone = lead?.phone ?? client?.phone_mobile;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{contactName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline">{STAGE_LABELS[attendance.stage as string] ?? attendance.stage}</Badge>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} className={`w-2.5 h-2.5 rounded-full ${n <= (attendance.thermometer as number) ? "bg-orange-400" : "bg-gray-200"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contactPhone && (
              <>
                <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => window.open(`https://wa.me/${contactPhone}`)}>
                  <MessageCircle className="h-3.5 w-3.5" />WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(`tel:${contactPhone}`)}>
                  <Phone className="h-3.5 w-3.5" />Ligar
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAppointment(true)}>
              <CalendarDays className="h-3.5 w-3.5" />Agendar Visita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nova atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="note">
                  <TabsList>
                    <TabsTrigger value="note" className="gap-1 text-xs"><StickyNote className="h-3 w-3" />Anotação</TabsTrigger>
                    <TabsTrigger value="whatsapp" className="gap-1 text-xs"><MessageCircle className="h-3 w-3" />WhatsApp</TabsTrigger>
                    <TabsTrigger value="call" className="gap-1 text-xs"><Phone className="h-3 w-3" />Ligação</TabsTrigger>
                    <TabsTrigger value="task" className="gap-1 text-xs"><ListChecks className="h-3 w-3" />Tarefa</TabsTrigger>
                  </TabsList>
                  <TabsContent value="note" className="mt-3 space-y-2">
                    <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Escreva uma anotação..." rows={3} />
                    <Button size="sm" onClick={addNote} disabled={savingNote || !newNote.trim()}>
                      {savingNote ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                      Salvar
                    </Button>
                  </TabsContent>
                  <TabsContent value="whatsapp" className="mt-3">
                    <p className="text-sm text-gray-500">Envie uma mensagem pelo WhatsApp conectado.</p>
                  </TabsContent>
                  <TabsContent value="call" className="mt-3">
                    <p className="text-sm text-gray-500">Registre uma ligação realizada.</p>
                  </TabsContent>
                  <TabsContent value="task" className="mt-3">
                    <p className="text-sm text-gray-500">Crie uma tarefa para este atendimento.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Activity timeline */}
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id as string} className="flex gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {act.type === "note" && <StickyNote className="h-4 w-4 text-gray-500" />}
                    {act.type === "whatsapp" && <MessageCircle className="h-4 w-4 text-green-500" />}
                    {act.type === "call" && <Phone className="h-4 w-4 text-blue-500" />}
                    {act.type === "stage_change" && <Clock className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap">{act.content as string}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(act.created_at as string).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">Nenhuma atividade registrada</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Pipeline</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(STAGE_LABELS).map(([key, label]) => (
                  <div key={key} className={`flex items-center gap-2 text-xs p-2 rounded ${
                    attendance.stage === key ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-500"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${attendance.stage === key ? "bg-blue-500" : "bg-gray-300"}`} />
                    {label}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Contato</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-gray-400" />{contactName}</p>
                {contactPhone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" />{contactPhone}</p>}
                {lead?.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" />{lead.email}</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AppointmentModal open={showAppointment} onClose={() => setShowAppointment(false)} attendanceId={id} clientName={contactName} />
    </AppLayout>
  );
}
