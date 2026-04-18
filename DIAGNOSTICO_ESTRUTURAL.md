# Diagnóstico Estrutural — ImobCreator AI / NexoImob

**Complemento a `RELATORIO_PROJETO_ANALISE.md`**
**Foco:** árvore do projeto, arquitetura das telas (dashboard + landing + subpages), mapa de rotas

---

## 1. Árvore do Projeto (top-level)

```
imob-creator-studio/
├── src/                       # React SPA (Vite)
├── supabase/                  # Edge Functions + migrations
├── server/                    # Node.js backend (pipeline-orchestrator, FFmpeg wrapper)
├── docs/                      # 25 arquivos: PRD, MASTER-PROMPT, sprint backlogs
├── scripts/                   # Setup utilitários
├── n8n-workflows/             # JSON de workflows n8n exportados
├── reverse-engineered/        # Referências de concorrentes analisados
├── public/                    # Assets estáticos (imagens de tema, samples)
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig*.json
├── package.json               # Stack declaration
├── components.json            # shadcn/ui config
├── eslint.config.js
├── deploy.sh                  # Deploy helper
├── setup-secrets.sh           # Secrets bootstrap Supabase
├── CHANGELOG.md               # Recente (2026-04-17 sessão compliance)
├── README.md
├── INTEGRATION.md             # Integrações externas
├── MIGRATION_NOTES.md
├── RELATORIO_PROJETO_ANALISE.md   # Relatório filosofia + módulos (gerado 2026-04-17)
└── DIAGNOSTICO_ESTRUTURAL.md      # Este arquivo
```

---

## 2. Árvore de `src/` (estrutura React)

```
src/
├── pages/                     # Todas as rotas do app
│   ├── Index.tsx              # Landing page MÃE (/)
│   ├── Auth.tsx               # /auth
│   ├── auth/
│   │   └── AuthCallbackPage.tsx
│   ├── Dashboard.tsx          # /dashboard (Home dinâmico com ModuleWidgets)
│   ├── lp/                    # 9 landing pages de módulo
│   ├── public/                # 2 páginas públicas (Precos, Diagnostico)
│   ├── dashboard/             # Subpages do dashboard por módulo
│   │   ├── criativos/
│   │   ├── videos/
│   │   ├── whatsapp/
│   │   ├── site/
│   │   ├── crm/
│   │   ├── social/
│   │   └── JobStatusPage.tsx  # NOVO 2026-04-17
│   ├── max/                   # 41 pages do Dashboard MAX (CRM, Book, Financeiro)
│   ├── admin/                 # AdminDiagnosticos, AdminFunnelAnalytics
│   └── ...                    # ~40 páginas top-level (Editor, Library, AI tools)
│
├── components/                # Organizado por domínio de negócio
│   ├── ui/                    # 50+ componentes shadcn (botões, dialogs, etc)
│   ├── app/                   # AppLayout, TenantWorkspaceCard, MaxPagePlaceholder
│   ├── auth/                  # ProtectedRoute, OAuth buttons
│   ├── dashboard/             # ModuleWidgets, ActionCardsSection, WelcomeBanner
│   ├── creatives/             # CreativeCard, CreativeModal, UpgradePrompt
│   ├── criativos/             # CaptionResultCards (sufixo diferente por legacy)
│   ├── studio/                # FormFlow, ImageUploader (geração de criativos)
│   ├── video/                 # VideoGalleryCard, VideoPlayerDialog
│   ├── whatsapp/              # ChatWindow (NOVO 2026-04-17)
│   ├── jobs/                  # JobStatusScreen (NOVO 2026-04-17)
│   ├── disclaimers/           # RestorationDisclaimer (NOVO 2026-04-17)
│   ├── site/                  # SiteOnboardingWizard, ThemeGallerySection
│   ├── site-temas/            # 9 temas de site (brisa, dark-premium, litoral, nestland, nexthm, ortiz, quarter, rethouse, urbano)
│   ├── crm/                   # LeadCard, LeadDrawer, CrmKanban (parcial)
│   ├── leads/                 # Lead-related UI
│   ├── imoveis/               # PropertyLeadsTab, upload
│   ├── onboarding/            # OnboardingWizard (first-time user flow)
│   ├── brand/                 # Brand captura
│   ├── analytics/             # FeatureUsageChart, InsightsPanel
│   ├── billing/               # UpgradePlannerCard
│   ├── public/                # IcpHero (landing)
│   └── ...                    # agentes, appointments, biblioteca, templates, share, trial, etc.
│
├── hooks/                     # ~60 hooks customizados
│   ├── useAuth.ts             # via AuthContext
│   ├── useWorkspace.ts        # via WorkspaceContext
│   ├── useUserPlan.ts
│   ├── useUserSubscriptions.ts # NOVO 2026-04-17 (Dashboard multi-produto)
│   ├── useCreativesGallery.ts
│   ├── useCreativeJob.ts      # Pipeline de geração dual-mode
│   ├── useCreativeActions.ts
│   ├── useCaptionGenerator.ts
│   ├── useVideoModule.ts
│   ├── useVideoGallery.ts
│   ├── useWhatsAppInstance.ts
│   ├── useImageRestoration.ts # NOVO 2026-04-17
│   ├── useJobStatus.ts        # NOVO 2026-04-17
│   ├── useABVariant.ts        # A/B testing via URL param + localStorage
│   ├── useAnalytics.ts
│   ├── usePlanGate.ts
│   ├── useModuleAccess.ts
│   └── ... (CRM, Financeiro, Leads, Agenda, etc.)
│
├── lib/                       # Utilitários puros
│   ├── funnel.ts              # Event tracking (fire-and-forget)
│   ├── creative-catalog.ts    # Templates + styles disponíveis
│   ├── template-engine.ts
│   ├── kiwify-links.ts        # URLs de checkout por plano
│   ├── plan-rules.ts
│   ├── video-templates.ts     # 3 templates de vídeo
│   ├── video-motion-presets.ts
│   ├── video-music-moods.ts
│   ├── video-plan-rules.ts    # Tiers Standard/Plus/Premium
│   ├── watermarkUtils.ts
│   └── utils.ts               # cn (classnames merger)
│
├── modules/                   # Business logic por domínio
│   └── monetization/          # control-points, plan-flags, video-events
│
├── services/                  # API wrappers
│   ├── analytics/             # eventTracker, insightsEngine, utmCapture
│   ├── generationApi.ts
│   ├── videoModuleApi.ts
│   ├── userPlanApi.ts
│   ├── workspaceApi.ts
│   ├── n8nBridgeApi.ts
│   └── ...
│
├── integrations/
│   ├── supabase/              # Client + types gerados
│   └── lovable/               # Integração legacy com Lovable
│
├── contexts/
│   ├── AuthContext.tsx
│   └── WorkspaceContext.tsx
│
├── config/
│   └── dashboard-nav.ts       # CONFIGURAÇÃO CENTRAL DO DASHBOARD (19 seções, ~60 itens)
│
├── data/                      # Seed data estático
├── types/                     # TypeScript interfaces + enums
├── assets/                    # Imagens, fonts, templates
└── App.tsx                    # Router principal + providers
```

---

## 3. Arquitetura do Dashboard

### 3.1 Layout geral

**AppLayout.tsx** (wrapper de todas as rotas protegidas):
- Sidebar esquerda fixa (~260px) com as 19 seções do `dashboard-nav.ts`
- Top bar com usuário + workspace switcher + notificações
- Área central = conteúdo da página
- Seção "Admin" só renderiza se user.admin_roles.role === "super_admin"

### 3.2 Estrutura do Sidebar (19 seções, ~60 itens)

Fonte: `src/config/dashboard-nav.ts`

| # | Seção | Emoji | Itens (rotas) |
|---|-------|-------|---------------|
| 1 | **Home** | 📊 | Visão Geral (`/dashboard`) |
| 2 | **Leads** | 👥 | Pipeline Kanban (`/leads`), Cadastro (`/leads/novo`), Histórico (`/leads/historico`) |
| 3 | **Atendimentos** | 📅 | Calendário (`/atendimentos`), Novo (`/atendimentos/novo`), Histórico (`/atendimentos/historico`) |
| 4 | **Imóveis** | 🏠 | Listagem (`/imoveis`), Editor (`/imoveis/editor`), Upload (`/imoveis/upload`), Importar (`/importar`) |
| 5 | **Conteúdo** | 🎨 | Gerar Posts `badge:AI` (`/gerar-posts`), Galeria (`/dashboard/criativos`), Novo Criativo (`/dashboard/criativos/novo`), Vídeos `badge:IA` (`/dashboard/videos`) |
| 6 | **Site & Portais** | 🌐 | Meu Site (`/site-imobiliario`) |
| 7 | **CRM** | 🤝 | CRM Kanban (`/dashboard/crm`) |
| 8 | **Automações** | 🤖 | Fluxos Ativos (`/automacoes`), Construtor (`/automacoes/construtor`), Histórico (`/automacoes/historico`) |
| 9 | **Calendário** | 📆 | Mensal/Semanal (`/calendario`), Feed de Conteúdo (`/calendario/feed`), Publicações (`/calendario/publicacoes`) |
| 10 | **Book Agente** | 📚 | PDF Apresentação (`/book`), Portfólio (`/book/portfolio`), Config (`/book/config`) |
| 11 | **Agentes de IA** | 🧠 | Agentes Ativos (`/agentes`), Criar (`/agentes/criar`), Logs (`/agentes/logs`) |
| 12 | **Financeiro** | 💰 | Receitas & Despesas (`/financeiro`), Comissões (`/financeiro/comissoes`), Relatório (`/financeiro/relatorio`) |
| 13 | **Usuários** | 👤 | Lista (`/usuarios`), Permissões (`/usuarios/permissoes`) |
| 14 | **Configurações** | ⚙️ | Perfil & Marca (`/configuracoes`), Prompts (`/configuracoes/prompts`), Plano (`/configuracoes/plano`), Módulos (`/configuracoes/modulos`) |
| 15 | **Integrações** | 🔌 | APIs (`/integracoes`), Webhooks (`/integracoes/webhooks`) |
| 16 | **Biblioteca** | 📁 | Fotos (`/biblioteca`), Vídeos (`/biblioteca/videos`), Documentos (`/biblioteca/documentos`) |
| 17 | **Relatórios** | 📈 | Performance (`/relatorios`), Analytics (`/relatorios/analytics`), Conversão (`/relatorios/conversao`), ROI (`/relatorios/roi`) |
| 18 | **Admin** | 🛡️ | Painel Admin (`/admin/diagnosticos`), Diagnósticos (`/admin/diagnosticos`) — *visível apenas super_admin* |
| 19 | **Gate WhatsApp** | (não no sidebar, acesso via `/dashboard/whatsapp`) | Setup, Inbox, Fluxos, Flow Builder |

### 3.3 Dashboard.tsx — Home (`/dashboard`)

Componente renderizado em `/dashboard` com arquitetura modular:

```
Dashboard.tsx
├── <WelcomeBanner />                        # Saudação personalizada
├── <CreditHeroCard credits={...} />         # Créditos disponíveis
├── Módulos Ativos (subscription-based)      # NOVO 2026-04-17
│   └── <ModuleWidgets />                    # Renderiza 6 widgets condicionalmente
│       ├── CriativosWidget                  #   (se user tem sub criativos)
│       ├── VideosWidget                     #   (se user tem sub videos)
│       ├── WhatsAppWidget                   #   (se user tem sub whatsapp)
│       ├── SiteWidget
│       ├── CRMWidget
│       └── SocialWidget
├── "O que você quer gerar hoje?"            # 4 cards de intent
│   ├── Post para Instagram → /create/ideia
│   ├── Criativo para anúncio → /create/studio
│   ├── Vídeo do imóvel → /video-creator
│   └── Pacote completo → /create
├── Time-to-first-value card                 # Métrica de onboarding
├── <ActionCardsSection />                   # CTAs secundários
├── Grid 4 cards (Criativo, Sequência, Thumbnail, Animar)
├── <RecentOperationsSection />              # Últimas 6 criativas
├── <TenantWorkspaceCard />                  # Info workspace
├── <OnboardingChecklist />                  # Tarefas pendentes do user
├── <ActivationFunnelCard />                 # Funil de ativação
├── <UpgradePlannerCard />                   # CTA para upgrade de plano
└── <OnboardingWizard />                     # Overlay first-time (se showWizard)
```

### 3.4 Subpages do Dashboard por Módulo

**`/dashboard/criativos/*`** (3 pages):
- `GaleriaCriativosPage` — grid de criativos com filtros
- `NovoCriativoPage` — wrapper do FormFlow (3 steps)
- `CriativoDetailPage` — detalhe + ações (download, WhatsApp, agendar)

**`/dashboard/videos/*`** (3 pages):
- `DashboardVideosPage` — galeria de vídeos
- `NovoVideoPage` — wizard de criação
- `VideoPlayerPage` — player com metadata

**`/dashboard/whatsapp/*`** (4 pages):
- `WhatsAppSetupPage` — QR code + status
- `WhatsAppInboxPage` — split-pane: contatos (esquerda) + ChatWindow (direita) `[NOVO 2026-04-17]`
- `WhatsAppFluxosPage` — 4 flows hardcoded + botão "Novo Fluxo"
- `WhatsAppFlowBuilderPage` `[NOVO 2026-04-17]` — editor visual (5 node types: trigger, send_message, delay, condition, webhook)

**`/dashboard/site/*`** (2 pages):
- `DashboardSitePage` — builder de site
- `SitePreviewFrame` — iframe de preview

**`/dashboard/crm/*`** (6 pages):
- `DashboardCRMPage` — overview
- `LeadDetailPage` — drawer de lead (3 abas: Detalhes, Timeline, Agenda)
- `ClientesPage` — lista de clientes convertidos
- `AgendaPage` — calendário de compromissos
- `AgendamentoModal` — modal de criação
- `ImportarLeadsPage` — CSV import wizard (3 steps)

**`/dashboard/social/*`** (4 pages):
- `SocialConnectPage` — conectar Instagram/Facebook via OAuth
- `SocialCallbackPage` — callback pós-OAuth
- `CalendarioPublicacoesPage` — calendário de posts agendados
- `AgendarPostModal` — modal de agendamento

**`/dashboard/job/:jobId`** `[NOVO 2026-04-17]`:
- `JobStatusPage` — wrapper de `JobStatusScreen` (Realtime Supabase, 4 estados)

### 3.5 Dashboard MAX (`/max/*` e rotas legacy)

41 pages em `src/pages/max/` organizadas em domínios:

- **Leads** (3): Pipeline, Cadastro, Histórico
- **Atendimentos** (3): Calendário, Novo, Histórico
- **Imóveis** (3): Listagem, Editor, Upload
- **Criativos MAX** (3): Posts, Vídeos, Templates
- **Automações** (3): Fluxos, Construtor, Histórico
- **Calendário** (3): Mensal, Feed, Publicações
- **Book** (3): Apresentação (PDF), Portfolio, Config
- **Agentes** (3): Ativos, Criar, Logs
- **Financeiro** (3): Receitas, Comissões, Relatório
- **Usuários** (2): Lista, Permissões
- **Config** (3): Perfil, Prompts, Plano
- **Integrações** (2): APIs, Webhooks
- **Biblioteca** (3): Fotos, Vídeos, Documentos
- **Relatórios** (2): Performance, Analytics
- **Site Config** (1)

### 3.6 Admin Pages (`/admin/*`)

- `AdminDiagnosticos` — listagem de diagnósticos submetidos
- `AdminFunnelAnalytics` — dashboard de A/B testing (CTR por seção, funil, scroll depth) `[implementado 2026-04-16]`

---

## 4. Arquitetura da Landing Page Mãe (`/`)

**Arquivo:** `src/pages/Index.tsx` (~550 linhas)

### 4.1 Stack de estruturação

```tsx
<Header />                     # Logo NexoImob + CTAs "Começar Agora"
<HeroSection />                # Hero com A/B testing (variant A vs B)

<section id="social-proof">    # Stats strip (CountUp animado)
<section id="solucoes">        # 6 módulos em grid com ícones
<section id="features">        # 5 tabs de features (A/B copy)
<section id="metrics">         # 4 métricas em números grandes
<section id="blocks">          # Blocos alternados (texto+imagem)
<section id="differentials">   # Diferenciais
<section id="testimonials">    # 3 depoimentos (A: genéricos / B: com métricas)
<section id="pricing">         # Planos (A: padrão / B: econômico)
<section id="cta-final">       # CTA navy+gold
<section id="faq">             # FAQ acordeão
<Footer />                     # Links + redes

<AnnouncementBanner />         # Banner topo anúncios
<WhatsAppButton />             # Floating WA
<PopupLeadCapture />           # Popup exit-intent
```

### 4.2 A/B Testing integrado (DEV-4)

- Hook `useABVariant()` — lê URL param `?variant=a|b` > localStorage > random 50/50
- Cada seção tem `data-ab-test` e `data-variant` attributes
- Variant A = "NOVA ERA DO DESIGN IMOBILIÁRIO" (estabilidade)
- Variant B = "GERE 100 CRIATIVOS EM 1 HORA" (urgência + ROI)

### 4.3 Funnel tracking integrado (DEV-5)

- `useSectionTracker(sectionName, variant)` via IntersectionObserver em 8 seções
- Fire-and-forget em `funnel_events` table
- Admin dashboard em `/admin/funnel-analytics`

---

## 5. Landing Pages Subpages (`/pages/lp/*`)

9 landing pages de módulo, uma por feature vertical. Estrutura consistente:

### 5.1 Template comum

```tsx
<Header>                       # Logo + CTA "Começar Agora"
<HeroSection>                  # H1 + sub + screenshot
<SolutionGrid>                 # 3-6 cards de benefícios
<FeatureTabs>                  # Tabs de funcionalidades
<Metrics>                      # Números
<Testimonials>                 # Depoimentos
<Pricing>                      # Planos segmentados
<FAQ>                          # Acordeão
<Footer>
```

### 5.2 Rotas e especificidades

| Rota | Arquivo | Checkout usado |
|------|---------|----------------|
| `/criativos` ou `/lp/criativos` | `CriativosPage` | `KIWIFY_CHECKOUT_CRIATIVOS` (Starter R$97 / Básico R$197 / PRO R$397) |
| `/videos` | `VideosPage` | `KIWIFY_CHECKOUT_VIDEOS` |
| `/whatsapp-imobiliario` | `WhatsappPage` | — (waitlist email, não checkout) |
| `/site-imobiliario` | `SitePage` | Com `ThemeGallerySection` embutido (9 temas) |
| `/crm-imobiliario` | `CrmPage` | — |
| `/social-imobiliario` | `SocialPage` | — |
| `/video-imobiliario` | `VideoImobiliarioPage` | Campaign LP (paid traffic) |
| `/criar-posts-imoveis` | `CriarPostsImoveisPage` | Campaign LP |
| `/automacao-imobiliaria` | `AutomacaoImobiliariaPage` | Campaign LP |

### 5.3 Páginas públicas adicionais (`/pages/public/`)

- `Precos.tsx` → `/precos` — tabela pública de planos (plano único R$147 + add-ons)
- `Diagnostico.tsx` → `/diagnostico` — formulário 3 steps → análise Claude → score 0-100

### 5.4 Páginas institucionais (top-level)

- `/` → `Index.tsx` (landing mãe)
- `/sobre` → `SobrePage`
- `/contato` → `ContatoPage`
- `/termos` → `TermsPage`
- `/para-corretores` → `ParaCorretoresPage`
- `/para-imobiliarias` → `ParaImobiliariasPage`
- `/para-equipes` → `ParaEquipesPage`

---

## 6. Mapa completo de rotas por categoria

**Total:** ~160 rotas em `App.tsx`

### 6.1 Públicas (não precisam login) — ~20 rotas

```
/                              Index (landing mãe)
/precos                        Pricing público
/diagnostico                   Ferramenta gratuita Claude
/sobre /contato /termos        Institucionais
/auth /auth/callback           Login/OAuth
/para-{corretores|imobiliarias|equipes}   Segment LPs
/lp/{criar-posts-imoveis|video-imobiliario|automacao-imobiliaria}   Campaign LPs
/criativos /videos /site-imobiliario /crm-imobiliario /social-imobiliario /whatsapp-imobiliario   Módulo LPs
```

### 6.2 Dashboard protegido — ~140 rotas

**Home e Intent:**
- `/dashboard` (home + widgets)
- `/create` `/create/ideia` `/create/studio` `/create/sequence` `/create/thumbnail` `/create/animate` (intent hubs)

**Criação (top-level legacy + nova):**
- `/studio` `/showcase` `/editor` `/property-editor` `/upload` `/export` `/library` `/templates` `/brand-templates`
- `/dashboard/criativos` `/dashboard/criativos/novo` `/dashboard/criativos/:id`
- `/dashboard/videos` `/dashboard/videos/novo` `/dashboard/videos/:id`

**AI Tools (top-level):**
- `/idea-creative` `/reverse-prompt-lab` `/upscale` `/image-restoration` `/renovate-property` `/sketch-render` `/empty-lot` `/land-marking` `/ai-agents`

**Vídeo:**
- `/video` `/video-creator` `/video-dashboard` `/video-plans` `/video-styles`
- `/biblioteca/videos`

**CRM:**
- `/leads` `/leads/novo` `/leads/historico`
- `/atendimentos` `/atendimentos/novo` `/atendimentos/historico`
- `/dashboard/crm` + subroutes

**Site:**
- `/site-imobiliario` `/site-config`

**WhatsApp:**
- `/dashboard/whatsapp` (setup)
- `/dashboard/whatsapp/inbox`
- `/dashboard/whatsapp/fluxos`
- `/dashboard/whatsapp/fluxos/novo` `/dashboard/whatsapp/fluxos/:id` `[NOVO 2026-04-17]`

**Social:**
- `/dashboard/social/conectar`
- `/dashboard/social/calendario`
- `/dashboard/social/callback`

**Jobs:**
- `/dashboard/job/:jobId` `[NOVO 2026-04-17]`

**MAX Dashboard (41 pages):** todas as rotas listadas em seção 3.5 acima.

**Analytics:**
- `/dashboard/analytics`
- `/attribution` `/referral` `/campaigns` `/funnel` `/metrics`

**Admin:**
- `/admin` (redirect para /admin/diagnosticos)
- `/admin/diagnosticos`
- `/admin/funnel-analytics`

**Settings:**
- `/settings` `/settings/profile` `/settings/prompts`
- `/plano` (MeuPlano)
- `/planos` (Seleção)

**Gerador Posts:**
- `/gerar-posts`

---

## 7. Edge Functions mapeadas por domínio

**Geração de conteúdo (13):**
- `generate-art`, `generate-video`, `generate-video-v2`, `compose-video`
- `gerar-criativo`, `gerar-post-imovel`
- `generate-caption`, `generate-seo`, `generate-xml-feed`
- `image-restoration` `[dual-mode 2026-04-17]`
- `image-to-video`
- `refinar-texto-criativo`

**Pipeline e orquestração (6):**
- `generate-dispatch`, `publish-dispatch`
- `generation-callback`, `publish-callback`, `poll-video-status`
- `process-scheduled-posts`

**Pagamentos (5):**
- `hotmart-webhook`, `kiwify-webhook`, `asaas-webhook`
- `asaas-api`, `create-asaas-subscription`

**WhatsApp (3):**
- `whatsapp-instance` `[actions: connect/status/disconnect/get/send/messages/contacts — 2026-04-17]`
- `whatsapp-events` (webhook Evolution API)
- `inbox-proxy`

**Social (1):**
- `publish-social` (Instagram/Facebook Graph API)

**Automação (2):**
- `n8n-bridge`
- `automation-trigger`

**Utilitários (2):**
- `import-data` (CSV)
- `verify-domain` (DNS CNAME)

**Total: 32 edge functions deployadas**

---

## 8. Database — tabelas críticas por domínio

### 8.1 Multi-tenant + auth
- `profiles`, `workspaces`, `workspace_members`, `admin_roles`

### 8.2 Billing + plans
- `user_plans`, `user_subscriptions` (CHECK module_id IN criativos|videos|site|crm|whatsapp|social|saas|addons)
- `user_plan_addons`, `asaas_subscriptions`, `kiwify_products`
- `billing_events`, `webhook_events_dedupe`

### 8.3 Criativos + geração
- `creatives_gallery` + `restoration_applied`/`original_image_url` `[2026-04-17]`
- `creative_jobs` (pipeline status machine)
- `generated_creatives`, `generated_assets`
- `generation_jobs`, `generation_logs`
- `jobs` (genérica) `[2026-04-17]`
- `image_audit_log` + RPCs de logging `[2026-04-17]`
- `creative_templates`, `prompt_templates`, `user_brand_profiles`
- `agent_registry`, `ai_agent_jobs`

### 8.4 Vídeo
- `video_jobs`, `video_job_segments`, `video_plan_addons`

### 8.5 Imóveis + CRM + leads
- `properties` (source: whatsapp|manual|upload|link)
- `leads`, `diagnostico_leads`
- `appointments`, `attendance_activities`

### 8.6 WhatsApp + automação
- `user_whatsapp_instances`, `whatsapp_inbox`
- `whatsapp_sent_messages` `[2026-04-17]`
- `automation_rules` + `nodes`/`edges` JSONB `[2026-04-17]`
- `automation_logs`

### 8.7 Social + publicação
- `social_accounts`, `scheduled_posts`, `publication_queue`, `channel_connections`

### 8.8 Site + portais
- `site_config`, `corretor_sites`, `site_imoveis`, `site_depoimentos`, `site_leads`
- `dominio_verificacoes`, `portals`

### 8.9 Analytics + growth
- `funnel_events` `[2026-04-16]`, `funnel_tracking`, `user_events`
- `acquisition_attribution`, `growth_engine`, `business_metrics`
- `notifications`, `explainability`, `observability`

---

## 9. UI primitives disponíveis (shadcn/ui)

50+ componentes em `src/components/ui/`:

```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge,
breadcrumb, button, calendar, card, carousel, chart,
checkbox, collapsible, command, context-menu, dialog, drawer,
dropdown-menu, form, hover-card, input, input-otp, label,
menubar, navigation-menu, pagination, popover, progress,
radio-group, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, slider, sonner (toast), switch,
table, tabs, textarea, toast, toaster, toggle, toggle-group,
tooltip
```

**Custom UI (não shadcn):**
- `AnnouncementBanner` — banner topo animado
- `CountUp` — número animado (landings)
- `PopupLeadCapture` — modal exit-intent
- `WhatsAppButton` — floating WA

---

## 10. Pontos de inconsistência / débito técnico visível na estrutura

### 10.1 Duplicação de pastas

- `src/components/creatives/` **vs** `src/components/criativos/` — PT vs EN coexistem
- `src/pages/CrmKanban.tsx` **vs** `src/pages/dashboard/crm/DashboardCRMPage.tsx` — duas implementações
- `src/pages/VirtualStagingPage.tsx` renomeado para `ImageRestorationPage.tsx` mas ainda referenciado em `dashboard-nav.ts` como `/image-restoration`

### 10.2 Pages top-level vs `/dashboard/*`

Muitas pages existem em `src/pages/*.tsx` (top-level) E em `src/pages/dashboard/*`. Ex: `LeadsPage` em `/pages/LeadsPage.tsx` vs `/pages/dashboard/crm/*`. Causa confusão sobre qual é source of truth.

### 10.3 `src/pages/max/` — estrutura desatualizada

41 pages em `/max/` que parecem ser uma **tentativa anterior** de reorganização por "Dashboard MAX". Muitas rotas deste dir foram migradas para `/dashboard/*` mas os arquivos antigos ainda existem.

### 10.4 Site-temas: 9 temas, apenas 4 documentados no dashboard-nav

- `brisa`, `dark-premium`, `litoral`, `nestland`, `nexthm`, `ortiz`, `quarter`, `rethouse`, `urbano`
- Alguns são legacy (Breza, Hamilton, Litoral, Urbano — commits descartados no force-push de 2026-04-17)
- Precisa decisão: manter todos ou limpar

### 10.5 Rotas órfãs

- `/dashboard/whatsapp/inbox` referenciado mas nav aponta apenas para `/dashboard/whatsapp` (setup)
- Rotas de Book PDF (`/book`, `/book/portfolio`, `/book/config`) no nav mas páginas estão em `/max/Book*Page.tsx` (commits descartados — pages existem mas função incompleta)

### 10.6 Arquivo órfão na raiz

- `UsersDouglaswebflow-home-dom.json` — trabalho em progresso não tracked, parece dump de Webflow para análise

---

## 11. Dependências externas visíveis no código

**Integrações ativas:**
- Supabase (Auth + DB + Storage + Edge Functions + Realtime)
- Anthropic Claude (via OpenRouter SDK)
- Google Gemini 2.0 Flash (direct API)
- Flux.ai (via Fal.ai)
- Shotstack (video composition)
- Evolution API (WhatsApp, self-hosted Railway)
- Instagram Graph API + Facebook Graph API
- Asaas (Brazilian recurring billing)
- Kiwify (Brazilian checkout, 18 products mapped em `kiwify-links.ts`)
- Hotmart (legacy, webhook ainda ativo)
- n8n (automations hub, self-hosted automacao.db8intelligence.com.br)
- MiniMax TTS, VEED (lip sync) — mencionados em específicas edge functions
- Railway (FFmpeg backend + Evolution API hosting)
- Vercel (frontend hosting)

**SDKs em package.json:**
- `@openrouter/sdk` para Claude
- `@tanstack/react-query` para caching
- `@react-pdf/renderer` para Book PDF
- `html-to-image`, `sharp`, `ExcelJS`, `PapaParse`
- `framer-motion`, `embla-carousel-react`
- `date-fns`, `zod`, `react-hook-form`

---

## 12. Arquitetura de deploy

### 12.1 Branches Git

```
main          ← source of truth (dev + staging)
production    ← ativo em Vercel production URL
feat/*        ← feature branches
```

**Política atual (pós 2026-04-17):** `main` → `production` via fast-forward ou force-push autorizado. Features únicas em production são cherry-picked para main primeiro.

### 12.2 Deploy targets

| Componente | Deploy |
|-----------|--------|
| Frontend (SPA) | Vercel (branch `production` auto-deploy) |
| Edge Functions | Supabase (`supabase functions deploy <name>`) |
| Migrations | Supabase (`supabase db push` ou via MCP) |
| Backend pesado (FFmpeg, pipeline-orchestrator) | Railway (`server/` folder) |
| Evolution API | Railway self-hosted |
| n8n | VM db8intelligence.com.br |

### 12.3 Secrets storage

- **Railway `db8-agent`** — todas as API keys (convenção `NEXOIMOB_*` MAIÚSCULAS)
- **Supabase project secrets** — cópia das chaves relevantes para edge functions (GEMINI_API_KEY, ANTHROPIC_API_KEY, EVOLUTION_API_URL, EVOLUTION_API_KEY, etc.)

---

## 13. Anexo: fluxo end-to-end de um "criativo com auto-restore"

```
1. User no FormFlow.tsx
   └─ toggle "Restaurar qualidade" ON (default)
   └─ metadata.auto_restore = true

2. useCreativeJob.createJob({ metadata: { auto_restore: true } })
   └─ INSERT em creative_jobs (status: pending)
   └─ Upload de imagens para Supabase Storage

3. pipeline-orchestrator (Railway) detecta job pendente
   └─ status: validating (progress: 10%)
   └─ Lê metadata.auto_restore

4. SE auto_restore E analysis.qualidade_foto ∈ {baixa, media}:
   └─ Invoke edge function image-restoration (mode: "restoration")
   └─ Gemini 2.0 Flash com RESTORATION_PROMPT + temperature 0.1
   └─ Storage: restored-<timestamp>.png
   └─ image_audit_log: original_url + restored_url + timestamp + user_id
   └─ UPDATE creatives_gallery: restoration_applied = true

5. Flux.ai estilização (usa restored image, não original)
   └─ status: processing_image (25%)

6. Claude generate-caption
   └─ status: generating_copy (45%)

7. Composição (Shotstack ou canvas HTML)
   └─ status: composing (60%)
   └─ status: rendering (80%)

8. UPDATE creatives_gallery: status = "ready"
   └─ Frontend (via Supabase Realtime em useCreativesGallery)
      recebe UPDATE e re-renderiza galeria

9. User abre modal (CreativeModal.tsx)
   └─ Se restoration_applied === true:
      └─ RestorationBadgeWithTooltip aparece (bottom-right)
      └─ Tooltip explica "denoise + upscale, sem alteração de conteúdo"
```

---

**Fim do diagnóstico estrutural.**
Para análise especialista, combinar com `RELATORIO_PROJETO_ANALISE.md`.
