# Decisao de Naming - Marca e Produto

Status: aprovado e em rollout
Data: 2026-04-12
Owner: Produto + Marketing + Engenharia

## Contexto

O repositorio possui uso misto de tres labels:
- NexoImob AI
- ImobCreator AI
- DB8 Intelligence

Essa variacao aparece em landing, app, pricing, utilitarios de share/watermark, SEO e conteudos de campanha.

## Inventario (amostragem validada)

- NexoImob AI:
  - index e metadata: index.html
  - componentes de shell e footer: src/components/app/AppLayout.tsx, src/components/Footer.tsx
  - paginas publicas: src/pages/Index.tsx, src/pages/SobrePage.tsx

- ImobCreator AI:
  - docs e especificacao de produto: docs/PRD-ImobCreator.md
  - comentarios/headers tecnicos: src/lib/ai-engines.ts, src/lib/generation-contract.ts

- DB8 Intelligence:
  - pagina de pricing de video: src/pages/VideosPricingPage.tsx
  - copies de campanha e growth: src/lib/adCampaigns.ts, src/lib/businessMetrics.ts
  - marca em share/watermark: src/lib/shareUtils.ts, src/lib/watermarkUtils.ts

## Proposta de padrao

- Marca externa (site/app/SEO): NexoImob AI
- Nome do produto/plataforma (interno + docs): ImobCreator AI Studio
- Marca corporativa (juridico/comercial): DB8 Intelligence

## Regras de uso

1. Interface publica (header, hero, footer, meta tags): usar NexoImob AI.
2. Documentacao tecnica e naming de modulo interno: usar ImobCreator AI Studio.
3. Termos legais, faturamento e razao social: usar DB8 Intelligence.
4. Materiais de campanha devem escolher uma marca primaria por pagina (sem mistura no mesmo bloco).

## Plano de rollout tecnico

1. Sprint 1 - Fase A (copy critica)
- Alinhar landing, pricing, CTA e checkout com uma marca primaria por pagina.
- Remover mistura de labels na mesma tela.

2. Sprint 1 - Fase B (suporte)
- Padronizar watermark/share para seguir a marca primaria da experiencia.
- Ajustar textos de campanha que usam marca diferente da pagina alvo.

3. Sprint 1 - Fase C (docs)
- Atualizar README e docs de produto para refletir a hierarquia de naming.

## Checklist de aceite SP1-001

- Zero divergencia de naming nas paginas criticas: home, auth, pricing, video pricing.
- SEO title/description e footer alinhados com a marca externa.
- Textos legais mantem DB8 Intelligence para conformidade juridica.
- Documento aprovado por Produto e Marketing.

## Decisao final

- Marca externa oficial: **NexoImob AI** (aprovado)
- Produto/plataforma interna: **ImobCreator AI Studio**
- Razao social/juridico/billing: **DB8 Intelligence**

## Execucao do rollout (2026-04-12)

Fase A - Copy critica (concluida):

- Header (src/components/Header.tsx) - ja usa NexoImob AI
- Landing (src/pages/Index.tsx) - ja usa NexoImob AI
- Pricing page (src/pages/PrecosPage.tsx) - sem marca conflitante
- Video pricing - sem marca conflitante

Fase B - Suporte (concluida):

- shareUtils.ts - ja usa "Criado com NexoImob AI" na caption
- watermarkUtils.ts - ja usa "Criado com NexoImob AI" como DEFAULT_TEXT
- adCampaigns.ts - 4 displayPaths de campanha Google migrados de
  `db8intelligence.com.br/*` para `nexoimob.com.br/*`
- TermsPage.tsx header corrigido de "DB8 Intelligence AI" para "NexoImob AI"

Fase C - Legal (mantido DB8 Intelligence):

- TermsPage.tsx corpo do documento (emails, razao social)
- Settings.tsx secao LGPD (contato juridico)
- Estes locais sao contexto juridico e devem manter DB8 Intelligence
