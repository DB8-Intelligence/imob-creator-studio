/**
 * topbar-tabs.ts — Abas horizontais da topbar (nav secundária)
 *
 * Inspirado no padrão Univen: atalhos rápidos para os 6 eixos principais
 * do sistema, exibidos numa segunda linha da topbar.
 *
 * A sidebar continua sendo a navegação completa — as abas aqui são
 * atalhos visuais. Uma aba fica "ativa" quando a rota atual bate com
 * qualquer dos prefixos em `activePrefixes`.
 */
export interface TopbarTab {
  id: string;
  label: string;
  path: string;
  activePrefixes: string[];
}

export const TOPBAR_TABS: TopbarTab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    activePrefixes: ["/dashboard"],
  },
  {
    id: "leads",
    label: "Gestão de Leads",
    path: "/leads",
    activePrefixes: ["/leads", "/dashboard/whatsapp/inbox"],
  },
  {
    id: "atendimentos",
    label: "Atendimentos",
    path: "/atendimentos",
    activePrefixes: [
      "/atendimentos",
      "/dashboard/crm",
      "/dashboard/secretaria",
      "/calendario",
    ],
  },
  {
    id: "negocios",
    label: "Central de Negócios",
    path: "/financeiro",
    activePrefixes: [
      "/financeiro",
      "/relatorios",
      "/imoveis",
      "/importar",
      "/dashboard/minhas-lps",
    ],
  },
  {
    id: "portais",
    label: "Portais",
    path: "/dashboard/portais",
    activePrefixes: ["/dashboard/portais"],
  },
  {
    id: "site",
    label: "Meu Site",
    path: "/dashboard/site-imobiliario",
    activePrefixes: [
      "/dashboard/site-imobiliario",
      "/gerar-posts",
      "/dashboard/criativos",
      "/dashboard/videos",
    ],
  },
];

/**
 * Decide se uma aba está ativa comparando `pathname` com os prefixos.
 * Regra:
 *  - match exato com algum prefixo → ativa
 *  - pathname começa com prefixo + "/" → ativa
 *  - caso especial: a aba "dashboard" só ativa quando pathname === "/dashboard"
 *    (evita ativar junto com /dashboard/secretaria, /dashboard/crm, etc.)
 */
export function isTabActive(tab: TopbarTab, pathname: string): boolean {
  if (tab.id === "dashboard") return pathname === "/dashboard";

  return tab.activePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}
