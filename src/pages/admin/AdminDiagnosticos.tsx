import { useEffect, useState, useMemo, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BarChart3,
  CalendarDays,
  TrendingUp,
  Target,
  MoreVertical,
  FileText,
  CheckCircle2,
  MessageCircle,
  Trash2,
  Download,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface DiagnosticoLead {
  id: string;
  nome: string;
  instagram: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  especialidade: string | null;
  nivel: string | null;
  score_geral: number | null;
  maior_dificuldade: string | null;
  converteu: boolean;
  diagnostico_json: Record<string, unknown> | null;
  created_at: string;
}

interface Stats {
  total: number;
  hoje: number;
  taxaConversao: number;
  scoreMedio: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `há ${diffD}d`;
  const diffM = Math.floor(diffD / 30);
  return `há ${diffM} meses`;
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-muted-foreground";
  if (score < 40) return "text-red-500";
  if (score <= 70) return "text-yellow-500";
  return "text-green-500";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function periodStart(periodo: string): string | null {
  const now = new Date();
  if (periodo === "hoje") return todayISO();
  if (periodo === "7dias") {
    now.setDate(now.getDate() - 7);
    return now.toISOString().slice(0, 10);
  }
  if (periodo === "30dias") {
    now.setDate(now.getDate() - 30);
    return now.toISOString().slice(0, 10);
  }
  return null; // "todos"
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminDiagnosticos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin gate
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // Data
  const [leads, setLeads] = useState<DiagnosticoLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodo, setPeriodo] = useState("todos");
  const [nivel, setNivel] = useState("todos");
  const [especialidade, setEspecialidade] = useState("todas");
  const [cidade, setCidade] = useState("");
  const [convertido, setConvertido] = useState("todos");

  // Sheet (detail drawer)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DiagnosticoLead | null>(null);

  // ── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("diagnostico_leads")
      .select("*")
      .order("created_at", { ascending: false });

    const start = periodStart(periodo);
    if (start) query = query.gte("created_at", start);
    if (nivel !== "todos") query = query.eq("nivel", nivel);
    if (especialidade !== "todas") query = query.eq("especialidade", especialidade);
    if (cidade.trim()) query = query.ilike("cidade", `%${cidade.trim()}%`);
    if (convertido === "sim") query = query.eq("converteu", true);
    if (convertido === "nao") query = query.eq("converteu", false);

    const { data, error } = await query;
    if (error) {
      console.error("Erro ao carregar diagnósticos:", error);
      toast({ title: "Erro", description: "Falha ao carregar diagnósticos.", variant: "destructive" });
    }
    setLeads((data as DiagnosticoLead[]) ?? []);
    setLoading(false);
  }, [periodo, nivel, especialidade, cidade, convertido, toast]);

  useEffect(() => {
    if (isAdmin) fetchLeads();
  }, [isAdmin, fetchLeads]);

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = useMemo<Stats>(() => {
    const total = leads.length;
    const hoje = leads.filter(
      (l) => l.created_at.slice(0, 10) === todayISO()
    ).length;
    const convertidos = leads.filter((l) => l.converteu).length;
    const taxaConversao = total > 0 ? (convertidos / total) * 100 : 0;
    const scores = leads.map((l) => l.score_geral).filter((s): s is number => s != null);
    const scoreMedio = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { total, hoje, taxaConversao, scoreMedio };
  }, [leads]);

  // ── Unique filter values ────────────────────────────────────────────────
  const especialidades = useMemo(
    () => [...new Set(leads.map((l) => l.especialidade).filter(Boolean))] as string[],
    [leads]
  );

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleMarcarConvertido = async (lead: DiagnosticoLead) => {
    const { error } = await supabase
      .from("diagnostico_leads")
      .update({ converteu: true })
      .eq("id", lead.id);
    if (error) {
      toast({ title: "Erro", description: "Falha ao atualizar.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `${lead.nome} marcado como convertido.` });
      fetchLeads();
    }
  };

  const handleExcluir = async (lead: DiagnosticoLead) => {
    if (!confirm(`Excluir diagnóstico de ${lead.nome}?`)) return;
    const { error } = await supabase.from("diagnostico_leads").delete().eq("id", lead.id);
    if (error) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    } else {
      toast({ title: "Excluído", description: `Diagnóstico de ${lead.nome} removido.` });
      fetchLeads();
    }
  };

  const handleWhatsApp = (lead: DiagnosticoLead) => {
    const phone = (lead.telefone ?? "").replace(/\D/g, "");
    const text = encodeURIComponent(`Olá ${lead.nome}! Vi seu diagnóstico e gostaria de conversar com você sobre como melhorar seus resultados.`);
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
  };

  const handleVerRelatorio = (lead: DiagnosticoLead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "Nome",
      "Instagram",
      "Telefone",
      "Email",
      "Cidade",
      "Especialidade",
      "Nível",
      "Score",
      "Maior Dificuldade",
      "Converteu",
      "Data",
    ];
    const rows = leads.map((l) => [
      l.nome,
      l.instagram ?? "",
      l.telefone ?? "",
      l.email ?? "",
      l.cidade ?? "",
      l.especialidade ?? "",
      l.nivel ?? "",
      l.score_geral?.toString() ?? "",
      l.maior_dificuldade ?? "",
      l.converteu ? "Sim" : "Não",
      new Date(l.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosticos_${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Access denied ───────────────────────────────────────────────────────
  if (isAdmin === false) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <ShieldAlert className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Diagnósticos</h1>
            <p className="text-muted-foreground text-sm">
              Painel administrativo de leads do diagnóstico imobiliário
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" disabled={leads.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total diagnósticos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realizados hoje</p>
                <p className="text-2xl font-bold">{stats.hoje}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de conversão</p>
                <p className="text-2xl font-bold">{stats.taxaConversao.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score médio</p>
                <p className="text-2xl font-bold">{stats.scoreMedio.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <label className="text-xs text-muted-foreground mb-1 block">Período</label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">7 dias</SelectItem>
                <SelectItem value="30dias">30 dias</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground mb-1 block">Nível</label>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediário">Intermediário</SelectItem>
                <SelectItem value="avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <label className="text-xs text-muted-foreground mb-1 block">Especialidade</label>
            <Select value={especialidade} onValueChange={setEspecialidade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {especialidades.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground mb-1 block">Cidade</label>
            <Input
              placeholder="Filtrar cidade..."
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>
          <div className="w-36">
            <label className="text-xs text-muted-foreground mb-1 block">Convertido</label>
            <Select value={convertido} onValueChange={setConvertido}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Nenhum diagnóstico realizado ainda</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="hidden md:table-cell">Cidade</TableHead>
                  <TableHead className="hidden lg:table-cell">Especialidade</TableHead>
                  <TableHead className="hidden lg:table-cell">Maior dificuldade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Converteu</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-semibold">{lead.nome}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.instagram ? `@${lead.instagram.replace(/^@/, "")}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${scoreColor(lead.score_geral)}`}>
                        {lead.score_geral ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.nivel ? (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {lead.nivel}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {lead.cidade ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {lead.especialidade ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate">
                      {lead.maior_dificuldade ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {timeAgo(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      {lead.converteu ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerRelatorio(lead)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Ver relatório
                          </DropdownMenuItem>
                          {!lead.converteu && (
                            <DropdownMenuItem onClick={() => handleMarcarConvertido(lead)}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Marcar convertido
                            </DropdownMenuItem>
                          )}
                          {lead.telefone && (
                            <DropdownMenuItem onClick={() => handleWhatsApp(lead)}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleExcluir(lead)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Sheet drawer — full diagnostico_json */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Relatório — {selectedLead?.nome}</SheetTitle>
            </SheetHeader>
            {selectedLead && (
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Instagram:</span>{" "}
                    {selectedLead.instagram ? `@${selectedLead.instagram.replace(/^@/, "")}` : "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>{" "}
                    {selectedLead.telefone ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedLead.email ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cidade:</span>{" "}
                    {selectedLead.cidade ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Especialidade:</span>{" "}
                    {selectedLead.especialidade ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nível:</span>{" "}
                    {selectedLead.nivel ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>{" "}
                    <span className={scoreColor(selectedLead.score_geral)}>
                      {selectedLead.score_geral ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Converteu:</span>{" "}
                    {selectedLead.converteu ? "Sim" : "Não"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Maior dificuldade:</span>
                  <p className="mt-1">{selectedLead.maior_dificuldade ?? "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block mb-2">
                    Diagnóstico completo (JSON):
                  </span>
                  {selectedLead.diagnostico_json ? (
                    <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedLead.diagnostico_json, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground italic">Sem dados de diagnóstico.</p>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
