# Auditoria do módulo de vídeo — checklist, aderência à skill e backlog até 90s

## Objetivo
Consolidar a validação do módulo de vídeo do ImobCreatorAI com base em:
- implementação atual no repositório
- skill específica do módulo de vídeo
- requisitos estratégicos derivados de benchmarks como iMOVIE

Este documento cobre:
1. checklist de validação
2. comparação implementação real vs. skill
3. backlog técnico para evolução até 90 segundos

---

# 1. Checklist de validação do módulo de vídeo

## A. UX e produto
- [ ] usuário entende o fluxo em 3 passos
- [ ] dashboard de vídeo mostra saldo, vídeos gerados, status e CTA de criação
- [ ] criador de vídeo explica mínimo recomendado e máximo suportado de fotos
- [ ] formatos disponíveis estão claros
- [ ] duração disponível está clara
- [ ] preview/download aparecem sem fricção
- [ ] biblioteca de vídeos está clara e utilizável
- [ ] pricing mostra limites e benefícios com clareza

## B. Input e regras de mídia
- [ ] upload aceita imagens corretamente
- [ ] limite máximo de 20 fotos está respeitado
- [ ] mínimo recomendado de 6 fotos está comunicado
- [ ] sistema lida bem com menos de 6 fotos
- [ ] nomes/ordem das fotos são preservados no job
- [ ] formatos de saída estão claros: reels / feed / youtube

## C. Jobs e processamento
- [ ] job nasce como `queued`
- [ ] vai para `processing`
- [ ] termina em `completed` ou `failed`
- [ ] `output_url` é persistido
- [ ] `metadata` salva dados úteis
- [ ] falhas ficam registradas
- [ ] n8n recebe eventos reais de sucesso/falha

## D. Storage
- [ ] inputs sobem em `video-assets`
- [ ] output sobe em `video-outputs`
- [ ] URL pública do vídeo funciona
- [ ] preview no player funciona
- [ ] download funciona

## E. Monetização
- [ ] add-on ativo é carregado corretamente
- [ ] consumo de crédito funciona
- [ ] bloqueio por falta de saldo funciona
- [ ] VIP / ilimitado funciona
- [ ] pricing está coerente com a regra real de acesso

## F. Operação
- [ ] biblioteca mostra vídeos reais do workspace
- [ ] dashboard reflete uso real
- [ ] erros de render não travam o fluxo
- [ ] retry/recuperação está pelo menos mapeado
- [ ] eventos de onboarding/add-on são disparados

## G. Aderência ao posicionamento
- [ ] módulo parece simples para não-editores
- [ ] fluxo está dashboard-first
- [ ] módulo é percebido como premium
- [ ] mensagem comercial reforça produtividade, qualidade e escala

---

# 2. Comparação: implementação real vs. skill

## O que está bem alinhado

### Base técnica e produto
- dashboard-first
- upload via dashboard
- pricing/add-on separado
- `video_jobs`
- `video_plan_addons`
- biblioteca com preview/download
- edge function de render
- eventos para n8n
- gating por workspace/plano
- storage de input/output
- UX relativamente simples para usuário comum

### Base operacional
- biblioteca funcional
- preview/download implementados
- dispatch automático para n8n
- consumo de crédito implementado
- ativação de add-on implementada

## O que está parcialmente alinhado
- mensagem comercial do módulo
- clareza do mínimo 6 / máximo 20
- narrativa omnichannel mais forte
- 4K como ativo de marca e não só detalhe técnico
- onboarding específico do vídeo
- argumento de ROI e produtividade no UI do módulo

## Gaps identificados

### GAP-01 — suporte a 90 segundos ainda ausente
Estado atual observado:
- 15s
- 30s
- 60s

### GAP-02 — nomenclatura de planos desalinhada
No backend/add-on real a lógica se aproxima de:
- starter
- pro
- enterprise

Na UI de pricing atual aparecem:
- standard
- plus
- premium

### GAP-03 — matriz comercial ainda inconsistente
Há sinais de conflito entre:
- número de fotos por plano
- resolução por plano
- naming comercial
- regras reais do add-on

### GAP-04 — 4K ainda mais discursivo que contratual
É necessário tornar explícito:
- quem recebe 4K
- em qual plano
- qual fallback existe
- se duração/foto impactam a entrega

### GAP-05 — duração ainda não conectada à lógica comercial
Duração existe, mas ainda não está claramente associada a:
- plano
- resolução
- créditos
- regras de render

### GAP-06 — falta reforço de ROI e produtividade no produto
A skill do módulo de vídeo já carrega isso, mas a UI ainda pode vender melhor:
- economia de tempo
- escala operacional
- aumento de frequência de publicação
- menor dependência de edição manual

### GAP-07 — backlog conversion ainda não virou recurso
A skill recomenda transformar acervos de fotos em vídeos rapidamente, mas o produto ainda não tem:
- fluxo em lote
- CTA de conversão de acervo
- fila de produção de múltiplos imóveis

---

# 3. Veredito da auditoria

## Situação atual
- base técnica: boa
- base comercial/estratégica: média
- aderência total à skill: parcial, mas com direção correta

## Conclusão
O módulo já é:
- funcional
- vendável
- tecnicamente promissor

Mas ainda não está completamente alinhado à visão final da skill, especialmente em:
- naming comercial
- suporte a 90 segundos
- coerência entre plano, duração, resolução e fotos
- narrativa de ROI e produtividade
- UX de escala e backlog conversion

---

# 4. Regra oficial de duração automática

## Princípio do módulo
A duração do vídeo não deve ser tratada como uma escolha arbitrária do usuário.

Regra oficial:
- cada imagem válida para montagem gera 5 segundos de vídeo
- a duração final é calculada automaticamente
- o teto final respeita o plano ativo

## Fórmula
`duração final = segmentos renderizados x 5 segundos`

## Regras oficiais por plano

### Standard
- até 10 imagens enviadas
- até 10 segmentos renderizados
- até 50s finais
- 720p
- 300 créditos por mês
- 100 créditos por vídeo

### Plus
- até 15 imagens enviadas
- até 15 segmentos renderizados
- até 75s finais
- 1080p Full HD
- 600 créditos por mês
- 100 créditos por vídeo

### Premium
- até 20 imagens enviadas
- até 18 segmentos renderizados
- até 90s finais
- 4K Ultra HD
- 800 créditos por mês
- 200 créditos por vídeo

## Regra especial do Premium
O usuário pode enviar até 20 imagens.
Para manter o teto final de 90 segundos, a montagem final utiliza até 18 segmentos de 5 segundos.

Isso implica:
- 19 ou 20 imagens podem ser aceitas no upload
- mas o sistema pode otimizar automaticamente a seleção usada na montagem final
- essa otimização deve ser registrada em metadata

## Estado atual da implementação
A lógica automática já começou a ser aplicada em:
- `src/lib/video-plan-rules.ts`
- `src/pages/VideoCreatorPage.tsx`
- `src/pages/VideosDashboardPage.tsx`
- `src/services/videoModuleApi.ts`
- `supabase/functions/generate-video/index.ts`
- `public.video_job_segments`

## Nova base segmentada
A arquitetura agora já possui uma base formal para segmentação:

### `video_job_segments`
Cada registro representa um segmento potencial da montagem final.

Campos principais:
- `video_job_id`
- `workspace_id`
- `sequence_index`
- `source_image_path`
- `source_image_name`
- `clip_duration_seconds`
- `status`
- `output_clip_url`
- `provider`
- `provider_job_id`
- `metadata`

Objetivo:
- modelar 1 imagem -> 1 segmento
- preparar o pipeline real de microclipes
- permitir rastreamento fino de status por imagem/clip

## O que já foi estruturado nessa evolução
- modelagem formal de segmentos com `video_job_segments`
- criação inicial dos segmentos ao abrir um `video_job`
- atualização de status dos segmentos em lote durante a renderização (`processing`, `completed`, `failed`)
- base para evoluir o modelo 1 imagem -> 1 clipe -> 1 vídeo final

## O que ainda falta para fechar o modelo completamente
- pipeline explícito de microclipes por imagem
- atualização de status individual dos segmentos durante a renderização
- compositor final com concatenação/branding/trilha
- persistência de `output_clip_url` real por segmento
- atualização completa do pricing e mensagens comerciais quando necessário

# 5. Backlog técnico do vídeo até 90 segundos

## EPIC V90-1 — Expansão de duração

### VID-001 — Adicionar suporte a 90 segundos no frontend
**Prioridade:** alta  
**Objetivo:** incluir 90s como opção oficial no criador.
**Implementar:**
- opção `90s` no `VideoCreatorPage`
- textos de uso ideal por duração
- validação visual no resumo do job

### VID-002 — Atualizar tipos e contratos de duração
**Prioridade:** alta  
**Objetivo:** refletir 90s em toda a camada de tipos e payloads.
**Implementar:**
- type `Duration` incluir `90`
- atualizar contratos do frontend
- revisar payload da edge function
- revisar persistência no job

### VID-003 — Validar pipeline externo para 90 segundos
**Prioridade:** alta  
**Objetivo:** garantir suporte real do motor externo.
**Implementar:**
- confirmar que `api.db8intelligence.com.br/generate-video` suporta 90s
- documentar limite real
- criar fallback de erro claro

---

## EPIC V90-2 — Coerência comercial e de produto

### VID-004 — Unificar nomenclatura dos planos
**Prioridade:** alta  
**Objetivo:** eliminar conflito entre UI e backend.
**Implementar:**
- padronizar naming entre pricing, add-ons e regras reais
- escolher uma convenção única

### VID-005 — Definir matriz oficial de plano x duração x fotos x resolução
**Prioridade:** alta  
**Objetivo:** tornar o produto comercialmente consistente.
**Exemplo de matriz:**
- Starter → até 30s / até 10 fotos / HD
- Pro → até 60s / até 20 fotos / Full HD
- Enterprise → até 90s / até 20 fotos / 4K

### VID-006 — Exibir limites reais por plano no criador
**Prioridade:** alta  
**Objetivo:** impedir frustração e tornar upgrade mais claro.
**Implementar:**
- bloquear opções indisponíveis
- tooltip / helper text com CTA de upgrade

---

## EPIC V90-3 — Regras de input e narrativa

### VID-007 — Exibir recomendação forte de 6–20 fotos
**Prioridade:** média/alta  
**Objetivo:** melhorar qualidade de input.
**Implementar:**
- helper text no upload
- alerta para `< 6`
- feedback de boa faixa de fotos

### VID-008 — Melhorar feedback de qualidade do input
**Prioridade:** média  
**Objetivo:** orientar o usuário antes da renderização.
**Implementar:**
- mensagens de narrativa insuficiente
- score simples de qualidade de input
- recomendação de melhor uso

---

## EPIC V90-4 — UX premium do módulo

### VID-009 — Melhorar copy comercial do dashboard de vídeo
**Prioridade:** média  
**Objetivo:** vender produtividade, velocidade e escala.
**Implementar:**
- textos de economia de tempo
- textos de escala semanal
- textos de presença multicanal

### VID-010 — Exibir formatos com propósito comercial
**Prioridade:** média  
**Objetivo:** ligar formato à estratégia de distribuição.
**Implementar:**
- Reels → descoberta
- Feed → portfólio
- YouTube → apresentação / SEO
- 90s → apresentação estendida / premium

### VID-011 — Adicionar onboarding do módulo de vídeo
**Prioridade:** média  
**Objetivo:** reduzir atrito e melhorar ativação.
**Implementar:**
- primeiro vídeo em 3 passos
- orientação para escolha de fotos
- recomendação de duração por objetivo

---

## EPIC V90-5 — Escala operacional

### VID-012 — Criar modo “gerar vídeos em lote”
**Prioridade:** estratégica  
**Objetivo:** permitir escala real por inventário.
**Implementar:**
- múltiplos imóveis
- múltiplos jobs
- fila de render

### VID-013 — Criar lógica de backlog conversion
**Prioridade:** estratégica  
**Objetivo:** transformar acervo em linha de produção.
**Implementar:**
- CTA “converter acervo em vídeos”
- fluxo em série a partir da biblioteca de fotos

### VID-014 — Melhorar observabilidade do pipeline
**Prioridade:** média  
**Objetivo:** dar mais controle operacional.
**Implementar:**
- motivo de falha
- tempo real / estimado de processamento
- status mais detalhado
- logs por job

---

# 5. Ordem recomendada de execução

## Sprint A — Coerência e base
- VID-001
- VID-002
- VID-004
- VID-005
- VID-006

## Sprint B — Input e UX
- VID-007
- VID-008
- VID-009
- VID-010
- VID-011

## Sprint C — Escala e robustez
- VID-003
- VID-012
- VID-013
- VID-014

---

# 6. Recomendação final

Antes de investir pesado em 90 segundos, priorizar nesta ordem:
1. alinhar naming e matriz comercial
2. confirmar contrato técnico da API externa
3. adicionar 90s ponta a ponta
4. ajustar copy e UX do módulo
5. depois evoluir para lote / backlog conversion
