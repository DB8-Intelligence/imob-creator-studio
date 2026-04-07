# Como usar estes prompts no Claude Code

## Sequência obrigatória de execução

```
PROMPT-1-FOUNDATION.md   →   PROMPT-2-FRONTEND-WEWEB.md   →   PROMPT-3-AGENT-REGISTRY.md
     (backend)                    (frontend WeWeb)                  (agentes dinâmicos)
```

NÃO pule etapas. Cada prompt depende do anterior estar funcionando.

---

## Como executar cada prompt no Claude Code

### Passo 1 — Abrir o repositório local

```bash
cd C:\Users\Douglas\imob-creator-studio
claude
```

### Passo 2 — Confirmar que o Claude Code leu o CLAUDE.md

```
> leia o CLAUDE.md e me diga o que entendeu sobre o projeto
```

Aguardar confirmação antes de continuar.

### Passo 3 — Executar PROMPT 1

Abrir `PROMPT-1-FOUNDATION.md` e colar o conteúdo no Claude Code assim:

```
Implemente tudo que está no arquivo PROMPT-1-FOUNDATION.md que está em 
C:\Users\Douglas\imob-creator-studio\.claude\

Siga a sequência exata das 6 fases.
Resolva automaticamente qualquer pendência que não seja credencial externa.
Ao final, liste:
1. O que foi criado
2. O que ficou pendente (apenas dependências externas reais)
3. Próximos passos para o Prompt 2
```

### Passo 4 — Testar PROMPT 1 antes de avançar

```bash
# Testar análise de imagem
curl -X POST http://localhost:3000/api/creative-jobs/create \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "form",
    "template_id": "dark_premium",
    "formats": ["post","story"],
    "variation_count": 1,
    "image_count": 1,
    "input_images": ["https://..."],
    "use_brand_identity": false,
    "user_description": "Apartamento exclusivo no Alphaville com 3 suítes"
  }'

# Verificar status
curl http://localhost:3000/api/creative-jobs/{job_id}/status
```

### Passo 5 — Executar PROMPT 2

```
Implemente tudo que está no PROMPT-2-FRONTEND-WEWEB.md.

IMPORTANTE: O frontend é WeWeb. Não criar arquivos React/Next.js.
Criar apenas:
1. Custom Elements Vue 3 em src/weweb-components/
2. State machine do assistente em src/weweb-components/assistant-state-machine.ts
3. Documentação dos workflows WeWeb em docs/weweb-workflows.md
4. Documentação da estrutura de páginas em docs/weweb-pages.md

Os Custom Elements Vue 3 serão importados manualmente no WeWeb via plugin.
```

### Passo 6 — Executar PROMPT 3 (somente após backend + frontend validados)

```
Implemente tudo que está no PROMPT-3-AGENT-REGISTRY.md.

O banco já tem as tabelas agent_registry, agent_versions, agent_bindings, agent_execution_logs.
Os serviços base existem em src/services/.
Atualize o pipeline-orchestrator para consultar agentes dinâmicos.
Execute o seed de agentes iniciais.
```

---

## O que esperar de cada prompt

### PROMPT 1 cria:
- `supabase/migrations/001` a `005` — schema completo
- `src/types/` — todos os tipos TypeScript
- `src/services/` — 5 serviços principais
- `src/routes/` — 8 endpoints da API
- `supabase/seed/templates.sql` — 6 templates iniciais

### PROMPT 2 cria:
- `src/weweb-components/FormatSelectorCard.vue`
- `src/weweb-components/TemplateCard.vue`
- `src/weweb-components/ProgressOverlay.vue`
- `src/weweb-components/AssistantChat.vue`
- `src/weweb-components/LogoUploader.vue`
- `src/weweb-components/ImageUploader.vue`
- `src/weweb-components/assistant-state-machine.ts`
- `docs/weweb-workflows.md`
- `docs/weweb-pages.md`

### PROMPT 3 cria:
- Atualização de `src/services/prompt-assimilation.service.ts`
- Criação de `src/services/agent-registry.service.ts`
- Atualização de `src/services/pipeline-orchestrator.service.ts`
- Atualização de `src/services/template-decision.service.ts`
- Adição de `src/routes/agents.ts`
- `supabase/seed/agents.sql` — 5 agentes base

---

## Problemas comuns e soluções

### "Cannot find module @anthropic-ai/sdk"
```bash
npm install @anthropic-ai/sdk @supabase/supabase-js fastify zod bull
```

### "Supabase connection refused"
Verificar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env

### "Claude Vision retorna parse error"
O modelo retornou markdown em vez de JSON puro.
O service já tem fallback — verificar logs para ver o texto retornado.

### "Shotstack webhook não chega"
Durante desenvolvimento local, usar ngrok:
```bash
ngrok http 3000
# Atualizar SHOTSTACK_WEBHOOK_URL no .env com a URL do ngrok
```

### "WeWeb não aceita o componente Vue"
Verificar se o componente está usando Vue 3 Options API ou Composition API.
WeWeb aceita ambos, mas não aceita `<script setup>` com algumas diretivas.
Testar com a versão Options API primeiro.

---

## Variáveis de ambiente necessárias (.env)

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Fal.ai
FAL_KEY=...

# Shotstack
SHOTSTACK_API_KEY=...
SHOTSTACK_ENV=stage

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=imobcreator-creatives

# App
API_BASE_URL=https://seu-railway-app.railway.app
PORT=3000

# Evolution API (WhatsApp — self-hosted Railway)
EVOLUTION_API_URL=https://evolution.seu-dominio.com.br
EVOLUTION_API_GLOBAL_KEY=sua-chave-global
```

---

## Depois que tudo estiver rodando

### Para adicionar um novo template:
1. Criar o JSON do template (use a skill `imobcreator-creative-engine` para gerar)
2. Adicionar em `supabase/seed/templates.sql`
3. Executar: `supabase db push`

### Para adicionar um novo agente:
```bash
curl -X POST https://seu-app.railway.app/api/agents/create \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Nome do Agente",
    "description": "O que ele faz",
    "prompt_master": "Você é um agente que..."
  }'
```

### Para analisar qualquer nova imagem e gerar template:
Usar a skill `imobcreator-creative-engine` nesta conversa — ela entrega os 5 blocos completos prontos para implementar.
