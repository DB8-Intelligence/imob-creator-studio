---
name: imobcreator-creative-engine
version: 2.0.0
description: >
  Motor completo de geração de criativos imobiliários do ImobCreator AI.
  Skill mestre que unifica: análise de imagem (Claude Vision), extração de cores,
  processamento de texto/copy, resolução de paleta (marca ou imagem), pipeline
  de composição (Shotstack), geração via Flux Pro (Fal.ai), onboarding de marca,
  biblioteca de templates e engenharia reversa de qualquer criativo concorrente.

  USE SEMPRE para:
  - Implementar ou atualizar o sistema de criativos do ImobCreator
  - Analisar qualquer imagem e gerar output completo (análise + copy + prompts + JSON)
  - Engenharia reversa de criativos concorrentes
  - Criar novos templates para a biblioteca
  - Implementar onboarding de captura de marca
  - Gerar prompts Flux Pro para qualquer estilo visual
---

# ImobCreator Creative Engine — Skill Mestre

## Visão Geral do Sistema

O sistema transforma qualquer imagem de imóvel em um criativo profissional
em 3 formatos (post 4:5, story 9:16, reels 9:16) através de um pipeline
invisível ao usuário com 6 etapas automáticas.

```
Usuário envia imagem + texto
        ↓
[1] Claude Vision analisa imagem
        ↓
[2] Extração de cores + análise composição
        ↓
[3] Processamento de texto → copy completo
        ↓
[4] Resolver cores (marca do usuário OU imagem)
        ↓
[5] Montar JSON Shotstack com variáveis resolvidas
        ↓
[6] Render → Preview para o usuário
```

A imagem original NUNCA é modificada. Ela serve como fundo da composição.
Toda a estilização é feita via overlays, tipografia e elementos sobre ela.

---

## Estrutura de Arquivos desta Skill

```
imobcreator-creative-engine/
├── SKILL.md                          ← este arquivo (leia primeiro)
├── CLAUDE.md                         ← instruções para Claude Code implementar
├── references/
│   ├── pipeline.md                   ← fluxo técnico completo
│   ├── color-resolver.md             ← lógica de resolução de cores
│   ├── copy-processor.md             ← processamento de texto → copy
│   ├── image-analyzer.md             ← prompt unificado de análise
│   ├── flux-prompts.md               ← biblioteca de prompts Flux por estilo
│   └── reverse-engineer.md           ← engenharia reversa de criativos
├── templates/
│   ├── dark_premium.json
│   ├── ia_express.json
│   ├── expert_photoshop.json
│   ├── imobiliario_top.json
│   └── ia_imobiliario.json
├── pipeline/
│   ├── unified-prompt.md             ← prompt Claude único para análise completa
│   ├── shotstack-builder.md          ← como montar o JSON Shotstack
│   └── variable-resolver.md          ← como resolver todas as variáveis
└── onboarding/
    ├── brand-capture.md              ← fluxo de captura de marca no 1º login
    └── logo-color-extractor.md       ← como extrair cores da logomarca
```

---

## Fluxo de Uso desta Skill

### Modo 1 — Análise de imagem + output completo
Quando o usuário enviar qualquer imagem pedindo análise, criativo ou engenharia reversa:
1. Ler `references/image-analyzer.md`
2. Executar análise completa
3. Retornar output estruturado (ver seção OUTPUT PADRÃO abaixo)

### Modo 2 — Implementação no sistema (Claude Code)
Quando usado via Claude Code para implementar o sistema:
1. Ler `CLAUDE.md` primeiro
2. Seguir ordem de implementação definida lá
3. Usar os arquivos de `pipeline/` e `templates/` como fonte de verdade

### Modo 3 — Engenharia reversa de criativo concorrente
Quando o usuário enviar imagem de outro app para replicar:
1. Ler `references/reverse-engineer.md`
2. Executar análise completa
3. Gerar novo template JSON + prompts Flux

### Modo 4 — Criar novo template
Quando precisar adicionar novo estilo à biblioteca:
1. Ler um template existente em `templates/` como referência
2. Ler `references/flux-prompts.md`
3. Gerar JSON completo do novo template

---

## OUTPUT PADRÃO — Para toda imagem analisada

Toda análise de imagem deve produzir SEMPRE este output completo:

```
## Análise Visual
[tipo de imóvel, ambiente, composição, luminosidade]

## Paleta Extraída
[5 cores hex com papel de cada uma]

## Análise de Composição Camada a Camada
Camada 0 — Foto base: [descrição]
Camada 1 — Overlay: [tipo, CSS, intensidade]
Camada 2 — Tipografia: [fontes, pesos, cores, posições]
Camada 3 — Elementos: [badges, linhas, botões]
Camada 4 — Marca: [logo, nome, posição]

## Copy Gerado
titulo_linha1: [texto]
titulo_linha2: [texto]
subtitulo: [texto]
conceito: [tagline]
cta: [texto botão]
badge: [texto urgência]

## JSON do Template Extraído
[JSON completo com todas as variáveis resolvidas]

## Prompts Flux Pro

### Post 4:5 (1080×1350)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Aspect ratio: 3:4 | raw: true
[prompt completo]

### Story 9:16 (1080×1920)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Aspect ratio: 9:16 | raw: true
[prompt completo]

### Reels Cover 9:16 (1080×1920)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Aspect ratio: 9:16 | raw: true
[prompt completo]

## Recipe de Composição Final
[camadas em ordem z-index para Shotstack/Canva/código]
```
