# CLAUDE.md — ImobCreator Creative Engine

## O que você vai implementar

O sistema de geração de criativos do ImobCreator AI. Um pipeline completo
que transforma imagem + texto do usuário em criativos profissionais para
post (4:5), story (9:16) e reels (9:16), usando composição sobre a foto
original sem modificá-la.

## Stack do projeto

- Frontend: WeWeb (visual) — não mexer nos componentes WeWeb diretamente
- Backend: Railway (Node.js/Express ou Fastify)
- Database: Supabase (PostgreSQL + Storage)
- IA Análise: Anthropic API (claude-sonnet-4-6 com vision)
- IA Geração: Fal.ai (Flux Pro)
- Render: Shotstack API
- WhatsApp: Evolution API v2 (self-hosted Railway)

## Ordem de implementação

### FASE 1 — Tipos e interfaces TypeScript
Criar em `src/types/`:

```
user-brand-profile.ts     → perfil de marca do usuário
image-analysis.ts         → resultado da análise Claude Vision
text-processed.ts         → copy gerado a partir do texto do usuário
resolved-palette.ts       → paleta final resolvida (marca ou imagem)
template-config.ts        → estrutura de um template
pipeline-input.ts         → input do pipeline de criação
pipeline-output.ts        → output com URLs dos criativos gerados
```

Todos os tipos estão documentados em `pipeline/variable-resolver.md`.

### FASE 2 — Supabase: schema do banco

Executar as migrations em `database/migrations/` nesta ordem:

1. `001_user_brand_profiles.sql`
2. `002_creative_templates.sql`
3. `003_creative_jobs.sql`
4. `004_generated_creatives.sql`

O schema completo está em `pipeline/shotstack-builder.md` seção "Database Schema".

### FASE 3 — Onboarding de marca (1º login)

Implementar em `src/services/onboarding/`:

- `brand-capture.service.ts` — orquestra o fluxo de onboarding
- `logo-analyzer.service.ts` — extrai cores da logomarca via Claude Vision
- `profile-builder.service.ts` — salva UserBrandProfile no Supabase

Fluxo completo em `onboarding/brand-capture.md`.
Extração de cores em `onboarding/logo-color-extractor.md`.

### FASE 4 — Pipeline de análise (core do sistema)

Implementar em `src/services/pipeline/`:

- `image-analyzer.service.ts` — chama Claude Vision com prompt unificado
- `copy-processor.service.ts` — processa texto bruto → copy completo
- `color-resolver.service.ts` — decide paleta (marca vs imagem)
- `variable-resolver.service.ts` — monta objeto final com todas variáveis

O prompt unificado Claude está em `pipeline/unified-prompt.md`.
A lógica de cores está em `references/color-resolver.md`.
A lógica de copy está em `references/copy-processor.md`.

### FASE 5 — Templates

Carregar templates da biblioteca em `src/services/templates/`:

- `template-loader.service.ts` — lê JSONs da pasta `templates/`
- `template-registry.ts` — mapa de todos os templates disponíveis
- `variable-interpolator.ts` — substitui {{variavel}} nos templates

Os JSONs dos templates estão em `templates/*.json`.

### FASE 6 — Render (Shotstack)

Implementar em `src/services/render/`:

- `shotstack.service.ts` — submete job e faz polling
- `shotstack-builder.service.ts` — monta JSON de timeline a partir do template
- `webhook-handler.ts` — recebe callback quando render completa

Referência técnica em `pipeline/shotstack-builder.md`.

### FASE 7 — API Routes

Criar em `src/routes/`:

```
POST /api/creatives/analyze          → analisa imagem, retorna JSON completo
POST /api/creatives/generate         → inicia pipeline completo
GET  /api/creatives/status/:jobId    → status do job de render
GET  /api/creatives/:id              → busca criativo gerado
GET  /api/templates                  → lista biblioteca de templates
POST /api/onboarding/brand           → salva perfil de marca
POST /api/onboarding/logo-analyze    → analisa logo e extrai cores
```

### FASE 8 — Geração via Flux (opcional, para templates com reestilização)

Implementar em `src/services/flux/`:

- `flux.service.ts` — wrapper da Fal.ai API
- `flux-prompt-builder.ts` — monta prompt Flux a partir do template + variáveis

Os prompts Flux por estilo estão em `references/flux-prompts.md`.

## Variáveis de ambiente necessárias

```env
# Anthropic
ANTHROPIC_API_KEY=

# Fal.ai
FAL_KEY=

# Shotstack
SHOTSTACK_API_KEY=
SHOTSTACK_ENV=stage  # ou production

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=imobcreator-creatives

# Evolution API (WhatsApp — self-hosted Railway)
EVOLUTION_API_URL=
EVOLUTION_API_GLOBAL_KEY=
```

## Regras importantes

1. **A imagem original NUNCA é modificada.** Ela é sempre o background layer.
   Toda estilização é overlay, tipografia e elementos sobre ela.

2. **Cores seguem prioridade:**
   - Tem logo cadastrada → usar cores da marca
   - Não tem logo → extrair cores da imagem enviada

3. **Claude model para análise:** sempre `claude-sonnet-4-6` (vision + qualidade)
   **Claude model para copy simples:** `claude-haiku-4-5` (volume + custo)

4. **Flux para reestilização:** apenas templates com `pipeline.reestilizacao_flux: true`
   Templates padrão NÃO chamam Flux — apenas Shotstack para composição.

5. **Shotstack é o render engine principal.** Flux é opcional para templates
   que precisam de foto gerada por IA (quando usuário não tem foto própria).

6. **Cada job de criativo gera 3 arquivos** (post + story + reels) em paralelo.

## Como testar cada fase

```bash
# Fase 1-2: verificar tipos e migrations
npx tsc --noEmit
supabase db push

# Fase 3: testar onboarding
curl -X POST /api/onboarding/logo-analyze \
  -F "logo=@logo.png"

# Fase 4: testar análise
curl -X POST /api/creatives/analyze \
  -F "image=@imovel.jpg" \
  -F "texto=Apartamento exclusivo no Alphaville" \
  -F "user_id=uuid"

# Fase 5-7: testar pipeline completo
curl -X POST /api/creatives/generate \
  -F "image=@imovel.jpg" \
  -F "texto=Apartamento exclusivo no Alphaville" \
  -F "template_id=dark_premium" \
  -F "formatos=post,story,reels" \
  -F "user_id=uuid"
```

## Referências desta skill

Leia nesta ordem conforme avança nas fases:

1. `pipeline/unified-prompt.md` — o prompt Claude que alimenta tudo
2. `references/color-resolver.md` — lógica de cores
3. `references/copy-processor.md` — lógica de copy
4. `pipeline/variable-resolver.md` — como montar o objeto de variáveis
5. `pipeline/shotstack-builder.md` — como montar o JSON de render
6. `onboarding/brand-capture.md` — fluxo de onboarding
7. `onboarding/logo-color-extractor.md` — extração de cores da logo
8. `templates/*.json` — os templates da biblioteca
9. `references/flux-prompts.md` — prompts Flux por estilo
10. `references/reverse-engineer.md` — como criar novos templates
