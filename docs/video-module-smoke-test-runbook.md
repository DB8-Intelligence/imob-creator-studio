# Smoke Test Runbook - Modulo de Video

Guia pratico para validar manualmente o modulo de video em producao.

- Projeto Supabase: `dsszhodrrchlaqfignky`
- Pre-requisito: deploy ja aplicado conforme `docs/video-module-supabase-deploy-checklist.md`
- Duracao estimada da bateria completa: 25-35 min
- Executor: preencher os campos de resultado no fim de cada teste

---

## Setup antes de comecar

### Contas e workspaces necessarios

| Papel | Workspace | Observacao |
|---|---|---|
| Owner A | `smoke-test-starter` | Add-on Starter a ativar |
| Owner B | `smoke-test-pro` | Add-on Pro a ativar |
| Member C | qualquer | Para teste de governanca |

### Material de teste

- 3 a 5 fotos de imovel (JPG/PNG, ~1-3MB cada)
- Navegador com DevTools aberto (aba Network + Console)
- Acesso ao SQL Editor do Supabase para inspecao

### URL base
- Producao: `https://nexoimob.com.br` (ou URL atual de deploy)

---

## Teste 1 - Ativacao do add-on Starter

Objetivo: garantir que o fluxo comercial de ativacao funciona.

### Passos
1. Login como **Owner A**
2. Abrir `/video-plans`
3. Clicar em "Ativar Starter"
4. Confirmar fluxo de ativacao
5. Verificar dashboard em `/video-dashboard`

### Query de verificacao
```sql
select workspace_id, addon_type, billing_cycle, credits_total, credits_used, status
from public.video_plan_addons
where workspace_id = '<ID do smoke-test-starter>';
```

### Resultado esperado
- [ ] Linha existe com `addon_type = 'starter'`
- [ ] `status = 'active'`
- [ ] `credits_used = 0`
- [ ] `credits_total > 0` (valor conforme plano)
- [ ] Dashboard mostra saldo correto

### Resultado obtido
```
Data: ____/____/____    Hora: _______
Status: [ ] PASS  [ ] FAIL
Notas:
```

---

## Teste 2 - Geracao ponta a ponta

Objetivo: validar pipeline completo de criacao de video.

### Passos
1. Ainda como Owner A, abrir `/video-creator`
2. Upload das 3-5 fotos de teste
3. Selecionar: estilo = padrao, formato = 9:16, duracao = 30s
4. Clicar em "Gerar video"
5. Aguardar conclusao (observar Network + status do job)

### Queries de verificacao
```sql
-- estado do job
select id, status, credits_used, output_url, created_at, updated_at
from public.video_jobs
where workspace_id = '<ID>'
order by created_at desc
limit 1;

-- storage inputs
select name, bucket_id, created_at
from storage.objects
where bucket_id = 'video-assets'
order by created_at desc
limit 10;

-- storage outputs
select name, bucket_id, created_at
from storage.objects
where bucket_id = 'video-outputs'
order by created_at desc
limit 5;
```

### Resultado esperado
- [ ] Job transita: `queued` -> `processing` -> `completed`
- [ ] `video_jobs.output_url` preenchido
- [ ] `video_jobs.credits_used = 1`
- [ ] Arquivos de input salvos em `video-assets`
- [ ] Arquivo de output salvo em `video-outputs`
- [ ] Video visivel em `/video-dashboard`
- [ ] Video visivel na aba Videos de `/library`
- [ ] Preview abre e reproduz
- [ ] Download funciona

### Resultado obtido
```
Tempo total de geracao: _______ s
Status: [ ] PASS  [ ] FAIL
Notas:
```

---

## Teste 3 - Consumo e saldo

Objetivo: validar contabilidade de creditos.

### Passos
1. Consultar saldo antes (query abaixo)
2. Gerar mais 1 video curto
3. Consultar saldo depois

### Query
```sql
select credits_total, credits_used, (credits_total - credits_used) as saldo
from public.video_plan_addons
where workspace_id = '<ID>' and status = 'active';
```

### Resultado esperado
- [ ] `credits_used` aumenta em exatamente `+1`
- [ ] Saldo decrementa `-1`
- [ ] Dashboard reflete o novo saldo imediatamente

### Resultado obtido
```
Antes: credits_used = ___    Depois: credits_used = ___
Status: [ ] PASS  [ ] FAIL
```

---

## Teste 4 - Bloqueio por saldo zerado

Objetivo: garantir que trava comercial funciona.

### Setup rapido via SQL (opcional)
Para acelerar, forcar `credits_used = credits_total` no workspace de teste:
```sql
update public.video_plan_addons
set credits_used = credits_total
where workspace_id = '<ID>' and status = 'active';
```

### Passos
1. Tentar gerar novo video em `/video-creator`
2. Observar comportamento da UI e resposta da edge function

### Resultado esperado
- [ ] UI exibe alerta "sem creditos" ou similar
- [ ] Botao de gerar desabilitado OU erro claro ao clicar
- [ ] Nenhum `video_jobs` criado (verificar via query)
- [ ] `credits_used` nao ultrapassa `credits_total`

### Resultado obtido
```
Status: [ ] PASS  [ ] FAIL
Mensagem exibida: ____________________
```

---

## Teste 5 - Governanca (member sem permissao)

Objetivo: validar que so owner/admin ativam add-on.

### Passos
1. Login como **Member C**
2. Abrir workspace `smoke-test-pro` (como member)
3. Abrir `/video-plans`
4. Tentar ativar add-on Pro

### Resultado esperado
- [ ] UI bloqueia ou oculta a acao
- [ ] Se a request chegar ao backend, deve retornar erro de permissao
- [ ] Nenhuma linha nova em `video_plan_addons`

### Resultado obtido
```
Status: [ ] PASS  [ ] FAIL
Comportamento observado: ____________________
```

---

## Resumo da bateria

| Teste | Status | Tempo | Observacoes |
|---|---|---|---|
| 1 - Ativacao Starter | [ ] | | |
| 2 - Geracao E2E | [ ] | | |
| 3 - Consumo de credito | [ ] | | |
| 4 - Bloqueio sem saldo | [ ] | | |
| 5 - Governanca member | [ ] | | |

**Veredicto:** [ ] GO  [ ] NO-GO  [ ] GO com ressalvas

**Executor:** ____________________  **Data:** ____/____/____

---

## Rollback se NO-GO

Se algum teste critico (1, 2 ou 4) falhar:

1. Documentar exatamente o que falhou + logs
2. Verificar `docs/video-module-supabase-deploy-checklist.md` secao "Riscos conhecidos"
3. Se API externa de video falhou: checar `https://api.db8intelligence.com.br/generate-video`
4. Se crédito foi consumido com erro: rodar `release_video_credit` manualmente
5. Se bucket nao responde: validar `video-outputs` esta publico

## Proximos passos pos-smoke

- Se GO: habilitar para primeiros clientes reais
- Se ressalvas: documentar issues em sprint-execution-backlog.md
- Se NO-GO: abrir incidente e reverter deploy se necessario
