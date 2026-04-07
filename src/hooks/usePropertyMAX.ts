/**
 * usePropertyMAX.ts — Dados extras do plano MAX para imóveis
 *
 * Dados adicionais por imóvel:
 * - Leads interessados (vinculados via imovel_interesse_id)
 * - Histórico de visitas (appointments filtrados)
 * - Performance de conteúdo (posts/criativos gerados)
 *
 * Mock data enquanto as queries reais não estão ativas.
 */
import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/types/lead";
import type { Appointment } from "@/types/appointment";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PropertyLeadSummary {
  id: string;
  nome: string;
  telefone: string | null;
  status: string;
  temperatura: string;
  ultimo_contato: string | null;
}

export interface PropertyVisitSummary {
  id: string;
  lead_nome: string;
  data_hora: string;
  status: string;
  resultado: string | null;
  notas: string | null;
}

export interface PropertyContentMetrics {
  id: string;
  titulo: string;
  tipo: "post" | "story" | "reel" | "video";
  data: string;
  visualizacoes: number;
  cliques: number;
  leads_gerados: number;
}

export interface PropertyMAXData {
  leads: PropertyLeadSummary[];
  visits: PropertyVisitSummary[];
  content: PropertyContentMetrics[];
  stats: {
    totalLeads: number;
    leadsQuentes: number;
    totalVisits: number;
    visitsConcluidas: number;
    taxaConversao: number;
    totalContent: number;
  };
}

// ─── Mock ──────────────────────────────────────────────────────────────────

const MOCK_BY_PROPERTY: Record<string, PropertyMAXData> = {};

function getMockData(propertyId: string): PropertyMAXData {
  if (MOCK_BY_PROPERTY[propertyId]) return MOCK_BY_PROPERTY[propertyId];

  const leads: PropertyLeadSummary[] = [
    { id: "1", nome: "Carlos Mendes", telefone: "(11) 99999-1234", status: "novo", temperatura: "quente", ultimo_contato: "2026-04-04T14:30:00Z" },
    { id: "8", nome: "Beatriz Nunes", telefone: "(11) 92222-9012", status: "contato_feito", temperatura: "quente", ultimo_contato: "2026-04-04T09:00:00Z" },
    { id: "7", nome: "Ricardo Lima", telefone: "(11) 93333-5678", status: "novo", temperatura: "morno", ultimo_contato: null },
  ];

  const visits: PropertyVisitSummary[] = [
    { id: "v1", lead_nome: "Carlos Mendes", data_hora: "2026-04-05T10:00:00Z", status: "confirmado", resultado: null, notas: "Visita agendada sábado" },
    { id: "v2", lead_nome: "Beatriz Nunes", data_hora: "2026-04-03T14:00:00Z", status: "concluido", resultado: "gostou", notas: "Gostou do layout, pediu proposta" },
  ];

  const content: PropertyContentMetrics[] = [
    { id: "c1", titulo: "Post Feed — Destaque", tipo: "post", data: "2026-04-01T10:00:00Z", visualizacoes: 1250, cliques: 87, leads_gerados: 3 },
    { id: "c2", titulo: "Reels — Tour Virtual", tipo: "reel", data: "2026-03-28T15:00:00Z", visualizacoes: 4800, cliques: 320, leads_gerados: 5 },
    { id: "c3", titulo: "Story — Preço Novo", tipo: "story", data: "2026-03-25T09:00:00Z", visualizacoes: 890, cliques: 45, leads_gerados: 1 },
  ];

  const data: PropertyMAXData = {
    leads,
    visits,
    content,
    stats: {
      totalLeads: leads.length,
      leadsQuentes: leads.filter((l) => l.temperatura === "quente").length,
      totalVisits: visits.length,
      visitsConcluidas: visits.filter((v) => v.status === "concluido").length,
      taxaConversao: visits.length > 0 ? Math.round((visits.filter((v) => v.resultado === "gostou_muito" || v.resultado === "gostou").length / visits.length) * 100) : 0,
      totalContent: content.length,
    },
  };
  MOCK_BY_PROPERTY[propertyId] = data;
  return data;
}

async function fetchPropertyMAXData(propertyId: string): Promise<PropertyMAXData> {
  await new Promise((r) => setTimeout(r, 200));
  return getMockData(propertyId);
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePropertyMAX(propertyId: string | null) {
  return useQuery({
    queryKey: ["property-max", propertyId],
    queryFn: () => fetchPropertyMAXData(propertyId as string),
    enabled: Boolean(propertyId),
    staleTime: 15_000,
  });
}

// ─── Property listing stats (bulk) ─────────────────────────────────────────

export interface PropertyListingStats {
  propertyId: string;
  leadsCount: number;
  visitsCount: number;
}

async function fetchPropertyListingStats(): Promise<PropertyListingStats[]> {
  await new Promise((r) => setTimeout(r, 150));
  return [
    { propertyId: "p1", leadsCount: 3, visitsCount: 2 },
    { propertyId: "p2", leadsCount: 1, visitsCount: 0 },
    { propertyId: "p3", leadsCount: 5, visitsCount: 4 },
  ];
}

export function usePropertyListingStats() {
  return useQuery({
    queryKey: ["property-listing-stats"],
    queryFn: fetchPropertyListingStats,
    staleTime: 30_000,
  });
}
