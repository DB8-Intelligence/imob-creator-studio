# Deploy operacional — Módulo de Vídeo no Supabase

## Objetivo
Publicar o módulo de vídeo do ImobCreator AI Studio com:
- banco atualizado
- storage preparado
- edge function publicada
- regras de crédito ativas
- smoke test de ponta a ponta

Projeto Supabase atual:
- `spjnymdizezgmzwoskoj`

---

# 1. Escopo do deploy

Este deploy cobre os blocos abaixo:

## Banco / SQL
Migrations obrigatórias:
- `20260320073000_add_workspaces_and_memberships.sql`
- `20260321143000_add_video_module_foundation.sql`
- `20260321152000_add_video_credit_functions.sql`
- `20260321160000_add_video_addon_activation.sql`

## Edge Functions
Funções envolvidas:
- `generate-video`
- `generate-art`
- `generate-caption`
- `inbox-proxy`

## Storage
Buckets esperados após deploy:
- `video-assets` (privado)
- `video-outputs` (público)

## Frontend
Depende de:
- rotas do módulo de vídeo
- integração com `supabase.functions.invoke("generate-video")`
- leitura de `video_jobs` e `video_plan_addons`

---

# 2. Pré-requisitos

Antes do deploy, confirmar:

- Supabase CLI instalado e autenticado
- acesso ao projeto correto
- chave `SUPABASE_SERVICE_ROLE_KEY`
- chave `SUPABASE_ANON_KEY`
- chave `SUPABASE_URL`
- API externa de vídeo disponível em:
  - `https://api.db8intelligence.com.br/generate-video`
- ambiente frontend configurado com:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

# 3. Ordem correta de deploy

## Etapa 1 — Linkar o projeto Supabase
```bash
supabase link --project-ref spjnymdizezgmzwoskoj
```

## Etapa 2 — Aplicar migrations
```bash
supabase db push
```

## Etapa 3 — Publicar edge function de vídeo
```bash
supabase functions deploy generate-video
```

## Etapa 4 — Se necessário, republicar funções relacionadas
```bash
supabase functions deploy generate-art
supabase functions deploy generate-caption
supabase functions deploy inbox-proxy
```

## Etapa 5 — Conferir secrets/config do projeto
Se necessário, configurar secrets:
```bash
supabase secrets set SUPABASE_URL=https://spjnymdizezgmzwoskoj.supabase.co
supabase secrets set SUPABASE_ANON_KEY=***
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=***
```

> Observação: `generate-video` depende principalmente de `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

---

# 4. Validação de banco após deploy

Executar checagem no SQL Editor do Supabase.

## 4.1 Tabelas criadas
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('video_jobs', 'video_plan_addons');
```

## 4.2 Funções criadas
```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'consume_video_credit',
    'release_video_credit',
    'activate_video_addon'
  );
```

## 4.3 Buckets criados
```sql
select id, name, public
from storage.buckets
where id in ('video-assets', 'video-outputs');
```

## 4.4 Add-ons bootstrapados por workspace
```sql
select workspace_id, addon_type, billing_cycle, credits_total, credits_used, status
from public.video_plan_addons
order by created_at desc;
```

---

# 5. Checklist operacional da edge function

## `generate-video` deve:
- validar bearer token
- resolver usuário autenticado
- receber `workspaceId`
- receber `videoJobId`
- receber fotos via multipart/form-data
- salvar inputs em `video-assets`
- chamar API externa
- salvar output em `video-outputs`
- atualizar `video_jobs.status`
- preencher `video_jobs.output_url`

## Teste esperado
Ao chamar a função:
- job sai de `queued`
- vai para `processing`
- termina em `completed`
- `output_url` fica preenchido

---

# 6. Smoke test de produção

## Smoke Test 1 — Ativação do add-on
Objetivo: validar onboarding comercial.

### Passos
1. entrar com usuário owner/admin
2. abrir `/video-plans`
3. ativar add-on compatível com o plano do workspace

### Resultado esperado
- `video_plan_addons.status = active`
- `credits_used = 0`
- tipo do add-on refletido no dashboard

---

## Smoke Test 2 — Consumo de crédito
Objetivo: validar regra de negócio.

### Passos
1. usar workspace com add-on Starter ou Pro
2. criar um vídeo

### Resultado esperado
- `credits_used` incrementa em `+1`
- `video_jobs.credits_used = 1`
- dashboard mostra saldo restante correto

---

## Smoke Test 3 — Geração ponta a ponta
Objetivo: validar pipeline completo.

### Passos
1. abrir `/video-creator`
2. subir fotos
3. selecionar estilo/formato/duração
4. gerar vídeo

### Resultado esperado
- inputs salvos em `video-assets`
- output salvo em `video-outputs`
- job com `status = completed`
- vídeo visível em `/video-dashboard`
- vídeo visível na aba Vídeos da `/library`
- preview funcionando
- download funcionando

---

## Smoke Test 4 — Bloqueio por falta de saldo
Objetivo: validar trava comercial.

### Passos
1. consumir todos os créditos do add-on Starter
2. tentar gerar novo vídeo

### Resultado esperado
- criação do job deve falhar
- UI deve impedir nova geração
- dashboard deve exibir saldo zerado

---

## Smoke Test 5 — Workspace sem permissão
Objetivo: validar governança.

### Passos
1. entrar com member/viewer
2. tentar ativar add-on em `/video-plans`

### Resultado esperado
- ativação não permitida
- owner/admin continua podendo ativar

---

# 7. Checklist de produção

## Banco
- [ ] migrations aplicadas sem erro
- [ ] tabelas `video_jobs` e `video_plan_addons` existem
- [ ] funções RPC existem
- [ ] índices aplicados
- [ ] RLS ativa

## Storage
- [ ] bucket `video-assets` criado
- [ ] bucket `video-outputs` criado
- [ ] output público funcionando
- [ ] uploads de input funcionando

## Edge Function
- [ ] `generate-video` publicada
- [ ] secrets presentes
- [ ] auth validando corretamente
- [ ] API externa respondendo com vídeo
- [ ] output sendo salvo no Supabase Storage

## Frontend
- [ ] `/video-dashboard` abre
- [ ] `/video-creator` abre
- [ ] `/video-styles` abre
- [ ] `/video-plans` abre
- [ ] aba Vídeos na biblioteca abre
- [ ] preview do vídeo funciona
- [ ] download funciona

## Regras de negócio
- [ ] add-on ativa por workspace
- [ ] owner/admin ativa add-on
- [ ] member/viewer não ativa
- [ ] crédito consome corretamente
- [ ] VIP mantém ilimitado
- [ ] sem saldo = geração bloqueada

---

# 8. Riscos conhecidos

## 1. API externa fora do ar
Impacto:
- jobs ficam falhos
- vídeos não geram

Mitigação:
- monitorar taxa de falha
- registrar erro upstream no `metadata`
- adicionar retry futuro

## 2. Output público quebrado
Impacto:
- vídeo gera, mas não abre/baixa

Mitigação:
- validar bucket público
- validar `getPublicUrl`

## 3. Crédito consumido com falha de render
Impacto:
- cliente perde saldo indevidamente

Mitigação atual:
- release em falhas iniciais
- revisar política de refund para falha downstream

## 4. Crescimento do storage
Impacto:
- custo sobe

Mitigação:
- política futura de retenção/arquivamento
- limpeza de inputs antigos

---

# 9. Pós-deploy imediato

Após publicar, fazer nesta ordem:

1. ativar add-on Starter em um workspace de teste
2. gerar 1 vídeo curto
3. validar storage de input/output
4. validar biblioteca e preview
5. validar consumo de crédito
6. validar bloqueio ao zerar saldo
7. ativar Pro/VIP em workspace de teste adicional

---

# 10. Próximas melhorias recomendadas após deploy

## Prioridade alta
- retry automático de job falho
- thumbnail/poster automático
- progresso assíncrono mais detalhado

## Prioridade média
- limpeza automática de `video-assets` antigos
- analytics de uso por workspace
- histórico de erro operacional

## Prioridade estratégica
- billing real do add-on
- ativação automática pós-pagamento
- upgrade self-service do plano base
