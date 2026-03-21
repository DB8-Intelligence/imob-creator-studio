# Backlog técnico — Gerador visual + copy + módulo de vídeo

## Contexto
Este backlog consolida:
- melhorias do gerador visual e de copy do ImobCreator AI
- evolução do módulo de vídeo como complemento vendável
- aprendizados da análise competitiva contra iMOVIE

---

## FRONTEND

### FE-001 — Wizard de criação de conteúdo
**Objetivo:** substituir fluxos soltos por etapas guiadas.
**Escopo:**
- etapa objetivo
- etapa assets
- etapa template/visual
- etapa briefing/copy
- etapa preview
- etapa aprovação/publicação
**Aceite:** navegação persistida por step, validação por etapa e resumo final.

### FE-002 — Tela de briefing dinâmico por tipo de conteúdo
**Objetivo:** adaptar campos para imóvel, branding, oferta e institucional.
**Escopo:** formulário condicional com schema por tipo.
**Aceite:** campos mudam automaticamente conforme categoria.

### FE-003 — Preview comparativo de variações
**Objetivo:** permitir comparação A/B/C de criativos e copy.
**Escopo:** grid com thumbnail, headline, CTA, template e score.
**Aceite:** usuário consegue aprovar, editar ou regenerar parcialmente.

### FE-004 — Edição rápida de copy
**Objetivo:** editar headline, subtítulo, CTA e preço sem sair do preview.
**Aceite:** salvar alterações por variação e refletir instantaneamente na arte.

### FE-005 — Catálogo de templates por objetivo
**Objetivo:** organizar templates por categoria, nicho e intenção.
**Aceite:** filtros por objetivo, formato, intensidade visual e nicho.

### FE-006 — Gestão de brand kit por cliente
**Objetivo:** permitir logo, paleta, fontes, preset e CTA padrão.
**Aceite:** brand kit salvo e aplicável no gerador.

### FE-007 — Módulo comercial de vídeos na landing page
**Objetivo:** vender vídeos IA como add-on dentro do ImobCreator AI.
**Escopo:**
- seção comparativa vs iMOVIE
- seção de upsell do módulo
- reforço de CTA para vídeo no hero e pricing
**Aceite:** home apresenta módulo de vídeo como nova linha de receita.

### FE-008 — Wizard de geração de vídeo com IA
**Objetivo:** permitir compra/uso de vídeos diretamente no painel.
**Escopo:**
- upload de 6 a 20 fotos
- escolha de estilo
- formato
- duração
- resumo da geração
- download final
**Aceite:** fluxo completo disponível para planos elegíveis.

### FE-009 — Toggle mensal/anual na página de planos
**Objetivo:** aumentar ticket médio e percepção de previsibilidade.
**Aceite:** alternância entre cobrança mensal e anual com badge de desconto.

### FE-010 — Card enterprise diferenciado
**Objetivo:** destacar plano de maior valor para imobiliárias.
**Aceite:** card com benefícios enterprise, CTA “Falar com especialista” e visual premium.

---

## BACKEND

### BE-001 — Schema de briefing estruturado
**Objetivo:** persistir contexto de geração por tipo de conteúdo.
**Aceite:** payload salvo com campos reutilizáveis por campanha.

### BE-002 — Schema de geração textual em blocos
**Objetivo:** salvar headline, subheadline, body, CTA, hashtags e caption curta.
**Aceite:** preview usa blocos independentes em vez de texto único.

### BE-003 — Persistência da análise visual
**Objetivo:** salvar leitura da imagem para influenciar copy e template.
**Aceite:** asset_analysis vinculada ao asset e à geração.

### BE-004 — Recomendação automática de template
**Objetivo:** sugerir template, ângulo e CTA com base em briefing + imagem.
**Aceite:** resposta inclui recommended_template, recommended_angle e confidence_score.

### BE-005 — Motor de variações
**Objetivo:** criar múltiplas saídas com diversidade controlada.
**Aceite:** geração pode retornar 1, 3 ou 5 variações com metadata própria.

### BE-006 — Controle de status da operação
**Objetivo:** rastrear toda a pipeline.
**Estados:** draft, processing, generated, preview_ready, pending_approval, approved, published, failed.
**Aceite:** UI reflete status real e histórico.

### BE-007 — Entidade de brand kit
**Objetivo:** persistir configurações visuais por cliente/workspace.
**Aceite:** logo, cores, fontes e defaults vinculados ao workspace.

### BE-008 — Entidade de plano/add-on de vídeo
**Objetivo:** vender vídeos como pacote complementar.
**Aceite:** usuário tem acesso conforme add-on/plano contratado e consumo registrado.

### BE-009 — Biblioteca de vídeos por imóvel/campanha
**Objetivo:** armazenar outputs de vídeo no mesmo ecossistema.
**Aceite:** vídeos ficam disponíveis em biblioteca, por imóvel e por campanha.

### BE-010 — Logs estruturados de geração
**Objetivo:** facilitar auditoria e melhoria do modelo.
**Aceite:** prompts, template, análise visual, brand kit, tempo e falhas ficam registrados.

---

## IA

### IA-001 — Taxonomia de objetivo de conteúdo
**Objetivo:** condicionar geração visual/textual ao objetivo.
**Valores iniciais:** lead_capture, property_showcase, personal_branding, launch_campaign, authority_content, investment_opportunity, engagement_post.

### IA-002 — Taxonomia de ângulo de copy
**Objetivo:** orientar headline e CTA.
**Valores iniciais:** luxury, desire, urgency, authority, investment, opportunity, educational.

### IA-003 — Prompting por objetivo
**Objetivo:** usar prompts específicos por cenário.
**Aceite:** prompts diferentes para vitrine de imóvel, branding, captação, lançamento, educativo e oportunidade.

### IA-004 — Prompting por ângulo
**Objetivo:** variar mensagem sem cair em texto genérico.
**Aceite:** headline muda conforme ângulo selecionado.

### IA-005 — Gerador de múltiplas headlines e CTAs
**Objetivo:** entregar opções úteis.
**Aceite:** mínimo de 3 headlines, 2 subtítulos e 2 CTAs por geração.

### IA-006 — Análise visual estruturada
**Objetivo:** detectar ambiente, estilo, pontos de luxo e ganchos comerciais.
**Aceite:** output em JSON reutilizável pelo backend/render.

### IA-007 — Validador de copy
**Objetivo:** barrar texto genérico, longo demais ou fraco comercialmente.
**Aceite:** score com alertas de clareza, tamanho e força de CTA.

### IA-008 — Diversidade controlada de variações
**Objetivo:** evitar saídas quase iguais.
**Aceite:** mudanças reais em ângulo, CTA, layout e intensidade visual.

### IA-009 — Sugestão de template por imagem + briefing
**Objetivo:** recomendar layout ideal sem depender só de escolha manual.
**Aceite:** ranking de templates compatíveis com score.

### IA-010 — Motor de vídeo IA para imóveis
**Objetivo:** transformar fotos em vídeos para Reels, Feed e YouTube.
**Parâmetros:** formato, duração, estilo, trilha/opção sonora, resolução.
**Aceite:** vídeo gerado entra na biblioteca do workspace.

---

## BANCO DE DADOS

### DB-001 — Tabela `content_briefs`
Campos principais:
- id
- workspace_id
- content_type
- post_goal
- tone_of_voice
- cta_goal
- brief_payload
- created_at

### DB-002 — Tabela `asset_analyses`
Campos principais:
- id
- asset_id
- analysis_payload
- confidence_score
- recommended_template_id
- recommended_angle
- created_at

### DB-003 — Tabela `copy_generations`
Campos principais:
- id
- brief_id
- angle
- objective
- headline
- subheadline
- body_copy
- cta
- hashtags
- short_caption
- created_at

### DB-004 — Tabela `creative_templates`
Campos principais:
- id
- name
- category
- goal
- target_niche
- visual_intensity
- layout_family
- metadata

### DB-005 — Tabela `creative_variations`
Campos principais:
- id
- generation_id
- template_id
- format
- variation_type
- image_url
- headline_version
- cta_version
- quality_score
- status

### DB-006 — Tabela `brand_kits`
Campos principais:
- id
- workspace_id
- name
- logo_url
- colors
- fonts
- defaults

### DB-007 — Tabela `video_jobs`
Campos principais:
- id
- workspace_id
- property_id
- style
- format
- duration_seconds
- resolution
- status
- credits_used
- output_url
- created_at

### DB-008 — Tabela `video_assets`
Campos principais:
- id
- video_job_id
- asset_id
- position
- created_at

### DB-009 — Tabela `plan_addons`
Campos principais:
- id
- workspace_id
- addon_type
- credits_total
- credits_used
- billing_cycle
- expires_at

### DB-010 — Tabela `generation_logs`
Campos principais:
- id
- workspace_id
- operation_type
- payload
- result_summary
- error_message
- created_at

---

## ROADMAP SUGERIDO

### Sprint 1 — Núcleo do gerador
- FE-001, FE-002, FE-003
- BE-001, BE-002, BE-003, BE-006
- IA-001, IA-003, IA-005, IA-006
- DB-001, DB-002, DB-003, DB-005

### Sprint 2 — Consistência visual + branding
- FE-004, FE-005, FE-006
- BE-004, BE-007
- IA-002, IA-004, IA-007, IA-009
- DB-004, DB-006

### Sprint 3 — Vídeo como complemento vendável
- FE-007, FE-008, FE-009, FE-010
- BE-008, BE-009
- IA-010
- DB-007, DB-008, DB-009

### Sprint 4 — Observabilidade e otimização
- BE-010
- IA-008
- DB-010

---

## Resultado esperado
Ao final, o ImobCreator AI deixa de ser apenas um gerador de posts e passa a operar como:

**plataforma de produção imobiliária com IA**
- criativo
- copy
- aprovação
- biblioteca
- vídeo como add-on
- monetização por plano e créditos
