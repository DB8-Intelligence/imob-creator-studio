# Design Spec — Dashboard CRM (ImobCreator AI)

> Rota: `/dashboard/crm`
> Arquivo principal: `src/pages/dashboard/crm/DashboardCRMPage.tsx` (wrapper de 359 bytes → delega para `src/pages/CrmKanban.tsx`, 8 KB).
> Módulo CRM completo: Kanban (pipeline) + Clientes + Agenda + Importar + Detalhe do Lead.

---

## 1. PROPÓSITO

- **Persona:** Corretor/imobiliária com plano `pro` (ou add-on CRM ativo) — precisa organizar leads, follow-ups e visitas num único painel, sem sair pra planilhas.
- **Objetivo:** Gerenciar visualmente o pipeline de vendas (leads → negócios fechados), centralizando temperatura do lead, origem, próximas ações e conversão em cliente.
- **Fluxo esperado:**
  1. Entra em `/dashboard/crm` → vê **Kanban de 5 colunas** com todos os leads ativos.
  2. Lê **4 KPIs no topo** (total, em negociação, fechados no mês, taxa de conversão).
  3. **Filtra** por temperatura (quente/morno/frio) e fonte (Instagram/WhatsApp/Site/Indicação).
  4. **Arrasta um card** entre colunas → status atualizado no Supabase via `useUpdateLead`.
  5. Clica num card → abre `LeadDrawer` lateral pra editar; ou vai pra `/dashboard/crm/lead/:id` (página inteira com timeline de atividades).
  6. Agenda visita (`/dashboard/crm/agenda`), converte lead em cliente (`useConvertLeadToCliente`) ou importa CSV (`/dashboard/crm/importar`).

---

## 2. ESTRUTURA VISUAL ATUAL

### Layout raiz (`CrmKanban.tsx`)
Sem abas internas — a navegação entre submódulos é feita pelo **sidebar global do `AppLayout`** (Leads, Clientes, Agenda, Importar são rotas irmãs, não tabs).

```
┌────────────────────────────────────────────────────────────────────────┐
│  Header:  "Pipeline de Leads"                        [+ Novo Lead]     │
│           "Gerencie seus leads pelo funil de vendas"                   │
├────────────────────────────────────────────────────────────────────────┤
│  KPIs (4 cards):                                                       │
│   [👥 Total]  [📈 Em negociação]  [🎯 Fechados/mês]  [📊 Taxa conv.]  │
├────────────────────────────────────────────────────────────────────────┤
│  Filtros:  🔍 [Buscar lead...]   [Temperatura ▼]   [Origem ▼]          │
├────────────────────────────────────────────────────────────────────────┤
│  Kanban (overflow-x-auto, colunas 280px cada):                         │
│   ┌──────────┬──────────┬──────────┬──────────┬──────────┐             │
│   │ 🟡 Novo  │ 🔵 Cont. │ 🟣 Visita│ 🟠 Prop. │ 🟢 Fech. │             │
│   │   Lead   │  Feito   │ Agendada │ Enviada  │   ado    │             │
│   │  [n]     │  [n]     │  [n]     │  [n]     │  [n]     │             │
│   │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │ ┌──────┐ │             │
│   │ │LeadC.│ │ │LeadC.│ │ │LeadC.│ │          │ │LeadC.│ │             │
│   │ └──────┘ │ └──────┘ │ └──────┘ │          │ └──────┘ │             │
│   └──────────┴──────────┴──────────┴──────────┴──────────┘             │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                  click card     │    +Novo
                      ▼                  ▼
              ┌──────────────────────────────────┐
              │  LeadDrawer (side panel)         │
              │  — edição inline do lead         │
              └──────────────────────────────────┘
```

### Dados dinâmicos por coluna
- Badge com contador por coluna (`columnLeads.length`).
- Cor/emoji por stage (definidos em `PIPELINE_COLUMNS` em `src/types/lead.ts`):
  - `novo` 🟡 amarelo · `contato_feito` 🔵 azul · `visita_agendada` 🟣 roxo · `proposta_enviada` 🟠 laranja · `fechado` 🟢 verde.
- **Atenção:** spec do prompt pedia 6 colunas (incluindo "Qualificando" e "Perdido") — o código real tem **5 colunas**, sem "Qualificando" nem "Perdido". Lead recusado hoje fica órfão.

### KPIs (derivados do array `leads` em tempo real)
1. **Total de leads** — `leads.length`
2. **Em negociação** — `status ∈ {contato_feito, visita_agendada, proposta_enviada}`
3. **Fechados no mês** — `status === 'fechado' && updated_at ≥ startOfMonth`
4. **Taxa de conversão** — `fechadosMes / total * 100`

### Submódulos irmãos (via sidebar)
- **`/dashboard/crm/clientes`** (`CrmClientes.tsx`, 9.6 KB) — tabela com busca + filtro por tipo (comprador/vendedor/locatário), cards de stats, drawer lateral, import CSV.
- **`/dashboard/crm/agenda`** (`CrmAgenda.tsx`, 22 KB) — calendário semanal + mensal, side panel com próximos eventos, modal de criação, cores por tipo (visita presencial/virtual/reunião).
- **`/dashboard/crm/importar`** (`ImportarLeadsPage.tsx`, 18 KB) — upload CSV, mapeamento de colunas, preview, progress.
- **`/dashboard/crm/lead/:id`** (`LeadDetailPage.tsx`, 21 KB) — header com nome + badge de temperatura + stage · grid 2/5 + 3/5 → **Informações** (editável inline) | **Timeline de atividades** (com form de nova atividade + realtime via Supabase).

---

## 3. COMPONENTES REUTILIZADOS

### Layout & UI
- `AppLayout` — shell global (sidebar, topbar, container).
- `Button`, `Input`, `Card`, `CardContent`, `Badge`, `Select`, `Label`, `Textarea`, `Separator`, `Table`, `Dialog`, `ScrollArea`, `Progress` — shadcn/ui.

### CRM-específicos (`src/components/crm/`)
- `KanbanBoard.tsx` — orquestra `DragDropContext` (`@hello-pangea/dnd`), renderiza 5 `Droppable` (colunas) + `LeadCard` draggables.
- `LeadCard.tsx` — card individual no kanban.
- `LeadDrawer.tsx` — side panel de edição/criação rápida de lead.
- `ClienteDrawer.tsx` — side panel de cliente (na página Clientes).
- `ImportacaoCSVModal.tsx` — wizard de import.
- `AppointmentModal.tsx` + `AgendamentoModal.tsx` — criação de evento na agenda.
- `NegocioModal.tsx` — modal de negócio.
- `CRMDashboardWidgets.tsx` — widgets agregados (provável home do CRM).

### Ícones (lucide-react)
`Plus`, `Search`, `Users`, `TrendingUp`, `Target`, `BarChart3`, `Phone`, `Mail`, `Home`, `DollarSign`, `CalendarPlus`, `Clock`, `Upload`, `FileSpreadsheet`, `CheckCircle2`, `AlertTriangle`, `ChevronLeft/Right`.

---

## 4. ESTADO / HOOKS

### Hooks de dados (TanStack Query)
- `useLeads()` — lista todos os leads (retorna `Lead[]`).
- `useUpdateLead()` — mutação de update (usada no drag-end do kanban e no edit inline da LeadDetailPage).
- `useDeleteLead()` — delete (soft).
- `useConvertLeadToCliente()` — converte lead em `CrmCliente`.
- `useLeadActivities(leadId)` + `useCreateLeadActivity` + `useLeadActivitiesRealtime` — timeline do lead com subscription Supabase realtime.
- `useClientes(search, tipo)` + `useCreateCliente` + `useDeleteCliente`.
- `useAppointments` + `useCreateAppointment` + `useUpdateAppointment`.

### Estado local (`useState` em `CrmKanban.tsx`)
```ts
const [search, setSearch] = useState("");
const [tempFilter, setTempFilter] = useState<LeadTemperatura | "all">("all");
const [fonteFilter, setFonteFilter] = useState<LeadFonte | "all">("all");
const [drawerOpen, setDrawerOpen] = useState(false);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
```

### Estado derivado (`useMemo`)
- `filteredLeads` — aplica search + tempFilter + fonteFilter sobre `leads`.
- `stats` — agrega 4 KPIs.

### Drag-and-drop
- Biblioteca: `@hello-pangea/dnd` (fork mantido do `react-beautiful-dnd`).
- `DragDropContext` → `Droppable` (coluna) → `Draggable` (card).
- Handler `handleDragEnd` dispara `updateLead.mutate({ id, status })` apenas se `lead.status !== newStatus`.

### Auth/plano (esperado, não visto no arquivo raiz)
- `useAuth()` + `useUserSubscriptions()` — devem gatear acesso ao módulo (plan_slug `pro` ou add-on CRM). **Hoje o Kanban não tem gate explícito visível** — pode estar no `AppLayout` ou em route guard.

---

## 5. ROTAS DE SAÍDA

| Origem | Destino | Trigger |
|---|---|---|
| Kanban card (click) | Abre `LeadDrawer` in-place | — |
| Kanban card (editar expandido) | `/dashboard/crm/lead/:id` | via LeadCard action |
| LeadDetailPage "Pipeline" | `/dashboard/crm` | back button |
| LeadDetailPage "Agendar Visita" | `/dashboard/crm/agenda` | button |
| Sidebar global | `/dashboard/crm/clientes` | nav item |
| Sidebar global | `/dashboard/crm/agenda` | nav item |
| Sidebar global | `/dashboard/crm/importar` | nav item |
| CrmClientes → converter | Lead vira Cliente | `useConvertLeadToCliente` |

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Tabs ausentes vs rotas separadas** — o spec imaginou "tabs Leads/Pipeline/Clientes/Agenda/Importar" no topo, mas o código navega via sidebar global. Isso fragmenta a experiência: o corretor perde o contexto visual do pipeline ao clicar em Agenda. Considerar **tab-bar local no `/dashboard/crm/*`** pra manter coerência.
2. **Kanban com 5 colunas, não 6** — faltam estágios "Qualificando" (entre Novo e Contato Feito) e especialmente **"Perdido/Descartado"**. Lead sem resposta hoje fica preso em "Contato Feito" poluindo métricas.
3. **Overflow horizontal em mobile** — 5 colunas × 280 px = 1400 px; em telas <1440 px já aparece scroll horizontal. Em mobile (~390 px) o card fica praticamente inusável. Falta modo "lista" ou "select column dropdown".
4. **Cognitive load** — 4 KPIs + 3 filtros + 5 colunas + header tudo visível simultaneamente. Topo ocupa ~280 px antes do kanban começar, reduzindo área útil.
5. **Ausência de filtros rápidos/chips** — "Leads sem resposta há 7 dias", "Hot leads do mês", "Meus leads (corretor)" não existem. Só há 2 selects + busca.
6. **Cores de stages inconsistentes** — `bgColor` dos stages mistura `#EEF2FF` (azul) em "Novo" (que é 🟡) e `#FFF7E0` (amarelo) em "Contato Feito" (que é 🔵) — emoji/cor do texto e cor de fundo não casam. Código em `src/types/lead.ts:79-84`.
7. **Brand off-brief** — o navy em uso é `#002B5B` (hardcoded em `LeadDetailPage`), não o `#0A1628` da spec, e o gold `#FFD700` pedido é na verdade `#D4AF37` (`ds.gold`) no `tailwind.config.ts`. Kanban não usa nenhum dos dois — visual atual é genérico `bg-*-500/10`.
8. **Empty state inexistente** — se `leads.length === 0` o kanban aparece vazio, sem CTA motivador ("Importe seu primeiro CSV" ou "Crie seu primeiro lead").
9. **Duplicação de rotas** — existem `/crm/*` (via `CrmKanban`, `CrmClientes`, `CrmAgenda`) **e** `/dashboard/crm/*` (via wrappers). A convenção oficial parece ser `/dashboard/crm/*`, mas as rotas `/crm` ainda estão vivas no router — confusão de canonical URL + risco de SEO/bookmark quebrado.
10. **LeadDetailPage fora do padrão visual** — usa `font-['Plus_Jakarta_Sans']` inline, cores hardcoded (`#002B5B`) e ignora tokens `ds.*` do design system.

---

## 7. PROMPT PRONTO PRA FIGMA / V0 / LOVABLE

```
Projete o Dashboard CRM de um SaaS imobiliário premium brasileiro
(ImobCreator AI), voltado para corretores e pequenas imobiliárias que
precisam gerenciar visualmente o pipeline de vendas — do primeiro
contato até o fechamento — sem abrir planilhas.

PERSONA
Corretor de 35 anos, 20-80 leads ativos/mês, usa no desktop grande e
ocasionalmente no iPad em visitas. Quer enxergar o funil inteiro em
uma tela, mover cards com o mouse, e nunca perder um follow-up.

OBJETIVO DA TELA
Gestão visual de pipeline por drag-and-drop + leitura instantânea de
saúde do funil (4 KPIs) + acesso rápido a detalhe do lead.

LAYOUT
Shell escuro com sidebar global à esquerda (já existente, não redesenhar).
Na área principal:
1. Header compacto: título "Pipeline de Leads" em serif Playfair Display
   + subtítulo Inter muted + botão dourado "+ Novo Lead" à direita.
2. Tab-bar horizontal embaixo do header: Pipeline | Clientes | Agenda | Importar
   (sticky no scroll; indicador dourado na tab ativa).
3. Faixa de 4 KPI cards translúcidos (glass effect): Total, Em negociação,
   Fechados no mês, Taxa de conversão. Cada KPI com ícone circular colorido
   (azul/laranja/verde/violeta) + número grande em display serif.
4. Barra de filtros: search à esquerda com ícone lupa, 3 selects (Temperatura,
   Origem, Corretor) + chips de filtro rápido ("Quentes", "Sem resposta 7d",
   "Meus leads") + toggle view Kanban/Lista.
5. Kanban horizontal com scroll-x elegante, 6 colunas de 300 px:
   🟡 Novo Lead | 🟠 Qualificando | 🔵 Contato Feito | 🟣 Visita Agendada |
   🟢 Proposta Enviada | ⚫ Fechado/Perdido (com toggle ganho↔perdido).
   Cada coluna: header com emoji + label + contador pill + total R$
   estimado no rodapé. Cards arrastáveis com foto/inicial do lead,
   nome, telefone, chip de temperatura (🔥quente/☀️morno/❄️frio),
   chip de fonte, valor estimado, "último contato há Xd", 3 ações
   rápidas no hover (WhatsApp, editar, converter).
6. Side panel deslizante à direita (400 px) quando clica num card:
   mesma estrutura do LeadDetailPage (Info + Timeline realtime), mas
   inline sem navegação.

CORES (brand DB8 / ImobCreator)
- Fundo: navy profundo #0A1628 (app) e #0B1420 (surface).
- Accent primário: gold #D4AF37 (CTAs, tab ativa, hover).
- Stages (azul→amarelo→verde→vermelho crescendo em urgência):
  Novo=azul #3B82F6, Qualif=âmbar, Contato=ciano, Visita=violeta,
  Proposta=laranja, Fechado=esmeralda, Perdido=rosa dim.
- Texto: #F5F7FA principal, #A0AEC0 muted, #4A5568 subtle.
- Bordas: rgba(255,255,255,0.07) com glow dourado sutil em hover.

TIPOGRAFIA
Playfair Display (títulos H1/H2), Inter (body, UI), JetBrains Mono
(valores em R$ e números KPI).

COMPORTAMENTOS
- Drag-drop de cards entre colunas com animação spring (Framer Motion).
- Filtros sticky ao rolar o kanban.
- Busca global com debounce 300 ms, destaca match no card.
- Empty state motivador: ilustração de funil dourado + "Seu pipeline
  começa aqui — importe um CSV ou crie seu primeiro lead".
- Loading: shimmer nos KPIs + skeleton nos cards.
- Realtime: badge "novo" pulsante quando chega lead via webhook Meta.
- Mobile (<768 px): kanban vira stack vertical com tab-selector de
  coluna ativa (evita scroll horizontal).

DELIVERABLES
Frame Desktop 1440×900 + Mobile 390×844, com estados: vazio, com
dados, card em drag, side panel aberto, loading.
```

---

**Fontes cruzadas:**
- `src/pages/dashboard/crm/DashboardCRMPage.tsx` (wrapper)
- `src/pages/CrmKanban.tsx` (página real)
- `src/pages/dashboard/crm/LeadDetailPage.tsx`
- `src/pages/dashboard/crm/{AgendaPage,ClientesPage}.tsx` (wrappers)
- `src/pages/CrmAgenda.tsx` + `src/pages/CrmClientes.tsx`
- `src/pages/dashboard/crm/ImportarLeadsPage.tsx`
- `src/components/crm/KanbanBoard.tsx`
- `src/types/lead.ts` (PIPELINE_COLUMNS, TEMPERATURA_CONFIG, FONTE_CONFIG)
- `tailwind.config.ts` (tokens `ds.*`, fontes, shadows, animations)
