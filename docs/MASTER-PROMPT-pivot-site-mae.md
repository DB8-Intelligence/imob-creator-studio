# Master Prompt — Pivot para Site Mãe de Venda de Produtos

Uso: copiar e colar este documento inteiro como primeira mensagem em uma nova sessão de IA (ou briefing para desenvolvedor) para dar contexto completo do estado atual e do plano de pivot.

Data de referência: 2026-04-12

---

## PARTE 1 — CONTEXTO: ESTADO ATUAL DO PROJETO

### Identidade atual

- **Repositório**: `c:/Users/Douglas/imob-creator-studio`
- **Branding atual**:
  - Marca externa: **NexoImob AI**
  - Produto interno: **ImobCreator AI Studio**
  - Razão social: **DB8 Intelligence**
- **Posicionamento atual**: SaaS all-in-one para corretores e imobiliárias
- **Stack**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase (DB + Auth + Storage + Edge Functions Deno) + n8n

### O que já está construído e funcional

**12 módulos core operacionais:**
1. Criativos (posts estáticos para IG/FB)
2. Vídeo Imobiliário (composição com IA, até 4K)
3. Site Imobiliário (editor com **10 temas prontos**: brisa, urbano, litoral, dark-premium, hamilton, nestland, nexthm, ortiz, quarter, rethouse)
4. CRM + Pipeline de Leads
5. WhatsApp (inbox, fluxos, bulk notify)
6. Social Media (IG/FB, calendário, auto-post)
7. Book / Portfolio PDF (catálogo de imóveis)
8. Financeiro (receitas, comissões)
9. Importação em massa (CSV/Excel)
10. Analytics & Relatórios
11. Diagnóstico Digital Gratuito (gerador de leads via IA)
12. Onboarding progressivo

**8 módulos especializados de IA de imagem:**
- Reverse Prompt Lab, Virtual Staging, Renovate Property, Sketch Render, Empty Lot, Land Marking, Upscale, Animate Creative

**Backend Supabase (projeto `spjnymdizezgmzwoskoj`):**
- 82 tabelas modeladas
- 55 migrations aplicadas
- 29 edge functions ativas (geração, publicação, webhooks, billing)
- Auth + RLS + Storage operacionais
- 0 erros críticos de segurança (hardening aplicado em 2026-04-12)

**Integrações ativas:**
- Anthropic Claude (Vision + texto)
- n8n (automação via edge function `n8n-bridge`)
- Meta Business (IG/FB)
- WhatsApp Business (Evolution API)
- **Asaas** (18 produtos já cadastrados — processor principal candidato)
- **Kiwify** (6 produtos cadastrados + 18 URLs com TODO no código)
- Hotmart (webhook ativo, sem produtos)
- DB8 Intelligence API (render de vídeo externo)

**~90+ rotas registradas em `src/App.tsx`**, entre públicas (landing pages), autenticadas (dashboard) e administrativas.

### O que NÃO está pronto

**Bloqueadores comerciais (não técnicos):**
- 18 links de checkout Kiwify com placeholder `/TODO` OU decisão de migrar 100% para Asaas
- Env vars de produção não configuradas: `VITE_GA4_ID`, `VITE_META_PIXEL_ID`, `VITE_META_APP_ID`, `VITE_ANTHROPIC_API_KEY`
- 11 commits locais não pushados para origin/main (produção defasada)
- Sem material de marketing real (depoimentos, cases, vídeo de demo)

**Pendências técnicas (não bloqueiam venda):**
- SP3-003: Preview comparativo A/B/C (estimativa G)
- SP3-004: Edição inline de copy (estimativa M)
- SP4-001 a SP4-004: Video hardening, observabilidade, retry, runbook
- LeadsMapView real (depende Mapbox/Google Maps API key)
- AutomacoesFluxosPage visual flow builder
- Fix de 7 funções com `search_path` mutável
- Revisão de 8 policies permissivas (provavelmente OK, validar)
- Drop de 4 tabelas legadas (`items`, `templates`, `user`, `user_teste2`)

### Documentos de referência no repo

- [docs/project-status-report-2026-04-12.md](docs/project-status-report-2026-04-12.md) — relatório executivo completo
- [docs/sprint-execution-backlog.md](docs/sprint-execution-backlog.md) — backlog de sprints atualizado
- [docs/brand-naming-decision.md](docs/brand-naming-decision.md) — decisão de naming
- [docs/PRD-ImobCreator.md](docs/PRD-ImobCreator.md) — PRD do produto atual
- [docs/video-module-smoke-test-runbook.md](docs/video-module-smoke-test-runbook.md) — smoke test do vídeo
- [supabase/migrations/20260412000000_security_hardening.sql](supabase/migrations/20260412000000_security_hardening.sql) — última migration

---

## PARTE 2 — OBJETIVO DO PIVOT: SITE MÃE DE VENDA

### Visão nova

Transformar o repositório de **"um SaaS para corretores"** em **"um site mãe que vende múltiplos produtos digitais"**, onde cada módulo hoje acoplado vira **produto vendável separadamente** ou em combos.

### Mudança conceitual

**ANTES (estado atual)**
```
NexoImob AI = 1 plataforma SaaS
             ↓
  Usuário paga uma assinatura
             ↓
  Acessa todos os módulos integrados
```

**DEPOIS (pivot)**
```
Site Mãe (catálogo / marketplace)
             ↓
  Produtos vendáveis independentes:
    1. Templates de Site Imobiliário (10 temas × modalidades)
    2. Módulo Criativos (IG/FB)
    3. Módulo Vídeo Imobiliário
    4. Módulo CRM
    5. Módulo WhatsApp Business
    6. Módulo Social Media (agendamento)
    7. Módulo Book PDF
    8. IA de Imagem (staging, upscale, etc)
    9. Combos (Starter / Pro / Enterprise)
   10. Serviços: implementação, setup, customização
             ↓
  Checkout individual OU bundle
             ↓
  Cliente recebe acesso só ao que comprou
```

### Princípios do pivot

1. **Não reescrever o que já existe** — os módulos atuais continuam funcionando, mas ganham uma "camada de catálogo" à frente
2. **Cada módulo vira um produto com SKU próprio** — mapeado em `asaas_products` / `kiwify_products`
3. **Acesso por módulo comprado** — sistema de gating baseado no que o usuário tem licença
4. **Site mãe é uma landing + catálogo**, não mais um app
5. **Dashboard atual continua existindo** mas só mostra o que o cliente comprou
6. **Templates de site viram produto tangível** — cliente compra o tema e recebe site publicado no domínio dele

---

## PARTE 3 — ARQUITETURA-ALVO

### Nova hierarquia de páginas

```
/ (Home do Site Mãe)
├── /produtos                       [novo: catálogo]
│   ├── /produtos/sites             [templates de site]
│   │   ├── /produtos/sites/:theme  [detalhe do tema]
│   ├── /produtos/criativos         [módulo criativos]
│   ├── /produtos/videos            [módulo vídeo]
│   ├── /produtos/crm               [módulo CRM]
│   ├── /produtos/whatsapp          [módulo WhatsApp]
│   ├── /produtos/social            [módulo social]
│   ├── /produtos/book              [módulo book PDF]
│   ├── /produtos/ia-imagem         [suite de IA]
│   └── /produtos/servicos          [setup, customização]
│
├── /combos                         [novo: bundles]
│   ├── /combos/starter
│   ├── /combos/pro
│   └── /combos/enterprise
│
├── /checkout/:productId            [novo: checkout direto]
├── /minha-conta                    [rename de /dashboard]
│   └── apenas módulos comprados visíveis
│
├── [rotas existentes de dashboard mantidas mas protegidas por licença]
│
└── [landing pages setoriais viram LPs de produto específico]
```

### Novas tabelas Supabase (a criar)

```sql
-- Catálogo de produtos vendáveis
CREATE TABLE public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,              -- "site-tema-nestland", "modulo-crm"
  category text not null,                  -- "site_template", "modulo", "combo", "servico"
  name text not null,
  description text,
  long_description text,
  price_cents integer not null,
  recurring boolean default false,         -- assinatura ou one-time
  billing_cycle text,                      -- "monthly", "yearly", "one_time"
  features jsonb,                          -- lista de features para display
  cover_image text,
  preview_url text,
  sku_asaas text,                          -- link com asaas_products
  sku_kiwify text,                         -- link com kiwify_products
  status text default 'draft',             -- draft, active, archived
  display_order integer,
  created_at timestamptz default now()
);

-- Licenças compradas por usuário/workspace
CREATE TABLE public.user_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  workspace_id uuid references public.workspaces(id),
  product_id uuid references public.marketplace_products(id),
  status text default 'active',            -- active, expired, cancelled
  activated_at timestamptz default now(),
  expires_at timestamptz,
  source text,                             -- "asaas", "kiwify", "manual"
  payment_reference text,                  -- ID externo do pagamento
  metadata jsonb
);

-- Histórico de transações do marketplace
CREATE TABLE public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  product_id uuid references public.marketplace_products(id),
  amount_cents integer not null,
  currency text default 'BRL',
  status text not null,                    -- pending, paid, failed, refunded
  processor text,                          -- asaas, kiwify
  processor_order_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);
```

### Sistema de gating (controle de acesso por licença)

Substituir ou complementar o atual `useUserPlan` / `usePlanGate` por um novo hook:

```typescript
// src/hooks/useLicenses.ts
export function useHasLicense(productSlug: string): boolean {
  // Consulta user_licenses para verificar se o usuário tem acesso
}

// src/components/LicenseGate.tsx
<LicenseGate product="modulo-crm" fallback={<UpsellCard />}>
  <CrmDashboard />
</LicenseGate>
```

Aplicar `<LicenseGate>` em todas as rotas do dashboard atual.

---

## PARTE 4 — PLANO DE EXECUÇÃO DO PIVOT

### Fase 0 — Preparação (antes de tocar código)

**Decisões comerciais que o usuário precisa tomar:**

1. **Processador canônico**: Asaas ou Kiwify como principal?
   - Recomendação: **Asaas** (já tem 18 produtos configurados, suporta recorrência nativa, API mais robusta)
2. **Modelo de licenciamento**:
   - (a) Uma assinatura por produto (SaaS tradicional, recorrente)
   - (b) Compra one-time + atualizações opcionais (modelo Shopify themes)
   - (c) Híbrido: templates one-time, módulos recorrentes
   - Recomendação: **(c) híbrido**
3. **Templates de site**:
   - (a) Cliente compra template e recebe código-fonte (como ThemeForest)
   - (b) Cliente compra e a plataforma hospeda o site sob subdomínio
   - (c) Cliente compra e publicamos em domínio customizado dele
   - Recomendação: **(b) + opção de upgrade para (c)**
4. **Preços por módulo**: definir tabela nova de preços (ver Fase 1)
5. **Branding do site mãe**: manter NexoImob AI ou criar marca nova guarda-chuva?

### Fase 1 — Estruturação do catálogo (2-3 dias)

1. Criar migration com as 3 tabelas novas (`marketplace_products`, `user_licenses`, `marketplace_orders`)
2. Popular `marketplace_products` com ~20 produtos iniciais:
   - 10 templates de site (1 por tema existente)
   - 7 módulos (criativos, vídeo, CRM, whatsapp, social, book, ia-imagem)
   - 3 combos (starter, pro, enterprise)
3. Linkar cada produto a um `asaas_product` existente ou criar novos
4. Criar `src/hooks/useLicenses.ts` e `src/hooks/useMarketplaceProducts.ts`
5. Criar `src/components/LicenseGate.tsx`

### Fase 2 — Páginas do marketplace (3-5 dias)

1. Nova home `/` com hero de catálogo (substitui a atual)
2. `/produtos` — listagem geral com filtros por categoria
3. `/produtos/:category` — listagem por categoria
4. `/produtos/:category/:slug` — página de detalhe com preview/mockup/features/CTA
5. `/combos` — listagem de bundles
6. `/checkout/:productId` — página intermediária antes do processor externo
7. Redirect da home antiga para `/dashboard-legado` ou link no menu

### Fase 3 — Gating das features existentes (2-3 dias)

1. Envolver cada rota do dashboard atual com `<LicenseGate>`
2. Criar UpsellCard genérico que mostra quando o usuário não tem licença
3. Atualizar sidebar para mostrar só itens comprados (com opção de ver tudo em modo "explore")
4. Onboarding ajustado: ao invés de criar conta e já ver tudo, mostrar catálogo primeiro

### Fase 4 — Integração de pagamento (2-3 dias)

1. Ajustar edge function `asaas-webhook` (ou `kiwify-webhook`) para popular `user_licenses` automaticamente ao confirmar pagamento
2. Criar edge function `marketplace-checkout` que inicia a order e redireciona para Asaas checkout URL
3. Fluxo: usuário clica "Comprar" → cria `marketplace_orders` pending → redireciona para Asaas → webhook atualiza status → cria `user_licenses`

### Fase 5 — Templates como produto tangível (1 semana)

Isso depende da decisão do item 3 da Fase 0.

Se **opção (b) — hospedagem sob subdomínio**:
1. Criar fluxo: cliente compra tema → wizard de configuração → cria `corretor_sites` + `site_imoveis` seed → publica em `:slug.nexoimob.com.br`
2. Edge function `publish-theme-site` que faz o bootstrap
3. Painel do cliente para editar conteúdo do site comprado

Se **opção (c) — domínio customizado**:
1. Tudo de (b) +
2. Wizard de DNS (instruções CNAME/A record)
3. Edge function `verify-domain` já existe (revisar)
4. Certificados SSL via Supabase edge ou Cloudflare

### Fase 6 — Landing pages setoriais → LPs de produto (2-3 dias)

As LPs existentes (`/lp/criar-posts-imoveis`, `/lp/video-imobiliario`, etc) viram LPs de produto individual, apontando para `/produtos/:slug`.

### Fase 7 — Polimento e launch (3-5 dias)

1. Seed de produtos com copy real
2. Imagens/preview de cada tema
3. Vídeos de demo por módulo
4. FAQ por produto
5. Depoimentos
6. Smoke test completo do fluxo compra → ativação → uso
7. Ativação em produção

---

## PARTE 5 — O QUE PRESERVAR DO ESTADO ATUAL

**Não tocar em (já funciona bem):**
- Backend Supabase (82 tabelas, 55 migrations)
- 29 edge functions
- Módulos core (criativos, vídeo, CRM, WhatsApp, etc) — todos continuam funcionais, só ganham gating
- Sistema de auth e workspaces
- Hooks e services existentes
- Componentes shadcn/ui e tokens de design
- Build config (Vite, code splitting)

**Refatorar parcialmente:**
- `useUserPlan` / `usePlanGate` → complementar com `useLicenses`
- `src/pages/Index.tsx` → virar home do marketplace
- Sidebar do dashboard → filtrar por licença

**Descartar ou mover:**
- Links Kiwify antigos com TODO (se for Asaas canônico)
- Landing pages antigas do SaaS all-in-one (reaproveitar copy nas LPs de produto)
- `/precos` atual (substituir pelo catálogo)

---

## PARTE 6 — PERGUNTAS ABERTAS QUE O USUÁRIO PRECISA RESPONDER

Antes de começar a execução, preciso das seguintes decisões:

1. **Processador canônico**: Asaas ou Kiwify?
2. **Modelo de licenciamento**: recorrente, one-time ou híbrido?
3. **Templates**: só tema vendido ou site hospedado também?
4. **Marca do site mãe**: manter NexoImob AI ou criar marca guarda-chuva?
5. **Preços por módulo**: você tem uma tabela ou quer que eu proponha?
6. **Público-alvo**: ainda só corretores/imobiliárias ou abrir para outros setores?
7. **Backward compatibility**: usuários atuais (se houver) mantêm acesso full ou migram para licenciamento?
8. **Cronograma**: urgência de lançar? Pode ser em fases ou precisa big-bang?

---

## PARTE 7 — INSTRUÇÃO PARA A PRÓXIMA SESSÃO

Se você é a IA que recebeu este master prompt em uma nova conversa:

1. Leia integralmente [docs/project-status-report-2026-04-12.md](docs/project-status-report-2026-04-12.md) antes de começar qualquer mudança
2. Pergunte ao usuário as 8 perguntas da Parte 6
3. Só após ter as respostas, proponha um plano concreto com a Fase 1
4. Execute fase por fase, commitando ao final de cada uma
5. Nunca sobrescreva módulos existentes — só adicione a camada de catálogo/gating por cima
6. Mantenha o project ID real do Supabase: `spjnymdizezgmzwoskoj`
7. A branch main local está 11 commits à frente do origin — push só com autorização explícita
8. Respeite o branding: NexoImob AI (externo) / ImobCreator AI Studio (produto) / DB8 Intelligence (legal)

---

## ANEXO — Comandos úteis para onboarding rápido

```bash
# Ver estado atual
git log --oneline -20
git status
npx tsc --noEmit

# Listar módulos core
ls src/pages/dashboard/
ls src/pages/max/

# Ver tabelas atuais
# (via Supabase MCP contra projeto spjnymdizezgmzwoskoj)

# Build
npm run build

# Dev
npm run dev
```

---

**FIM DO MASTER PROMPT**
