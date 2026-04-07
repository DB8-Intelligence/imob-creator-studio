# Análise Pré-Implementação — ImobCreator Creative Engine

## O que foi analisado

- 9 telas do criadordecriativos.app (concorrente de referência)
- Documento DEV Prompt 1: arquitetura dual (formulário + assistente IA)
- Documento DEV Prompt 2: Agent Registry + Prompt Assimilation
- Stack conhecida: WeWeb (frontend) + Railway (backend) + Supabase + n8n + Evolution API
- Conversas anteriores: skill engine, pipeline, templates, color resolver, onboarding

---

## O que o concorrente tem que VOCÊ NÃO TEM ainda

### Tela home (120922)
- 4 ações primárias: Criar Criativo / Criar Sequência / Criar Thumbnail / Animar Criativo
- Últimas criações visíveis na home com thumbnail + nome do template + data
- Contador de créditos no header
- Nome personalizado "Olá, Douglas!"

### Fluxo Formulário (120112, 120130, 120529)
- Tab "Assistente IA" | Tab "Formulário" no topo
- Stepper 2 etapas: [1 Foto] → [2 Textos]
- Seleção de formato por cards visuais com ícone do formato (quadrado, retrato, vertical, paisagem)
- "Quantos criativos gerar?" com badge "5 variações" no card premium
- "Quantas imagens usar?" 1 / 2 / 3
- Upload com preview da imagem + botão de troca
- Logo salva com posição e opacidade (15% • 100% opacidade)
- Toggle "Usar identidade visual personalizada"
- Grid de templates com filtros por categoria (TOP Temas / Novos / Todos / Imobiliário / Vendas)
- Badges: "Recomendado", "Novo", "Popular" nos cards de template
- CTA "Avançar para o texto" no rodapé fixo

### Tela de Texto (120641)
- Campo "O que você está vendendo?" com botão "Deixar a IA escrever"
- Fallback manual: Título principal, outros campos
- Indicador "IA" no label do campo

### Tela de processamento (120418)
- Overlay completo escurecido
- Ícone animado de preview do criativo sendo gerado
- Steps com ícones circulares (check verde = concluído, spinner = em progresso)
- Step atual: "Otimizando — Ajustes para máxima conversão"
- Barra de progresso numérica (73% | -7s)
- Dica rotativa: "Teste diferentes variações para melhores resultados"

---

## Riscos e problemas nos prompts DEV como estão

### Prompt 1 — Risco alto: WeWeb não é React
Os prompts DEV usam linguagem de componentes React/Next.js.
O frontend é WeWeb (no-code visual). Componentes precisam ser:
- Criados como WeWeb custom components (Vue 3 compilado)
- Ou como páginas WeWeb com lógica em workflow/actions
- A state machine do assistente precisa ser implementada via WeWeb workflows + variáveis globais,
  não como hooks React

**Correção necessária:** separar claramente o que vai no WeWeb vs o que vai no backend Railway.

### Prompt 1 — Risco médio: endpoint único compartilhado
O prompt propõe POST /creative-jobs/create para ambos os modos.
Isso é correto em design, mas falta definir como o WeWeb vai chamar esse endpoint
(WeWeb usa fetch nativo em custom actions, não axios direto).

### Prompt 2 — Risco alto: complexidade prematura
O Agent Registry com assimilação automática de prompt é poderoso mas introduz
muita complexidade antes do MVP estar rodando.
Recomendação: implementar como módulo separado DEPOIS que o Prompt 1 estiver funcionando.
Os agentes devem primeiro ser hardcoded como serviços TypeScript, depois migrar para registry dinâmico.

### Prompt 3 (Motor de Templates) — Risco baixo
O classificador input_analyzer() é viável e bem especificado.
O único risco é o over-engineering das regras — começar com 5-8 regras simples,
não tentar cobrir todos os cenários de uma vez.

### Problema de sequência
Os 3 prompts foram escritos como se fossem independentes mas têm dependências:
Prompt 1 depende do schema de Prompt 2 (tabela jobs)
Prompt 3 (templates) depende dos agentes de Prompt 2

**Ordem correta de implementação:**
1. Schema do banco (foundation)
2. Pipeline backend + agentes hardcoded
3. Frontend formulário
4. Frontend assistente IA
5. Motor de templates automático
6. Agent Registry dinâmico (último)

---

## Stack mapeada para cada camada

```
FRONTEND (WeWeb):
  - Páginas: Home, Criar Criativo, Minhas Criações, Admin Agentes
  - Custom Components: TemplateCard, FormatSelector, ProgressOverlay, ChatAssistant
  - Workflows WeWeb: chamadas para Railway API, upload para Supabase Storage
  - Variáveis globais WeWeb: user_profile, current_job, selected_template

BACKEND (Railway — Node.js/Fastify):
  - Routes: /creative-jobs, /templates, /agents, /onboarding, /webhooks
  - Services: image-analyzer, copy-processor, color-resolver, template-decision
  - Queue: Bull/BullMQ para jobs assíncronos
  - Webhooks: Shotstack callback, Fal.ai callback

DATABASE (Supabase):
  - Tables: user_brand_profiles, creative_templates, creative_jobs,
            generated_creatives, agent_registry, agent_versions,
            agent_bindings, agent_execution_logs
  - Storage: imagens do usuário, logos, criativos gerados
  - Realtime: status do job para o frontend (polling ou subscription)

IA (Anthropic API — via Railway):
  - claude-sonnet-4-6: análise de imagem + copy (vision)
  - claude-haiku-4-5: tarefas simples de copy em volume

RENDER (Shotstack):
  - POST /render com timeline JSON
  - Webhook callback quando concluído

GERAÇÃO DE IMAGEM (Fal.ai):
  - flux-pro/v1.1-ultra: criativos finais
  - flux/schnell: preview rápido
  - flux-pro/kontext: edição de foto real
```
