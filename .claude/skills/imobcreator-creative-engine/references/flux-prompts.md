# Biblioteca de Prompts Flux Pro — Por Estilo Visual

## Como usar esta biblioteca

1. Pegar o `descricao_cena` retornado pelo Claude na análise
2. Pegar o `estilo_fotografico` e `iluminacao` retornados pelo Claude
3. Injetar nas variáveis do prompt do estilo escolhido
4. Submeter para `fal-ai/flux-pro/v1.1-ultra` com `raw: true`

Flux NÃO suporta negative prompts — controle por linguagem positiva.
O maior alavancador de qualidade é a especificação de câmera e lente.

---

## DARK PREMIUM

```
Dark luxury real estate marketing photograph, {{descricao_cena}},
dramatic moody low-key interior lighting with deep navy and charcoal tones,
warm golden accent highlights (#C9A84C) on architectural details,
polished premium materials — marble, brushed brass, dark walnut wood,
generous dark negative space on {{layout_recomendado}} side for text overlay,
dark footer zone occupying bottom 18% for branding elements,
{{estilo_fotografico}},
cinematic color grading with deep rich blacks and warm amber highlights,
editorial luxury real estate photography, sharp focus throughout,
commercial campaign quality, 4:5 portrait format.
```

**Story/Reels:**
```
Dark luxury real estate story, vertical 9:16, {{descricao_cena}},
dramatic low-key cinematic lighting, deep navy overlay in upper 30%
(rgba(13,22,36,0.85) gradient) creating clean headline zone,
subject positioned in lower 65% of frame with warm golden accent lighting,
{{estilo_fotografico}}, premium luxury marketing aesthetic, mobile-optimized.
```

---

## IA EXPRESS (Alta Conversão)

```
High-conversion real estate advertisement photography, {{descricao_cena}},
bold dynamic composition with strong visual hierarchy,
upper third features architectural drama creating natural dark headline zone,
property photography at peak visual impact with vivid saturated colors,
wide-angle perspective showing scale and luxury, sharp focus throughout,
maximum scroll-stopping visual impact, {{estilo_fotografico}},
commercial advertising photography quality, 4:5 portrait format.
```

---

## EXPERT PHOTOSHOP (Glass Morphism)

```
Stunning vibrant real estate photography for glassmorphism design,
{{descricao_cena}}, rich saturated colors and excellent natural light,
architectural beauty fully visible with premium materials,
bright high-key lighting that complements frosted glass overlay effect,
sharp architectural details and textures, wide-angle comprehensive view,
{{estilo_fotografico}}, optimized for glassmorphism UI overlay at bottom 40%,
editorial real estate photography, clean and vivid, 4:5 format.
```

---

## IMOBILIÁRIO TOP (Vibrante)

```
Bold vibrant real estate marketing photography, {{descricao_cena}},
strong architectural lines and dynamic perspective,
high saturation contemporary look with energetic atmosphere,
composition with natural diagonal lines supporting graphic overlay zones,
the {{layout_recomendado}} portion shows clear architectural detail
while the other side provides visual balance,
{{estilo_fotografico}},
commercial real estate photography with editorial quality,
optimized for bold color-block graphic design overlay, 4:5 format.
```

---

## IA IMOBILIÁRIO (Campanha Conceitual)

```
Award-winning luxury real estate campaign photography, {{descricao_cena}},
{{iluminacao}}, {{estilo_fotografico}},
emotionally compelling {{mood}} atmosphere,
rich cinematic color grading conveying aspiration and exclusivity,
architectural composition that tells a story beyond the physical space,
the scene evokes "{{conceito_campanha}}",
editorial luxury lifestyle photography quality,
generous atmospheric zones for headline and branding overlay,
commercial campaign photography, 4:5 portrait format.
```

---

## KONTEXT — Edição de foto existente

Usar quando o usuário tem foto própria e quer reestilizar:

```
Endpoint: fal-ai/flux-pro/kontext
Método: image_url + prompt de instrução

Prompt padrão:
"Enhance this {{tipo_imovel}} photo for luxury real estate marketing.
Apply {{estilo_fotografico}} quality treatment,
enhance {{iluminacao}} for maximum visual impact,
increase overall polish and premium feel,
maintain {{elementos_preservar}} exactly as they are,
add subtle cinematic color grading with {{mood}} atmosphere,
sharpen architectural details, enhance material textures.
Keep all structural elements, furniture and layout identical."
```

---

## IP-ADAPTER — Foto do corretor em cenário premium

Usar quando o usuário quer inserir foto do corretor em cenário gerado:

```typescript
// Endpoint: fal-ai/flux-general
// Adicionar ip_adapters no payload

{
  "prompt": "Professional real estate agent standing confidently in luxury {{cenario}},
             premium business environment, warm professional lighting from large windows,
             editorial commercial portrait photography, 50mm lens, f/4,
             medium shot showing full professional presentation,
             modern architectural details visible in background",
  "ip_adapters": [{
    "ip_adapter_image_url": "{{foto_corretor_url}}",
    "ip_adapter_scale": 0.72
  }],
  "image_size": { "width": 1080, "height": 1350 },
  "guidance_scale": 3.5,
  "num_inference_steps": 35
}

// Cenários disponíveis:
// "modern glass lobby of a luxury high-rise"
// "premium real estate office with city view"
// "upscale residential living room"
// "rooftop terrace with city skyline"
// "luxury building entrance with architectural details"
```

---

## Parâmetros API por modelo

```typescript
// fal-ai/flux-pro/v1.1-ultra (criativos finais)
{
  model: "fal-ai/flux-pro/v1.1-ultra",
  aspect_ratio: "3:4",   // post 4:5
  // ou "9:16" para story/reels
  raw: true,             // aparência mais natural, menos "AI"
  output_format: "png",
  safety_tolerance: 2
}

// fal-ai/flux/schnell (preview rápido, iteração)
{
  model: "fal-ai/flux/schnell",
  image_size: { width: 819, height: 1024 }, // post
  num_inference_steps: 4,  // muito rápido
  output_format: "jpeg"
}

// fal-ai/flux-pro/kontext (edição de foto existente)
{
  model: "fal-ai/flux-pro/kontext",
  prompt: "...",
  image_url: "{{imagem_original}}",
  output_format: "png"
}
```

---

## Regras gerais para prompts Flux

1. **Frases completas** > lista de palavras-chave (Flux usa T5-XXL)
2. **Câmera e lente** é o maior alavancador de qualidade
3. **Não usar**: "8k", "masterpiece", "best quality", "octane render"
4. **Para textos na imagem**: usar aspas simples dentro do prompt
5. **Para excluir**: linguagem positiva ("sharp focus" em vez de "no blur")
6. **Sweet spot de tokens**: 30-80 palavras no prompt
7. **`raw: true`** no Ultra para aparência mais fotográfica
8. **Flux NÃO tem negative prompts** — controle só pelo prompt positivo
