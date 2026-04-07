/**
 * template-decision.service.ts — Classificador de template
 *
 * Analisa a ImageAnalysis e o texto do usuário para recomendar
 * o template ideal, estilo e pipeline.
 */
import type { ImageAnalysis, TemplateDecision } from './types.js';

export function decideTemplate(
  analysis: ImageAnalysis,
  textoUsuario: string
): TemplateDecision {
  const { imovel, cores_imagem, copy } = analysis;
  const textoLower = textoUsuario.toLowerCase();

  // Detectar luxury_level
  let luxuryLevel: 'standard' | 'premium' | 'ultra' = 'standard';
  const luxuryKeywords = ['luxo', 'exclusivo', 'premium', 'alto padrão', 'cobertura', 'penthouse', 'mansão'];
  if (luxuryKeywords.some((k) => textoLower.includes(k))) luxuryLevel = 'ultra';
  else if (['alta'].includes(imovel.qualidade_foto) && imovel.contraste === 'alto') luxuryLevel = 'premium';

  // Detectar campaign_goal
  let campaignGoal = 'venda';
  const urgencyKeywords = ['últimas', 'ultima', 'urgente', 'desconto', 'oferta', 'promoção'];
  const educativeKeywords = ['dica', 'como', 'aprenda', 'saiba'];
  if (urgencyKeywords.some((k) => textoLower.includes(k))) campaignGoal = 'urgencia';
  else if (educativeKeywords.some((k) => textoLower.includes(k))) campaignGoal = 'educativo';

  // Detectar composition_type
  const compositionType = imovel.tem_pessoa ? 'pessoa_destaque' : 'imovel_foco';

  // ── Regras de decisão ──────────────────────────────────────────────
  const templates: string[] = [];
  let style = 'dark_premium';
  let reason = '';

  // Pessoa + externo + corretor → autoridade
  if (imovel.tem_pessoa && imovel.ambiente === 'externo') {
    templates.push('autoridade_expert');
    style = 'autoridade_expert';
    reason = 'Foto com pessoa em ambiente externo → template de autoridade';
  }
  // Escuro + ultra luxo
  else if (imovel.luminosidade === 'escura' && luxuryLevel === 'ultra') {
    templates.push('dark_premium', 'luxo_dourado');
    style = 'dark_premium';
    reason = 'Foto escura + alto luxo → dark premium';
  }
  // Alta qualidade + interno + alto contraste
  else if (imovel.qualidade_foto === 'alta' && imovel.ambiente === 'interno' && imovel.contraste === 'alto') {
    templates.push('expert_photoshop', 'ia_express');
    style = 'expert_photoshop';
    reason = 'Foto alta qualidade + interno + contraste → expert/express';
  }
  // Urgência
  else if (campaignGoal === 'urgencia') {
    templates.push('ia_express');
    style = 'ia_express';
    reason = 'Texto com urgência → ia_express';
  }
  // Educativo
  else if (campaignGoal === 'educativo') {
    templates.push('ia_imobiliario');
    style = 'ia_imobiliario';
    reason = 'Texto educativo → ia_imobiliario';
  }
  // Default
  else {
    templates.push('dark_premium');
    style = 'dark_premium';
    reason = 'Default → dark_premium';
  }

  // Sempre adicionar fallbacks
  if (!templates.includes('dark_premium')) templates.push('dark_premium');
  if (!templates.includes('ia_express')) templates.push('ia_express');

  return {
    image_type: imovel.tipo,
    campaign_goal: campaignGoal,
    luxury_level: luxuryLevel,
    composition_type: compositionType,
    recommended_templates: templates,
    recommended_style: style,
    recommended_copy_mode: 'ia',
    recommended_pipeline: {
      analise_claude: true,
      reestilizacao_flux: false,
      composicao_shotstack: true,
    },
    decision_reason: reason,
  };
}
