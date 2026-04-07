# Prompt Unificado — Análise Completa de Imagem

Este é o prompt único que o Claude recebe para cada criativo.
Ele faz tudo em uma única chamada: analisa a imagem, processa o texto,
gera o copy e retorna o JSON completo para o pipeline.

## Quando usar

- `claude-sonnet-4-6` — análise principal (vision + qualidade de copy)
- `claude-haiku-4-5` — se volume alto e copy simples (economiza custo)

## Como chamar

```typescript
// src/services/pipeline/image-analyzer.service.ts

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function analyzeCreative(params: {
  image_url: string;
  image_base64?: string;
  texto_bruto: string;
  user_profile: UserBrandProfile;
  template_id?: string;
}): Promise<CreativeAnalysis> {

  const imageContent = params.image_base64
    ? { type: 'base64', media_type: 'image/jpeg', data: params.image_base64 }
    : { type: 'url', url: params.image_url };

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: imageContent },
        { type: 'text', text: buildUnifiedPrompt(params) }
      ]
    }]
  });

  const json = JSON.parse(response.content[0].text);
  return json as CreativeAnalysis;
}

function buildUnifiedPrompt(params: {
  texto_bruto: string;
  user_profile: UserBrandProfile;
  template_id?: string;
}): string {
  const { texto_bruto, user_profile } = params;

  return `Você é o motor de análise visual e copywriting do ImobCreator AI.

DADOS DE ENTRADA:
- Texto do usuário: "${texto_bruto}"
- Nome: "${user_profile.nome_corretor}"
- Nicho: "${user_profile.nicho}"
- Cidade: "${user_profile.cidade_atuacao}"
- Tom de comunicação: "${user_profile.tom_comunicacao}"
- Público-alvo: "${user_profile.publico_alvo}"
- Tem logo cadastrada: ${user_profile.logo_url ? 'true' : 'false'}
${user_profile.cores_marca?.primaria ? `- Cor primária da marca: "${user_profile.cores_marca.primaria}"` : ''}
${user_profile.cores_marca?.secundaria ? `- Cor secundária da marca: "${user_profile.cores_marca.secundaria}"` : ''}

ANALISE A IMAGEM E RETORNE APENAS O JSON ABAIXO, sem texto adicional, sem markdown:

{
  "imovel": {
    "tipo": "string (ex: apartamento, cobertura, casa, terreno, sala, fachada, piscina, área gourmet)",
    "ambiente": "interno|externo|aereo|fachada|area_comum",
    "tem_pessoa": false,
    "posicao_focal": "esquerda|centro|direita|full",
    "luminosidade": "escura|media|clara",
    "contraste": "alto|medio|baixo",
    "zona_livre_texto": "superior_esquerda|superior_direita|inferior|lateral_esquerda|lateral_direita",
    "qualidade_foto": "alta|media|baixa",
    "angulo": "grande_angular|plano_medio|aereo|detalhe|frontal"
  },
  "cores_imagem": {
    "dominante": "#hex",
    "secundaria": "#hex",
    "terciaria": "#hex",
    "fundo_sugerido": "#hex (cor escura e harmoniosa derivada da imagem, para usar como base de overlay)",
    "accent_sugerido": "#hex (cor vibrante que contrasta bem com o fundo sugerido)",
    "overlay_intensidade": 0.72,
    "overlay_css_lateral": "linear-gradient(to right, rgba(R,G,B,0.82) 0%, rgba(R,G,B,0.50) 40%, transparent 70%)",
    "overlay_css_inferior": "linear-gradient(to top, rgba(R,G,B,0.95) 0%, rgba(R,G,B,0.60) 20%, transparent 45%)"
  },
  "copy": {
    "titulo_linha1": "string (máx 12 chars, derivado do texto_bruto, impactante)",
    "titulo_linha2": "string (máx 12 chars, continuação ou complemento)",
    "titulo_completo": "string (título em uma linha para story)",
    "subtitulo": "string (máx 65 chars, frase de apoio contextual ao texto_bruto)",
    "conceito_campanha": "string (tagline aspiracional em 3-5 palavras)",
    "cta_texto": "string (máx 4 palavras, ação direta e específica)",
    "badge_texto": "string (máx 3 palavras em CAPS, urgência ou categoria do imóvel)",
    "script_elegante": "string (versão cursiva/elegante do título para elementos decorativos)",
    "mood": "aspiracional|urgencia|exclusividade|educativo|conquista|familiar",
    "copy_instagram": "string (legenda completa para Instagram, com emojis e hashtags, baseada no texto_bruto)"
  },
  "composicao": {
    "layout_recomendado": "texto_esquerda|texto_direita|texto_superior|texto_inferior|central",
    "estilo_overlay": "lateral|inferior|superior|diagonal|vinheta|full",
    "saturacao_foto": "aumentar|manter|reduzir",
    "ajuste_brilho": -5,
    "ajuste_contraste": 5,
    "posicao_foto_background": "center|top|bottom|left|right"
  },
  "prompt_flux": {
    "descricao_cena": "string (descrição técnica da cena para usar nos prompts Flux, 20-30 palavras)",
    "estilo_fotografico": "string (especificação de câmera e lente recomendada para o tipo de imóvel)",
    "iluminacao": "string (tipo de iluminação ideal para o mood)",
    "elementos_preservar": "string (o que deve ser preservado se usar Kontext)"
  }
}

REGRAS DE COPY:
- titulo_linha1 e titulo_linha2 DEVEM ser derivados do texto_bruto, não inventados
- Se tom_comunicacao="sofisticado": títulos curtos, elegantes, sem exclamações excessivas
- Se tom_comunicacao="urgente": imperativo, números visíveis, urgência clara
- Se tom_comunicacao="amigavel": conversacional, acolhedor, benefícios em destaque
- badge_texto deve refletir o nicho: luxo→"EXCLUSIVO", lançamento→"NOVO", urgência→"ÚLTIMAS UNIDADES"
- copy_instagram deve ter 3-5 parágrafos curtos + emojis + hashtags relevantes para ${user_profile.cidade_atuacao}

REGRAS DE CORES:
- fundo_sugerido deve ser escuro o suficiente para texto branco ser legível
- accent_sugerido deve contrastar com fundo_sugerido em pelo menos 4.5:1 (WCAG AA)
- overlay_intensidade entre 0.50 (foto clara) e 0.85 (foto muito escura já)
- Os valores RGB nos overlay_css devem corresponder ao hex de fundo_sugerido

RETORNE APENAS O JSON. Zero texto antes ou depois.`;
}
```

## Output esperado (exemplo)

```json
{
  "imovel": {
    "tipo": "apartamento",
    "ambiente": "interno",
    "tem_pessoa": false,
    "posicao_focal": "centro",
    "luminosidade": "clara",
    "contraste": "alto",
    "zona_livre_texto": "lateral_esquerda",
    "qualidade_foto": "alta",
    "angulo": "grande_angular"
  },
  "cores_imagem": {
    "dominante": "#C4A882",
    "secundaria": "#2B3A4E",
    "terciaria": "#F5F0EB",
    "fundo_sugerido": "#0D1B2A",
    "accent_sugerido": "#C9A84C",
    "overlay_intensidade": 0.72,
    "overlay_css_lateral": "linear-gradient(to right, rgba(13,27,42,0.82) 0%, rgba(13,27,42,0.50) 40%, transparent 70%)",
    "overlay_css_inferior": "linear-gradient(to top, rgba(13,27,42,0.95) 0%, rgba(13,27,42,0.60) 20%, transparent 45%)"
  },
  "copy": {
    "titulo_linha1": "ALPHAVILLE",
    "titulo_linha2": "EXCLUSIVO",
    "titulo_completo": "ALPHAVILLE EXCLUSIVO",
    "subtitulo": "Apartamento premium com vista privilegiada e acabamento superior",
    "conceito_campanha": "Seu Padrão de Vida Elevado",
    "cta_texto": "Agende sua Visita",
    "badge_texto": "EXCLUSIVO",
    "script_elegante": "Alphaville Exclusivo",
    "mood": "exclusividade",
    "copy_instagram": "✨ O endereço que você merece está em Alphaville.\n\nApartamento com acabamento premium, vista privilegiada e todos os detalhes pensados para quem exige o melhor.\n\n🏡 Alto padrão | 📍 Alphaville | 🔑 Pronto para morar\n\nAgende sua visita exclusiva 👇\n.\n.\n#alphaville #imoveisalphaville #apartamentoluxo #altopAdrao #imoveissp #corretor #exclusivo"
  },
  "composicao": {
    "layout_recomendado": "texto_esquerda",
    "estilo_overlay": "lateral",
    "saturacao_foto": "manter",
    "ajuste_brilho": 0,
    "ajuste_contraste": 5,
    "posicao_foto_background": "right"
  },
  "prompt_flux": {
    "descricao_cena": "luxury apartment interior with high ceilings, natural light, premium finishes, walnut wood and marble details",
    "estilo_fotografico": "shot on Canon EOS R5, 24mm wide-angle lens, f/8, balanced interior exposure",
    "iluminacao": "warm natural light from floor-to-ceiling windows, soft shadows, golden hour quality",
    "elementos_preservar": "architectural structure, interior layout, furniture placement, natural lighting"
  }
}
```
