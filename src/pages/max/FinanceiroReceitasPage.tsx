/**
 * FinanceiroReceitasPage.tsx — Modulo Financeiro completo (Supabase + recharts)
 *
 * Route: /financeiro
 * KPIs + charts + receitas/despesas tables + modal + meta + export XLSX
 */
import { useState, useMemo, useCallback } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign, TrendingUp, TrendingDown, Trophy, ChevronLeft, ChevronRight,
  Plus, Download, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Trash2, Edit2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  useReceitas, useCreateReceita, useUpdateReceita, useDeleteReceita, useMarcarRecebido,
  useDespesas, useCreateDespesa, useUpdateDespesa, useDeleteDespesa, useMarcarPago,
  useResumoMensal, useResumoAnual, useMeta, useUpdateMeta,
} from "@/hooks/useFinanceiro";
import {
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA, MESES_FULL,
  type CategoriaReceita, type CategoriaDespesa, type StatusReceita, type StatusDespesa,
  type FrequenciaRecorrente, type FinanceiroReceita, type FinanceiroDespesa,
} from "@/types/financeiro";

/* ─── Helpers ──────────────────────────────────────────────────────── */

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function fmtFull(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const PIE_COLORS = ["#1e3a5f", "#2563eb", "#60a5fa", "#f59e0b", "#94a3b8"];

/* ─── Status badges ─────────────────────────────────────────────────── */

const STATUS_RECEITA_MAP: Record<StatusReceita, { label: string; cls: string }> = {
  previsto:  { label: "Previsto",  cls: "bg-blue-500/10 text-blue-600 border-blue-200" },
  recebido:  { label: "Recebido", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  cancelado: { label: "Cancelado", cls: "bg-gray-500/10 text-gray-500 border-gray-200" },
};

const STATUS_DESPESA_MAP: Record<StatusDespesa, { label: string; cls: string }> = {
  pendente:  { label: "Pendente",  cls: "bg-amber-500/10 text-amber-600 border-amber-200" },
  pago:      { label: "Pago",      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  cancelado: { label: "Cancelado", cls: "bg-gray-500/10 text-gray-500 border-gray-200" },
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function FinanceiroReceitasPage() {
  const { toast } = useToast();

  /* ── Month/year selector ───────────────────────────────── */
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const goMonth = (dir: -1 | 1) => {
    let m = mes + dir;
    let y = ano;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMes(m);
    setAno(y);
  };

  /* ── Queries ───────────────────────────────────────────── */
  const { data: resumo, isLoading: loadingResumo } = useResumoMensal(ano, mes);
  const { data: anual = [], isLoading: loadingAnual } = useResumoAnual(ano);
  const { data: meta } = useMeta(ano, mes);

  // Receitas filters
  const [filtroReceita, setFiltroReceita] = useState<StatusReceita | "todos">("todos");
  const receitaFiltros = useMemo(() => ({
    ano, mes,
    ...(filtroReceita !== "todos" ? { status: filtroReceita as StatusReceita } : {}),
  }), [ano, mes, filtroReceita]);
  const { data: receitas = [], isLoading: loadingReceitas } = useReceitas(receitaFiltros);

  // Despesas filters
  const [filtroDespesa, setFiltroDespesa] = useState<StatusDespesa | "todas" | "recorrentes">("todas");
  const despesaFiltros = useMemo(() => ({
    ano, mes,
    ...(filtroDespesa === "recorrentes" ? { recorrente: true } : {}),
    ...(filtroDespesa !== "todas" && filtroDespesa !== "recorrentes" ? { status: filtroDespesa as StatusDespesa } : {}),
  }), [ano, mes, filtroDespesa]);
  const { data: despesas = [], isLoading: loadingDespesas } = useDespesas(despesaFiltros);

  /* ── Mutations ─────────────────────────────────────────── */
  const createReceita = useCreateReceita();
  const updateReceita = useUpdateReceita();
  const deleteReceita = useDeleteReceita();
  const marcarRecebido = useMarcarRecebido();
  const createDespesa = useCreateDespesa();
  const updateDespesa = useUpdateDespesa();
  const deleteDespesa = useDeleteDespesa();
  const marcarPago = useMarcarPago();
  const updateMeta = useUpdateMeta();

  /* ── Modal state ───────────────────────────────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"receita" | "despesa">("receita");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm("receita", ano, mes));

  function defaultForm(mode: "receita" | "despesa", y: number, m: number) {
    return {
      descricao: "",
      categoria: mode === "receita" ? "comissao" : "marketing",
      valor: "",
      mes_competencia: `${y}-${String(m).padStart(2, "0")}`,
      data_recebimento: "",
      data_pagamento: "",
      status: mode === "receita" ? "previsto" : "pendente",
      recorrente: false,
      frequencia: "mensal" as FrequenciaRecorrente,
      observacoes: "",
      negocio_id: null as string | null,
    };
  }

  const openModal = (mode: "receita" | "despesa", item?: FinanceiroReceita | FinanceiroDespesa) => {
    setModalMode(mode);
    if (item) {
      setEditingId(item.id);
      setForm({
        descricao: item.descricao,
        categoria: item.categoria,
        valor: String(item.valor),
        mes_competencia: item.mes_competencia,
        data_recebimento: mode === "receita" ? (item as FinanceiroReceita).data_recebimento ?? "" : "",
        data_pagamento: mode === "despesa" ? (item as FinanceiroDespesa).data_pagamento ?? "" : "",
        status: item.status,
        recorrente: mode === "despesa" ? (item as FinanceiroDespesa).recorrente : false,
        frequencia: mode === "despesa" ? ((item as FinanceiroDespesa).frequencia ?? "mensal") : "mensal",
        observacoes: item.observacoes ?? "",
        negocio_id: mode === "receita" ? (item as FinanceiroReceita).negocio_id : null,
      });
    } else {
      setEditingId(null);
      setForm(defaultForm(mode, ano, mes));
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.descricao.trim() || !form.valor) {
      toast({ title: "Preencha todos os campos obrigatorios", variant: "destructive" });
      return;
    }
    const valor = parseFloat(form.valor.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast({ title: "Valor invalido", variant: "destructive" });
      return;
    }

    if (modalMode === "receita") {
      const payload = {
        descricao: form.descricao.trim(),
        categoria: form.categoria as CategoriaReceita,
        valor,
        mes_competencia: form.mes_competencia,
        data_recebimento: form.data_recebimento || null,
        status: form.status as StatusReceita,
        observacoes: form.observacoes || null,
        negocio_id: form.negocio_id || null,
      };
      if (editingId) {
        await updateReceita.mutateAsync({ id: editingId, ...payload });
      } else {
        await createReceita.mutateAsync(payload);
      }
    } else {
      const payload = {
        descricao: form.descricao.trim(),
        categoria: form.categoria as CategoriaDespesa,
        valor,
        mes_competencia: form.mes_competencia,
        data_pagamento: form.data_pagamento || null,
        status: form.status as StatusDespesa,
        recorrente: form.recorrente,
        frequencia: form.recorrente ? form.frequencia : null,
        observacoes: form.observacoes || null,
      };
      if (editingId) {
        await updateDespesa.mutateAsync({ id: editingId, ...payload });
      } else {
        await createDespesa.mutateAsync(payload);
      }
    }
    setModalOpen(false);
  };

  /* ── Meta dialog ───────────────────────────────────────── */
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaForm, setMetaForm] = useState({ meta_receita: "", meta_negocios: "" });

  const openMetaDialog = () => {
    setMetaForm({
      meta_receita: meta?.meta_receita ? String(meta.meta_receita) : "",
      meta_negocios: meta?.meta_negocios ? String(meta.meta_negocios) : "",
    });
    setMetaOpen(true);
  };

  const saveMeta = async () => {
    const mr = parseFloat(metaForm.meta_receita.replace(",", ".")) || 0;
    const mn = parseInt(metaForm.meta_negocios) || 0;
    await updateMeta.mutateAsync({ ano, mes, meta_receita: mr, meta_negocios: mn });
    setMetaOpen(false);
  };

  /* ── Pie chart data ────────────────────────────────────── */
  const pieData = useMemo(() => {
    const byCategoria: Record<string, number> = {};
    receitas.forEach((r) => {
      const cat = CATEGORIAS_RECEITA[r.categoria as CategoriaReceita]?.label ?? r.categoria;
      byCategoria[cat] = (byCategoria[cat] ?? 0) + Number(r.valor);
    });
    return Object.entries(byCategoria).map(([name, value]) => ({ name, value }));
  }, [receitas]);

  const handleExport = useCallback(async () => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();

      const recSheet = wb.addWorksheet("Receitas");
      recSheet.columns = [
        { header: "Descricao", key: "descricao" },
        { header: "Categoria", key: "categoria" },
        { header: "Competencia", key: "competencia" },
        { header: "Recebimento", key: "recebimento" },
        { header: "Valor", key: "valor" },
        { header: "Status", key: "status" },
      ];
      receitas.forEach((r) => recSheet.addRow({
        descricao: r.descricao,
        categoria: CATEGORIAS_RECEITA[r.categoria as CategoriaReceita]?.label ?? r.categoria,
        competencia: r.mes_competencia,
        recebimento: r.data_recebimento ?? "",
        valor: Number(r.valor),
        status: r.status,
      }));

      const despSheet = wb.addWorksheet("Despesas");
      despSheet.columns = [
        { header: "Descricao", key: "descricao" },
        { header: "Categoria", key: "categoria" },
        { header: "Competencia", key: "competencia" },
        { header: "Pagamento", key: "pagamento" },
        { header: "Valor", key: "valor" },
        { header: "Status", key: "status" },
        { header: "Recorrente", key: "recorrente" },
      ];
      despesas.forEach((d) => despSheet.addRow({
        descricao: d.descricao,
        categoria: CATEGORIAS_DESPESA[d.categoria as CategoriaDespesa]?.label ?? d.categoria,
        competencia: d.mes_competencia,
        pagamento: d.data_pagamento ?? "",
        valor: Number(d.valor),
        status: d.status,
        recorrente: d.recorrente ? "Sim" : "Nao",
      }));

      const dreSheet = wb.addWorksheet("DRE");
      dreSheet.columns = [
        { header: "Mes", key: "mes" },
        { header: "Receitas", key: "receitas" },
        { header: "Despesas", key: "despesas" },
        { header: "Resultado", key: "resultado" },
      ];
      anual.forEach((row) => dreSheet.addRow({
        mes: row.label,
        receitas: row.receitas,
        despesas: row.despesas,
        resultado: row.resultado,
      }));

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Financeiro_${ano}_${String(mes).padStart(2, "0")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "XLSX exportado com sucesso" });
    } catch {
      // Fallback to CSV
      const lines = ["Tipo;Descricao;Categoria;Competencia;Valor;Status"];
      receitas.forEach((r) => lines.push(`Receita;${r.descricao};${r.categoria};${r.mes_competencia};${r.valor};${r.status}`));
      despesas.forEach((d) => lines.push(`Despesa;${d.descricao};${d.categoria};${d.mes_competencia};${d.valor};${d.status}`));
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Financeiro_${ano}_${String(mes).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV exportado (xlsx indisponivel)" });
    }
  }, [receitas, despesas, anual, ano, mes, toast]);

  /* ── Derived values ────────────────────────────────────── */
  const r = resumo ?? {
    totalReceitas: 0, totalRecebido: 0, totalDespesas: 0, totalPago: 0,
    despesasPendentes: 0, resultado: 0, metaReceita: 0, metaNegocios: 0, percentualMeta: 0,
  };

  const metaColor = r.percentualMeta >= 100 ? "text-emerald-500" : r.percentualMeta >= 70 ? "text-amber-500" : "text-red-500";
  const metaBarColor = r.percentualMeta >= 100 ? "bg-emerald-500" : r.percentualMeta >= 70 ? "bg-amber-500" : "bg-red-500";

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => goMonth(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-semibold min-w-[140px] text-center">{MESES_FULL[mes]} {ano}</span>
            <Button variant="ghost" size="icon" onClick={() => goMonth(1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />Exportar XLSX
            </Button>
            <Button variant="outline" size="sm" onClick={openMetaDialog}>
              <Target className="w-4 h-4 mr-2" />Definir Meta
            </Button>
          </div>
        </div>

        {/* ─── 4 KPI Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receitas do Mes */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Receitas do Mes</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">{fmt(r.totalRecebido)}</p>
              {r.metaReceita > 0 && (
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", metaBarColor)}
                      style={{ width: `${Math.min(r.percentualMeta, 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{r.percentualMeta}% da meta ({fmt(r.metaReceita)})</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas do Mes */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-muted-foreground">Despesas do Mes</span>
              </div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{fmt(r.totalPago)}</p>
              {r.despesasPendentes > 0 && (
                <Badge variant="outline" className="text-[10px] text-red-500 border-red-300">
                  {r.despesasPendentes} pendente{r.despesasPendentes > 1 ? "s" : ""}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Resultado Liquido */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                {r.resultado >= 0
                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />}
                <span className="text-xs text-muted-foreground">Resultado Liquido</span>
              </div>
              <p className={cn("text-2xl font-bold", r.resultado >= 0 ? "text-emerald-500" : "text-red-500")}>
                {fmt(r.resultado)}
              </p>
            </CardContent>
          </Card>

          {/* Meta do Mes */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className={cn("w-4 h-4", metaColor)} />
                <span className="text-xs text-muted-foreground">Meta do Mes</span>
              </div>
              <p className={cn("text-2xl font-bold", metaColor)}>
                {r.metaReceita > 0 ? `${r.percentualMeta}%` : "--"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {r.metaReceita > 0 ? "atingida" : "Nenhuma meta definida"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ─── Charts ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Bar Chart - 12 months */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Receitas vs Despesas ({ano})</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={anual} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmtFull(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="receitas" name="Receitas" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Receitas por categoria */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Receitas por Categoria</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }: { name: string; percent: number }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtFull(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                  Sem receitas neste periodo
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line chart - resultado mensal */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Resultado Liquido Mensal ({ano})</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={anual} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtFull(v)} />
                <Line
                  type="monotone"
                  dataKey="resultado"
                  name="Resultado"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ─── Receitas Table ──────────────────────────────── */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Receitas</h3>
              <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white" onClick={() => openModal("receita")}>
                <Plus className="w-4 h-4 mr-1" />Receita
              </Button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {(["todos", "previsto", "recebido", "cancelado"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filtroReceita === f ? "default" : "outline"}
                  className={cn("text-xs h-7", filtroReceita === f && "bg-[#1e3a5f]")}
                  onClick={() => setFiltroReceita(f)}
                >
                  {f === "todos" ? "Todos" : STATUS_RECEITA_MAP[f].label}
                </Button>
              ))}
            </div>

            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Descricao</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Competencia</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Recebimento</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-[100px]">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingReceitas ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                  ) : receitas.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nenhuma receita encontrada</TableCell></TableRow>
                  ) : receitas.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-medium">{r.descricao}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORIAS_RECEITA[r.categoria as CategoriaReceita]?.emoji}{" "}
                          {CATEGORIAS_RECEITA[r.categoria as CategoriaReceita]?.label ?? r.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{r.mes_competencia}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {r.data_recebimento ? new Date(r.data_recebimento + "T12:00:00").toLocaleDateString("pt-BR") : "---"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-right text-emerald-600">{fmtFull(Number(r.valor))}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_RECEITA_MAP[r.status as StatusReceita]?.cls)}>
                          {STATUS_RECEITA_MAP[r.status as StatusReceita]?.label ?? r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {r.status === "previsto" && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600"
                              title="Marcar recebido"
                              onClick={() => marcarRecebido.mutate({ id: r.id, dataRecebimento: today() })}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => openModal("receita", r)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500"
                            onClick={() => deleteReceita.mutate(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ─── Despesas Table ──────────────────────────────── */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Despesas</h3>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => openModal("despesa")}>
                <Plus className="w-4 h-4 mr-1" />Despesa
              </Button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {(["todas", "pendente", "pago", "recorrentes"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filtroDespesa === f ? "default" : "outline"}
                  className={cn("text-xs h-7", filtroDespesa === f && "bg-[#1e3a5f]")}
                  onClick={() => setFiltroDespesa(f)}
                >
                  {f === "todas" ? "Todas" : f === "recorrentes" ? "Recorrentes" : STATUS_DESPESA_MAP[f]?.label}
                </Button>
              ))}
            </div>

            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Descricao</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Competencia</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Pagamento</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-[100px]">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDespesas ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                  ) : despesas.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nenhuma despesa encontrada</TableCell></TableRow>
                  ) : despesas.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-medium">
                        {d.descricao}
                        {d.recorrente && <Badge variant="secondary" className="ml-2 text-[9px]">Recorrente</Badge>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORIAS_DESPESA[d.categoria as CategoriaDespesa]?.emoji}{" "}
                          {CATEGORIAS_DESPESA[d.categoria as CategoriaDespesa]?.label ?? d.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{d.mes_competencia}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {d.data_pagamento ? new Date(d.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR") : "---"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-right text-red-600">{fmtFull(Number(d.valor))}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_DESPESA_MAP[d.status as StatusDespesa]?.cls)}>
                          {STATUS_DESPESA_MAP[d.status as StatusDespesa]?.label ?? d.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {d.status === "pendente" && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600"
                              title="Marcar pago"
                              onClick={() => marcarPago.mutate({ id: d.id, dataPagamento: today() })}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => openModal("despesa", d)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500"
                            onClick={() => deleteDespesa.mutate(d.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════
         RECEITA / DESPESA MODAL
         ════════════════════════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar" : "Nova"} {modalMode === "receita" ? "Receita" : "Despesa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Descricao */}
            <div>
              <Label>Descricao *</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Comissao venda Apt Brooklin"
              />
            </div>

            {/* Categoria + Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {modalMode === "receita"
                      ? Object.entries(CATEGORIAS_RECEITA).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                        ))
                      : Object.entries(CATEGORIAS_DESPESA).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  placeholder="36000.00"
                />
              </div>
            </div>

            {/* Competencia + Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mes competencia</Label>
                <Input
                  type="month"
                  value={form.mes_competencia}
                  onChange={(e) => setForm((f) => ({ ...f, mes_competencia: e.target.value }))}
                />
              </div>
              <div>
                <Label>{modalMode === "receita" ? "Data recebimento" : "Data pagamento"}</Label>
                <Input
                  type="date"
                  value={modalMode === "receita" ? form.data_recebimento : form.data_pagamento}
                  onChange={(e) =>
                    setForm((f) => modalMode === "receita"
                      ? { ...f, data_recebimento: e.target.value }
                      : { ...f, data_pagamento: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {modalMode === "receita" ? (
                    <>
                      <SelectItem value="previsto">Previsto</SelectItem>
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Recorrente toggle (despesa only) */}
            {modalMode === "despesa" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.recorrente ? "true" : "false"}
                    aria-label="Despesa recorrente"
                    title="Despesa recorrente"
                    onClick={() => setForm((f) => ({ ...f, recorrente: !f.recorrente }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      form.recorrente ? "bg-[#1e3a5f]" : "bg-muted",
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                      form.recorrente ? "translate-x-5" : "translate-x-0",
                    )} />
                  </button>
                  <Label className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, recorrente: !f.recorrente }))}>
                    Despesa recorrente
                  </Label>
                </div>
                {form.recorrente && (
                  <div>
                    <Label>Frequencia</Label>
                    <Select value={form.frequencia} onValueChange={(v) => setForm((f) => ({ ...f, frequencia: v as FrequenciaRecorrente }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Observacoes */}
            <div>
              <Label>Observacoes</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Anotacoes opcionais..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              className={cn(
                modalMode === "receita"
                  ? "bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                  : "bg-red-600 hover:bg-red-600/90 text-white",
              )}
              onClick={handleSave}
              disabled={createReceita.isPending || updateReceita.isPending || createDespesa.isPending || updateDespesa.isPending}
            >
              {(createReceita.isPending || updateReceita.isPending || createDespesa.isPending || updateDespesa.isPending)
                ? "Salvando..."
                : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
         META DIALOG
         ════════════════════════════════════════════════════════ */}
      <Dialog open={metaOpen} onOpenChange={setMetaOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Definir Meta — {MESES_FULL[mes]} {ano}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Meta de Receita (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={metaForm.meta_receita}
                onChange={(e) => setMetaForm((f) => ({ ...f, meta_receita: e.target.value }))}
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Meta de Negocios (quantidade)</Label>
              <Input
                type="number"
                min="0"
                value={metaForm.meta_negocios}
                onChange={(e) => setMetaForm((f) => ({ ...f, meta_negocios: e.target.value }))}
                placeholder="5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMetaOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white" onClick={saveMeta} disabled={updateMeta.isPending}>
              {updateMeta.isPending ? "Salvando..." : "Salvar Meta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
