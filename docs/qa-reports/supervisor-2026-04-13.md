# QA Supervisor Report — NexoImob AI
**Data:** 2026-04-13
**Escopo:** Macro report dos 6 módulos core + dívidas técnicas transversais + gate de liberação de venda
**Repo:** `c:\Users\Douglas\imob-creator-studio` (branches `main` + `feat/lp-criativos-redesign`)
**Supabase:** `spjnymdizezgmzwoskoj`
**Gate de venda:** ver [memory/project_venda_gate.md](../../../.claude/projects/c--Users-Douglas-imob-creator-studio/memory/project_venda_gate.md) — **venda só é liberada quando TODOS os módulos core estão 🟢**

---

## 📊 RESUMO EXECUTIVO

| # | Módulo | Status | Nota executiva |
|---|---|:---:|---|
| 1 | **Criativos** | 🟡 | Wizard robusto, 3 edge functions, geração DALL-E 3 ativa. Bloqueio real: RPC `consume_credits` quebrada. Debts: 8 console.log em produção, async sem try/catch em polling. |
| 2 | **Vídeos** | 🟡 | 61KB de código em `dashboard/videos`, 5 edge functions (Shotstack + Veo2), credit gating rigoroso. 2 versões concorrentes (`generate-video` vs `v2`), 13+ console.log. |
| 3 | **Site do Corretor** | 🟢 | 9 temas completos, autosave com debounce, RLS verificado, `verify-domain` edge function. Único módulo pronto para produção. |
| 4 | **CRM** | 🟡 | Kanban + Leads + Clientes + Agenda + Import CSV todos implementados. Sem stubs. Falta: error handling explícito em mutations de conversão. |
| 5 | **WhatsApp** | 🟡 | Setup wizard + inbox + flows existem. 3 casts `as any` inseguros, polling sem cleanup, **webhook sem signature validation**. Inbox potencialmente stub. |
| 6 | **Social** | 🟡 | Calendário + OAuth Meta + publish dispatch funcionais. Timezone naive nas datas, rotas duplicadas, sem retry em falha da Graph API. |

**Maturidade geral:** 🟡 **MVP funcional com débito técnico crítico bloqueante.** Código legível e bem-organizado, padrões consistentes (React Query + Supabase + hooks tipados), mas **3 bloqueios foundational** impedem qualquer venda:

1. `consume_credits` RPC lê de `public.users` (tabela vazia — 0 rows)
2. 5 webhooks de billing/eventos sem validação de assinatura (spoofable)
3. Leaked Password Protection desativado

---

## 🚨 PROBLEMAS CRÍTICOS (P0) — bloqueiam venda

### P0.1 — `consume_credits` RPC lê de tabela vazia

**Causa raiz:** a função SECURITY DEFINER `public.consume_credits(p_user_id, p_amount)` faz `SELECT credits_remaining FROM public.users WHERE id = p_user_id`. A tabela `public.users` tem **0 linhas** (confirmado via MCP). Nenhum usuário OAuth é populado nela — não existe trigger `on_auth_user_created`.

**Impacto:**
- **TODO usuário pago (starter/básico/pro)** recebe "Usuário não encontrado" ao tentar gerar qualquer criativo ou vídeo
- Douglas (fundador) está protegido só porque `isUnlimited === true` desvia o fluxo em [AppLayout.tsx:82](../../src/components/app/AppLayout.tsx#L82)
- **Qualquer smoke test com conta nova quebra aqui**

**Evidência:** detectado em sessão anterior (sidebar fix, commit `83c067f`). Definição da função confirmada via `pg_get_functiondef`:
```
SELECT credits_remaining INTO v_remaining FROM public.users WHERE id = p_user_id;
IF NOT FOUND THEN RAISE EXCEPTION 'Usuário não encontrado'; END IF;
```

**Fix:** reescrever para operar em `user_plans.credits_used` + `credits_total`, incrementando `credits_used`. 1 migration. ~30min.

---

### P0.2 — 5 webhooks sem validação de assinatura

**Causa raiz:** os endpoints abaixo aceitam qualquer POST sem verificar HMAC/signature do provedor:

| Edge function | Impacto de spoof |
|---|---|
| `kiwify-webhook` (verify_jwt=false) | Spoof ativa plano MAX em conta qualquer |
| `hotmart-webhook` (verify_jwt=false) | Mesmo que Kiwify |
| `asaas-webhook` (verify_jwt=false) | Mesmo |
| `whatsapp-events` (verify_jwt=false) | Spoof injeta mensagens falsas na inbox |
| `publish-callback` (verify_jwt=false) | Spoof marca posts como publicados falsamente |

**Impacto:** qualquer pessoa com o URL do webhook pode **liberar MAX plan gratuito** via POST forjado. Estes são spoofáveis porque os 3 webhooks de billing rodam sem JWT (necessário — são chamados externamente) **e sem validar HMAC do corpo**.

**Fix:**
1. Para Kiwify: HMAC SHA-256 do body com secret do webhook
2. Para Hotmart: validar hottok header
3. Para Asaas: validar header `asaas-access-token`
4. Para WhatsApp: validar X-Hub-Signature-256 (Meta Graph)
5. Para publish-callback: validar Meta signature
**Tempo:** ~1h por webhook × 5 = ~5h

---

### P0.3 — Leaked Password Protection desativado

**Causa raiz:** advisor do Supabase detectou `auth_leaked_password_protection` como `WARN`. Usuário pode cadastrar senhas já vazadas em HaveIBeenPwned.

**Fix:** toggle único no dashboard Supabase Auth → Providers → Settings. **30 segundos.** (Tarefa já listada como B.4 no backlog, pendente ação do usuário.)

---

## ⚠️ PROBLEMAS IMPORTANTES (P1) — afetam UX ou confiança

### P1.1 — 8 RLS policies com `WITH CHECK (true)` no INSERT

Advisor do Supabase detectou:

| Tabela | Policy | Uso pretendido | Risco |
|---|---|---|---|
| `alert_events` | `alert_events_insert` | service_role | Se `anon` ganhar acesso, spam de alertas |
| `billing_events` | `billing_events_insert_service` | service_role | Spoof billing |
| `notifications` | `notifications_insert_service` | service_role | Spam notification |
| `referral_events` | `Service role insert referral events` | service_role | Spoof referral |
| `referral_rewards` | `Service role insert rewards` | service_role | Spoof reward |
| `system_metrics_snapshots` | `sys_metrics_insert` | service_role | Ruído métricas |
| `site_leads` | `public_insert_leads` | **público (form submit)** | OK — por design |
| `diagnostico_leads` | `public_insert_diagnostico` | **público (lead magnet)** | OK — por design |

**Fix:** para as 6 tabelas de service_role, trocar `WITH CHECK (true)` por `WITH CHECK (auth.role() = 'service_role')`. As 2 públicas (`site_leads`, `diagnostico_leads`) permanecem como estão — é intencional.

---

### P1.2 — 404 ocorrências de `console.*` em 135 arquivos

Grep completo encontrou `console.log|error|warn` em 135 arquivos do repo. Alguns quebrados por módulo:

| Arquivo | Count |
|---|:---:|
| `components/integracoes/ChannelConnectionsPanel.tsx` | 14 |
| `components/crm/LeadDrawer.tsx` | 8 |
| `components/inbox/EditorForm.tsx` | 11 |
| `components/leads/LeadFormSheet.tsx` | 11 |
| `components/site/SiteImoveisManager.tsx` | 9 |
| `pages/max/ImoveisEditorPage.tsx` | 9 |
| `pages/max/ImoveisUploadPage.tsx` | 5 |

**Impacto:** vazamento de dados em produção, performance, ruído em logs.

**Fix:** adicionar `drop_console` no Vite build config (`build.terserOptions.compress.drop_console = true`) ou plugin `vite-plugin-remove-console`. **Custo:** 5min, 1 linha de config. Benefício imediato em produção.

---

### P1.3 — Tipo casting inseguro (`as any`, `as never`)

Hotspots:
- [src/pages/dashboard/whatsapp/WhatsAppSetupPage.tsx:65,71,72](../../src/pages/dashboard/whatsapp/WhatsAppSetupPage.tsx#L65) — 3× `as any` em acesso a `user_whatsapp_instances`
- [src/hooks/useCorretorSite.ts:61,91,92,122](../../src/hooks/useCorretorSite.ts#L61) — 4× `as never` (padrão aceitável do Supabase quando tabela não está tipada)
- [src/hooks/useGeradorPosts.ts:66](../../src/hooks/useGeradorPosts.ts#L66) — `.from("gerador_posts" as any)`

**Fix:** rodar `supabase gen types typescript --project-id spjnymdizezgmzwoskoj > src/integrations/supabase/types.ts` e atualizar imports. 10 min. Elimina todos os casts.

---

### P1.4 — Polling sem cleanup em unmount

- [WhatsAppSetupPage.tsx:81-90](../../src/pages/dashboard/whatsapp/WhatsAppSetupPage.tsx#L81) — `setInterval` 5000ms sem `return () => clearInterval(...)` no useEffect
- Risco: memory leak + chamadas à API após usuário sair da página
- **Fix:** 2 linhas por ocorrência

---

### P1.5 — Async sem try/catch em polling crítico

- [IdeaCreativePage.tsx:80+](../../src/pages/IdeaCreativePage.tsx#L80) — `pollJobUntilDone` encadeado sem error boundary
- [VideoCreatorPage.tsx:~850](../../src/pages/VideoCreatorPage.tsx#L850) — handler de geração de vídeo
- **Impacto:** erro não tratado → tela em branco ou estado inconsistente
- **Fix:** wrap em try/catch + toast de erro explícito

---

### P1.6 — Timezone-naive date operations

- [dashboard/social/CalendarioPublicacoesPage.tsx:96](../../src/pages/dashboard/social/CalendarioPublicacoesPage.tsx#L96) — `new Date()` direto no render
- [CrmAgenda.tsx:58-60](../../src/pages/CrmAgenda.tsx#L58) — `startOfMonth` sem timezone
- **Impacto:** agendamentos podem aparecer em dia errado para usuários fora de UTC. Brasil UTC-3, margem de erro é 3 horas.
- **Fix:** usar `date-fns-tz` + timezone do usuário (campo no profile)

---

### P1.7 — Duplicação de rotas (Social)

- `/dashboard/social/calendario` e `/calendario/publicacoes` renderizam a mesma `CalendarioPublicacoesPage`
- **Fix:** consolidar em uma ou documentar propósito

---

## 🟡 MELHORIAS (P2) — otimizações, não urgentes

### P2.1 — Duplicação `generate-video` vs `generate-video-v2`

2 edge functions ativas. A v2 parece ser upgrade mas a antiga não foi removida. Decidir qual é canônica e dar deprecate na outra.

### P2.2 — `SiteLeads.tsx` é near-stub

1KB de código, basicamente re-export. Funcional mas minimal. O [SiteLeadsManager.tsx](../../src/components/site/SiteLeadsManager.tsx) existe como componente e deveria ser mountado aqui.

### P2.3 — `DashboardCRMPage`, `ClientesPage`, `AgendaPage` são 15 linhas wrapper

Delegation pattern aceitável, mas poderiam simplesmente re-exportar os componentes originais sem nova página. Limpeza opcional.

### P2.4 — Stats recomputadas a cada render

[CrmKanban.tsx:65-68](../../src/pages/CrmKanban.tsx#L65) recalcula `startOfMonth` em cada render. Memoizar com `useMemo`.

### P2.5 — Credits debit race condition potencial

Se `generation-callback` for chamado 2× para o mesmo job, créditos podem ser debitados em dobro. Adicionar idempotence key na tabela `generation_jobs`.

---

## 🧠 ANÁLISE TÉCNICA — estado real do backend

### Supabase — 84 tabelas, todas com RLS enabled ✅

**Tabelas por módulo** (rows em produção entre parênteses):

- **Core infra:** `workspaces` (1), `workspace_memberships` (1), `admin_roles` (1), `user_plans` (1 — só Douglas), `user_events` (2), `platform_stats` (4)
- **Criativos:** `creative_templates` (13), `creatives` (0), `creative_jobs` (0), `generated_creatives` (0), `generation_jobs` (0), `generation_logs` (0)
- **Vídeos:** `video_jobs` (0), `video_job_segments` (0), `video_plan_addons` (0)
- **Site corretor:** `corretor_sites` (1), `site_imoveis` (0), `site_depoimentos` (0), `site_leads` (0), `site_themes` (11), `dominio_verificacoes` (0), `site_config` (0)
- **CRM:** `leads` (0), `clients` (0), `crm_clientes` (0), `crm_negocios` (0), `attendances` (0), `appointments` (0), `lead_activities` (0)
- **WhatsApp:** `user_whatsapp_instances` (0), `whatsapp_inbox` (0)
- **Social:** `social_accounts` (0), `scheduled_posts` (0), `publication_queue` (0), `publication_logs` (0)
- **Billing:** `asaas_products` (18), `asaas_subscriptions` (0), `kiwify_products` (10), `kiwify_subscriptions` (0), `billing_events` (0)
- **Layout engine (Sprint 0):** `layout_templates` (0), `user_layouts` (0), `admin_layouts` (0), `layout_block_registry` (0)

**Insight:** o banco está **zerado de dados reais**. Zero leads, zero creatives, zero jobs, zero subscriptions. Isso confirma que **nada foi testado ponta-a-ponta em produção** — o que alinha com a política "venda só depois de tudo perfeito".

### Edge functions — 30 deployed

Todas as funções esperadas estão ativas:

**Criativos (3):** `gerar-criativo`, `refinar-texto-criativo`, `generate-art`, `generation-callback`, `generate-dispatch`, `generate-caption`
**Vídeos (4):** `image-to-video`, `poll-video-status`, `generate-reel-script`
**Site:** `verify-domain`, `generate-xml-feed`, `generate-seo`
**WhatsApp (4):** `whatsapp-connect`, `whatsapp-status`, `whatsapp-events`, `whatsapp-instance`, `inbox-proxy`
**Social (3):** `publish-dispatch`, `publish-callback`, `publish-social`, `process-scheduled-posts`
**Automation:** `automation-trigger`, `n8n-bridge`
**Billing (4):** `kiwify-webhook`, `hotmart-webhook`, `asaas-webhook`, `create-asaas-subscription`
**Utils:** `virtual-staging`, `import-data`

**Insight positivo:** a plataforma está **estruturalmente completa**. Não faltam funções críticas — faltam polimento, testes e validações.

---

## 🔧 RECOMENDAÇÃO — ordem de correção

Abaixo, ordem ótima custo/impacto assumindo "não podemos vender nada até estar perfeito":

### Sprint 1 — Fundações (1 dia)
1. **Fix `consume_credits`** → migration reescrevendo para usar `user_plans`. Destrava tudo. *[~30min]*
2. **Ativar Leaked Password Protection** → toggle no dashboard. *[30s — usuário faz]*
3. **Adicionar `drop_console` no Vite build** → uma linha. Limpa 404 console.* em produção. *[5min]*
4. **Gerar types Supabase atualizados** → elimina `as any`. *[10min]*
5. **Tighten 6 RLS policies service_role** → migration. *[15min]*

### Sprint 2 — Segurança crítica (1-2 dias)
6. **HMAC validation nos 5 webhooks** → Kiwify, Hotmart, Asaas, whatsapp-events, publish-callback. *[~5h total]*
7. **Cleanup em polling** → setInterval/clearInterval + try/catch. *[~2h]*

### Sprint 3 — Health dashboard interno (1 dia)
8. **Construir `/admin/health`** → página interna que mostra:
   - 🟢/🔴 para cada módulo core
   - Uptime dos 30 edge functions
   - Últimas chamadas de webhook (validar que HMAC passa)
   - Integridade das RLS (query `pg_tables`)
   - Contador de `user_plans`, `creatives`, `video_jobs`, etc.
9. Substitui smoke test manual. Usuário abre uma vez por dia e vê o verde.

### Sprint 4 — Validação módulo a módulo (1 semana)
10. **Por módulo** (na ordem: Site → Criativos → Vídeos → CRM → WhatsApp → Social):
    - `qa-autotest` roda o golden path
    - Consertar tudo que ele reportar vermelho
    - Marcar no health dashboard como 🟢
11. **Timezone fix** → `date-fns-tz` + campo `user_timezone` no profile
12. **Resolver duplicação** generate-video / generate-video-v2

### Sprint 5 — Finalização
13. **Review completo de async/await** sem try/catch → audit + fix
14. **Testes end-to-end** de fluxo de pagamento Kiwify sandbox (sem ativar produção)
15. **Load test** das edge functions críticas
16. **Abrir gate de venda** quando TODOS os módulos core estão 🟢 + todos os P0 fechados + webhook HMAC testado

---

## 🔒 GATE DE LIBERAÇÃO DE VENDA — checklist

Referência: [memory/project_venda_gate.md](../../../.claude/projects/c--Users-Douglas-imob-creator-studio/memory/project_venda_gate.md)

Nenhum checkout Kiwify ativa-se para público até TODOS os itens abaixo estarem marcados:

### Fundações
- [ ] `consume_credits` RPC migrada para `user_plans` (P0.1)
- [ ] Leaked Password Protection ativo (P0.3)
- [ ] `drop_console` habilitado no build de produção (P1.2)
- [ ] Types Supabase regenerados, zero `as any` em paths críticos (P1.3)
- [ ] 6 RLS policies service_role tightened (P1.1)

### Segurança
- [ ] HMAC validation em `kiwify-webhook` — testado com payload forjado (rejeita) (P0.2)
- [ ] HMAC validation em `hotmart-webhook` (P0.2)
- [ ] HMAC validation em `asaas-webhook` (P0.2)
- [ ] Signature validation em `whatsapp-events` (P0.2)
- [ ] Signature validation em `publish-callback` (P0.2)

### Observabilidade
- [ ] `/admin/health` implementado e mostrando estado real
- [ ] Usuário abre health todo dia e confirma 🟢

### Módulos (qa-autotest deve retornar 🟢 no golden path)
- [ ] 🟢 Criativos — login → criar criativo → download → publicar IG
- [ ] 🟢 Vídeos — login → upload fotos → Reel 30s gerado → download
- [ ] 🟢 Site do Corretor — já 🟢 hoje, só revalidar
- [ ] 🟢 CRM — import CSV → lead entra → move pipeline → converte
- [ ] 🟢 WhatsApp — conectar instância → receber mensagem → responder
- [ ] 🟢 Social — conectar Meta → agendar post → publica no horário

### Pagamento (teste controlado)
- [ ] Compra real Starter R$97 em Kiwify sandbox → webhook chega → `user_plans` atualiza → usuário vê plano no sidebar
- [ ] Compra Básico R$197 e PRO R$397 testadas (3 tiers)
- [ ] Cancelamento testado → plano volta a trial
- [ ] Refund testado → créditos revertidos

### Auditoria final
- [ ] 0 errors em `npx tsc --noEmit`
- [ ] 0 warnings críticos no Supabase advisors
- [ ] Smoke test manual pelo usuário em conta de teste (não Douglas)

**Quando todos os 20 itens estiverem ✅ → destrava venda.**

---

## 📋 PENDÊNCIAS PARA PRÓXIMO CICLO

Itens que exigem ação ou decisão do usuário:

1. **Decidir `generate-video` vs `generate-video-v2`** — qual é a canônica? A antiga pode ser removida?
2. **`/admin/health` design** — quer página fullscreen ou widget no dashboard existente?
3. **Timezone** — qual é a política? Forçar UTC-3 (Brasil) ou ler do perfil do usuário?
4. **Rotas duplicadas Social** — `/dashboard/social/calendario` vs `/calendario/publicacoes` — qual fica?
5. **Branch `feat/lp-criativos-redesign`** — merge, abandona, ou continua iterando?
6. **Kiwify sandbox** — existe conta de teste? Ou precisa criar para validar fluxo de compra antes de produção?
7. **Quem faz o smoke test manual** — Douglas? Tester externo? Cliente beta?

---

## 📎 ARTEFATOS DESTA AUDITORIA

- **Este relatório:** `docs/qa-reports/supervisor-2026-04-13.md`
- **Output Explore agent:** capturado neste documento (não persistido separadamente — evitar duplicação)
- **Memory persistido:**
  - `memory/project_venda_gate.md` — política de gate de venda
  - `memory/feedback_qa_custo.md` — restrições de custo em QA
- **Próximo QA sugerido:** `qa-autotest` por módulo, um de cada vez, começando por **Criativos** (porque é o módulo mais usado e o `consume_credits` destrava ele)

---

## ⏹️ FIM DO RELATÓRIO

**Budget respeitado:** 1 pass, 1 arquivo, 0 subagentes em cadeia.
**Próxima ação:** aguardar decisão do usuário sobre qual item do gate atacar primeiro. Sugestão: **P0.1 — fix `consume_credits`** (eu consigo fazer sozinho em 30min, destrava geração para qualquer conta nova, zero envolvimento do usuário).
