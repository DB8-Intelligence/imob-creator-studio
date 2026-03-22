---
name: imob-reverse-prompt
description: Analisa pares de imagens imobiliárias (antes/depois) para reconstruir o prompt provável usado por um site concorrente, gerar negative prompt, CTA e prompt final otimizado para o iMobCreatorAI. Ativa quando o usuário mencionar "reverse prompt", "prompt reverso", "análise antes/depois", "concorrente imobiliário", "Reverse Prompt Lab" ou "iMobCreatorAI".
---

# iMobCreatorAI — Reverse Prompt Lab Skill

## Quando usar esta skill

- Usuário quer descobrir o prompt de um concorrente a partir de duas imagens (antes/depois)
- Usuário quer analisar transformações visuais em imagens de imóveis
- Usuário menciona "reverse prompt", "prompt reverso", "Reverse Prompt Lab"
- Usuário quer gerar um prompt otimizado a partir de uma imagem de referência

## Fluxo de execução

1. **Coletar inputs** do usuário:
   - Imagem inicial (antes da transformação)
   - Imagem final (gerada pelo concorrente)
   - Texto original digitado no site concorrente (opcional)
   - Texto gerado/convertido pela IA do concorrente (opcional)
   - Opção/estilo selecionado (ex: cinematic, luxury, realistic)
   - Nome do modelo informado (ex: SDXL, Flux, Midjourney, DALL·E)

2. **Analisar com Claude Vision** (API multimodal):
   - Comparar diferenças visuais entre antes e depois
   - Identificar: estilo dominante, família do modelo, transformações

3. **Gerar outputs obrigatórios**:
   - `style` — estilo visual inferido (ex: cinematic luxury, warm realistic)
   - `model_family` — família do modelo provável (ex: Stable Diffusion XL, Midjourney v6)
   - `confidence` — alta | média | baixa
   - `visual_changes` — lista de transformações detectadas
   - `analysis_summary` — análise detalhada antes/depois em português
   - `probable_prompt` — prompt que o concorrente provavelmente usou (em inglês)
   - `negative_prompt` — negative prompt recomendado (em inglês)
   - `cta` — CTA sugerido para o iMobCreatorAI (em português)
   - `final_prompt` — prompt final consolidado e otimizado para o iMobCreatorAI (em inglês)

## System prompt para a API Claude

```
Você é o motor de análise e geração de prompts reversos do iMobCreatorAI.

Recebe:
- imagem inicial (antes da transformação)
- imagem final gerada por uma IA concorrente
- contexto textual fornecido pelo usuário

Sua missão:
1. Analisar as diferenças visuais entre antes e depois
2. Inferir o prompt que o site concorrente provavelmente usou
3. Gerar todos os outputs necessários para o iMobCreatorAI

Responda APENAS em JSON válido, sem markdown, sem texto fora do JSON:
{
  "style": "string",
  "model_family": "string",
  "confidence": "alta|média|baixa",
  "visual_changes": ["change1", "change2"],
  "analysis_summary": "string",
  "probable_prompt": "string",
  "negative_prompt": "string",
  "cta": "string",
  "final_prompt": "string"
}
```

## Tabela de estilos imobiliários

| Palavra-chave detectada | Estilo inferido | Modelo provável |
|---|---|---|
| cinematic, dramatic | cinematic luxury | Midjourney v6 / SDXL |
| warm, golden hour | warm realistic | Stable Diffusion + LoRA |
| anime, illustrated | illustrated editorial | Niji Journey |
| 3D, render, CGI | architectural render | ComfyUI + ControlNet |
| clean, minimal | modern minimalist | DALL·E 3 / Flux |
| vintage, film | vintage editorial | SD 1.5 + filter |

## Limitações importantes

- Não é possível recuperar prompts ocultos no backend do concorrente
- Se a IA usou LoRA, embeddings ou inpainting complexo, o prompt é uma aproximação
- seed, steps, cfg e sampler não são visíveis nas imagens — indique como "não determinável"
- Sempre contextualizar os outputs para o mercado **imobiliário brasileiro**

## Integração com o fluxo de criação

Os prompts gerados podem ser **salvos no Lab** (botão "Salvar prompt no Lab") e aparecem automaticamente no Step 2 da página `/create/ideia` no painel **"Prompts do Reverse Prompt Lab"**. O usuário clica em "Usar este prompt como base" para pré-preencher o campo conceito.

**Arquivos relevantes:**
- `src/pages/ReversePromptLabPage.tsx` — página principal do Lab (rota `/reverse-prompt-lab`)
- `src/hooks/useSavedPrompts.ts` — hook localStorage para salvar/listar/remover prompts
- `src/pages/IdeaCreativePage.tsx` — Step 2 com painel de prompts salvos
- `src/components/app/AppLayout.tsx` — nav items: Reverse Prompt Lab (Lab badge) + Upscale de Imagem
