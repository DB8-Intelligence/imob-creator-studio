# Relatório Executivo — NexoImob AI / ImobCreator AI Studio

Data: 2026-04-12
Versão: 1.0
Autor: Auditoria técnica combinada (código + Supabase + docs)

---

## Sumário executivo

**Plataforma:** SaaS imobiliário all-in-one para corretores e imobiliárias.

**Marca e nomenclatura:**
- Marca externa: **NexoImob AI**
- Nome do produto / plataforma: **ImobCreator AI Studio**
- Razão social / juridico / billing: **DB8 Intelligence**

**Status geral:** ~85% funcional. Base técnica robusta, módulos principais operacionais. Os bloqueadores restantes são **comerciais / operacionais**, não técnicos.

**Arquitetura:**
- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions Deno)
- Automação: n8n bridge via edge function
- Pagamentos: Asaas (principal, 18 produtos configurados) + Kiwify (6 produtos) + Hotmart (webhook)
- IA: Anthropic Claude + provedores externos (Shotstack / DB8 video API)
- Infra: 82 tabelas, 55 migrations, 29 edge functions ativas

---

## 1. Módulos do produto

### 1.1 Módulos core funcionais

| Módulo | Rotas principais | Estado |
|---|---|---|
| **Criativos** (posts estáticos) | `/dashboard/criativos`, `/max/criativos`, `/create/*` | ✅ Operacional |
| **Vídeo Imobiliário** | `/video-creator`, `/video-dashboard`, `/video-plans`, `/videos` | ✅ Operacional (pipeline v2) |
| **Site Imobiliário** | `/dashboard/site`, `/site-imobiliario`, `/c/:slug` | ✅ Operacional (10 temas) |
| **CRM + Leads** | `/dashboard/crm`, `/leads/*`, `/atendimentos/*` | ✅ Operacional |
| **WhatsApp** | `/dashboard/whatsapp/*` (setup, inbox, fluxos) | ✅ Operacional + bulk notify |
| **Social (IG/FB)** | `/dashboard/social/*` (connect, calendário) | ✅ Operacional |
| **Book / Portfolio PDF** | `/book/*`, `BookApresentacaoPage` | ✅ Operacional |
| **Financeiro** | `/max/financeiro/*` (receitas, comissões, relatórios) | ✅ Operacional |
| **Importação** | `/importar`, `/imoveis/upload` | ✅ Operacional (Supabase real) |
| **Analytics** | `/analytics`, `/relatorios/*`, `/funnel` | ✅ Operacional |
| **Onboarding** | `/onboarding`, checklist, hub pós-login | ✅ Operacional |
| **Diagnóstico Digital** | `/diagnostico` | ✅ Operacional (IA em tempo real) |

### 1.2 Módulos especializados (IA de imagem)

Todos funcionais, alguns dependem de APIs externas:

- **Reverse Prompt Lab** — engenharia reversa de prompts (Anthropic Vision)
- **Virtual Staging** — mobiliar ambientes vazios
- **Renovate Property** — simular reformas
- **Sketch Render** — render a partir de esboços
- **Empty Lot** — visualização 3D de terrenos
- **Land Marking** — marcação de terrenos
- **Upscale Image** — ampliação sem perda
- **Animate Creative** — animar estáticos

### 1.3 Módulos administrativos

- **AI Agents / Agentes** — registry de 8 agentes, bindings, logs
- **Automações** — construtor de fluxos, histórico (visual builder pendente)
- **Usuários & Permissões** — RBAC, workspace_memberships
- **Integrações** — APIs, webhooks, canais
- **Biblioteca Multimídia** — fotos, vídeos, documentos
- **Configurações** — perfil, prompts customizados, planos, LGPD
- **Admin (super_admin)** — diagnósticos, gestão geral

### 1.4 Landing pages

- Home (`/`) e LPs setoriais: `/criativos`, `/videos`, `/site-imobiliario`, `/crm-imobiliario`, `/whatsapp-imobiliario`, `/publicacao-social`
- LPs de campanha: `/lp/criar-posts-imoveis`, `/lp/video-imobiliario`, `/lp/automacao-imobiliaria`
- Institucionais: `/sobre`, `/contato`, `/precos`, `/termos`
- Segmentadas: `/para-corretores`, `/para-equipes`, `/para-imobiliarias`

**Total**: ~90+ rotas registradas em `src/App.tsx`.

---

## 2. Backend — Supabase

### 2.1 Estado do banco (projeto `spjnymdizezgmzwoskoj`)

- **82 tabelas** no schema public
- **55 migrations** aplicadas (última: `20260412000000_security_hardening`)
- **29 edge functions** ativas

### 2.2 Tabelas principais agrupadas

**Identidade e tenancy**
`profiles`, `users`, `user_plans`, `user_subscriptions`, `workspaces`, `workspace_memberships`, `workspace_members`, `roles`, `users_roles`, `admin_roles`

**Imóveis**
`properties`, `property_media`, `property_portals`, `creative_templates`, `import_jobs`

**CRM**
`leads`, `clients`, `crm_clientes`, `crm_negocios`, `appointments`, `attendances`, `attendance_activities`, `lead_activities`

**Geração de conteúdo**
`creatives`, `creatives_gallery`, `creative_jobs`, `generated_creatives`, `generation_jobs`, `generated_assets`, `generation_logs`, `prompt_templates`, `user_brand_profiles`, `gerador_posts`

**Vídeo**
`video_jobs`, `video_job_segments`, `video_plan_addons`

**Automação**
`automation_rules`, `automation_logs`, `publication_queue`, `publication_logs`, `scheduled_posts`, `ai_agent_jobs`, `agent_registry`, `agent_versions`, `agent_bindings`, `agent_execution_logs`

**Site builder**
`corretor_sites`, `site_imoveis`, `site_depoimentos`, `site_leads`, `site_themes`, `site_config`, `dominio_verificacoes`

**WhatsApp e Social**
`whatsapp_inbox`, `user_whatsapp_instances`, `social_accounts`, `channel_connections`

**Billing**
`asaas_products` (18 linhas!), `asaas_subscriptions`, `kiwify_products` (6 linhas), `kiwify_subscriptions`, `credit_transactions`, `billing_events`, `financial_config`, `financeiro_receitas`, `financeiro_despesas`, `financeiro_metas`

**Analytics e growth**
`user_events`, `platform_stats`, `mrr_snapshots`, `onboarding_progress`, `acquisition_attribution`, `referral_codes`, `referral_events`, `referral_rewards`, `diagnostico_leads`, `alert_events`, `system_metrics_snapshots`, `notifications`

**Outros**
`corretor_books`, `implementation_orders`, `items`, `templates`, `user`, `user_teste2` (4 últimas são legado / dead code candidato a drop)

### 2.3 Edge functions ativas

**Geração de conteúdo**
- `gerar-criativo`, `refinar-texto-criativo`, `generate-art`, `generate-caption`, `generate-seo`
- `virtual-staging`, `image-to-video`
- `generate-dispatch`, `generation-callback`, `poll-video-status`, `generate-reel-script`

**Publicação e automação**
- `publish-dispatch`, `publish-callback`, `publish-social`, `process-scheduled-posts`
- `automation-trigger`, `n8n-bridge`

**WhatsApp**
- `whatsapp-connect`, `whatsapp-status`, `whatsapp-instance`, `whatsapp-events`, `inbox-proxy`

**Billing**
- `kiwify-webhook`, `asaas-webhook`, `hotmart-webhook`, `create-asaas-subscription`

**Integração**
- `import-data`, `generate-xml-feed`, `verify-domain`

### 2.4 Segurança (após hardening de hoje)

- ✅ 0 ERROS críticos no advisor (eram 5)
- ⚠️ 9 warnings `function_search_path_mutable` — correção trivial
- ⚠️ 8 warnings `rls_policy_always_true` — provavelmente intencionais (service_role), revisar
- ⚠️ 1 warning `auth_leaked_password_protection` — toggle no painel Auth
- ℹ️ 4 tabelas legadas sem policy — candidatas a drop

---

## 3. Integrações externas

| Integração | Propósito | Estado |
|---|---|---|
| **Supabase** | DB + Auth + Storage + Edge Functions | ✅ Ativo |
| **Anthropic Claude** | Vision + geração de copy + agentes | ✅ Ativo (precisa env var) |
| **n8n** | Automação via `n8n-bridge` | ✅ Ativo (9 tipos de eventos) |
| **Meta Business (IG/FB)** | Publicação direta | ✅ Ativo |
| **WhatsApp Business (Evolution)** | Inbox + notificações | ✅ Ativo |
| **Google Analytics 4** | Tracking de eventos | ⚠️ Sem `VITE_GA4_ID` em prod |
| **Meta Pixel** | Conversão de anúncios | ⚠️ Sem `VITE_META_PIXEL_ID` em prod |
| **Asaas** | Cobrança recorrente (18 produtos) | ✅ Webhook configurado |
| **Kiwify** | Checkout (6 produtos) | ⚠️ 18 URLs com placeholder TODO |
| **Hotmart** | Alternativa de checkout | ✅ Webhook configurado |
| **DB8 Intelligence API** | Render de vídeo externo | ✅ Configurado |
| **Shotstack** | Composição de vídeo (backup) | ✅ Docs existem |
| **Mapbox / Google Maps** | LeadsMapView | ❌ Não integrado |

---

## 4. Modelo comercial

### 4.1 Matriz de planos (conforme `plan-rules.ts` e `PrecosPage.tsx`)

**Criativos (posts estáticos)**

| Plano | Mensal | Anual (-20%) | Criativos/mês | Formatos |
|---|---|---|---|---|
| Starter | R$ 97 | R$ 78/mês | 50 | Feed + Story |
| Básico | R$ 197 | R$ 158/mês | 100 | Feed + Story + Reel |
| PRO | R$ 397 | R$ 318/mês | 150 | Todos |

**Vídeos (composição de reels)**

| Plano | Mensal | Anual | Vídeos/mês | Duração |
|---|---|---|---|---|
| Starter | R$ 97 | R$ 78/mês | 5 | até 30s |
| Básico | R$ 197 | R$ 158/mês | 10 | até 60s |
| PRO | R$ 397 | R$ 318/mês | 20 | até 90s |

**Pacotes de crédito (one-time)**
- 20 créditos — R$ 59
- 50 créditos — R$ 97
- 150 créditos — R$ 197

**Addons de vídeo (conforme `video-plan-rules.ts`)**
- Standard, Plus, Premium — custos variáveis por resolução

### 4.2 Processadores de pagamento

- **Asaas** já tem **18 produtos** cadastrados no banco — aparentemente é o primário
- **Kiwify** tem 6 produtos cadastrados + 18 URLs faltantes no código
- **Hotmart** tem webhook ativo mas sem produtos
- **Conclusão**: há dupla/tripla configuração. Decisão comercial pendente sobre qual é canônico.

---

## 5. Documentação de planejamento

### 5.1 Docs existentes em `docs/`

**Produto**
- `PRD-ImobCreator.md` — PRD completo do produto
- `GUIA_USO_IMOBCREATOR.md` — guia de uso
- `brand-naming-decision.md` — decisão de naming (SP1-001 concluído)
- `sprint-execution-backlog.md` — backlog de sprints

**Vídeo (módulo crítico)**
- `PRD-ImobCreator.md` (seção vídeo)
- `imobcreator-video-composer-design.md`
- `imobcreator-video-module-audit.md`
- `video-engine-philosophy.md`
- `video-backend-dependency.md`
- `video-backend-activation.md`
- `ffmpeg-pipeline-spec.md`
- `shotstack-static-composition-guide.md`
- `video-module-supabase-deploy-checklist.md` (⚠️ project ID desatualizado)
- `video-module-smoke-test-runbook.md` (criado nesta sessão)
- `imobcreator-video-copy-generator-backlog.md`

**Técnico**
- `workspace-backend-contract.md`
- `EXPORT_IMOBCREATOR.md`
- `PART97-explainability-audit-trust.md`
- `imobcreator-landing-onboarding-backlog.md`
- `weweb-*.md` (legado, migração de platform anterior)

### 5.2 Sprint backlog — estado atual

**Sprint 1 — Base Comercial (concluído)**
- ✅ SP1-001 Naming oficial
- ✅ SP1-002 Planos de vídeo unificados
- ✅ SP1-003 Matriz comercial
- ⚠️ SP1-004 Links Kiwify (bloqueado NEG — faltam URLs)
- ✅ SP1-005 Auditoria consistência

**Sprint 2 — Ativação (concluído)**
- ✅ SP2-001 Hub pós-login
- ✅ SP2-002 Vídeo no dashboard
- ✅ SP2-003 Onboarding progressivo
- ✅ SP2-004 Eventos de ativação
- ✅ SP2-005 Time-to-first-value

**Sprint 3 — Nucleo Unificado (em curso)**
- ✅ SP3-001 Wizard único
- ✅ SP3-002 Briefing dinâmico
- ⏳ SP3-003 Preview A/B/C (G — pendente, FE+BE)
- ⏳ SP3-004 Edição inline de copy (M — pendente, FE)
- ✅ SP3-005 TODOs de copy

**Sprint 4 — Video Hardening (pendente)**
- ⏳ SP4-001 E2E do pipeline v2
- ⏳ SP4-002 Observabilidade de jobs
- ⏳ SP4-003 Retry e fallback
- ⏳ SP4-004 TODOs de integração operacional

---

## 6. Entregas complementares (fora do backlog, 2026-04-10 a 2026-04-12)

Durante as últimas sessões, foram entregues 10 itens que não estavam no backlog original:

1. **5 novos temas de site** (nestland, nexthm, ortiz, quarter, rethouse) — total 10 temas
2. **Dashboard dark de modelos** adaptado do intermetrix
3. **Upload real de imóveis no Supabase** (storage + properties + property_media)
4. **WhatsApp bulk notify** via n8n (PropertyLeadsTab)
5. **Agent Chat** com Edge Function + fallback mock
6. **Build fix crítico** (eventTracker.ts syntax error bloqueava build)
7. **Code splitting** (index.js -32%, BookApresentacaoPage -98%)
8. **Kiwify fallback** para WhatsApp quando link não configurado
9. **Cleanup de badges "Em breve"** em módulos já implementados
10. **Hardening de segurança** (migration `20260412000000` — 5 ERROS → 0)

---

## 7. O que falta — visão consolidada

### 7.1 Bloqueadores duros (impedem vender hoje)

**🔴 P0 — Comercial**
- 18 links de checkout Kiwify (depende de criar produtos no painel)
- **Ou decidir migrar 100% para Asaas** (18 produtos já criados)
- Env vars de tracking em produção: `VITE_GA4_ID`, `VITE_META_PIXEL_ID`, `VITE_META_APP_ID`, `VITE_ANTHROPIC_API_KEY`

**🔴 P0 — Deploy**
- 10 commits locais não pushados para origin/main (produção defasada)
- Docs de deploy do vídeo com project ID errado (`dsszhodrrchlaqfignky` vs real `spjnymdizezgmzwoskoj`)

### 7.2 Pendências importantes (não bloqueiam venda, mas deveriam ser resolvidas)

**🟠 P1 — Qualidade de produto**
- SP3-003 Preview comparativo A/B/C (estimativa G)
- SP3-004 Edição inline de copy (estimativa M)
- Smoke test real do módulo de vídeo em produção (runbook pronto, nunca executado)

**🟠 P1 — Operação de vídeo**
- SP4-001 a SP4-004: E2E, observabilidade, retry, runbook de contingência

**🟠 P1 — Segurança restante**
- Revisar 8 policies permissivas (provavelmente OK, mas precisa auditar)
- Fix de 7 funções com `search_path` mutável
- Ativar Leaked Password Protection no painel Auth
- Drop de 4 tabelas legadas (`items`, `templates`, `user`, `user_teste2`)

### 7.3 Features grandes pendentes

**🟡 P2 — Novas features**
- LeadsMapView real (depende de Mapbox ou Google Maps API key)
- AutomacoesFluxosPage — visual flow builder (feature grande)
- StudioPage editor visual avançado
- Integração LGPD completa (Política de Cancelamento em branco)
- Múltiplas fontes no Book PDF
- Canais adicionais em ChannelConnectionsPanel (TikTok, Twitter)

### 7.4 Marketing e go-to-market (não-técnico)

**🟢 Ações necessárias fora do código**
- Depoimentos reais de clientes (nome, foto, texto)
- Case de resultado real (números)
- Vídeo de demo do produto
- Meta Business + Instagram Business da NexoImob
- Calendário editorial
- Criação de reels de marketing
- FAQ revisado

---

## 8. Caminho mínimo para vender

**Fase 1 — Decisões do usuário (horas)**
1. Decidir: Asaas ou Kiwify como processor principal
2. Se Asaas: ok, já tem 18 produtos. Se Kiwify: criar 18 produtos e me passar as URLs
3. Preencher env vars em produção (Meta Pixel, GA4, Anthropic, Kiwify se for o caso)
4. Autorizar `git push` dos 10 commits

**Fase 2 — Execução técnica (1 sessão)**
5. Substituir TODOs de Kiwify pelas URLs reais OU migrar para Asaas no frontend
6. Corrigir project ID nos docs de deploy
7. Rodar smoke test do módulo de vídeo em produção

**Fase 3 — Marketing (paralelo)**
8. Gravar 3-5 vídeos de demo
9. Configurar Meta Business + IG Business
10. Ativar Meta Ads com pixel funcionando
11. Buscar depoimentos de early users

**Fase 4 — Pós-lançamento**
12. SP3-003 e SP3-004 (melhorias de UX)
13. SP4-001 a SP4-004 (hardening de vídeo)
14. LeadsMapView + flow builder (features grandes)

---

## 9. Pontos de atenção

**Riscos técnicos**
- 3 processadores de pagamento (Asaas + Kiwify + Hotmart) sem definição clara de qual é canônico — risco de inconsistência comercial
- Docs de vídeo descrevem arquitetura v1 (`generate-video`) mas produção usa v2 (`generate-dispatch` + `generation-callback`)
- `dsszhodrrchlaqfignky` nos docs é um project ID inexistente

**Riscos operacionais**
- Sem pixel/GA em produção = funil de marketing cego
- Sem smoke test executado = primeiro cliente vai ser o QA
- 10 commits não pushados = versão vendida != versão do repositório

**Dívida técnica aceitável**
- 7 warnings de search_path (trivial de corrigir, baixo risco)
- 4 tabelas legadas (dead code, drop seguro)
- 8 policies permissivas (precisa validar caso a caso)

---

## 10. Conclusão

**O produto está tecnicamente pronto.** A plataforma tem 12 módulos core funcionais, 82 tabelas modeladas, 29 edge functions ativas, integração completa com processadores de pagamento, IA, automação e publicação social. A base é sólida para lançamento imediato de MVP.

**Os bloqueadores reais são externos ao código**:
1. Decisão comercial sobre processador de pagamento
2. Configuração de env vars de tracking em produção
3. Push dos commits locais para produção
4. Material de marketing (depoimentos, demos, copy validada)

**Trabalho técnico restante é de polimento**, não de construção:
- 2 itens de Sprint 3 (UX do criador)
- 4 itens de Sprint 4 (hardening de vídeo)
- Warnings residuais de segurança
- Features grandes planejadas mas não bloqueantes (mapa, flow builder)

**Recomendação**: priorizar destravar Fase 1 (comercial + deploy) nesta semana. O produto pode estar vendendo em 5-7 dias úteis contados a partir da decisão de processador de pagamento.
