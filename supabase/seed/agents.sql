-- Seed: 5 agentes base hardcoded do pipeline
-- Executar via: supabase db push (ou psql)

INSERT INTO public.agent_registry (slug, name, description, prompt_master, category, pipeline_stage, trigger_mode, input_schema, output_schema, active, version)
VALUES

('image-analyzer-agent', 'Image Analyzer Agent',
 'Analisa imagem do imóvel via Claude Vision. Retorna tipo, ambiente, cores, composição e copy.',
 'Você é o motor de análise visual do ImobCreator. Analise a imagem do imóvel e retorne JSON com: imovel (tipo, ambiente, luminosidade, contraste, posição focal), cores_imagem (dominante, secundária, fundo_sugerido, accent_sugerido, overlays CSS), copy (título, subtítulo, CTA, badge, copy Instagram), composição (layout, overlay, saturação) e prompt_flux.',
 'visual', 'image_analysis', 'always',
 '{"image_url":"string","image_base64":"string (opcional)","texto_bruto":"string","user_profile":"UserBrandProfile"}'::jsonb,
 '{"imovel":"ImovelInfo","cores_imagem":"CoresImagem","copy":"CopyGerado","composicao":"ComposicaoAnalise","prompt_flux":"PromptFluxAnalise"}'::jsonb,
 true, 1),

('copy-generator-agent', 'Copy Generator Agent',
 'Gera copy profissional para criativos imobiliários baseado no texto do usuário e análise da imagem.',
 'Você é um copywriter especializado em marketing imobiliário brasileiro. Gere copy profissional derivado do texto do usuário. Adapte o tom (formal/sofisticado/amigável/urgente/aspiracional) ao perfil. Nunca invente informações — derive tudo do texto_bruto. Gere: título (2 linhas curtas), subtítulo (max 65 chars), CTA (max 4 palavras), badge (max 3 palavras CAPS), copy Instagram (com emojis e hashtags), copy story (curto) e copy WhatsApp.',
 'copy', 'copy_generation', 'always',
 '{"texto_bruto":"string","user_profile":"UserBrandProfile","image_analysis":"ImageAnalysis"}'::jsonb,
 '{"titulo_linha1":"string","titulo_linha2":"string","subtitulo":"string","cta_texto":"string","badge_texto":"string","copy_instagram":"string","copy_story":"string","copy_whatsapp":"string"}'::jsonb,
 true, 1),

('color-extractor-agent', 'Color Extractor Agent',
 'Extrai cores da logomarca ou imagem do imóvel e resolve a paleta final.',
 'Você resolve a paleta de cores para criativos imobiliários. Prioridade: 1) Se o usuário tem logo com cores cadastradas → usar cores da marca. 2) Senão → extrair cores da imagem. Gere overlays RGBA com intensidade adequada, accents com contraste WCAG AA ≥ 4.5:1, e CSS gradients para lateral e inferior.',
 'branding', 'branding_analysis', 'always',
 '{"user_profile":"UserBrandProfile","image_analysis":"ImageAnalysis"}'::jsonb,
 '{"primaria":"string","secundaria":"string","fundo":"string","overlay_rgba":"string","accent":"string","fonte":"marca|imagem"}'::jsonb,
 true, 1),

('template-selector-agent', 'Template Selector Agent',
 'Decide o melhor template com base na análise da imagem e texto do usuário.',
 'Você é um classificador de templates para criativos imobiliários. Regras: pessoa+externo→autoridade, escuro+luxo→dark_premium, alta qualidade+interno→expert_photoshop, urgência→ia_express, educativo→ia_imobiliario. Retorne lista ordenada de templates recomendados com razão.',
 'template_decision', 'template_decision', 'conditional',
 '{"image_analysis":"ImageAnalysis","texto_bruto":"string"}'::jsonb,
 '{"recommended_templates":"string[]","recommended_style":"string","luxury_level":"standard|premium|ultra","decision_reason":"string"}'::jsonb,
 true, 1),

('composition-builder-agent', 'Composition Builder Agent',
 'Monta o JSON de composição Shotstack a partir do template + variáveis resolvidas.',
 'Você monta a composição visual final do criativo. Interpole todas as variáveis {{}} no template Shotstack. Ajuste dimensões por formato (post 1080x1350, story/reels 1080x1920). A imagem original é sempre a camada de fundo — nunca modifique a foto. Toda estilização é overlay, tipografia e elementos sobre ela.',
 'composicao', 'composition', 'always',
 '{"template":"TemplateConfig","vars":"PipelineVars","formato":"post|story|reels"}'::jsonb,
 '{"shotstack_json":"object","output_size":"object"}'::jsonb,
 true, 1)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  prompt_master = EXCLUDED.prompt_master,
  updated_at = NOW();

-- Insert initial versions
INSERT INTO public.agent_versions (agent_id, version, prompt_master)
SELECT id, 1, prompt_master FROM public.agent_registry
WHERE slug IN ('image-analyzer-agent','copy-generator-agent','color-extractor-agent','template-selector-agent','composition-builder-agent')
ON CONFLICT DO NOTHING;

-- Insert bindings (all agents bound to 'both' flow types)
INSERT INTO public.agent_bindings (agent_id, flow_type, stage_name, execution_order)
SELECT id, 'both', pipeline_stage,
  CASE slug
    WHEN 'image-analyzer-agent' THEN 1
    WHEN 'color-extractor-agent' THEN 2
    WHEN 'template-selector-agent' THEN 3
    WHEN 'copy-generator-agent' THEN 4
    WHEN 'composition-builder-agent' THEN 5
  END
FROM public.agent_registry
WHERE slug IN ('image-analyzer-agent','copy-generator-agent','color-extractor-agent','template-selector-agent','composition-builder-agent')
ON CONFLICT DO NOTHING;
