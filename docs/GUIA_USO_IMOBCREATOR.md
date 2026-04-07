# Como Usar os Dados de Pesquisa no ImobCreator AI

## Passo 1 — Clonar os dados para o projeto

No seu terminal Windows (PowerShell), na pasta `C:\Users\Douglas\`:

```powershell
# Clonar o db8-engine (se ainda não tiver)
git clone https://github.com/DB8-Intelligence/db8-engine.git
cd db8-engine
git checkout claude/saas-audit-agent-oF5oJ

# Copiar os arquivos relevantes para o imob-creator-studio
xcopy /E /I saas-auditor\EXPORT_IMOBCREATOR.md ..\imob-creator-studio\docs\
xcopy /E /I saas-auditor\reverse-engineer-cli.js ..\imob-creator-studio\tools\analyze.js*
xcopy /E /I saas-auditor\src\reverse-engineer.js ..\imob-creator-studio\tools\src\
xcopy /E /I saas-auditor\visual-analysis-data.js ..\imob-creator-studio\docs\
xcopy /E /I saas-auditor\reverse-engineered ..\imob-creator-studio\reverse-engineered\
xcopy /E /I saas-auditor\reports\criadordecriativos_20260404 ..\imob-creator-studio\docs\concorrente\
```

## Passo 2 — Usar a Skill de Engenharia Reversa

### Analisar uma imagem de referência (Pinterest, Canva, concorrente)

```powershell
cd C:\Users\Douglas\imob-creator-studio\tools

# Definir chave da API
$env:ANTHROPIC_API_KEY="sk-ant-..."

# Analisar uma imagem
node analyze.js "C:\Users\Douglas\Downloads\referencia_imovel.png"

# Analisar pasta inteira de referências
node analyze.js "C:\Users\Douglas\Downloads\referencias_pinterest\" --output .\resultados\
```

### O que sai da análise:

```
reverse-engineered/
├── referencia_imovel_analysis.json    ← Análise completa individual
├── consolidated_analysis.json         ← Todas as análises juntas
└── prompt_library.json                ← BIBLIOTECA DE PROMPTS (este é o ouro!)
```

### Estrutura do `prompt_library.json`:
```json
[
  {
    "source": "referencia_imovel.png",
    "categoria": "anuncio_imovel",
    "nicho": "imobiliario",
    "estilo": "dark_premium",
    "prompt_en": "Professional luxury real estate ad with dark background...",
    "prompt_pt": "Anúncio imobiliário de luxo profissional com fundo escuro...",
    "prompt_template": "Professional {NICHO} ad in {PROPORCAO}. {ESTILO} design...",
    "negative_prompt": "low quality, blurry, amateur...",
    "modelo": "flux_pro"
  }
]
```

## Passo 3 — Transformar análises em TEMAS do ImobCreator

Cada análise gera dados que viram um tema no sistema. A conversão:

### De `_analysis.json` → Para `tema no ImobCreator`:

| Campo da Análise | → | Campo do Tema ImobCreator |
|---|---|---|
| `cores.paleta_principal` | → | Paleta de cores do tema |
| `cores.estilo_cor` | → | Nome/categoria do estilo |
| `cores.fundo` | → | Tipo de overlay sobre a foto |
| `tipografia.fonte_titulo` | → | Font family do título |
| `tipografia.peso_titulo` | → | Font weight do título |
| `tipografia.alinhamento` | → | Text alignment |
| `elementos_graficos.badges` | → | Badges disponíveis |
| `elementos_graficos.icones` | → | Ícones do tema |
| `elementos_graficos.shapes` | → | Elementos decorativos |
| `composicao.layout` | → | Template de posicionamento |
| `composicao.hierarquia_visual` | → | Ordem dos elementos |
| `prompt_reproducao.prompt_template` | → | Prompt para gerar variações |
| `prompt_reproducao.variaveis.lista` | → | Campos do formulário |

### Exemplo de conversão:

**Input** (da análise da imagem Douglas Bonanza):
```json
{
  "cores": {
    "paleta_principal": ["#1a1a1a", "#c8a04e", "#2b4a8c"],
    "estilo_cor": "dark_premium",
    "fundo": "gradiente escuro com textura geométrica"
  },
  "tipografia": {
    "fonte_titulo": "Playfair Display Bold",
    "alinhamento": "esquerda"
  }
}
```

**Output** (tema no ImobCreator):
```typescript
const temaDarkPremium: Theme = {
  id: 'dark-premium',
  name: 'Dark Premium',
  description: 'Fundo escuro elegante com detalhes dourados',
  
  colors: {
    background: '#1a1a1a',
    primary: '#c8a04e',     // dourado
    secondary: '#2b4a8c',   // azul marinho
    text: '#ffffff',
    textSecondary: '#d4d4d4',
    accent: '#c8a04e',
  },
  
  overlay: {
    type: 'gradient',
    css: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
  },
  
  typography: {
    titleFont: 'Playfair Display',
    titleWeight: 700,
    bodyFont: 'Montserrat',
    bodyWeight: 400,
    titleAlign: 'left',
    titleTransform: 'capitalize',
    titleMaxChars: 40,
  },
  
  badges: {
    available: ['À VENDA', 'VENDIDO', 'EXCLUSIVO', 'NOVO', 'OPORTUNIDADE'],
    style: 'pill',           // pill | square | ribbon
    position: 'top-left',
    bgColor: '#c8a04e',
    textColor: '#1a1a1a',
  },
  
  icons: {
    show: true,
    style: 'outlined',       // outlined | filled | emoji
    items: ['bed', 'bath', 'car', 'ruler'],  // quartos, banheiros, vagas, m²
    color: '#c8a04e',
  },
  
  decorations: {
    confetti: false,
    shapes3d: false,
    lensFlare: false,
    borderFrame: false,
  },
  
  layout: {
    photoPosition: 'background',  // background | left | right | top
    textPosition: 'bottom-left',
    logoPosition: 'bottom-right',
    ctaPosition: 'bottom-center',
    spacing: 'balanced',
  },
  
  cta: {
    style: 'button',           // button | text | pill
    bgColor: '#c8a04e',
    textColor: '#1a1a1a',
    borderRadius: 8,
  },
};
```

## Passo 4 — Workflow completo de criação de novo tema

```
1. Salvar imagem de referência (Pinterest, Canva, concorrente)
     ↓
2. Rodar: node tools/analyze.js referencia.png
     ↓
3. Abrir: reverse-engineered/referencia_analysis.json
     ↓
4. Copiar cores, tipografia, layout, overlay
     ↓
5. Criar novo tema no ImobCreator (src/themes/novo-tema.ts)
     ↓
6. Testar com foto de imóvel real
     ↓
7. Ajustar e publicar
```

## Passo 5 — Os 12 temas que precisamos criar (MVP)

Baseado na pesquisa do concorrente (5 temas imobiliários) + Pinterest + Canva:

### Prioridade ALTA (lançar com esses 5):

| # | Tema | Estilo | Paleta | Referência |
|---|---|---|---|---|
| 1 | **Dark Premium** | Fundo escuro + dourado | `#1a1a1a` `#c8a04e` `#fff` | Concorrente: "Dark Premium" |
| 2 | **Moderno Clean** | Branco + azul + minimalista | `#ffffff` `#2979FF` `#333` | Concorrente: "Produto em Destaque" |
| 3 | **Imobiliário Clássico** | Azul marinho + branco | `#1a3a5c` `#fff` `#c8a04e` | Pinterest: posts mais comuns |
| 4 | **Luxo Elegante** | Preto + ouro + serif | `#0a0a0a` `#d4af37` `#fff` | Concorrente: "IA Imobiliário" |
| 5 | **Glass Morphism** | Translúcido + blur | `rgba(255,255,255,0.15)` | Concorrente: "Expert Photoshop" |

### Prioridade MÉDIA (V2):

| # | Tema | Estilo | Paleta |
|---|---|---|---|
| 6 | **Colorido Vibrante** | Azul + laranja forte | `#2979FF` `#FF6D00` `#fff` |
| 7 | **Natureza Verde** | Verde + bege + clean | `#2E7D32` `#F5F0E8` `#333` |
| 8 | **Urgência** | Vermelho + preto + bold | `#D32F2F` `#1a1a1a` `#fff` |
| 9 | **Pastel Suave** | Rosa + azul claro | `#F8BBD0` `#B3E5FC` `#333` |
| 10 | **Editorial** | Branco + serif + magazine | `#fff` `#333` `#666` |

### Prioridade BAIXA (V3):

| # | Tema | Estilo |
|---|---|---|
| 11 | **Neon Futurista** | Preto + neon verde/roxo |
| 12 | **Rústico Premium** | Madeira + tons terrosos |

## Resumo rápido

- **Skill de engenharia reversa** → `node tools/analyze.js <imagem>`
- **Resultado** → JSON com cores, fontes, layout, prompt reproduzível
- **Cada JSON** → vira 1 tema no ImobCreator
- **MVP** → 5 temas + 8 categorias de criativo
- **Concorrente tem** → 5 temas imobiliários (nós teremos 12)
