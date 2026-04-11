/* ─── useFinanceiro — Complete financial data hook ────────────────── */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type {
  FinanceiroReceita,
  FinanceiroDespesa,
  FinanceiroMeta,
  ResumoMensal,
  ResumoAnual,
  CategoriaReceita,
  CategoriaDespesa,
  StatusReceita,
  StatusDespesa,
  FrequenciaRecorrente,
} from "@/types/financeiro";
import { MESES_LABEL } from "@/types/financeiro";

/* ─── Filters ──────────────────────────────────────────────────────── */

interface FiltrosReceita {
  mes?: number;
  ano?: number;
  status?: StatusReceita;
  categoria?: CategoriaReceita;
}

interface FiltrosDespesa {
  mes?: number;
  ano?: number;
  status?: StatusDespesa;
  categoria?: CategoriaDespesa;
  recorrente?: boolean;
}

/* ─── RECEITAS ─────────────────────────────────────────────────────── */

export function useReceitas(filtros: FiltrosReceita = {}) {
  const { user } = useAuth();
  return useQuery<FinanceiroReceita[]>({
    queryKey: ["financeiro-receitas", user?.id, filtros],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("financeiro_receitas")
        .select("*")
        .eq("user_id", user!.id)
        .order("mes_competencia", { ascending: false });

      if (filtros.ano && filtros.mes) {
        const comp = `${filtros.ano}-${String(filtros.mes).padStart(2, "0")}`;
        q = q.eq("mes_competencia", comp);
      } else if (filtros.ano) {
        q = q.gte("mes_competencia", `${filtros.ano}-01`).lte("mes_competencia", `${filtros.ano}-12`);
      }
      if (filtros.status) q = q.eq("status", filtros.status);
      if (filtros.categoria) q = q.eq("categoria", filtros.categoria);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FinanceiroReceita[];
    },
  });
}

export function useCreateReceita() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<FinanceiroReceita, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("financeiro_receitas")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroReceita;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-receitas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Receita criada com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar receita", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateReceita() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<FinanceiroReceita> & { id: string }) => {
      const { data, error } = await supabase
        .from("financeiro_receitas")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroReceita;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-receitas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Receita atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar receita", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteReceita() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financeiro_receitas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-receitas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Receita excluída" });
    },
    onError: (e: Error) => toast({ title: "Erro ao excluir receita", description: e.message, variant: "destructive" }),
  });
}

export function useMarcarRecebido() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, dataRecebimento }: { id: string; dataRecebimento: string }) => {
      const { data, error } = await supabase
        .from("financeiro_receitas")
        .update({ status: "recebido", data_recebimento: dataRecebimento })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroReceita;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-receitas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Receita marcada como recebida" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

/* ─── DESPESAS ─────────────────────────────────────────────────────── */

export function useDespesas(filtros: FiltrosDespesa = {}) {
  const { user } = useAuth();
  return useQuery<FinanceiroDespesa[]>({
    queryKey: ["financeiro-despesas", user?.id, filtros],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("financeiro_despesas")
        .select("*")
        .eq("user_id", user!.id)
        .order("mes_competencia", { ascending: false });

      if (filtros.ano && filtros.mes) {
        const comp = `${filtros.ano}-${String(filtros.mes).padStart(2, "0")}`;
        q = q.eq("mes_competencia", comp);
      } else if (filtros.ano) {
        q = q.gte("mes_competencia", `${filtros.ano}-01`).lte("mes_competencia", `${filtros.ano}-12`);
      }
      if (filtros.status) q = q.eq("status", filtros.status);
      if (filtros.categoria) q = q.eq("categoria", filtros.categoria);
      if (filtros.recorrente !== undefined) q = q.eq("recorrente", filtros.recorrente);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FinanceiroDespesa[];
    },
  });
}

export function useCreateDespesa() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<FinanceiroDespesa, "id" | "user_id" | "created_at" | "updated_at">) => {
      const rows: Array<Omit<FinanceiroDespesa, "id" | "created_at" | "updated_at">> = [];
      rows.push({ ...input, user_id: user!.id });

      // If recorrente, create next 11 months automatically
      if (input.recorrente && input.frequencia) {
        const [baseYear, baseMonth] = input.mes_competencia.split("-").map(Number);
        const step = input.frequencia === "mensal" ? 1 : input.frequencia === "trimestral" ? 3 : 12;
        for (let i = 1; i <= 11; i++) {
          const totalMonths = (baseYear * 12 + baseMonth - 1) + (step * i);
          const y = Math.floor(totalMonths / 12);
          const m = (totalMonths % 12) + 1;
          rows.push({
            ...input,
            user_id: user!.id,
            mes_competencia: `${y}-${String(m).padStart(2, "0")}`,
            data_pagamento: null,
            status: "pendente",
          });
        }
      }

      const { data, error } = await supabase
        .from("financeiro_despesas")
        .insert(rows)
        .select();
      if (error) throw error;
      return data as FinanceiroDespesa[];
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["financeiro-despesas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: data.length > 1 ? `${data.length} despesas criadas (recorrente)` : "Despesa criada com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro ao criar despesa", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateDespesa() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<FinanceiroDespesa> & { id: string }) => {
      const { data, error } = await supabase
        .from("financeiro_despesas")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroDespesa;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-despesas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Despesa atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar despesa", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteDespesa() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financeiro_despesas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-despesas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Despesa excluída" });
    },
    onError: (e: Error) => toast({ title: "Erro ao excluir despesa", description: e.message, variant: "destructive" }),
  });
}

export function useMarcarPago() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, dataPagamento }: { id: string; dataPagamento: string }) => {
      const { data, error } = await supabase
        .from("financeiro_despesas")
        .update({ status: "pago", data_pagamento: dataPagamento })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroDespesa;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-despesas"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Despesa marcada como paga" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
}

/* ─── RESUMO MENSAL ────────────────────────────────────────────────── */

export function useResumoMensal(ano: number, mes: number) {
  const { user } = useAuth();
  const comp = `${ano}-${String(mes).padStart(2, "0")}`;

  return useQuery<ResumoMensal>({
    queryKey: ["financeiro-resumo", "mensal", user?.id, comp],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: receitas }, { data: despesas }, { data: metas }] = await Promise.all([
        supabase.from("financeiro_receitas").select("*").eq("user_id", user!.id).eq("mes_competencia", comp),
        supabase.from("financeiro_despesas").select("*").eq("user_id", user!.id).eq("mes_competencia", comp),
        supabase.from("financeiro_metas").select("*").eq("user_id", user!.id).eq("ano", ano).eq("mes", mes).limit(1),
      ]);

      const recs = (receitas ?? []) as FinanceiroReceita[];
      const desps = (despesas ?? []) as FinanceiroDespesa[];
      const meta = (metas ?? [])[0] as FinanceiroMeta | undefined;

      const totalReceitas = recs.reduce((s, r) => s + Number(r.valor), 0);
      const totalRecebido = recs.filter((r) => r.status === "recebido").reduce((s, r) => s + Number(r.valor), 0);
      const totalDespesas = desps.reduce((s, d) => s + Number(d.valor), 0);
      const totalPago = desps.filter((d) => d.status === "pago").reduce((s, d) => s + Number(d.valor), 0);
      const despesasPendentes = desps.filter((d) => d.status === "pendente").length;
      const metaReceita = meta?.meta_receita ?? 0;
      const metaNegocios = meta?.meta_negocios ?? 0;

      return {
        totalReceitas,
        totalRecebido,
        totalDespesas,
        totalPago,
        despesasPendentes,
        resultado: totalRecebido - totalPago,
        metaReceita,
        metaNegocios,
        percentualMeta: metaReceita > 0 ? Math.round((totalRecebido / metaReceita) * 100) : 0,
      };
    },
  });
}

/* ─── RESUMO ANUAL (12 months for charts) ──────────────────────────── */

export function useResumoAnual(ano: number) {
  const { user } = useAuth();

  return useQuery<ResumoAnual[]>({
    queryKey: ["financeiro-resumo", "anual", user?.id, ano],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: receitas }, { data: despesas }] = await Promise.all([
        supabase
          .from("financeiro_receitas")
          .select("mes_competencia, valor, status")
          .eq("user_id", user!.id)
          .gte("mes_competencia", `${ano}-01`)
          .lte("mes_competencia", `${ano}-12`),
        supabase
          .from("financeiro_despesas")
          .select("mes_competencia, valor, status")
          .eq("user_id", user!.id)
          .gte("mes_competencia", `${ano}-01`)
          .lte("mes_competencia", `${ano}-12`),
      ]);

      const recs = (receitas ?? []) as Array<{ mes_competencia: string; valor: number; status: string }>;
      const desps = (despesas ?? []) as Array<{ mes_competencia: string; valor: number; status: string }>;

      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const comp = `${ano}-${String(m).padStart(2, "0")}`;
        const recMes = recs.filter((r) => r.mes_competencia === comp).reduce((s, r) => s + Number(r.valor), 0);
        const desMes = desps.filter((d) => d.mes_competencia === comp).reduce((s, d) => s + Number(d.valor), 0);
        return {
          mes: m,
          label: MESES_LABEL[m],
          receitas: recMes,
          despesas: desMes,
          resultado: recMes - desMes,
        };
      });
    },
  });
}

/* ─── METAS ────────────────────────────────────────────────────────── */

export function useMeta(ano: number, mes: number) {
  const { user } = useAuth();
  return useQuery<FinanceiroMeta | null>({
    queryKey: ["financeiro-meta", user?.id, ano, mes],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financeiro_metas")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ano", ano)
        .eq("mes", mes)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as FinanceiroMeta | null;
    },
  });
}

export function useUpdateMeta() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { ano: number; mes: number; meta_receita: number; meta_negocios: number }) => {
      const { data, error } = await supabase
        .from("financeiro_metas")
        .upsert(
          { user_id: user!.id, ...input },
          { onConflict: "user_id,ano,mes" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as FinanceiroMeta;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-meta"] });
      qc.invalidateQueries({ queryKey: ["financeiro-resumo"] });
      toast({ title: "Meta atualizada" });
    },
    onError: (e: Error) => toast({ title: "Erro ao salvar meta", description: e.message, variant: "destructive" }),
  });
}
