# Engenharia Reversa — Criar Templates a partir de Criativos

## Quando usar este guia

- Usuário envia print de criativo concorrente e pede "crie igual"
- Você quer adicionar novo template à biblioteca do ImobCreator
- Precisa replicar um estilo visual específico do mercado

## Output obrigatório para toda engenharia reversa

Ao analisar qualquer imagem de criativo, produza SEMPRE estes 4 blocos:

---

### BLOCO 1 — Análise Técnica Camada a Camada

```
CAMADA 0 — Foto base (background)
  Tipo: [gerada por IA | foto real | render 3D | maquete]
  Conteúdo: [descrição do que mostra]
  Posicionamento: [onde o sujeito principal está no frame]
  
CAMADA 1 — Overlay de luz/sombra
  Tipo: [gradiente lateral | gradiente inferior | vinheta | sem overlay]
  CSS: [linear-gradient(...)]
  Intensidade: [0.XX]
  
CAMADA 2 — Tipografia principal
  Título: fonte=[X], peso=[X], tamanho=[Xpx em 1080px], cor=[#hex], transform=[X]
  Subtítulo: fonte=[X], peso=[X], tamanho=[Xpx], cor=[#hex]
  Script/cursivo (se presente): fonte=[X], tamanho=[Xpx], cor=[#hex]
  
CAMADA 3 — Elementos decorativos
  Badge: posição=[X], estilo=[pill|square|ribbon], bg=[#hex], texto_cor=[#hex]
  Linha decorativa: largura=[Xpx], altura=[Xpx], cor=[#hex]
  Botão CTA: estilo=[pill|square|ghost], bg=[#hex|gradient], border=[X]
  
CAMADA 4 — Identidade de marca
  Logo: posição=[X], tamanho_relativo=[X%], container=[sim/não]
  Nome: fonte=[X], peso=[X], cor=[#hex]
  Script do nome (se presente): fonte=[X], cor=[#hex]
  Subtítulo da marca: fonte=[X], tamanho=[Xpx], cor=[#hex]

PALETA EXTRAÍDA:
  Fundo/overlay: #hex
  Primária (títulos, accent): #hex
  Secundária (botão, elementos): #hex
  Texto corpo: #hex (ou rgba)
  Accent decorativo: #hex
```

---

### BLOCO 2 — JSON do Template Extraído

```json
{
  "id": "template-[nome-descritivo]",
  "nome": "[Nome do Estilo]",
  "descricao": "[1 linha descrevendo o estilo]",
  "categoria": "Imobiliário",
  "origem": "engenharia-reversa",
  "config_visual": {
    "overlay": {
      "lateral": "linear-gradient(...)",
      "inferior": "linear-gradient(...)"
    },
    "paleta": {
      "fundo": "#hex",
      "primaria": "#hex",
      "secundaria": "#hex",
      "texto": "#hex",
      "texto_corpo": "rgba(...)",
      "accent": "#hex"
    },
    "tipografia": {
      "titulo":    { "fonte": "", "peso": 0, "tamanho_post": 0, "tamanho_story": 0, "cor": "{{cor_primaria}}", "transform": "" },
      "subtitulo": { "fonte": "", "peso": 0, "tamanho": 0, "cor": "{{cor_texto_corpo}}" },
      "script":    { "fonte": "", "peso": 0, "tamanho_post": 0, "cor": "{{cor_primaria}}" },
      "cta":       { "fonte": "", "peso": 0, "tamanho": 0, "cor": "#FFFFFF" },
      "badge":     { "fonte": "", "peso": 0, "tamanho": 0, "cor": "{{cor_accent}}", "transform": "uppercase" }
    },
    "elementos": {
      "linha_decorativa": { "largura": 0, "altura": 0, "cor": "{{cor_primaria}}", "opacidade": 0 },
      "badge_box": { "border_radius": 0, "padding": "", "border": "1px solid {{cor_accent_40}}", "bg": "{{cor_accent_12}}" },
      "cta_btn": { "border_radius": 0, "bg": "", "border": "", "largura_pct": 0 },
      "logo_box": { "border_radius": 0, "tamanho": 0, "border": "", "bg": "" }
    },
    "layout": {
      "post":  { "texto_zona": "", "texto_max_width_pct": 0, "badge_pos": "", "cta_pos": "", "logo_pos": "" },
      "story": { "texto_zona": "", "texto_max_width_pct": 0, "badge_pos": "", "cta_pos": "", "logo_pos": "" },
      "reels": { "texto_zona": "", "texto_max_width_pct": 0, "badge_pos": "", "cta_pos": "", "logo_pos": "" }
    }
  }
}
```

---

### BLOCO 3 — Prompts Flux Pro (3 formatos)

```
POST 4:5 (1080×1350)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Parâmetros: aspect_ratio="3:4", raw=true, output_format="png"

[prompt completo de 40-70 palavras descrevendo a cena, iluminação,
câmera, composição e zonas de texto — SEM mencionar o concorrente]

---
STORY 9:16 (1080×1920)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Parâmetros: aspect_ratio="9:16", raw=true, output_format="png"

[prompt completo adaptado para vertical]

---
REELS COVER 9:16 (1080×1920)
Endpoint: fal-ai/flux-pro/v1.1-ultra
Parâmetros: aspect_ratio="9:16", raw=true, output_format="png"

[prompt completo adaptado para reels]
```

---

### BLOCO 4 — Recipe de Composição Final

```
Ordem de camadas (z-index crescente):

Z-INDEX 0 → Foto gerada pelo Flux (background, fit: cover)
Z-INDEX 1 → Overlay lateral  (div com gradient CSS)
Z-INDEX 2 → Overlay inferior (div com gradient CSS)
Z-INDEX 3 → Foto do imóvel (se layout dividido)
Z-INDEX 4 → Linha decorativa (div 40px × 1.5px)
Z-INDEX 5 → Badge de urgência (posição: top-right ou top-left)
Z-INDEX 6 → Título linha 1 (Playfair/Inter, cor primária)
Z-INDEX 7 → Título linha 2 (mesma fonte)
Z-INDEX 8 → Subtítulo (Inter Light, off-white)
Z-INDEX 9 → Script/cursivo (Dancing Script, cor primária)
Z-INDEX 10 → Botão CTA (pill/square, centralizado inferior)
Z-INDEX 11 → Logo (bottom-right, 15% da largura)
Z-INDEX 12 → Nome do corretor + script + CRECI (bottom-right)
```

---

## Prompt Claude para engenharia reversa (ativar automaticamente)

Quando o usuário enviar imagem de criativo para análise, usar este prompt:

```
Você é um especialista em design e engenharia reversa de criativos de marketing.
Analise este criativo imobiliário e produza a análise técnica completa seguindo
exatamente o formato definido na skill imobcreator-creative-engine, arquivo
references/reverse-engineer.md, com os 4 blocos obrigatórios:

1. Análise Técnica Camada a Camada (todas as camadas)
2. JSON do Template Extraído (completo e implementável)
3. Prompts Flux Pro para os 3 formatos (post, story, reels)
4. Recipe de Composição Final (z-index order)

REGRAS:
- Extrair cores HEX exatas da imagem (use amostragem visual precisa)
- Identificar fontes por suas características (serifada, sans-serif, script, display)
- O JSON deve usar {{variavel}} para todos os valores dinâmicos
- Os prompts Flux devem descrever como recriar o ESTILO, não copiar o conteúdo
- Nunca mencionar marcas, pessoas ou empresas nos prompts
```
