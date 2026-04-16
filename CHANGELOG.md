# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased] — Sessão Compliance + Go-Live Prep (2026-04-17)

Sessão focada em compliance legal para fotos restauradas com IA, dual-mode
image-restoration, disclaimers visuais e infraestrutura pré go-live.

### Compliance (crítico)

- **`b517cad`** — `image-restoration` edge function refatorada para dual-mode:
  - `restoration` (default): RESTORATION_PROMPT com 15+ constraints "DO NOT",
    temperature 0.1, `customPrompt` bloqueado por segurança
  - `staging` (opcional): comportamento de virtual staging preservado
  - Audit logs rastreiam `mode` e `temperature` ativos
- **`5d3a915`** — Componentes de disclaimer visual em
  `src/components/disclaimers/RestorationDisclaimer.tsx`:
  - `RestorationBadge` (3 variantes: default, compact, transparent)
  - `RestorationBadgeWithTooltip` (hover com explicação)
  - `ImageWithRestorationDisclaimer` (toggle "Ver Original / Ver Restaurada")
  - `RestorationInfoBanner` (notice de página para múltiplas fotos)
- **`9a6c8de`** — Badge integrado em `CreativeCard` (compact, bottom-right) e
  `CreativeModal` (tooltip, bottom-right). Migration adiciona
  `restoration_applied` e `original_image_url` em `creatives_gallery`.

### Background Processing (Gemini Fase 2)

- **`3b67b4e`** — Infraestrutura genérica de jobs assíncronos:
  - Tabela `jobs` com RLS + Realtime publication
  - Hook `useJobStatus` (Realtime subscription, funciona com qualquer tabela
    de jobs: `jobs`, `generation_jobs`, `creative_jobs`, `video_jobs`)
  - Hook `useImageRestoration` (wrapper da edge function)
  - Componente `JobStatusScreen` (UI com 4 estados:
    pending/processing/completed/error)
  - Rota `/dashboard/job/:jobId`

### WhatsApp Module — Outbound + Flow Builder

- **`70276f0`** — Módulo WhatsApp completo:
  - Edge function `whatsapp-instance` com novos actions `send`, `messages`,
    `contacts` (via Evolution API)
  - `ChatWindow` component (bolhas, auto-scroll, optimistic append)
  - `WhatsAppInboxPage` redesenhada (split-pane: contatos + chat)
  - `WhatsAppFlowBuilderPage` (editor visual com 5 tipos de node: trigger,
    send_message, delay, condition, webhook)
  - Migration `whatsapp_sent_messages` + colunas `nodes`/`edges` em
    `automation_rules`

### FormFlow — Auto-Restore Toggle

- **`a3a5dbc`** — Toggle "Restaurar qualidade automaticamente" no Step 1
  do FormFlow. Passa `auto_restore: true` no metadata do creative job para
  o pipeline-orchestrator processar restauração antes do Flux.

### Sprint 1 — Dashboard Multi-Produto

- **`72d23b5`** — Dashboard dinâmico baseado em subscriptions:
  - Hook `useUserSubscriptions` (fetch + Realtime auto-refresh)
  - `ModuleWidgets` com 6 widgets (Criativos, Vídeos, WhatsApp, Site,
    CRM, Social)
  - Renderização condicional: widgets aparecem conforme
    `user_subscriptions.module_id` ativos

### Migrations Aplicadas no Supabase

| Migration | Propósito |
|-----------|-----------|
| `20260417100000_whatsapp_outbound_and_flow_builder` | `whatsapp_sent_messages` + `automation_rules` extensions |
| `20260417200000_create_jobs_table` | Tabela genérica `jobs` + RLS + Realtime |
| `20260417300000_add_restoration_flag_to_creatives` | `restoration_applied` + `original_image_url` em `creatives_gallery` |

### Pendências Pós-Sessão (não-código)

- Advogado revisar `RESTORATION_PROMPT` e aprovar
- Atualizar Termos de Serviço (restauração ≠ geração)
- Deploy da edge function `image-restoration` atualizada no Supabase
- Pipeline-orchestrator no server backend precisa respeitar
  `metadata.auto_restore` e setar `restoration_applied = true` nos
  creative_jobs processados
- 4 vulnerabilidades no Dependabot (1 high, 3 moderate)
