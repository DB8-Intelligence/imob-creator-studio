/**
 * FinanceiroReceitasPage.tsx — Módulo Financeiro completo (MAX)
 *
 * Abas: Visão Geral | Comissões | Receitas/Despesas | Relatório
 * KPIs + gráficos + tabelas + modais de registro.
 */
import { useState, useMemo } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DollarSign, TrendingUp, TrendingDown, Receipt, Plus, Download,
  ArrowUpCircle, ArrowDownCircle, PiggyBank, BarChart3, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── Mock data ─────────────────────────────────────────────────────────────

interface FinancialRecord {
  id: string; tipo: "receita" | "despesa"; categoria: string;
  descricao: string; valor: number; data: string; status: string;
}

interface Commission {
  id: string; imovel: string; comprador: string; valorTransacao: number;
  percentual: number; valorComissao: number; dataFechamento: string;
  status: "prevista" | "confirmada" | "recebida" | "perdida";
}

const MOCK_RECORDS: FinancialRecord[] = [
  { id: "fr1", tipo: "receita", categoria: "Comissão", descricao: "Comissão venda Apt Brooklin", valor: 36000, data: "2026-04-02", status: "confirmado" },
  { id: "fr2", tipo: "despesa", categoria: "Marketing", descricao: "Meta Ads — Campanha Abril", valor: 2500, data: "2026-04-01", status: "confirmado" },
  { id: "fr3", tipo: "despesa", categoria: "Ferramentas", descricao: "ImobCreator AI — Plano MAX", valor: 297, data: "2026-04-01", status: "confirmado" },
  { id: "fr4", tipo: "receita", categoria: "Comissão", descricao: "Comissão aluguel Studio Moema", valor: 3500, data: "2026-03-28", status: "confirmado" },
  { id: "fr5", tipo: "despesa", categoria: "Deslocamento", descricao: "Combustível + estacionamento", valor: 450, data: "2026-03-25", status: "confirmado" },
  { id: "fr6", tipo: "receita", categoria: "Indicação", descricao: "Bônus indicação Fernando", valor: 5000, data: "2026-03-20", status: "confirmado" },
  { id: "fr7", tipo: "despesa", categoria: "Marketing", descricao: "Fotos profissionais 3 imóveis", valor: 900, data: "2026-03-15", status: "confirmado" },
];

const MOCK_COMMISSIONS: Commission[] = [
  { id: "cm1", imovel: "Cobertura Itaim 200m²", comprador: "Mariana Costa", valorTransacao: 3150000, percentual: 5, valorComissao: 157500, dataFechamento: "2026-04-10", status: "prevista" },
  { id: "cm2", imovel: "Apt Brooklin 2Q", comprador: "Fernando Souza", valorTransacao: 720000, percentual: 5, valorComissao: 36000, dataFechamento: "2026-04-02", status: "recebida" },
  { id: "cm3", imovel: "Studio Moema", comprador: "Ana Paula Silva", valorTransacao: 3500, percentual: 100, valorComissao: 3500, dataFechamento: "2026-03-28", status: "recebida" },
  { id: "cm4", imovel: "Casa Alphaville 420m²", comprador: "Roberto Almeida", valorTransacao: 2200000, percentual: 5, valorComissao: 110000, dataFechamento: "", status: "prevista" },
];

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const STATUS_COMISSAO = {
  prevista: { label: "Prevista", color: "bg-blue-500/10 text-blue-500" },
  confirmada: { label: "Confirmada", color: "bg-amber-500/10 text-amber-500" },
  recebida: { label: "Recebida", color: "bg-emerald-500/10 text-emerald-500" },
  perdida: { label: "Perdida", color: "bg-red-500/10 text-red-500" },
};

export default function FinanceiroReceitasPage() {
  const { toast } = useToast();
  const [newRecordOpen, setNewRecordOpen] = useState(false);

  const receitas = MOCK_RECORDS.filter((r) => r.tipo === "receita").reduce((s, r) => s + r.valor, 0);
  const despesas = MOCK_RECORDS.filter((r) => r.tipo === "despesa").reduce((s, r) => s + r.valor, 0);
  const comissoesAReceber = MOCK_COMMISSIONS.filter((c) => c.status === "prevista").reduce((s, c) => s + c.valorComissao, 0);
  const lucro = receitas - despesas;

  // Simple bar chart data (last 6 months)
  const barData = [
    { mes: "Nov", receita: 28000, despesa: 5200 },
    { mes: "Dez", receita: 45000, despesa: 7800 },
    { mes: "Jan", receita: 32000, despesa: 4100 },
    { mes: "Fev", receita: 38000, despesa: 6300 },
    { mes: "Mar", receita: 44500, despesa: 4850 },
    { mes: "Abr", receita: receitas, despesa: despesas },
  ];
  const maxBar = Math.max(...barData.map((d) => Math.max(d.receita, d.despesa)));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          </div>
          <Button onClick={() => setNewRecordOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />Novo Registro
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><ArrowUpCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Receita do mês</span></div>
            <p className="text-2xl font-bold text-emerald-500">{fmt(receitas)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><PiggyBank className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Comissões a receber</span></div>
            <p className="text-2xl font-bold text-blue-500">{fmt(comissoesAReceber)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><ArrowDownCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-muted-foreground">Despesas do mês</span></div>
            <p className="text-2xl font-bold text-red-500">{fmt(despesas)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-foreground" /><span className="text-xs text-muted-foreground">Lucro líquido</span></div>
            <p className={cn("text-2xl font-bold", lucro >= 0 ? "text-emerald-500" : "text-red-500")}>{fmt(lucro)}</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="visao">
          <TabsList>
            <TabsTrigger value="visao" className="gap-1.5"><BarChart3 className="w-4 h-4" />Visão Geral</TabsTrigger>
            <TabsTrigger value="comissoes" className="gap-1.5"><PiggyBank className="w-4 h-4" />Comissões</TabsTrigger>
            <TabsTrigger value="registros" className="gap-1.5"><Receipt className="w-4 h-4" />Receitas/Despesas</TabsTrigger>
            <TabsTrigger value="relatorio" className="gap-1.5"><FileDown className="w-4 h-4" />Relatório</TabsTrigger>
          </TabsList>

          {/* ── Visão Geral ─────────────────────────────── */}
          <TabsContent value="visao" className="mt-4 space-y-6">
            {/* Bar chart (CSS-only) */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Receitas vs Despesas (6 meses)</h3>
                <div className="flex items-end gap-3 h-40">
                  {barData.map((d) => (
                    <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end w-full justify-center h-32">
                        <div className="w-5 bg-emerald-500/80 rounded-t" style={{ height: `${(d.receita / maxBar) * 100}%` }} />
                        <div className="w-5 bg-red-400/80 rounded-t" style={{ height: `${(d.despesa / maxBar) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.mes}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 justify-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/80" />Receitas</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400/80" />Despesas</span>
                </div>
              </CardContent>
            </Card>

            {/* Latest transactions */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Últimas transações</h3>
                <div className="space-y-2">
                  {MOCK_RECORDS.slice(0, 6).map((r) => (
                    <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      {r.tipo === "receita" ? <ArrowUpCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <ArrowDownCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{r.descricao}</p>
                        <p className="text-[10px] text-muted-foreground">{r.categoria} &middot; {new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                      </div>
                      <span className={cn("text-sm font-semibold", r.tipo === "receita" ? "text-emerald-500" : "text-red-500")}>
                        {r.tipo === "receita" ? "+" : "-"}{fmt(r.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Comissões ───────────────────────────────── */}
          <TabsContent value="comissoes" className="mt-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {Object.entries(STATUS_COMISSAO).map(([k, v]) => {
                const count = MOCK_COMMISSIONS.filter((c) => c.status === k).length;
                return count > 0 ? <Badge key={k} variant="secondary" className={cn("text-xs", v.color)}>{v.label}: {count}</Badge> : null;
              })}
            </div>
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Imóvel</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Comprador</TableHead>
                    <TableHead className="text-xs">Transação</TableHead>
                    <TableHead className="text-xs">Comissão</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_COMMISSIONS.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-medium">{c.imovel}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.comprador}</TableCell>
                      <TableCell className="text-xs">{fmt(c.valorTransacao)} ({c.percentual}%)</TableCell>
                      <TableCell className="text-sm font-bold text-foreground">{fmt(c.valorComissao)}</TableCell>
                      <TableCell><Badge variant="secondary" className={cn("text-[10px]", STATUS_COMISSAO[c.status].color)}>{STATUS_COMISSAO[c.status].label}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Receitas/Despesas ─────────────────────── */}
          <TabsContent value="registros" className="mt-4">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8"></TableHead>
                    <TableHead className="text-xs">Descrição</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_RECORDS.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.tipo === "receita" ? <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> : <ArrowDownCircle className="w-4 h-4 text-red-500" />}</TableCell>
                      <TableCell className="text-sm">{r.descricao}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="text-[10px]">{r.categoria}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</TableCell>
                      <TableCell className={cn("text-sm font-semibold text-right", r.tipo === "receita" ? "text-emerald-500" : "text-red-500")}>{r.tipo === "receita" ? "+" : "-"}{fmt(r.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Relatório ────────────────────────────── */}
          <TabsContent value="relatorio" className="mt-4">
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <FileDown className="w-12 h-12 text-accent mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">Relatório Financeiro</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Gere relatórios PDF mensais, trimestrais ou anuais com dados para Imposto de Renda.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Excel</Button>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><FileDown className="w-4 h-4 mr-2" />Gerar PDF Completo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New record dialog */}
      <Dialog open={newRecordOpen} onOpenChange={setNewRecordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Registro</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo</Label><Select defaultValue="receita"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent></Select></div>
              <div><Label>Categoria</Label><Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="comissao">Comissão</SelectItem><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="deslocamento">Deslocamento</SelectItem><SelectItem value="ferramentas">Ferramentas</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Descrição</Label><Input placeholder="Ex: Comissão venda Apt Brooklin" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor (R$)</Label><Input type="number" placeholder="36000" /></div>
              <div><Label>Data</Label><Input type="date" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRecordOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground" onClick={() => { setNewRecordOpen(false); toast({ title: "Registro salvo" }); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
