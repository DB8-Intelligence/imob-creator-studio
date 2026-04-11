/**
 * RelatoriosPerformancePage.tsx — Relatórios (MAX)
 *
 * Abas: Performance | Conversão | ROI | Relatório Completo
 * KPIs + funil + gráficos CSS + export.
 */
import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, Target, PieChart, FileDown, Download, Mail, Share2,
  Eye, MousePointer, Users, DollarSign, ArrowRight, Sparkles,
  BarChart3, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function RelatoriosPerformancePage() {
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState("mes");

  // ── Funil data ──
  const funnel = [
    { etapa: "Novo Lead", valor: 45, pct: 100, color: "bg-blue-500" },
    { etapa: "Contato feito", valor: 32, pct: 71, color: "bg-cyan-500" },
    { etapa: "Visita agendada", valor: 18, pct: 40, color: "bg-violet-500" },
    { etapa: "Proposta enviada", valor: 8, pct: 18, color: "bg-amber-500" },
    { etapa: "Fechado", valor: 3, pct: 7, color: "bg-emerald-500" },
  ];

  // ── Performance bar data ──
  const contentByType = [
    { tipo: "Feed", count: 24, color: "bg-blue-500" },
    { tipo: "Stories", count: 18, color: "bg-pink-500" },
    { tipo: "Reels", count: 8, color: "bg-violet-500" },
    { tipo: "Vídeo", count: 4, color: "bg-red-500" },
  ];
  const maxContent = Math.max(...contentByType.map((c) => c.count));

  // ── Leads by source ──
  const leadsBySource = [
    { fonte: "Instagram", count: 18, color: "bg-pink-500" },
    { fonte: "WhatsApp", count: 12, color: "bg-green-500" },
    { fonte: "Site", count: 8, color: "bg-blue-500" },
    { fonte: "Indicação", count: 7, color: "bg-violet-500" },
  ];
  const maxLeads = Math.max(...leadsBySource.map((l) => l.count));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          </div>
          <div className="flex gap-3">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar PDF</Button>
          </div>
        </div>

        <Tabs defaultValue="performance">
          <TabsList className="flex-wrap">
            <TabsTrigger value="performance" className="gap-1.5"><TrendingUp className="w-4 h-4" />Performance</TabsTrigger>
            <TabsTrigger value="conversao" className="gap-1.5"><Target className="w-4 h-4" />Conversão</TabsTrigger>
            <TabsTrigger value="roi" className="gap-1.5"><PieChart className="w-4 h-4" />ROI</TabsTrigger>
            <TabsTrigger value="completo" className="gap-1.5"><FileDown className="w-4 h-4" />Relatório Completo</TabsTrigger>
          </TabsList>

          {/* ── Performance ──────────────────────────────── */}
          <TabsContent value="performance" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Image className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Posts gerados</span></div><p className="text-2xl font-bold">54</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-violet-500" /><span className="text-xs text-muted-foreground">Engajamento médio</span></div><p className="text-2xl font-bold">4.2%</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Melhor post</span></div><p className="text-2xl font-bold">4.8K</p><p className="text-[10px] text-muted-foreground">views no Reel</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-amber-500" /><span className="text-xs text-muted-foreground">Seguidores +</span></div><p className="text-2xl font-bold">+127</p></CardContent></Card>
            </div>

            {/* Posts by type */}
            <Card><CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Posts por tipo</h3>
              <div className="space-y-3">
                {contentByType.map((c) => (
                  <div key={c.tipo} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{c.tipo}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", c.color)} style={{ width: `${(c.count / maxContent) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-foreground w-8 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* ── Conversão ────────────────────────────────── */}
          <TabsContent value="conversao" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total leads</p><p className="text-2xl font-bold">45</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lead → Visita</p><p className="text-2xl font-bold text-cyan-500">40%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Visita → Proposta</p><p className="text-2xl font-bold text-amber-500">44%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Proposta → Fechado</p><p className="text-2xl font-bold text-emerald-500">37%</p></CardContent></Card>
            </div>

            {/* Funnel */}
            <Card><CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Funil de conversão</h3>
              <div className="space-y-2">
                {funnel.map((step) => (
                  <div key={step.etapa} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 text-right">{step.etapa}</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                      <div className={cn("h-full rounded-lg flex items-center justify-end pr-3", step.color)} style={{ width: `${step.pct}%` }}>
                        <span className="text-xs font-bold text-white">{step.valor}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{step.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>

            {/* Leads by source */}
            <Card><CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">Leads por fonte</h3>
              <div className="space-y-3">
                {leadsBySource.map((l) => (
                  <div key={l.fonte} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20">{l.fonte}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", l.color)} style={{ width: `${(l.count / maxLeads) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{l.count}</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* ── ROI ──────────────────────────────────────── */}
          <TabsContent value="roi" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Investimento IA</p><p className="text-2xl font-bold">{fmt(297)}</p><p className="text-[10px] text-muted-foreground">Plano MAX</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transações</p><p className="text-2xl font-bold">3</p><p className="text-[10px] text-muted-foreground">este mês</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Comissão total</p><p className="text-2xl font-bold text-emerald-500">{fmt(39500)}</p></CardContent></Card>
              <Card className="border-accent/30 bg-accent/5"><CardContent className="p-4"><p className="text-xs text-accent">ROI</p><p className="text-2xl font-bold text-accent">13.300%</p><p className="text-[10px] text-muted-foreground">R$1 → R$133</p></CardContent></Card>
            </div>

            <Card><CardContent className="p-6 text-center">
              <DollarSign className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Cada R$ 1 investido no NexoImob gerou R$ 133 em comissões</p>
              <p className="text-sm text-muted-foreground mt-1">Baseado no faturamento e custo da plataforma neste período.</p>
            </CardContent></Card>
          </TabsContent>

          {/* ── Relatório Completo ────────────────────────── */}
          <TabsContent value="completo" className="mt-4">
            <Card><CardContent className="p-8 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-accent mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Relatório Completo</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Resumo executivo gerado por IA com todas as métricas de performance, conversão e ROI. Formatado para impressão e envio.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><FileDown className="w-4 h-4 mr-2" />Gerar PDF</Button>
                <Button variant="outline"><Mail className="w-4 h-4 mr-2" />Enviar por Email</Button>
                <Button variant="outline"><Share2 className="w-4 h-4 mr-2" />Compartilhar</Button>
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
