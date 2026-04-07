/**
 * image-analyzer.service.ts — Análise de imagem via Claude Vision
 *
 * Usa claude-sonnet-4-6 com vision para analisar a imagem e retornar
 * o JSON completo (imóvel, cores, copy, composição, prompt flux).
 * Prompt unificado: .claude/skills/imobcreator-creative-engine/pipeline/unified-prompt.md
 */
import Anthropic from '@anthropic-ai/sdk';
import type { ImageAnalysis } from './types.js';

interface UserBrandProfile {
  nome_corretor: string;
  nicho: string;
  cidade_atuacao: string;
  tom_comunicacao: string;
  publico_alvo: string;
  logo_url?: string;
  cores_marca?: { primaria?: string; secundaria?: string };
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeCreative(params: {
  image_url?: string;
  image_base64?: string;
  image_mime?: string;
  texto_bruto: string;
  user_profile: UserBrandProfile;
}): Promise<ImageAnalysis> {
  const { image_url, image_base64, image_mime, texto_bruto, user_profile } = params;

  // Build image content block
  const imageContent: Anthropic.ImageBlockParam = image_base64
    ? {
        type: 'image',
        source: {
          type: 'base64',
          media_type: (image_mime ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: image_base64,
        },
      }
    : {
        type: 'image',
        source: {
          type: 'url',
          url: image_url!,
        },
      };

  const prompt = buildUnifiedPrompt(texto_bruto, user_profile);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [
            imageContent,
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON — Claude may wrap in ```json ... ```
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(jsonStr) as ImageAnalysis;
    return result;
  } catch (err) {
    console.error('[image-analyzer] Error:', err);
    return getDefaultAnalysis(texto_bruto);
  }
}

function buildUnifiedPrompt(texto_bruto: string, profile: UserBrandProfile): string {
  return `Você é o motor de análise visual e copywriting do ImobCreator AI.

DADOS DE ENTRADA:
- Texto do usuário: "${texto_bruto}"
- Nome: "${profile.nome_corretor}"
- Nicho: "${profile.nicho}"
- Cidade: "${profile.cidade_atuacao}"
- Tom de comunicação: "${profile.tom_comunicacao}"
- Público-alvo: "${profile.publico_alvo}"
- Tem logo cadastrada: ${profile.logo_url ? 'true' : 'false'}
${profile.cores_marca?.primaria ? `- Cor primária da marca: "${profile.cores_marca.primaria}"` : ''}
${profile.cores_marca?.secundaria ? `- Cor secundária da marca: "${profile.cores_marca.secundaria}"` : ''}

ANALISE A IMAGEM E RETORNE APENAS O JSON ABAIXO, sem texto adicional, sem markdown:

{
  "imovel": {
    "tipo": "string",
    "ambiente": "interno|externo|aereo|fachada|area_comum",
    "tem_pessoa": false,
    "posicao_focal": "esquerda|centro|direita|full",
    "luminosidade": "escura|media|clara",
    "contraste": "alto|medio|baixo",
    "zona_livre_texto": "string",
    "qualidade_foto": "alta|media|baixa",
    "angulo": "string"
  },
  "cores_imagem": {
    "dominante": "#hex",
    "secundaria": "#hex",
    "terciaria": "#hex",
    "fundo_sugerido": "#hex",
    "accent_sugerido": "#hex",
    "overlay_intensidade": 0.72,
    "overlay_css_lateral": "linear-gradient(...)",
    "overlay_css_inferior": "linear-gradient(...)"
  },
  "copy": {
    "titulo_linha1": "string (máx 12 chars)",
    "titulo_linha2": "string (máx 12 chars)",
    "titulo_completo": "string",
    "subtitulo": "string (máx 65 chars)",
    "conceito_campanha": "string (3-5 palavras)",
    "cta_texto": "string (máx 4 palavras)",
    "badge_texto": "string (máx 3 palavras CAPS)",
    "script_elegante": "string",
    "mood": "aspiracional|urgencia|exclusividade|educativo|conquista|familiar",
    "copy_instagram": "string (legenda completa com emojis e hashtags)",
    "copy_story": "string (texto curto para story)",
    "copy_whatsapp": "string (mensagem para WhatsApp)"
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
    "descricao_cena": "string (20-30 palavras)",
    "estilo_fotografico": "string",
    "iluminacao": "string",
    "elementos_preservar": "string"
  }
}

REGRAS DE COPY:
- titulo_linha1 e titulo_linha2 DEVEM ser derivados do texto do usuário
- Se tom_comunicacao="sofisticado": títulos curtos, elegantes
- Se tom_comunicacao="urgente": imperativo, números, urgência
- Se tom_comunicacao="amigavel": conversacional, acolhedor
- copy_instagram: 3-5 parágrafos curtos + emojis + hashtags para ${profile.cidade_atuacao}
- copy_story: texto curto e direto para story
- copy_whatsapp: mensagem profissional para encaminhar via WhatsApp

REGRAS DE CORES:
- fundo_sugerido deve ser escuro para texto branco legível
- accent_sugerido deve contrastar com fundo (WCAG AA ≥ 4.5:1)
- overlay_intensidade entre 0.50 (foto clara) e 0.85 (foto escura)

RETORNE APENAS O JSON.`;
}

function getDefaultAnalysis(texto: string): ImageAnalysis {
  const titulo = texto.slice(0, 12).toUpperCase();
  return {
    imovel: {
      tipo: 'apartamento',
      ambiente: 'interno',
      tem_pessoa: false,
      posicao_focal: 'centro',
      luminosidade: 'media',
      contraste: 'medio',
      zona_livre_texto: 'lateral_esquerda',
      qualidade_foto: 'media',
      angulo: 'plano_medio',
    },
    cores_imagem: {
      dominante: '#8B7355',
      secundaria: '#2B3A4E',
      terciaria: '#F5F0EB',
      fundo_sugerido: '#0D1B2A',
      accent_sugerido: '#C9A84C',
      overlay_intensidade: 0.72,
      overlay_css_lateral: 'linear-gradient(to right, rgba(13,27,42,0.82) 0%, rgba(13,27,42,0.50) 40%, transparent 70%)',
      overlay_css_inferior: 'linear-gradient(to top, rgba(13,27,42,0.95) 0%, rgba(13,27,42,0.60) 20%, transparent 45%)',
    },
    copy: {
      titulo_linha1: titulo || 'IMÓVEL',
      titulo_linha2: 'EXCLUSIVO',
      titulo_completo: `${titulo || 'IMÓVEL'} EXCLUSIVO`,
      subtitulo: texto.slice(0, 65),
      conceito_campanha: 'Seu Novo Endereço',
      cta_texto: 'Saiba Mais',
      badge_texto: 'DESTAQUE',
      script_elegante: titulo || 'Imóvel Exclusivo',
      mood: 'aspiracional',
      copy_instagram: `✨ ${texto}\n\n📍 Agende sua visita!\n\n#imoveis #corretor`,
      copy_story: texto.slice(0, 80),
      copy_whatsapp: `Olá! Gostaria de apresentar este imóvel: ${texto.slice(0, 100)}`,
    },
    composicao: {
      layout_recomendado: 'texto_esquerda',
      estilo_overlay: 'lateral',
      saturacao_foto: 'manter',
      ajuste_brilho: 0,
      ajuste_contraste: 5,
      posicao_foto_background: 'center',
    },
    prompt_flux: {
      descricao_cena: 'professional real estate interior photograph with natural lighting',
      estilo_fotografico: 'Canon EOS R5, 24mm wide-angle, f/8',
      iluminacao: 'warm natural light',
      elementos_preservar: 'architectural structure and layout',
    },
  };
}
