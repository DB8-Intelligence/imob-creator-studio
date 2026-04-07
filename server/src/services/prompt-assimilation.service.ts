/**
 * prompt-assimilation.service.ts — Classificação automática de agentes
 *
 * Recebe prompt bruto → usa claude-haiku-4-5 para classificar →
 * retorna slug, category, pipeline_stage, schemas.
 *
 * Fallback: se ANTHROPIC_API_KEY não estiver configurada,
 * faz classificação heurística simples sem chamar a API.
 */
import Anthropic from '@anthropic-ai/sdk';

export interface AssimilationResult {
  slug: string;
  category: string;
  pipeline_stage: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  trigger_mode: string;
  reason: string;
}

export async function assimilateAgentPrompt(params: {
  name: string;
  description: string;
  prompt_master: string;
}): Promise<AssimilationResult> {
  const { name, description, prompt_master } = params;

  // If no API key, use heuristic fallback
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicClassification(name, description, prompt_master);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Você é um classificador de agentes para um pipeline de geração de criativos imobiliários.

Dado o seguinte agente, classifique-o:

Nome: ${name}
Descrição: ${description}
Prompt Master (primeiras 500 chars): ${prompt_master.slice(0, 500)}

Retorne APENAS o JSON abaixo (sem texto adicional):
{
  "slug": "string (kebab-case, ex: image-analyzer-agent)",
  "category": "copy|visual|branding|composicao|validacao|publicacao|analytics|roteamento|template_decision",
  "pipeline_stage": "input_collection|image_analysis|branding_analysis|template_decision|copy_generation|image_restyling|composition|rendering|validation|publication|analytics",
  "input_schema": { "tipo": "descricao dos inputs esperados" },
  "output_schema": { "tipo": "descricao dos outputs produzidos" },
  "trigger_mode": "always|conditional|manual",
  "reason": "string (por que esta classificação)"
}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No response from Claude');
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(jsonStr) as AssimilationResult;
  } catch (err) {
    console.warn('[prompt-assimilation] API call failed, using heuristic:', err);
    return heuristicClassification(name, description, prompt_master);
  }
}

/** Classificação heurística quando API não está disponível */
function heuristicClassification(
  name: string,
  description: string,
  prompt_master: string
): AssimilationResult {
  const text = `${name} ${description} ${prompt_master}`.toLowerCase();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  // Category + stage detection by keywords
  let category = 'composicao';
  let pipeline_stage = 'composition';
  let trigger_mode = 'always';

  if (text.includes('copy') || text.includes('texto') || text.includes('legenda') || text.includes('caption')) {
    category = 'copy';
    pipeline_stage = 'copy_generation';
  } else if (text.includes('imagem') || text.includes('image') || text.includes('foto') || text.includes('visual') || text.includes('analis')) {
    category = 'visual';
    pipeline_stage = 'image_analysis';
  } else if (text.includes('cor') || text.includes('color') || text.includes('brand') || text.includes('logo') || text.includes('marca')) {
    category = 'branding';
    pipeline_stage = 'branding_analysis';
  } else if (text.includes('template') || text.includes('decision') || text.includes('classif') || text.includes('selet')) {
    category = 'template_decision';
    pipeline_stage = 'template_decision';
    trigger_mode = 'conditional';
  } else if (text.includes('render') || text.includes('shotstack') || text.includes('composição') || text.includes('panel') || text.includes('split')) {
    category = 'composicao';
    pipeline_stage = 'composition';
  } else if (text.includes('valid')) {
    category = 'validacao';
    pipeline_stage = 'validation';
  } else if (text.includes('public') || text.includes('instagram') || text.includes('whatsapp')) {
    category = 'publicacao';
    pipeline_stage = 'publication';
  }

  return {
    slug,
    category,
    pipeline_stage,
    input_schema: { image_url: 'string', texto_bruto: 'string', user_profile: 'UserBrandProfile' },
    output_schema: { result: 'object' },
    trigger_mode,
    reason: `Heuristic classification based on keywords (ANTHROPIC_API_KEY not configured). Detected: ${category}/${pipeline_stage}`,
  };
}
