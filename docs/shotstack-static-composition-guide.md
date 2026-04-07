# Shotstack API para criativos imobiliários: guia completo de composição com camadas

**A Shotstack Edit API suporta plenamente composição de imagens estáticas** — não é apenas para vídeo. Basta definir `"format": "jpg"` ou `"png"` no objeto `output` para gerar imagens com múltiplas camadas, texto estilizado, overlays, logomarcas e formas geométricas, usando exatamente o mesmo JSON schema dos vídeos. Imagens renderizam em **1–2 segundos**, suportam dimensões até **4096px**, e o sistema de templates com merge fields permite gerar milhares de criativos personalizados programaticamente — ideal para marketing imobiliário em escala.

---

## 1. A Shotstack gera imagens estáticas, não apenas vídeo

Uma dúvida recorrente que merece ser esclarecida de imediato: **a Edit API gera JPG, PNG e BMP nativamente**. O mesmo endpoint `POST /render`, a mesma estrutura de timeline com tracks e clips, os mesmos asset types — tudo funciona igual. A única diferença está no objeto `output`:

```json
"output": {
  "format": "png",
  "size": { "width": 1080, "height": 1080 },
  "quality": "high"
}
```

Para imagens, `start` e `length` nos clips continuam obrigatórios mas são ignorados na prática — a convenção é usar `"start": 0, "length": 1`. O limite de resolução para imagens é **4096px** (contra 1920px para vídeo), e dimensões devem ser divisíveis por 2. A Shotstack possui quatro APIs distintas que compartilham a mesma chave:

- **Edit API** — composição e renderização (vídeo + imagem + áudio)
- **Ingest API** — upload, redimensionamento e transformação de assets antes da composição
- **Create API** — geração de assets via IA (text-to-image, text-to-speech)
- **Serve API** — hospedagem e gerenciamento dos assets gerados no CDN

---

## 2. Estrutura completa do JSON de template para composição de imagens

A hierarquia fundamental é `timeline → tracks → clips → assets`. **Tracks funcionam como camadas do Photoshop**: a primeira track no array renderiza por cima de todas as outras (foreground), e a última é o fundo (background).

### Estrutura raiz

```json
{
  "timeline": {
    "background": "#000000",
    "fonts": [
      { "src": "https://exemplo.com/fonts/Montserrat-Bold.ttf" },
      { "src": "https://exemplo.com/fonts/Montserrat-Regular.ttf" }
    ],
    "tracks": [ /* array de tracks — primeira = topo, última = fundo */ ]
  },
  "output": {
    "format": "png",
    "size": { "width": 1080, "height": 1080 },
    "quality": "high"
  },
  "merge": [
    { "find": "PRECO", "replace": "R$ 850.000" },
    { "find": "ENDERECO", "replace": "Rua das Flores, 123" },
    { "find": "FOTO_URL", "replace": "https://cdn.exemplo.com/imovel.jpg" }
  ]
}
```

### Clip — unidade de cada camada

Cada clip dentro de uma track define um elemento visual com posicionamento:

```json
{
  "asset": { /* ImageAsset, HtmlAsset, TitleAsset, etc. */ },
  "start": 0,
  "length": 1,
  "fit": "crop",
  "scale": 1.0,
  "width": 800,
  "height": 600,
  "position": "center",
  "offset": { "x": 0.0, "y": 0.0 },
  "opacity": 1.0,
  "transform": {
    "rotate": { "angle": 0 },
    "flip": { "horizontal": false, "vertical": false }
  }
}
```

### Ordem de aplicação das propriedades de posicionamento

O sistema de posicionamento usa **coordenadas normalizadas** (relativas ao viewport), garantindo que o layout funcione identicamente em qualquer resolução de saída. As propriedades são aplicadas nesta ordem:

1. **`width`/`height`** — define dimensões em pixels do container do clip
2. **`fit`** — escala o asset para caber no container (`crop` preenche e corta excesso, `cover` estica sem manter proporção, `contain` encaixa mantendo proporção, `none` usa dimensões originais)
3. **`position`** — ancora a um dos 9 pontos da grade: `center`, `top`, `bottom`, `left`, `right`, `topLeft`, `topRight`, `bottomLeft`, `bottomRight`
4. **`offset`** — ajuste fino em relação ao ponto âncora. Valores de **-1 a 1**, relativos à largura/altura do viewport. x positivo = direita, y positivo = cima
5. **`scale`** — multiplicador final de tamanho (0.5 = metade, 2 = dobro)

**Conversão de pixels para offset**: divida a distância em pixels pela dimensão do viewport. Para 50px à direita em output de 1080px: `50 / 1080 = 0.046`.

---

## 3. Tipos de asset e como usar cada um

### ImageAsset — fotos de imóveis, logomarcas, ícones

```json
{
  "type": "image",
  "src": "https://cdn.exemplo.com/imovel-fachada.jpg",
  "crop": {
    "top": 0.0, "bottom": 0.0,
    "left": 0.0, "right": 0.0
  }
}
```

Para **logomarcas PNG com transparência**, a técnica recomendada é usar `fit: "none"` combinado com `scale` para evitar distorção:

```json
{
  "asset": {
    "type": "image",
    "src": "https://cdn.exemplo.com/logo-imobiliaria.png"
  },
  "start": 0, "length": 1,
  "fit": "none",
  "scale": 0.3,
  "position": "topRight",
  "offset": { "x": -0.03, "y": -0.03 }
}
```

A documentação recomenda redimensionar logos e ícones para as dimensões exatas desejadas **antes** de incluí-los na composição, para garantir nitidez máxima.

### HtmlAsset — texto estilizado, retângulos, gradientes via CSS

O **HtmlAsset é o recurso mais poderoso** para criativos imobiliários. Permite texto com CSS completo, backgrounds coloridos e semi-transparentes, e serve como "forma geométrica" usando divs vazios:

```json
{
  "type": "html",
  "html": "<p>R$ 850.000</p>",
  "css": "p { font-family: 'Montserrat'; font-size: 48px; color: #FFFFFF; font-weight: 700; text-align: left; }",
  "width": 500,
  "height": 100,
  "background": "transparent",
  "position": "bottom"
}
```

**Para retângulos e overlays**: use HTML vazio com `background` colorido:

```json
{
  "type": "html",
  "html": "<div></div>",
  "width": 1080,
  "height": 300,
  "background": "#000000"
}
```

Combinado com `opacity: 0.6` no clip, cria overlay escuro. O motor HTML suporta CSS2.1 — **não suporta** CSS animations, position absolute/relative, ou imagens embutidas no HTML. Para layouts complexos, use múltiplos HtmlAssets em clips separados.

### TitleAsset — texto com estilos pré-definidos

```json
{
  "type": "title",
  "text": "Apartamento Premium",
  "style": "minimal",
  "color": "#ffffff",
  "size": "large",
  "background": "transparent",
  "position": "center",
  "offset": { "x": 0.0, "y": 0.0 }
}
```

Estilos disponíveis: `minimal`, `blockbuster`, `vogue`, `sketchy`, `skinny`, `chunk`, `chunkLight`, `marker`, `future`, `subtitle`, `midnight`. Tamanhos: `xx-small` a `xx-large`. O TitleAsset é mais limitado que o HtmlAsset — **use HtmlAsset para controle total** de fontes, cores e posicionamento.

### SVG/Shape Assets — formas geométricas nativas

A Shotstack suporta formas geométricas via **SvgAsset** (beta) e shapes nativas com subtipos como `SvgRectangleShape`, `SvgCircleShape`, `SvgEllipseShape`, `SvgLineShape`, `SvgPolygonShape`, `SvgStarShape`. Cada forma suporta `SvgFill` (sólido, gradiente linear, gradiente radial), `SvgStroke` e `SvgShadow`. Também é possível inserir SVG raw:

```json
{
  "type": "svg",
  "svg": "<svg width='200' height='4'><rect width='200' height='4' fill='#D4AF37'/></svg>"
}
```

### LumaAsset — máscaras para recortes circulares (foto do corretor)

```json
{
  "asset": {
    "type": "luma",
    "src": "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/luma-mattes/circle.jpg"
  },
  "start": 0, "length": 1
}
```

Útil para foto circular do corretor/agente em criativos imobiliários.

---

## 4. Upscale de imagem antes da composição

A Shotstack **não possui AI upscaling** (super-resolução). O "upscaling" mencionado na documentação da Ingest API é redimensionamento convencional por interpolação. Para pré-processar imagens antes da composição, há duas opções:

**Ingest API** — redimensionamento, crop, conversão de formato:

```json
POST https://api.shotstack.io/ingest/v1/sources
{
  "url": "https://exemplo.com/foto-original.jpg",
  "outputs": {
    "renditions": [
      {
        "size": { "width": 1080, "height": 1080 },
        "fit": "crop",
        "quality": 85
      }
    ]
  }
}
```

**Workflows** — módulo de Image Transformation no pipeline no-code, com opções de format, width, height, fit e quality.

Para AI upscaling real, seria necessário usar serviços externos como **Real-ESRGAN**, **Topaz Labs API** ou **Replicate** antes de enviar a imagem para a Shotstack.

---

## 5. Exemplos completos de JSON para criativos imobiliários

### Criativo com overlay escuro no rodapé e texto branco

```json
{
  "timeline": {
    "background": "#000000",
    "fonts": [
      { "src": "https://cdn.exemplo.com/fonts/Montserrat-Bold.ttf" },
      { "src": "https://cdn.exemplo.com/fonts/Montserrat-Regular.ttf" }
    ],
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "https://cdn.exemplo.com/logo-imobiliaria.png"
            },
            "start": 0, "length": 1,
            "fit": "none", "scale": 0.25,
            "position": "topRight",
            "offset": { "x": -0.03, "y": -0.03 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<p>R$ 850.000</p>",
              "css": "p { font-family: 'Montserrat'; font-weight: 700; color: #FFFFFF; font-size: 52px; text-align: left; }",
              "width": 900, "height": 80
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.18 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>Rua das Palmeiras, 456 — Jardins, SP</p>",
              "css": "p { font-family: 'Montserrat'; color: #CCCCCC; font-size: 24px; text-align: left; }",
              "width": 900, "height": 50
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.10 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>3 quartos &bull; 2 vagas &bull; 120 m²</p>",
              "css": "p { font-family: 'Montserrat'; color: #AAAAAA; font-size: 20px; text-align: left; }",
              "width": 900, "height": 40
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.04 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<div></div>",
              "width": 1080, "height": 350,
              "background": "#000000"
            },
            "start": 0, "length": 1,
            "position": "bottom",
            "opacity": 0.7
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "{{FOTO_IMOVEL}}"
            },
            "start": 0, "length": 1,
            "fit": "crop"
          }
        ]
      }
    ]
  },
  "output": {
    "format": "jpg",
    "size": { "width": 1080, "height": 1080 },
    "quality": "high"
  },
  "merge": [
    { "find": "FOTO_IMOVEL", "replace": "https://cdn.exemplo.com/foto-imovel.jpg" }
  ]
}
```

**Ordem das tracks** (de cima para baixo no array = de frente para trás na composição): logo → textos → overlay escuro → foto de fundo.

### Criativo "Dark Premium" com fundo escurecido e acentos dourados

```json
{
  "timeline": {
    "background": "#0A0A0A",
    "fonts": [
      { "src": "https://cdn.exemplo.com/fonts/Playfair-Display-Bold.ttf" },
      { "src": "https://cdn.exemplo.com/fonts/Montserrat-Light.ttf" }
    ],
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "{{LOGO_URL}}"
            },
            "start": 0, "length": 1,
            "fit": "none", "scale": 0.20,
            "position": "topLeft",
            "offset": { "x": 0.04, "y": -0.04 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<p>EXCLUSIVO</p>",
              "css": "p { font-family: 'Montserrat'; font-size: 14px; color: #0A0A0A; font-weight: 700; text-align: center; letter-spacing: 3px; }",
              "width": 160, "height": 32,
              "background": "#D4AF37"
            },
            "start": 0, "length": 1,
            "position": "topLeft",
            "offset": { "x": 0.04, "y": -0.16 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "svg",
              "svg": "<svg width='120' height='3'><rect width='120' height='3' fill='#D4AF37'/></svg>"
            },
            "start": 0, "length": 1,
            "fit": "none",
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.28 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>R$ 2.450.000</p>",
              "css": "p { font-family: 'Playfair Display'; font-weight: 700; color: #D4AF37; font-size: 56px; text-align: left; }",
              "width": 800, "height": 80
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.20 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>Cobertura Duplex — Vila Nova Conceição</p>",
              "css": "p { font-family: 'Montserrat'; color: #FFFFFF; font-size: 22px; text-align: left; font-weight: 300; }",
              "width": 800, "height": 40
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.13 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>4 suítes &bull; 3 vagas &bull; 380 m² &bull; Vista panorâmica</p>",
              "css": "p { font-family: 'Montserrat'; color: #999999; font-size: 16px; text-align: left; }",
              "width": 800, "height": 30
            },
            "start": 0, "length": 1,
            "position": "bottomLeft",
            "offset": { "x": 0.05, "y": 0.07 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>AGENDAR VISITA</p>",
              "css": "p { font-family: 'Montserrat'; font-size: 14px; color: #0A0A0A; font-weight: 700; text-align: center; letter-spacing: 2px; }",
              "width": 200, "height": 44,
              "background": "#D4AF37"
            },
            "start": 0, "length": 1,
            "position": "bottomRight",
            "offset": { "x": -0.05, "y": 0.04 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<div></div>",
              "width": 1080, "height": 1080,
              "background": "#000000"
            },
            "start": 0, "length": 1,
            "opacity": 0.55
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "{{FOTO_IMOVEL}}"
            },
            "start": 0, "length": 1,
            "fit": "crop"
          }
        ]
      }
    ]
  },
  "output": {
    "format": "png",
    "size": { "width": 1080, "height": 1080 },
    "quality": "high"
  }
}
```

### Criativo com painel lateral e texto ao lado da foto

```json
{
  "timeline": {
    "background": "#FFFFFF",
    "fonts": [
      { "src": "https://cdn.exemplo.com/fonts/Poppins-Bold.ttf" },
      { "src": "https://cdn.exemplo.com/fonts/Poppins-Regular.ttf" }
    ],
    "tracks": [
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "{{LOGO_URL}}"
            },
            "start": 0, "length": 1,
            "fit": "none", "scale": 0.18,
            "position": "topLeft",
            "offset": { "x": 0.02, "y": -0.02 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<p>R$ 1.200.000</p>",
              "css": "p { font-family: 'Poppins'; font-weight: 700; color: #1A1A2E; font-size: 42px; text-align: left; }",
              "width": 450, "height": 60
            },
            "start": 0, "length": 1,
            "position": "left",
            "offset": { "x": 0.04, "y": 0.08 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>Jardim Europa, São Paulo</p>",
              "css": "p { font-family: 'Poppins'; color: #555555; font-size: 20px; text-align: left; }",
              "width": 450, "height": 35
            },
            "start": 0, "length": 1,
            "position": "left",
            "offset": { "x": 0.04, "y": -0.01 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>3 quartos &bull; 2 banheiros &bull; 1 vaga</p>",
              "css": "p { font-family: 'Poppins'; color: #888888; font-size: 16px; text-align: left; }",
              "width": 450, "height": 30
            },
            "start": 0, "length": 1,
            "position": "left",
            "offset": { "x": 0.04, "y": -0.08 }
          },
          {
            "asset": {
              "type": "html",
              "html": "<p>SAIBA MAIS</p>",
              "css": "p { font-family: 'Poppins'; font-size: 14px; color: #FFFFFF; font-weight: 600; text-align: center; }",
              "width": 160, "height": 40,
              "background": "#1A1A2E"
            },
            "start": 0, "length": 1,
            "position": "left",
            "offset": { "x": 0.07, "y": -0.18 }
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "html",
              "html": "<div></div>",
              "width": 500, "height": 1080,
              "background": "#F5F5F5"
            },
            "start": 0, "length": 1,
            "position": "left"
          }
        ]
      },
      {
        "clips": [
          {
            "asset": {
              "type": "image",
              "src": "{{FOTO_IMOVEL}}"
            },
            "start": 0, "length": 1,
            "fit": "crop",
            "position": "right",
            "width": 580, "height": 1080
          }
        ]
      }
    ]
  },
  "output": {
    "format": "jpg",
    "size": { "width": 1080, "height": 1080 },
    "quality": "high"
  }
}
```

---

## 6. Alternativas para render de imagens estáticas via API

Embora a Shotstack seja totalmente capaz de gerar imagens estáticas, vale conhecer alternativas. Cada plataforma tem trade-offs distintos:

**Creatomate** é a alternativa mais forte para controle programático total. Seu RenderScript (JSON proprietário) permite definir composições inteiramente via código, sem editor visual obrigatório. Suporta `output_format: "jpg"`, elementos de texto, imagem, shape e compositions aninhadas. Custo a partir de **~$54/mês** para 2.000 imagens. Possui templates de real estate prontos e SDKs para Node, PHP e Python.

**Bannerbear** é ideal para equipes onde designers criam templates no editor visual e desenvolvedores apenas fazem chamadas API com modificações. Destaque para **Template Sets** (gerar múltiplos tamanhos em uma chamada) e **AI Face Detection** para fotos de corretores. A partir de **$49/mês** para 1.000 imagens, mas com menos controle programático — o layout é fixo no template visual.

**Puppeteer/headless Chrome** oferece liberdade total com HTML/CSS/SVG completo (flexbox, grid, gradientes CSS, Google Fonts), sem custo por imagem. Renderiza em ~500ms–2s por imagem com browser reuso. O custo é puramente infraestrutura (~$20–100/mês para milhares de imagens). A desvantagem é o overhead de DevOps significativo: gerenciamento de pool de browsers, instalação de fontes no servidor, e scaling horizontal.

**Placid.app** é o mais acessível, a partir de **$19/mês** para 500 créditos, com créditos que acumulam. Possui integração com Zapier, Make e até MCP server para agentes IA. **RenderForm** oferece pay-as-you-go a **$0.005/imagem** sem assinatura obrigatória. **APITemplate.io** se destaca por gerar tanto PDFs (brochuras) quanto imagens do mesmo template — útil para materiais impressos e digitais simultaneamente.

| Plataforma | Imagem estática | JSON programático | Preço/1K imagens | Editor visual |
|---|---|---|---|---|
| **Shotstack** | JPG/PNG/BMP | Completo | ~$25 | Studio |
| **Creatomate** | JPG/PNG | RenderScript | ~$27 | Sim |
| **Bannerbear** | JPG/PNG | Template-only | ~$49 | Excelente |
| **Puppeteer** | Qualquer | HTML/CSS | ~$1–5 (infra) | Nao |
| **Placid** | JPG/PNG | Template-only | ~$38 | Sim |
| **RenderForm** | PNG/JPG | Parcial | ~$5 | Sim |

---

## 7. Como estruturar prompts para o Claude gerar o JSON automaticamente

Para que o Claude gere templates Shotstack corretos automaticamente, o prompt do sistema deve conter três componentes: o schema da API, regras de composição visual, e os dados dinâmicos do criativo.

**Prompt de sistema recomendado** (a ser adaptado para cada projeto):

```
Você é um especialista em composição de criativos imobiliários usando a Shotstack Edit API.
Gere JSON válido para a Shotstack seguindo estas regras:

SCHEMA:
- Estrutura: { timeline: { background, fonts[], tracks[] }, output: { format, size, quality } }
- Tracks: primeira = camada superior (foreground), última = fundo (background)
- Clips: { asset, start: 0, length: 1, fit, scale, position, offset: {x, y}, opacity }
- Asset types: "image" (src, crop), "html" (html, css, width, height, background, position), "title" (text, style, color, size), "svg" (svg)
- Offset: valores de -1 a 1, relativos ao viewport. x positivo = direita, y positivo = cima
- Para logos/ícones: usar fit: "none" + scale
- Para overlays/retângulos: HtmlAsset com html vazio e background colorido + opacity no clip
- Para texto: HtmlAsset com CSS inline (font-family, font-size, color, font-weight, text-align)
- Fontes customizadas devem ser declaradas em timeline.fonts[]

REGRAS DE ESTILO:
- Estilo "dark_premium": overlay #000000 opacity 0.5-0.6, textos brancos, acentos em #D4AF37, fonte serif para preço (Playfair Display), sans-serif para demais (Montserrat)
- Estilo "minimalista": fundo branco #F5F5F5, textos escuros #1A1A2E, sem overlay na foto, layout limpo com bastante espaço em branco
- Estilo "moderno": gradiente lateral, cores vivas da marca, tipografia bold
- Badge "EXCLUSIVO": HtmlAsset com background da cor de acento, texto em caps, letter-spacing: 3px
- CTA button: HtmlAsset com background sólido, texto centered, width/height fixos

DADOS DINÂMICOS (usar merge fields {{CAMPO}}):
- {{FOTO_IMOVEL}} — URL da foto principal
- {{LOGO_URL}} — URL da logomarca PNG
- {{PRECO}} — preço formatado
- {{ENDERECO}} — endereço completo
- {{DETALHES}} — quartos, vagas, área
- {{CTA_TEXTO}} — texto do call-to-action
```

**Exemplo de prompt do usuário para o Claude:**

```
Gere um criativo imobiliário Shotstack no estilo dark_premium, formato 1080x1080 PNG.
Cor primária da marca: #2E5090 (azul escuro)
Cor de acento: #D4AF37 (dourado)
Logomarca: posição top-left
Badge "NOVO" no canto superior direito
Foto do imóvel como fundo com overlay escuro
Preço grande em dourado no rodapé
Endereço abaixo do preço em branco
Detalhes (quartos/vagas/m²) em cinza claro
Botão CTA "AGENDAR VISITA" no canto inferior direito
```

O resultado será um JSON completo e válido pronto para enviar ao endpoint `POST /render` da Shotstack, com merge fields nos campos dinâmicos para personalização em lote.

---

## Conclusão

A Shotstack Edit API é uma solução completa e viável em produção para geração de criativos imobiliários estáticos — **não é necessário buscar alternativas apenas por ser "uma API de vídeo"**. A combinação de HtmlAssets com CSS para texto e formas, ImageAssets para fotos e logos, sistema de 9 pontos + offset para posicionamento, e merge fields para personalização em massa cobre todos os cenários de marketing imobiliário. Para escala brasileira, o fluxo mais eficiente é: pré-processar fotos via Ingest API, salvar templates parametrizados com merge fields, e renderizar via `POST /templates/render` — gerando centenas de criativos personalizados por minuto a um custo de centavos por imagem. A Creatomate se destaca como melhor alternativa quando se deseja controle JSON completo sem depender de video-first API, e o Puppeteer quando o custo por imagem precisa ser próximo de zero.
