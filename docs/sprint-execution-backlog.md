# Backlog de Execucao por Sprint

Status: pronto para planejamento e criacao de issues
Data: 2026-04-12

## Status de Execucao

- Concluido: SP1-001 - Congelar naming oficial da marca (Fases A, B e C aplicadas; rollout NexoImob AI / ImobCreator AI Studio / DB8 Intelligence documentado em docs/brand-naming-decision.md)
- Concluido: SP1-002 - Unificar nomenclatura de planos de video
- Concluido: SP2-001 - Hub pos-login por intencao
- Concluido: SP2-002 - Expor modulo de video no dashboard inicial
- Concluido: SP2-003 - Onboarding progressivo orientado a valor
- Concluido: SP2-004 - Instrumentacao de eventos de ativacao (eventos em auth, onboarding e modulo de video)
- Concluido: SP2-005 - Medicao de time-to-first-value
- Concluido: SP3-001 - Wizard unico de criacao
- Concluido: SP3-002 - Briefing dinamico por tipo de conteudo
- Concluido: SP3-005 - Fechar TODOs criticos de copy e persistencia
- Pendente: SP1-004 - Preencher 13 links de checkout Kiwify (bloqueado por NEG)
- Pendente: SP3-003 - Preview comparativo A/B/C (proximo item tecnico de maior esforco)
- Pendente: SP3-004 - Edicao inline de copy
- Pendente: SP4-001 a SP4-004 - Video hardening e operacao

## Entregas complementares (fora do backlog original)

Aplicadas entre 2026-04-10 e 2026-04-12:

- 5 novos temas de site (nestland, nexthm, ortiz, quarter, rethouse) - total de 10 temas disponiveis
- Dashboard dark de modelos de site (adaptado do intermetrix) em src/pages/dashboard/site/DashboardSitePage.tsx
- Upload real de imoveis no Supabase (properties + property_media + storage property-media)
- WhatsApp bulk notify via n8n bridge (PropertyLeadsTab) - removido alert placeholder
- Agent Chat integrado com Edge Function supabase.functions.invoke('agent-chat') com fallback mock
- Build unblocked: fix critico em eventTracker.ts (semicolon prematuro na union type)
- Code splitting agressivo: index.js 2.4MB->1.6MB (-32%), BookApresentacaoPage 1.5MB->24KB (-98%)
- Kiwify checkout fallback para WhatsApp quando link ainda nao configurado
- Cleanup de badges "Em breve" em modulos ja implementados (Header, Index, PrecosPage, LPs)

## Convencoes

- Estimativa: P (ate 1 dia), M (2 a 3 dias), G (4 a 6 dias)
- Prioridade: P0 (critico), P1 (alto), P2 (medio)
- Dependencias:
  - NEG = decisao de negocio/comercial
  - BE = backend/infra
  - FE = frontend
  - DATA = analytics/eventos

## Sprint 1 - Base Comercial e Posicionamento

Objetivo: eliminar inconsistencias de marca, planos e checkout para destravar conversao.

### SP1-001 - Congelar naming oficial da marca

- Prioridade: P0
- Estimativa: M
- Dependencias: NEG
- Escopo:
  - Definir nome oficial para produto e marca de comunicacao.
  - Aplicar nome oficial em landing, app shell, pricing, README e metadados.
- Aceite:
  - Zero divergencia de naming nas paginas criticas.
  - Documento de brand naming publicado em docs.

### SP1-002 - Unificar nomenclatura de planos de video

- Prioridade: P0
- Estimativa: M
- Dependencias: NEG, FE, BE
- Escopo:
  - Padronizar planos entre landing de video, pagina de pricing e regras de negocio.
  - Garantir que labels comerciais e tiers tecnicos se correspondam 1:1.
- Aceite:
  - Mesmo nome de plano em UI, regras e webhooks.
  - Sem aliases ambiguos no funil de compra.

### SP1-003 - Fechar matriz comercial oficial por plano

- Prioridade: P0
- Estimativa: M
- Dependencias: NEG
- Escopo:
  - Consolidar preco, faturamento, creditos, limite de fotos, duracao e resolucao por plano.
- Aceite:
  - Matriz unica aprovada por negocio e produto.
  - Todas as telas de pricing refletem a mesma matriz.

### SP1-004 - Preencher links de checkout pendentes

- Prioridade: P0
- Estimativa: P
- Dependencias: NEG
- Escopo:
  - Substituir links TODO por links validos de checkout para assinatura, creditos e video.
- Aceite:
  - 100% dos CTAs de compra com destino valido.
  - Sem ocorrencias de TODO nos arquivos de links comerciais.

### SP1-005 - Auditoria de consistencia comercial no front

- Prioridade: P1
- Estimativa: P
- Dependencias: FE
- Escopo:
  - Revisao final de landing, header, CTA final e paginas de planos.
- Aceite:
  - Navegacao comercial sem contradicoes de promessa/oferta.

## Sprint 2 - Ativacao e Onboarding

Objetivo: reduzir time-to-first-value e aumentar descoberta dos fluxos principais.

### SP2-001 - Hub pos-login por intencao

- Prioridade: P0
- Estimativa: G
- Dependencias: FE
- Escopo:
  - Primeira tela pos-login com 4 caminhos: post, anuncio, video, pacote completo.
- Aceite:
  - Usuario novo escolhe um objetivo em ate 1 clique apos login.

### SP2-002 - Expor modulo de video no dashboard inicial

- Prioridade: P0
- Estimativa: P
- Dependencias: FE
- Escopo:
  - Tornar o acesso a video visivel na secao principal de acoes.
- Aceite:
  - Card/acao de video visivel para planos elegiveis.
  - Estado de bloqueio/upsell claro para nao elegiveis.

### SP2-003 - Onboarding progressivo orientado a valor

- Prioridade: P1
- Estimativa: M
- Dependencias: FE, DATA
- Escopo:
  - Ajustar wizard/checklist para priorizar primeiro output antes de recursos avancados.
- Aceite:
  - Fluxo recomendado leva ao primeiro output sem friccao tecnica.

### SP2-004 - Instrumentacao de eventos de ativacao

- Prioridade: P0
- Estimativa: M
- Dependencias: DATA, BE
- Escopo:
  - Garantir eventos minimos: signup, first_login, first_generation_started, first_generation_completed, brand_kit_configured, video_module_viewed, video_addon_activated.
- Aceite:
  - Eventos observaveis por usuario/workspace.
  - Dashboard de funil com dados completos.

### SP2-005 - Medicao de time-to-first-value

- Prioridade: P1
- Estimativa: P
- Dependencias: DATA
- Escopo:
  - Exibir e monitorar diferenca entre criacao de conta e primeiro output util.
- Aceite:
  - KPI acessivel para acompanhamento semanal.

## Sprint 3 - Nucleo de Criacao Unificado

Objetivo: consolidar criativo + copy + variacoes em fluxo unico.

### SP3-001 - Wizard unico de criacao

- Prioridade: P0
- Estimativa: G
- Dependencias: FE
- Escopo:
  - Etapas: objetivo, assets, template, briefing, preview, aprovacao/publicacao.
- Aceite:
  - Navegacao por etapas persistida e validacao por step.

### SP3-002 - Briefing dinamico por tipo de conteudo

- Prioridade: P1
- Estimativa: M
- Dependencias: FE, BE
- Escopo:
  - Campos condicionais por contexto imobiliario.
- Aceite:
  - Formulario muda automaticamente conforme categoria.

### SP3-003 - Preview comparativo A/B/C com acao rapida

- Prioridade: P1
- Estimativa: G
- Dependencias: FE, BE
- Escopo:
  - Comparacao de variacoes com aprovacao, edicao e regeneracao parcial.
- Aceite:
  - Usuario compara e aprova sem sair da tela.

### SP3-004 - Edicao inline de copy

- Prioridade: P1
- Estimativa: M
- Dependencias: FE
- Escopo:
  - Editar headline, subtitulo, CTA e preco no preview.
- Aceite:
  - Atualizacao imediata no rendering da variacao.

### SP3-005 - Fechar TODOs criticos de copy e persistencia

- Prioridade: P0
- Estimativa: M
- Dependencias: FE, BE
- Escopo:
  - Resolver pendencias no fluxo de legenda/hashtags e integracao de caption.
- Aceite:
  - Nao existem TODOs no caminho critico de geracao e salvamento de copy.

## Sprint 4 - Video Hardening e Operacao

Objetivo: garantir confiabilidade operacional do pipeline de video em escala.

### SP4-001 - Validacao E2E do pipeline v2

- Prioridade: P0
- Estimativa: G
- Dependencias: BE, infra externa
- Escopo:
  - Teste completo com upload, dispatch, callback, persistencia e consumo na galeria.
- Aceite:
  - Taxa de conclusao estavel em ambiente real.

### SP4-002 - Observabilidade de jobs e callbacks

- Prioridade: P1
- Estimativa: M
- Dependencias: DATA, BE
- Escopo:
  - Logs estruturados, status de job, erro tipado e trilha de execucao.
- Aceite:
  - Erro de producao rastreavel fim a fim.

### SP4-003 - Politica de fallback e retry operacional

- Prioridade: P1
- Estimativa: M
- Dependencias: BE
- Escopo:
  - Formalizar comportamento quando backend principal falha e quando fallback falha.
- Aceite:
  - Runbook de contingencia publicado.

### SP4-004 - Fechar TODOs de integracao operacional

- Prioridade: P1
- Estimativa: M
- Dependencias: FE, BE
- Escopo:
  - Completar pendencias de webhook de WhatsApp em lote e user_id via auth no servidor.
- Aceite:
  - Fluxos operacionais sem TODO no caminho principal.

## Ordem Exata de Execucao (sequenciamento)

1. SP1-003
2. SP1-002
3. SP1-001
4. SP1-004
5. SP1-005
6. SP2-004
7. SP2-001
8. SP2-002
9. SP2-003
10. SP2-005
11. SP3-001
12. SP3-002
13. SP3-003
14. SP3-004
15. SP3-005
16. SP4-001
17. SP4-002
18. SP4-003
19. SP4-004

## Quadro de Dependencias Criticas

- SP1-003 desbloqueia SP1-002 e SP1-004
- SP2-004 desbloqueia medicao real de SP2-005
- SP3-001 desbloqueia SP3-002, SP3-003 e SP3-004
- SP4-001 depende da disponibilidade dos servicos externos de render

## Definicao de Pronto (DoD) por sprint

- Sprint 1:
  - Sem conflito de marca/plano no front e no backend.
  - Checkout completo e funcional.

- Sprint 2:
  - Novo usuario chega ao primeiro valor com fluxo guiado.
  - Eventos de ativacao disponiveis para analise.

- Sprint 3:
  - Criacao unificada com preview comparativo e edicao de copy.
  - Persistencia consistente no resultado final.

- Sprint 4:
  - Pipeline de video com operacao monitorada e runbook.
  - Integracoes operacionais sem pendencias criticas.

## KPI alvo por sprint

- Sprint 1: aumento de conversao para cadastro e compra.
- Sprint 2: reducao de time-to-first-value.
- Sprint 3: aumento de conclusao do fluxo de criacao.
- Sprint 4: aumento de taxa de sucesso de video e reducao de falhas sem diagnostico.
