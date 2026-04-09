import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, LayoutGrid, List, Loader2, Thermometer, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Attendance {
  id: string;
  stage: string;
  thermometer: number;
  notes: string | null;
  created_at: string;
  leads?: { name: string; phone: string } | null;
  clients?: { name: string } | null;
}

const STAGES = [
  { key: "waiting", label: "Em espera", color: "bg-gray-100 border-gray-300" },
  { key: "awaiting_return", label: "Aguardando retorno", color: "bg-yellow-50 border-yellow-300" },
  { key: "in_attendance", label: "Em atendimento", color: "bg-blue-50 border-blue-300" },
  { key: "visit_scheduled", label: "Visita agendada", color: "bg-purple-50 border-purple-300" },
  { key: "proposal", label: "Em proposta", color: "bg-orange-50 border-orange-300" },
  { key: "contract", label: "Em contrato", color: "bg-green-50 border-green-300" },
];

export default function AttendancesPage() {
  const { toast } = useToast();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState("");
  const [moveDialog, setMoveDialog] = useState<{ attendance: Attendance; toStage: string } | null>(null);
  const [moving, setMoving] = useState(false);

  const fetchAttendances = useCallback(async () => {
    const { data } = await supabase
      .from("attendances")
      .select("*, leads(name, phone), clients(name)")
      .order("created_at", { ascending: false });
    setAttendances((data as Attendance[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAttendances(); }, [fetchAttendances]);

  const handleMoveConfirm = async () => {
    if (!moveDialog) return;
    setMoving(true);
    await supabase.from("attendances")
      .update({ stage: moveDialog.toStage, stage_changed_at: new Date().toISOString() })
      .eq("id", moveDialog.attendance.id);
    toast({ title: "Etapa alterada!" });
    setMoveDialog(null);
    setMoving(false);
    fetchAttendances();
  };

  const byStage = (stage: string) =>
    attendances.filter((a) =>
      a.stage === stage &&
      (filter === "" || (a.leads?.name ?? a.clients?.name ?? "").toLowerCase().includes(filter.toLowerCase()))
    );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Atendimentos</h1>
            <p className="text-sm text-gray-500">{attendances.length} atendimentos</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-9 w-64" placeholder="Filtrar por nome..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <Button size="sm" variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button size="sm" variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : view === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const items = byStage(stage.key);
              return (
                <div key={stage.key} className={`min-w-[240px] flex-1 rounded-xl border-2 ${stage.color} p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">{stage.label}</p>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((att) => (
                      <Card key={att.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3 space-y-2">
                          <p className="text-sm font-medium truncate">{att.leads?.name ?? att.clients?.name ?? "Sem nome"}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((n) => (
                                <div key={n} className={`w-2 h-2 rounded-full ${n <= att.thermometer ? "bg-orange-400" : "bg-gray-200"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(att.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {STAGES.filter((s) => s.key !== att.stage).slice(0, 2).map((s) => (
                              <button key={s.key} onClick={() => setMoveDialog({ attendance: att, toStage: s.key })}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-0.5">
                                <ArrowRight className="h-2 w-2" />{s.label}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <p className="text-xs text-center text-gray-400 py-4">Nenhum</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="p-3">Nome</th><th className="p-3">Etapa</th><th className="p-3">Termômetro</th><th className="p-3">Data</th>
                </tr></thead>
                <tbody>
                  {attendances.filter((a) => filter === "" || (a.leads?.name ?? "").toLowerCase().includes(filter.toLowerCase())).map((att) => (
                    <tr key={att.id} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="p-3 font-medium">{att.leads?.name ?? att.clients?.name ?? "—"}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{STAGES.find((s) => s.key === att.stage)?.label}</Badge></td>
                      <td className="p-3">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map((n) => (
                          <div key={n} className={`w-2 h-2 rounded-full ${n <= att.thermometer ? "bg-orange-400" : "bg-gray-200"}`} />
                        ))}</div>
                      </td>
                      <td className="p-3 text-gray-400">{new Date(att.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar etapa</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Mover <strong>{moveDialog?.attendance.leads?.name ?? "atendimento"}</strong> para{" "}
            <strong>{STAGES.find((s) => s.key === moveDialog?.toStage)?.label}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialog(null)}>Cancelar</Button>
            <Button onClick={handleMoveConfirm} disabled={moving}>
              {moving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
