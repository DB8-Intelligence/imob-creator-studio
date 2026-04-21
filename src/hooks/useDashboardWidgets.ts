/**
 * useDashboardWidgets — fonte de dados real dos 3 widgets Univen do dashboard:
 *  1. Atendimentos pendentes (leads com status 'new')
 *  2. Compromissos de hoje+amanhã (appointments entre now e +48h)
 *  3. Pretensão de compra (aggregate de leads.interesse_tipo)
 *
 * RLS já garante filtro por workspace_id (só dados do workspace do usuário).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  AtendimentoItem,
  CompromissoItem,
  PretensaoItem,
} from "@/components/dashboard/UnivenStyleWidgets";

export interface DashboardWidgetsData {
  atendimentos: AtendimentoItem[];
  compromissos: CompromissoItem[];
  pretensao: PretensaoItem[];
  loading: boolean;
}

/**
 * Mapeia valores do campo interesse_tipo (compra/aluguel/lancamento) pra labels e cores.
 * Labels não mapeados viram "Outros".
 */
const INTERESSE_LABELS: Record<string, string> = {
  compra: "Compra",
  aluguel: "Locação",
  lancamento: "Lançamento",
  temporada: "Temporada",
  avaliacao: "Avaliação",
  permuta: "Permuta",
};

const INTERESSE_COLORS: Record<string, string> = {
  compra: "#0891B2",
  aluguel: "#10B981",
  lancamento: "#F59E0B",
  temporada: "#8B5CF6",
  avaliacao: "#6B7280",
  permuta: "#EC4899",
};

/**
 * Heurística pra mapear tipo de appointment pro enum do widget.
 * Valores comuns no banco: 'visita', 'reuniao', 'ligacao', 'outro'.
 */
function mapCompromissoType(raw: string | null): CompromissoItem["type"] {
  const v = (raw || "").toLowerCase();
  if (v.includes("visita")) return "visita";
  if (v.includes("reuni")) return "reuniao";
  if (v.includes("lig") || v.includes("call")) return "ligacao";
  return "outro";
}

export function useDashboardWidgets(): DashboardWidgetsData {
  const [state, setState] = useState<DashboardWidgetsData>({
    atendimentos: [],
    compromissos: [],
    pretensao: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const agora = new Date();
      const em48h = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

      const [atendRes, apptRes, interesseRes] = await Promise.all([
        // 1. Atendimentos pendentes — leads novos
        supabase
          .from("leads")
          .select("id, name, created_at, status, read_at")
          .in("status", ["new", "read"])
          .is("read_at", null)
          .order("created_at", { ascending: false })
          .limit(10),

        // 2. Compromissos de hoje+amanhã
        supabase
          .from("appointments")
          .select(
            "id, title, scheduled_at, tipo, lead_nome, property_nome, property_endereco, status"
          )
          .gte("scheduled_at", agora.toISOString())
          .lte("scheduled_at", em48h.toISOString())
          .in("status", ["agendado", "confirmado"])
          .order("scheduled_at", { ascending: true })
          .limit(10),

        // 3. Pretensão — leads group by interesse_tipo
        supabase.from("leads").select("interesse_tipo"),
      ]);

      if (cancelled) return;

      // Atendimentos
      const atendimentos: AtendimentoItem[] = (atendRes.data || []).map(
        (row) => {
          const idade = Date.now() - new Date(row.created_at).getTime();
          const horas = idade / (1000 * 60 * 60);
          return {
            id: row.id,
            clientName: row.name || "Lead sem nome",
            scheduledAt: row.created_at,
            status: horas > 4 ? "atrasado" : "pendente",
            href: `/dashboard/crm?lead=${row.id}`,
          };
        }
      );

      // Compromissos
      const compromissos: CompromissoItem[] = (apptRes.data || []).map(
        (row) => ({
          id: row.id,
          title:
            row.title ||
            [row.tipo, row.lead_nome].filter(Boolean).join(" — ") ||
            "Compromisso",
          startAt: row.scheduled_at,
          location: row.property_endereco || row.property_nome || undefined,
          type: mapCompromissoType(row.tipo),
          href: `/calendario?appt=${row.id}`,
        })
      );

      // Pretensão — aggregate em JS
      const counts: Record<string, number> = {};
      (interesseRes.data || []).forEach((row) => {
        const key = (row.interesse_tipo || "outro").toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      });

      // Garante sempre 4 buckets (mesmo que zerados) pra o widget ficar consistente
      const presetKeys = ["compra", "aluguel", "lancamento", "outro"];
      const pretensao: PretensaoItem[] = presetKeys.map((k) => ({
        label: INTERESSE_LABELS[k] || "Outros",
        value: counts[k] || 0,
        color: INTERESSE_COLORS[k],
      }));

      setState({
        atendimentos,
        compromissos,
        pretensao,
        loading: false,
      });
    })().catch((err) => {
      console.warn("useDashboardWidgets fetch failed:", err);
      if (!cancelled) setState((s) => ({ ...s, loading: false }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
