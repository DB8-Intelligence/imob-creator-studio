# ImobCreator AI / NexoImob — Relatório Geral para Análise Especialista

**Data:** 2026-04-17
**Autor:** Douglas Bonânzza (DB8 Intelligence)
**Repositório:** `DB8-Intelligence/imob-creator-studio`
**Branch de produção:** `production` (sincronizada com `main`, commit `ed4459a`)
**Objetivo deste documento:** Fornecer contexto suficiente para análise crítica externa sobre viabilidade técnica, gaps de implementação e riscos do go-live.

---

## 1. Filosofia e Proposta de Valor

### 1.1 O problema

O corretor de imóveis brasileiro médio:
- Usa iPhone 8–11 (2017–2019) para fotos → **ruído de sensor + compressão JPEG agressiva**
- Publica fotos ruins direto no Instagram, portais e WhatsApp
- Não tem tempo (ou skill) para editar, estilizar, gerar copy
- Gasta 10+ horas/semana só fazendo posts manualmente

### 1.2 A solução (filosofia "Fábrica de Desejo")

Transformar o produto de **gerador de posts** (outputs soltos que o corretor não sabe o que fazer com) para **assistente de vendas** (pacote completo pronto para encaminhar ao cliente):

```
Foto ruim (iPhone 8) 
  → Claude Vision detecta qualidade baixa
  → Gemini 2.0 RESTAURA (denoise + upscale 2-4x, temp 0.1)  ← legal/seguro
  → Flux.ai estiliza o look cinematográfico
  → FFmpeg Ken Burns + unsharp mask
  → Claude gera Sales Kit (copy + 3 diferenciais + CTA)
  → WhatsApp entrega ao corretor com link de download
  → Corretor encaminha ao cliente em 1 toque
```

### 1.3 A linha jurídica crítica (compliance)

**Fotos imobiliárias são documentos contratuais no Brasil.** Qualquer alteração via IA (adicionar móvel inexistente, remover bolor, mudar iluminação significativamente) pode configurar **fraude ao consumidor** (CDC art. 37) + responsabilização solidária do SaaS.

A distinção que o produto adota:

| Ação | Status | Risco |
|------|--------|-------|
| **Upscaling** (+ pixels) | ✅ Legal | Baixo |
| **Denoise** (remover ruído) | ✅ Legal | Baixo |
| **HDR leve** (max +15%) | ⚠️ Defensável | Médio |
| **Virtual staging** (mobilia vazio) | ⚠️ Opt-in explícito | Médio |
| **Adicionar móveis em ambiente já mobiliado** | ❌ Proibido | Alto |
| **Remover objetos** (bolor, móveis) | ❌ Proibido | Alto |
| **Mudar cores de parede** | ❌ Proibido | Alto |

**Decisão arquitetural:** modo default é `restoration` (temperature 0.1, 15+ constraints "DO NOT" no prompt, `customPrompt` bloqueado). Virtual staging é `mode: "staging"` opt-in e separado.

### 1.4 Público-alvo

**Persona:** Corretor individual ou imobiliária pequena/média no Brasil.
**ICP:** 1–30 imóveis ativos, MRR R$97–R$297.
**Não é para:** grandes imobiliárias (>100 imóveis, precisam CRM enterprise) ou quem já tem agência de marketing terceirizada.

---

## 2. Stack Técnica

### 2.1 Frontend (React SPA)

```
React 18.3 + TypeScript strict + Vite 8
Tailwind 3.4 + shadcn/ui (Radix primitives)
@tanstack/react-query 5.83 (cache + Realtime)
React Router 6.30
React Hook Form 7.61 + Zod 3.25
Framer Motion 12 (animações)
@react-pdf/renderer 4.4 (lazy-loaded para Book PDF do corretor)
recharts (dashboards), PapaParse (CSV import), ExcelJS (export)
```

**Deploy:** Vercel (team DB8-Intelligence, auto-deploy branch `production`)

### 2.2 Backend (Supabase)

```
Postgres 17.6 (Supabase managed, project spjnymdizezgmzwoskoj)
Row Level Security em todas tabelas
Realtime subscriptions via canal postgres_changes
Edge Functions em Deno (stateless, limite 150s execução)
Storage com bucket "creatives" (público) para assets gerados
```

**Workspaces:** multi-tenant com `workspaces` + `workspace_members` (RBAC).

### 2.3 Serviços Externos

| Serviço | Função | Crítico? |
|---------|--------|----------|
| **Anthropic Claude** (via OpenRouter) | Geração de copy, análise de imagem | Sim |
| **Google Gemini 2.0 Flash** | Image restoration (denoise + upscale) | Sim |
| **Flux.ai** (via Fal.ai) | Estilização de imagens | Sim |
| **Shotstack** | Composição de vídeo final | Sim |
| **FFmpeg** (Railway backend) | Ken Burns + unsharp mask em vídeos | Sim |
| **Evolution API** (self-hosted Railway) | WhatsApp (inbox + outbound) | Sim |
| **n8n** (automacao.db8intelligence.com.br) | Orquestração de workflows pesados | Médio |
| **Asaas** | Pagamento recorrente (principal) | Sim |
| **Kiwify** | Pagamento BR (secundário, 18 produtos) | Sim |
| **Hotmart** | Pagamento BR (legacy) | Baixo |

### 2.4 Backend "pesado" (não-Supabase)

- **BookAgent / Railway:** serviço Node.js que roda FFmpeg (Ken Burns, concat, áudio overlay) — limite de 150s do Supabase Edge Functions não cabe vídeo.
- **db8-agent Railway:** guarda todas API keys (convenção `NEXOIMOB_*` MAIÚSCULAS).

---

## 3. Estrutura de Módulos (12 principais)

### 3.1 Implementados e funcionais ✅

| Módulo | Rotas principais | Status |
|--------|------------------|--------|
| **Auth** | `/auth`, OAuth callback | ✅ Google + GitHub + Facebook login |
| **Dashboard Multi-Produto** | `/dashboard` | ✅ Widgets dinâmicos por subscription ativa |
| **Criativos (Galeria)** | `/dashboard/criativos/*` | ✅ CRUD, filtros, compartilhamento, download |
| **Criativos (Geração)** | `/dashboard/criativos/novo` | ✅ FormFlow 3 steps, 8+ templates, auto-restore toggle |
| **Criativos (MAX)** | `/max/criativos/*` | ✅ Posts, Videos, Templates hubs |
| **Vídeos** | `/dashboard/videos/*`, `/video-creator` | ✅ Gerador + player + galeria, 3 tiers de plano |
| **WhatsApp Inbox** | `/dashboard/whatsapp/inbox` | ✅ Split-pane chat com ChatWindow (outbound via Evolution API) |
| **WhatsApp Setup** | `/dashboard/whatsapp` | ✅ QR code + instance status |
| **WhatsApp Fluxos** | `/dashboard/whatsapp/fluxos` | ✅ 4 flows hardcoded + Flow Builder visual (5 node types) |
| **Propriedades (MAX)** | `/imoveis/*` | ✅ Listagem, editor, upload, captura via WhatsApp |
| **AI Tools** | `/upscale`, `/image-restoration`, `/reverse-prompt-lab`, etc. | ✅ 7+ ferramentas de edição IA |
| **Analytics** | `/dashboard/analytics`, `/admin/funnel-analytics` | ✅ KPIs + funil + A/B tests |

### 3.2 Implementados mas NÃO em produção (existem no repo, mas Fase 2 do go-live)

Estes estavam em `origin/production` antes, foram **descartados no force-push de 2026-04-17** (sync com `main` para trazer compliance). **Recuperáveis via tag `backup-before-sync-20260417`.**

| Módulo | Commit original | Por que ficou fora |
|--------|-----------------|---------------------|
| **CRM Sprint 5** | `f5965d0` | Clientes, Negócios, Financeiro, Book PDF — fora do scope da Fase 1A |
| **Site Imobiliário completo** | `48f21c5` | 4 temas (Breza, Hamilton, Litoral, Urbano) + editor — Fase 2 |
| **Tema Hamilton Classic** | `182a06b` | Layout completo com busca e galeria — Fase 2 |
| **Gerador Posts/Stories** | `7d5bb2b` | Gerador inspirado no Lano — main tem equivalente |
| **GitHub OAuth** | `5cf4b52` | Tab de signup — não crítico Fase 1A |
| **Preços R$147** | `75e08fd` | Página pública de preços — main já tem versão |
| **Diagnóstico digital** | `9ad3f43` | Ferramenta pública gratuita — main já tem equivalente |

### 3.3 Não implementados (backlog)

| Módulo | Prioridade | Notas |
|--------|------------|-------|
| **Sales Kit Generator** | Alta | `salesKitGenerator.ts` — gerar copy + 3 diferenciais + CTA via Claude |
| **Notification Dispatcher WhatsApp** | Alta | Disparar ao corretor quando job finaliza — hoje usa `whatsapp-instance?action=send` genérico |
| **Calendário de publicações** | Média | Rotas existem, lógica de agendamento parcial |
| **Book PDF do corretor** | Média | Descartado no force-push, Fase 2 |
| **Relatórios financeiros** | Baixa | Descartado no force-push, Fase 2 |
| **Portais (XML feed para Viva Real/ZAP)** | Baixa | Edge function `generate-xml-feed` existe, UI incompleta |

---

## 4. Infraestrutura de Dados

### 4.1 Tabelas principais (24 core + 11 analytics/automation)

**Usuários e billing:**
- `profiles` — perfis de auth.users
- `workspaces` + `workspace_members` — multi-tenant RBAC
- `user_plans` — plano ativo (basic/pro/premium/enterprise/MAX)
- `user_subscriptions` — por módulo (criativos, videos, site, crm, whatsapp, social, saas, addons)
- `billing_events` — log de eventos de pagamento
- `kiwify_products`, `asaas_subscriptions` — integração de checkout
- `admin_roles` — super_admin (Douglas)

**Criativos e geração:**
- `creatives_gallery` — resultado final (feed, story, square, reel)
- `creative_jobs` — pipeline de geração (status: pending → validating → processing_image → generating_copy → composing → rendering → done/error)
- `generated_creatives`, `generated_assets` — assets por job
- `generation_jobs` — jobs genéricos de geração (imagem/vídeo)
- `jobs` — tabela genérica de background jobs (criada 2026-04-17)
- `video_jobs`, `video_job_segments`, `video_plan_addons` — pipeline de vídeo
- `image_audit_log` — compliance legal (original + restaurada + timestamp + user_id)

**Imóveis e CRM:**
- `properties` — listagens (beds, price, location, photos, source=whatsapp|manual|upload)
- `leads` — pipeline de vendas
- `crm_clientes`, `crm_negocios` — Sprint 5 (descartado no force-push, recuperável via tag)
- `appointments`, `attendance_activities` — agenda

**WhatsApp e social:**
- `user_whatsapp_instances` — uma por user (Evolution API)
- `whatsapp_inbox` — mensagens recebidas
- `whatsapp_sent_messages` — audit de mensagens enviadas (criada 2026-04-17)
- `automation_rules` — flows customizáveis (nodes + edges JSONB)
- `social_accounts` — contas Instagram/Facebook conectadas
- `scheduled_posts` — fila de agendamento

**Site e portais:**
- `site_config`, `corretor_sites` — builder de site
- `site_imoveis`, `site_depoimentos`, `site_leads` — conteúdo do site
- `dominio_verificacoes` — verificação de domínio CNAME

**Analytics e growth:**
- `funnel_events` — tracking de funil (sessões 2026-04-16)
- `user_events`, `acquisition_attribution`, `growth_engine`, `funnel_tracking`
- `ab_experiments` (planejada, não criada)
- `business_metrics`, `notifications`

### 4.2 Total de migrations

**76 migrations aplicadas** (período 2026-02-05 a 2026-04-17). Todas sincronizadas entre repo local e Supabase.

### 4.3 RLS

Todas as tabelas de usuário têm RLS ativo. Service role tem bypass para edge functions. Workspaces validam membership via `workspace_members`.

---

## 5. Edge Functions (32 deployadas)

### 5.1 Core de geração

| Função | Status | Observação |
|--------|--------|------------|
| `image-restoration` | ✅ v2 ACTIVE (2026-04-17) | Dual-mode restoration/staging, temp 0.1 |
| `generate-art` | ✅ | Posts estáticos via Flux |
| `generate-video` | ✅ (legacy v1) | |
| `generate-video-v2` | ✅ | Pipeline com credit tracking |
| `compose-video` | ✅ | Composição direta |
| `gerar-criativo` | ✅ | Wrapper PT-BR |
| `gerar-post-imovel` | ✅ | Posts por imóvel |
| `generate-caption` | ✅ | Copy via Claude |
| `generate-seo` | ✅ | Metadata SEO |
| `generate-xml-feed` | ✅ | Feed XML para portais |
| `image-to-video` | ✅ | Imagem → vídeo com narração |

### 5.2 Pipeline e callbacks

| Função | Status |
|--------|--------|
| `generate-dispatch`, `publish-dispatch` | ✅ Batch dispatch |
| `publish-callback`, `generation-callback`, `poll-video-status` | ✅ Webhooks |
| `process-scheduled-posts` | ✅ Cron |
| `n8n-bridge` | ✅ Integração n8n |
| `automation-trigger` | ✅ |

### 5.3 Pagamentos

| Função | Status |
|--------|--------|
| `hotmart-webhook`, `kiwify-webhook`, `asaas-webhook` | ✅ Validados end-to-end 2026-04-16 |
| `asaas-api`, `create-asaas-subscription` | ✅ |

### 5.4 WhatsApp

| Função | Status |
|--------|--------|
| `whatsapp-instance` | ✅ Actions: connect, status, disconnect, get, send, messages, contacts |
| `whatsapp-events` | ✅ Webhook recebe mensagens (Evolution API) |
| `inbox-proxy` | ✅ |

### 5.5 Utilitários

| Função | Status |
|--------|--------|
| `refinar-texto-criativo` | ✅ |
| `import-data` | ✅ CSV import |
| `verify-domain` | ✅ DNS CNAME |

---

## 6. O que foi desenvolvido na sessão 2026-04-17 (compliance + go-live prep)

### 6.1 Sete commits na branch main

```
ed4459a feat: admin Douglas — super_admin + plano MAX vitalício + proteção webhook
5fbc378 docs: add CHANGELOG for compliance + go-live prep session
9a6c8de feat(compliance): integrate restoration badge in CreativeCard + CreativeModal
5d3a915 feat(compliance): add visual disclaimer components
b517cad fix(compliance): dual-mode image-restoration with RESTORATION_PROMPT
a3a5dbc feat: add auto-restore toggle in FormFlow creative generation
3b67b4e feat: background job processing infrastructure (Gemini Fase 2)
```

### 6.2 Entregas por bucket

**Compliance jurídico (crítico):**
- `image-restoration` edge function refatorada em dual-mode (restoration default, staging opt-in)
- `RESTORATION_PROMPT` com 15+ constraints "DO NOT"
- `temperature: 0.1` enforced em modo restoration
- `customPrompt` **bloqueado** em restoration (warn no log, não é injetado)
- Deploy confirmado no Supabase (version 2, ACTIVE)

**Background jobs infra:**
- Tabela `jobs` genérica com RLS + Realtime publication
- Hook `useJobStatus` (funciona com qualquer tabela de jobs)
- Hook `useImageRestoration` (wrapper client-side)
- Componente `JobStatusScreen` (4 estados: pending/processing/completed/error)
- Página `/dashboard/job/:jobId`

**Disclaimers visuais (UX compliance):**
- `RestorationBadge` (3 variantes: default/compact/transparent)
- `RestorationBadgeWithTooltip` (hover explicativo)
- `ImageWithRestorationDisclaimer` (toggle "Ver Original / Ver Restaurada")
- `RestorationInfoBanner` (notice de página)
- Integração em `CreativeCard` (compact, bottom-right) e `CreativeModal` (tooltip)

**FormFlow:**
- Toggle "Restaurar qualidade automaticamente" no Step 1 (default ON)
- Flag `auto_restore` passada em `metadata` do job — backend pipeline-orchestrator deve respeitar

**WhatsApp outbound + flow builder (sessão antes do compliance):**
- Actions `send`, `messages`, `contacts` adicionadas em `whatsapp-instance`
- `ChatWindow` component com bolhas e envio
- `WhatsAppInboxPage` redesenhada split-pane
- `WhatsAppFlowBuilderPage` com editor visual (5 node types)

**Dashboard Multi-Produto:**
- `useUserSubscriptions` hook com Realtime
- `ModuleWidgets` com 6 widgets (Criativos, Vídeos, WhatsApp, Site, CRM, Social)
- Renderização condicional por subscription ativa

### 6.3 Migrations aplicadas (todas no Supabase)

- `20260417000000_create_image_audit_log` — compliance audit
- `20260417100000_whatsapp_outbound_and_flow_builder` — whatsapp_sent_messages + automation_rules.nodes/edges
- `20260417200000_create_jobs_table` — tabela genérica jobs
- `20260417300000_add_restoration_flag_to_creatives` — restoration_applied + original_image_url em creatives_gallery

### 6.4 Sync de branches (operação crítica)

Ao final, `origin/production` foi **force-pushed** para igualar `origin/main` (commit `ed4459a`). Isso descartou 7 commits que estavam só em production (ver seção 3.2 — CRM Sprint 5, Site Imobiliário, etc.).

**Backup preservado em tag `backup-before-sync-20260417`** → qualquer feature descartada é recuperável via `git cherry-pick` ou `git reset --hard backup-before-sync-20260417`.

Motivação: compliance era blocker absoluto do go-live; features descartadas são Fase 2.

---

## 7. O que FALTA implementar

### 7.1 Crítico para Go-Live Fase 1A (amanhã, 2026-04-18)

- [ ] **Rotação tokens** KIWIFY + ASAAS (follow-up manual do gate de venda)
- [ ] **Teste payment flow** com admin Douglas (super_admin + plano MAX)
- [ ] **Validação Vercel deploy** de production (auto-trigger após force-push)
- [ ] **Advogado revisar** `RESTORATION_PROMPT` (compliance legal — bloqueio de lançamento)
- [ ] **Atualizar Termos de Serviço** (restauração ≠ geração)

### 7.2 Crítico pré-beta (semana)

- [ ] **Backend pipeline-orchestrator** precisa respeitar `metadata.auto_restore` e setar `restoration_applied = true` nos `creative_jobs` processados
- [ ] **Template WhatsApp** `sales_kit_delivery` cadastrado no Meta Business Manager (lead time dias)
- [ ] **Sales Kit Generator** (`src/services/salesKitGenerator.ts`) — gerar copy + 3 diferenciais + CTA via Claude multimodal
- [ ] **Teste end-to-end** com 5-10 corretores beta (mix Starter/Básico/PRO, iPhone 8 + DSLR, azulejos/madeira)

### 7.3 Features da Fase 2 do Go-Live

Descartadas da branch production no force-push, recuperáveis via tag:

- [ ] **Sprint 5 CRM completo** (clientes, negócios, financeiro, book PDF)
- [ ] **Site Imobiliário** com 4 temas (Breza, Hamilton, Litoral, Urbano)
- [ ] **Gerador Posts/Stories** inspirado no Lano
- [ ] **GitHub OAuth** na tab de signup

### 7.4 Features nunca implementadas (backlog do plano original)

- [ ] **BullMQ queue** para rate limiting do Gemini — **REJEITADO nesta sessão** (pipeline-orchestrator já cobre). Reavaliar se Gemini rate limit virar problema.
- [ ] **Railway autoscaling** 1-10 containers — só se FFmpeg virar gargalo
- [ ] **PSNR validation automática** — pós-beta
- [ ] **LPIPS perceptual loss** — pós-beta
- [ ] **Feedback loop 1-5 stars** após cada criativo
- [ ] **Analytics dashboard por plano** (Starter vs Básico vs PRO) — infra parcial existe
- [ ] **A/B testing de prompts** — tabela `ab_experiments` não existe ainda
- [ ] **Referral program**
- [ ] **White-label** para imobiliárias enterprise
- [ ] **API access** para integrações CRM externas

### 7.5 Dívida técnica

- [ ] **4 vulnerabilidades Dependabot** (1 high, 3 moderate) — não triadas
- [ ] **Bundle size** — chunks acima de 1000 kB (recharts, xlsx, react-pdf)
- [ ] **Funnel.ts** static+dynamic import warning (não crítico)
- [ ] **Arquivo órfão** `UsersDouglaswebflow-home-dom.json` na raiz do repo (parece trabalho em progresso)

---

## 8. Riscos e pontos de atenção para análise externa

### 8.1 Riscos jurídicos (prioridade máxima)

1. **Gemini pode "inventar" texturas** mesmo com temperature 0.1 + prompt restrito. Sem benchmark PSNR/SSIM automático, não temos garantia quantitativa.
2. **Azulejos portugueses tradicionais** podem ser "modernizados" pela IA em mármore (caso real reportado no plano original). Falta teste de fidelidade por categoria de material.
3. **Auditoria jurídica do RESTORATION_PROMPT** ainda não feita por advogado. Blocker antes do lançamento público.
4. **ToS desatualizado** — menciona "geração" onde deveria ser "restauração". Risco reputacional + legal.

### 8.2 Riscos de arquitetura

1. **Fragmentação de tabelas de jobs:** existem 8 tabelas `*_jobs` diferentes (`ai_agent_jobs`, `creative_jobs`, `generation_jobs`, `video_jobs`, `video_job_segments`, `import_jobs`, `jobs`, etc.). A tabela `jobs` genérica foi adicionada mas **o hook `useJobStatus` é genérico**. Decisão pendente: consolidar ou manter separadas.
2. **Supabase Edge Functions 150s timeout:** pipeline completo (restauração + Flux + FFmpeg) pode ultrapassar. Por isso FFmpeg roda em Railway separado. Arquitetura funcional mas **aumenta latência por hop de rede**.
3. **Sem Redis/BullMQ:** rate limiting do Gemini depende de orquestração manual. Se mais de ~15 req/min simultâneos, podem começar a falhar por 429. Tier pago Gemini resolveria mas custa $$$.
4. **Realtime subscriptions:** cada hook `useJobStatus` abre um channel novo. Dezenas de jobs ativos simultâneos = muitos WebSockets.

### 8.3 Riscos de produto

1. **Onboarding:** user precisa conectar WhatsApp (QR code), aguardar scan, para depois receber output. Friction alta no primeiro uso.
2. **Latência invisível:** restauração + Flux + FFmpeg = ~60-90s. Background processing ajuda mas corretor pode abandonar se não entender que está rodando.
3. **Expectativa de qualidade:** foto ruim entra, vídeo "bom" sai. Se o corretor compara com vídeo profissional (R$500–R$2.000), pode decepcionar.
4. **Preço:** plano único R$147 ou plano segmentado por módulo (Criativos R$67, Vídeos R$85, etc.)? Ainda há duas versões de pricing no código.

### 8.4 Riscos de go-to-market

1. **Mercado imobiliário é altamente fragmentado** no Brasil. Sem canal de aquisição validado, CAC pode matar unit economics.
2. **Concorrentes diretos:** Lano, Tecimob, VivaReal Pro. Diferenciação do NexoImob é "WhatsApp sales kit" — ainda não lançado.
3. **Dependência de Evolution API:** self-hosted no Railway. Se WhatsApp (Meta) endurecer políticas contra Baileys, quebra o módulo WhatsApp inteiro.
4. **Dependência de Gemini + Flux + Shotstack:** cada um tem próprio SLA, rate limit, pricing. Multiplos pontos de falha.

### 8.5 Riscos financeiros

1. **Custo variável por job:** Gemini ($0.03/img) + Flux ($0.05/img) + Shotstack ($0.15/min de vídeo) + Claude ($0.01/copy) = ~$0.30 por creative completo. Se preço médio é R$3/creative (R$147÷50), margem bruta fica ~50% antes de infra + CAC.
2. **Railway autoscaling** pode explodir conta em picos (R$50-200/mês).
3. **Supabase pricing:** storage de vídeos em `creatives` bucket. Vídeos 1080x1920 MP4 = ~5-15MB cada. Em escala (1000 users × 20 vídeos/mês) = 100-300GB/mês → ~$25/mês só de storage.

---

## 9. Métricas-alvo para validar sucesso

| Métrica | Target | Status atual |
|---------|--------|--------------|
| Latência P95 criativo | < 60s | não medido |
| Latência P95 vídeo | < 90s | não medido |
| PSNR médio restoration | > 30 | não medido |
| SSIM médio restoration | > 0.85 | não medido |
| WhatsApp delivery rate | > 95% | não medido |
| Quality rating (1-5 stars) | > 4.2 | feature não existe |
| Retenção 7d | > 40% | não medido |
| Retenção 30d | > 15% | não medido |
| Error rate (job falha) | < 0.5% | não medido |
| Conversion signup → paid | > 5% | não medido |
| Churn mensal | < 10% | não medido |

**Observação:** nenhuma métrica está instrumentada hoje. Primeira coisa pós-beta é infra de analytics.

---

## 10. Perguntas para o especialista

Questões específicas onde análise externa agregaria mais valor:

1. **Arquitetura:** faz sentido ter `jobs` genérica + 8 tabelas especializadas? Ou consolidar?
2. **Compliance:** RESTORATION_PROMPT é suficiente? Falta adicionar algum safeguard?
3. **Rate limiting:** tier pago Gemini vs BullMQ vs QStash — qual mais custo-efetivo para 100 req/min sustentados?
4. **Unit economics:** dado custo de ~$0.30/creative e preço R$3/creative, é viável sem usage caps agressivos?
5. **Onboarding:** deve ser "use antes de conectar WhatsApp" (lazy setup) ou "conecte primeiro" (forced setup)?
6. **Pricing:** plano único R$147 (mais simples, menor LTV) vs modular R$67 base + addons (mais complexo, maior LTV)?
7. **Go-to-market:** qual canal primário de aquisição para corretores BR — Instagram orgânico, Facebook Ads, parcerias com imobiliárias, ou afiliação de infoprodutores?
8. **Diferenciação:** WhatsApp Sales Kit é suficiente vs concorrentes consolidados (Lano, Tecimob)? Ou precisa algo mais?
9. **Compliance jurídico:** que tipos de auditoria externa o SaaS deve contratar antes de ativar venda?

---

## 11. Referências e artefatos

**Commits-chave para revisar:**
- `b517cad` — compliance dual-mode image-restoration
- `3b67b4e` — jobs infrastructure
- `ed4459a` — admin super_admin (atual HEAD)

**Tags:**
- `compliance-v1` — milestone de compliance (2026-04-17)
- `backup-before-sync-20260417` — estado pré-force-push (recupera CRM/Site descartados)

**Docs canônicos no repo:**
- `CHANGELOG.md` — resumo detalhado dos 6 commits de compliance
- `docs/PRD-ImobCreator.md` — especificação do produto
- `docs/MASTER-PROMPT-pivot-site-mae.md` — contexto da pivot
- `docs/project-status-report-2026-04-12.md` — audit executivo

**Endpoints críticos:**
- Edge function: `https://spjnymdizezgmzwoskoj.supabase.co/functions/v1/image-restoration`
- Dashboard public: `https://nexoimobai.com.br`
- Evolution API: `https://evolution-api-production-feed.up.railway.app`

---

**Fim do relatório.**
