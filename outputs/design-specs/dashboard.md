# Dashboard Principal Autenticado — Especificação Visual

> Rota: `/dashboard` · Arquivo: `src/pages/Dashboard.tsx` (217 linhas)
> Última análise: 2026-04-17 · Branch: `production`

---

## 1. PROPÓSITO

- **Persona:** corretor imobiliário brasileiro autenticado, com pelo menos 1 módulo ativo em `user_subscriptions` (plano base Criativos ou add-on como Vídeos, WhatsApp, Site, CRM, Social). Pode ser corretor solo (MVP típico) ou gerente de imobiliária com workspace multi-usuário.
- **Objetivo (1 frase):** servir como hub central de entrada que concentra créditos, módulos contratados, atalhos de criação e operações recentes, roteando o corretor para o fluxo produtivo correto em no máximo 2 cliques.
- **Fluxo esperado:** chega logado → vê saudação + créditos no `CreditHeroCard` → escaneia a grid "Seus Módulos" (widgets condicionais) → escolhe intenção rápida ("Post para Instagram", "Criativo para anúncio", "Vídeo do imóvel", "Pacote completo") → entra no fluxo de criação → retorna ao dashboard para ver a peça em `RecentOperationsSection`. First-time users caem no `OnboardingWizard` overlay antes do dashboard ficar visível.

---

## 2. ESTRUTURA VISUAL ATUAL

Top-down, tudo dentro de `<AppLayout>` (sidebar + topbar já fornecidos pelo layout — dashboard só preenche main):

1. **`OnboardingWizard` (overlay condicional)** — só renderiza se `showWizard && !wizardDismissed`. Modal full-screen para primeiros minutos.
2. **`WelcomeBanner`** — saudação com nome do usuário (`profile.full_name.split(" ")[0] ?? "Corretor"`).
3. **`CreditHeroCard`** — card hero com `credits` (vindos de `useUserPlan().credits_remaining`) e `firstName`. Protagonista da dobra.
4. **Seção "Seus Módulos"** (condicional — só renderiza se `subscriptions.length > 0`):
   - Header: `h2 "Seus Módulos"` + subtítulo `"{N} módulo(s) ativo(s)"` + botão outline `"Adicionar módulo"` → `/planos`.
   - Grid responsivo `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`.
   - Para cada subscription ativa, busca widget em `MODULE_WIDGETS[sub.module_id]` e renderiza. Mapa: `criativos` (roxo `#7C3AED`), `videos` (âmbar `#F59E0B`), `whatsapp` (verde `#25D366`), `site` (azul `#0EA5E9`), `crm` (esmeralda `#10B981`), `social` (rosa `#EC4899`).
   - Cada widget tem: icon chip tintado, label, `credits_used/credits_total` em fonte 11px, barra de progresso colorida, contador dinâmico (ex: "{count} criativos gerados", "{completed} vídeos prontos de {total}"), 2 CTAs (primary + secondary outline).
5. **Seção "O que você quer gerar hoje?"** — `h2` + sub "Escolha um objetivo e siga direto para o fluxo ideal". Grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` com 4 cards de intent (`INTENT_OPTIONS`): Post Instagram, Criativo para anúncio, Vídeo do imóvel, Pacote completo. Cada card: ícone em chip `accent/10`, título, descrição, botão outline "Abrir fluxo →".
6. **Card "Time-to-first-value"** — métrica de ativação com `timeToValueLabel` (formata `user.created_at` vs `firstGenerationAt` em "X min" / "Xh Ymin"). Chip uppercase `"primeiro valor entregue"` ou `"em andamento"` + botão outline "Ver jornada de ativacao" → `/dashboard/funnel`.
7. **`ActionCardsSection`** — bloco de ações complementares (componente próprio).
8. **Grid de 4 cards estáticos** — Criar Criativo / Criar Sequência / Criar Thumbnail / Animar Criativo (descrições placeholder, sem CTA funcional visível no JSX — cards decorativos).
9. **`RecentOperationsSection items={recentCreatives}`** — últimos 6 criativos via React Query (`creatives` join `properties`), mostra nome, formato, status, `exported_url`.
10. **`TenantWorkspaceCard`** — card do workspace/tenant atual.
11. **`OnboardingChecklist`** — checklist de primeiros passos.
12. **`ActivationFunnelCard`** — card do funil de ativação do usuário.
13. **`UpgradePlannerCard`** — upsell de plano (fecha a página).

**Dados dinâmicos por render:**
- Nome: `profile.full_name` → primeiro nome, fallback "Corretor".
- Créditos globais: `useUserPlan().credits_remaining` (pode ser `null`).
- Plano ativo: `plan_slug` / `plan_name` / `isMax` (flag para badge MAX).
- Contadores por módulo: subqueries Supabase (`creatives_gallery count`, `video_jobs status`).
- Número de módulos: `subscriptions.length`.
- Time-to-first-value: diff em minutos entre `user.created_at` e primeira geração.

---

## 3. COMPONENTES REUTILIZADOS

De `src/components/`:

| Componente | Path | Função |
|---|---|---|
| `AppLayout` | `components/app/AppLayout` | Shell (sidebar + topbar + auth guard) |
| `WelcomeBanner` | `components/dashboard/WelcomeBanner` | Saudação personalizada |
| `CreditHeroCard` | `components/dashboard/CreditHeroCard` | Hero com saldo de créditos |
| `MODULE_WIDGETS` (mapa) | `components/dashboard/ModuleWidgets` | Widgets por módulo: `CriativosWidget`, `VideosWidget`, `WhatsAppWidget`, `SiteWidget`, `CRMWidget`, `SocialWidget` (todos via `WidgetShell` compartilhado) |
| `ActionCardsSection` | `components/dashboard/ActionCardsSection` | Bloco de ações |
| `RecentOperationsSection` | `components/dashboard/RecentOperationsSection` | Lista de criativos recentes |
| `TenantWorkspaceCard` | `components/app/TenantWorkspaceCard` | Card do workspace |
| `OnboardingChecklist` | `components/dashboard/OnboardingChecklist` | Checklist de setup |
| `OnboardingWizard` | `components/onboarding/OnboardingWizard` | Modal de primeiro acesso |
| `ActivationFunnelCard` | `components/dashboard/ActivationFunnelCard` | Card do funil |
| `UpgradePlannerCard` | `components/billing/UpgradePlannerCard` | Upsell de plano |
| `Button` | `components/ui/button` (shadcn) | CTAs |

Ícones: `lucide-react` — `ArrowRight`, `Megaphone`, `Clapperboard`, `Package2`, `Instagram`, `PlusCircle`, `Palette`, `Film`, `MessageCircle`, `Globe`, `Users`, `Share2`.

---

## 4. ESTADO / HOOKS

| Hook | Origem | Uso no Dashboard |
|---|---|---|
| `useAuth()` | `@/contexts/AuthContext` | `user` (id, email, created_at) + `profile` (full_name) |
| `useUserPlan()` | `@/hooks/useUserPlan` | `planInfo.credits_remaining` no `CreditHeroCard` |
| `useModulePlan()` | `@/hooks/useUserPlan` | `plan`, `hasActivePlan`, `isMax`, `creditsLeft` (disponível mas NÃO consumido no Dashboard.tsx atual — oportunidade) |
| `useUserSubscriptions()` | `@/hooks/useUserSubscriptions` | `subscriptions[]` + `hasModule(id)`; alimenta grid de widgets |
| `useOnboardingProgress()` | `@/hooks/useOnboardingProgress` | `showWizard`, `completeWizard`, `dismiss`, `firstGenerationAt` |
| `useQuery` (dashboard-recent) | `@tanstack/react-query` | Últimos 6 registros de `creatives` |
| `useState(wizardDismissed)` | React | Local, evita reabertura do wizard na mesma sessão |

**Realtime (crítico):** `useUserSubscriptions` abre channel `user-subs-realtime` via `supabase.channel(...).on("postgres_changes", { event: "*", table: "user_subscriptions", filter: "email=eq.${user.email}" }, ...)` → quando webhook Kiwify/Asaas insere/atualiza linha, invalida `["user-subscriptions"]` e a grid de módulos re-renderiza em segundos, sem refresh manual.

**Super-admin:** `useIsSuperAdmin` (tabela `admin_roles` com `role='super_admin'`) NÃO é consumido diretamente neste `Dashboard.tsx` — o bypass é aplicado upstream em gates/RLS. Pode ser injetado aqui para badge visual.

---

## 5. ROTAS DE SAÍDA

Todas via `useNavigate()`:

- `/planos` — botão "Adicionar módulo".
- `/create/ideia` — intent "Post para Instagram".
- `/create/studio` — intent "Criativo para anúncio".
- `/video-creator` — intent "Vídeo do imóvel".
- `/create` — intent "Pacote completo".
- `/dashboard/funnel` — "Ver jornada de ativacao".
- `/dashboard/criativos` + `/dashboard/criativos/novo` — widget Criativos.
- `/dashboard/videos` + `/dashboard/videos/novo` — widget Vídeos.
- `/dashboard/whatsapp` + `/dashboard/whatsapp/fluxos` — widget WhatsApp.
- `/dashboard/site` — widget Site.
- `/dashboard/crm` — widget CRM.
- `/dashboard/social/calendario` + `/dashboard/social/conectar` — widget Social.

---

## 6. PROBLEMAS VISUAIS DETECTADOS

1. **Sem empty state para usuário sem módulos.** Se `subscriptions.length === 0`, a seção "Seus Módulos" desaparece por completo (`&&` short-circuit). O usuário fica sem referência visual do que contratou ou de que deveria contratar. Deveria mostrar card "Você ainda não ativou nenhum módulo → Conheça os planos".
2. **Hierarquia confusa entre plano base + add-ons.** `useUserPlan` (créditos globais no hero) e `useUserSubscriptions` (widgets por módulo) expõem dois "plans" diferentes. Um MAX com 6 módulos ativos gera hero "créditos globais" + 6 widgets com `credits_used/total` individuais — é difícil saber se os créditos do hero são compartilhados, adicionais ou do módulo Criativos legacy.
3. **Cognitive load alto para quem tem muitos módulos.** Sequência: Welcome → Credit Hero → 6 widgets → 4 intents → Time-to-value → ActionCardsSection → 4 cards estáticos → RecentOperations → Workspace → Checklist → FunnelCard → UpgradeCard = 12+ blocos verticais. Scroll excessivo, sem agrupamento ou tabs.
4. **Redundância com sidebar.** A sidebar do `AppLayout` já expõe links para `/dashboard/criativos`, `/dashboard/videos` etc. Os widgets duplicam essa navegação — precisam justificar existência com dados únicos (créditos, contadores, progresso), o que os widgets `WhatsApp`/`Site`/`CRM`/`Social` NÃO fazem hoje (só texto placeholder).
5. **4 cards estáticos duplicam "Intent Options".** O bloco "Criar Criativo / Sequência / Thumbnail / Animar Criativo" aparece logo depois de "O que você quer gerar hoje?" com conteúdo parecido, sem CTA funcional (são `<div>` puros, não `<button>`). Parece resto de refatoração inacabada.
6. **Badge MAX não aparece.** `useModulePlan().isMax` existe mas não é lido em `Dashboard.tsx`. Usuário MAX vitalício (como o admin Douglas) não vê indicador visual de status premium.
7. **Sem skeleton loading.** Queries (`useUserPlan`, `useUserSubscriptions`, `recentCreatives`) retornam `undefined`/`[]` enquanto carregam — hero mostra "—", grid de módulos fica vazia, sem placeholder shimmer. Flash de conteúdo.
8. **Acentuação inconsistente.** Strings "Tempo entre sua criacao de conta e o primeiro output util gerado." e "jornada de ativacao" estão sem acento (ASCII), enquanto o resto do dashboard usa PT-BR pleno. Parece escape bug ou copy-paste de shell.
9. **Erros ortográficos silenciosos nos widgets WhatsApp/Site/CRM/Social** — linha única de descrição genérica ("Atendimento e automações", "Sites e portais de imóveis") em vez de métrica real como Criativos e Vídeos fazem.
10. **Tokens de cor inconsistentes.** Tailwind config tem `ds.gold #D4AF37` e shadows `gold-sm/md/lg`, mas o dashboard usa `text-accent`, `bg-accent/10`, `border-accent/30` (CSS vars) — não fica garantido que `accent` resolve para o gold da marca. Widgets usam cores hardcoded inline (`#7C3AED`, `#F59E0B`…) fora do design-system.

---

## 7. PROMPT PRONTO PARA FIGMA / V0 / LOVABLE

```
Redesenhe o Dashboard Home do ImobCreator AI, um SaaS de marketing imobiliário
brasileiro para corretores autônomos e imobiliárias. A persona é o corretor
logado que acabou de fechar uma visita e tem 5 minutos entre um cliente e
outro para gerar um criativo, um vídeo curto ou disparar uma mensagem em massa
pelo WhatsApp. O objetivo da tela é ser o hub central que mostra quanto de
crédito ele ainda tem, quais módulos ele contratou (Criativos, Vídeos,
WhatsApp, Site, CRM, Social Media) e coloca o próximo clique produtivo a no
máximo 2 toques de distância, com decisão guiada por intenção, não por menu.

Layout em 3 zonas verticais, dentro de uma AppLayout que já fornece sidebar
fixa à esquerda (240px) e topbar com avatar + notificações.

Zona 1 — Hero: saudação personalizada "Olá, {Primeiro Nome}", badge do plano
ativo (mostrar badge dourado "MAX" para plano vitalício), card hero grande
com saldo de créditos em números grandes, barra de progresso mensal e CTA
primário "Criar agora".

Zona 2 — Seus Módulos: grid modular de 2 a 3 colunas (xl:grid-cols-3,
md:grid-cols-2, mobile 1 coluna) com um widget por módulo ativo. Cada widget:
ícone em chip colorido no canto superior esquerdo (Criativos roxo, Vídeos
âmbar, WhatsApp verde WhatsApp, Site azul, CRM esmeralda, Social rosa),
contador de créditos usados/total com barra de progresso, 1 métrica viva
(ex: "12 criativos gerados", "8 vídeos prontos de 10") e 2 CTAs (primário
sólido + secundário outline). Quando zero módulos ativos, mostrar empty
state grande com ilustração e CTA "Conheça os planos".

Zona 3 — Intenções rápidas: grid de 4 cards "O que você quer gerar hoje?"
(Post Instagram, Criativo de anúncio, Vídeo do imóvel, Pacote completo),
cada um com ícone grande + descrição curta + botão "Abrir fluxo →".

Rodapé: métrica Time-to-first-value, operações recentes (lista dos últimos
6 criativos com thumb + status + data), card do workspace, checklist de
onboarding colapsável e card de upgrade como último upsell.

Cores: navy #0A1628 como background, azul-oceano #0B1F2A para surfaces,
dourado #D4AF37 como accent/CTA primário, cinza-claro #F5F7FA para texto
principal. Tipografia: Playfair Display para títulos h1/h2 (voz premium),
Inter para corpo e UI. Bordas arredondadas rounded-2xl (16px), sombras
suaves, hover com glow dourado discreto.

Comportamentos: skeleton shimmer em todos os cards enquanto as queries
carregam, empty state ilustrado quando subscriptions=[], widgets se
atualizam em realtime quando um webhook ativa um módulo novo (fade-in suave),
badge "MAX" vitalício em dourado, toast de boas-vindas no primeiro acesso,
OnboardingWizard overlay modal fullscreen apenas no primeiro login.
Mobile-first, tudo responsivo, performance crítica (LCP < 2s).
```
