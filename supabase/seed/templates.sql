-- Seed: 6 templates iniciais do Creative Engine
-- Executar via: supabase db push (ou psql)

INSERT INTO public.creative_templates (id, nome, descricao, categoria, tags, tipos, config_visual, shotstack_template, prompt_flux, pipeline_config, badge_label, badge_tipo, ativo, ordem_exibicao, creditos)
VALUES

-- 1. Dark Premium
('dark_premium', 'Dark Premium', 'Fundo escuro elegante com detalhes luminosos em destaque', 'Imobiliário',
 ARRAY['luxo','alto padrão','cobertura','penthouse','exclusivo'],
 ARRAY['post','story','reels'],
 '{"overlay":{"lateral":"linear-gradient(to right, {{overlay_rgba_95}} 0%, {{overlay_rgba_60}} 40%, transparent 70%)","inferior":"linear-gradient(to top, {{overlay_rgba_95}} 0%, {{overlay_rgba_60}} 20%, transparent 45%)"},"tipografia":{"titulo":{"fonte":"Playfair Display","peso":800,"tamanho_post":72,"tamanho_story":56,"cor":"{{cor_primaria}}","transform":"uppercase","tracking":"-1.5px","linha_altura":0.92},"subtitulo":{"fonte":"Inter","peso":300,"tamanho_post":16,"tamanho_story":14,"cor":"{{cor_texto_corpo}}","linha_altura":1.5},"cta":{"fonte":"Inter","peso":500,"tamanho":15,"cor":"#FFFFFF"},"badge":{"fonte":"Inter","peso":600,"tamanho":10,"cor":"{{cor_accent}}","transform":"uppercase","tracking":"2px"}}}'::jsonb,
 '{"timeline":{"background":"{{cor_fundo}}","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover","position":"{{posicao_foto_background}}"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:{{overlay_css_lateral}}''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:{{overlay_css_inferior}}''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"html","html":"<div style=''font-size:10px;font-weight:600;background:{{cor_accent_12}};border:1px solid {{cor_accent_40}};border-radius:3px;padding:3px 9px;color:{{cor_accent}};letter-spacing:2px;text-transform:uppercase;font-family:Inter,sans-serif;white-space:nowrap''>{{badge_texto}}</div>","width":200,"height":32},"start":0,"length":5,"position":"topRight","offset":{"x":-0.05,"y":-0.44}}]},{"clips":[{"asset":{"type":"title","text":"{{titulo_linha1}}\n{{titulo_linha2}}","style":"minimal","color":"{{cor_primaria}}","size":"xx-large"},"start":0,"length":5,"position":"topLeft","offset":{"x":0.07,"y":-0.35}}]},{"clips":[{"asset":{"type":"title","text":"{{subtitulo}}","style":"minimal","color":"#E8DCCA","size":"small"},"start":0,"length":5,"position":"topLeft","offset":{"x":0.07,"y":-0.13}}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:linear-gradient(135deg,{{cor_secundaria}},{{cor_primaria}});border:1.5px solid {{cor_accent_40}};border-radius:50px;padding:11px 0;color:#fff;font-family:Inter,sans-serif;font-weight:500;font-size:15px;text-align:center;width:100%''>{{cta_texto}}</div>","width":340,"height":48},"start":0,"length":5,"position":"bottom","offset":{"x":0,"y":0.12}}]},{"clips":[{"asset":{"type":"image","src":"{{logo_url}}"},"start":0,"length":5,"position":"bottomRight","offset":{"x":-0.05,"y":0.04},"scale":0.15}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 'Recomendado', 'recomendado', true, 1, 1),

-- 2. IA Express
('ia_express', 'IA Express', 'Geração rápida com IA para campanhas de urgência', 'Imobiliário',
 ARRAY['urgente','rápido','oferta','promoção','campanha'],
 ARRAY['post','story','reels'],
 '{"overlay":{"lateral":"linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.50) 35%, transparent 65%)","inferior":"linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.50) 25%, transparent 50%)"}}'::jsonb,
 '{"timeline":{"background":"#000000","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.50) 35%, transparent 65%);''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"title","text":"{{titulo_completo}}","style":"blockbuster","color":"#FFFFFF","size":"x-large"},"start":0,"length":5,"position":"left","offset":{"x":0.06,"y":0.05}}]},{"clips":[{"asset":{"type":"title","text":"{{subtitulo}}","style":"minimal","color":"#CCCCCC","size":"small"},"start":0,"length":5,"position":"left","offset":{"x":0.06,"y":-0.08}}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:#EF4444;border-radius:8px;padding:10px 24px;color:#fff;font-family:Inter,sans-serif;font-weight:700;font-size:14px;text-align:center''>{{cta_texto}}</div>","width":280,"height":44},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.10}}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 'Novo', 'novo', true, 2, 1),

-- 3. Expert Photoshop (Glass Morphism)
('expert_photoshop', 'Expert Photoshop', 'Glass morphism com overlay translúcido sofisticado', 'Imobiliário',
 ARRAY['glass','moderno','minimalista','clean','sofisticado'],
 ARRAY['post','story','reels'],
 '{"overlay":{"lateral":"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"}}'::jsonb,
 '{"timeline":{"background":"#0A0A0A","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:rgba(0,0,0,0.40);backdrop-filter:blur(2px)''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:rgba(255,255,255,0.10);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.20);border-radius:16px;padding:32px;color:#fff;font-family:Inter,sans-serif''><h2 style=''font-size:28px;font-weight:700;margin:0 0 8px''>{{titulo_completo}}</h2><p style=''font-size:14px;opacity:0.8;margin:0''>{{subtitulo}}</p></div>","width":480,"height":200},"start":0,"length":5,"position":"center","offset":{"x":-0.15,"y":0}}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:{{cor_primaria}};border-radius:12px;padding:12px 32px;color:#fff;font-family:Inter,sans-serif;font-weight:600;font-size:14px;text-align:center''>{{cta_texto}}</div>","width":240,"height":44},"start":0,"length":5,"position":"bottom","offset":{"x":0,"y":0.08}}]},{"clips":[{"asset":{"type":"image","src":"{{logo_url}}"},"start":0,"length":5,"position":"topLeft","offset":{"x":0.04,"y":-0.04},"scale":0.12}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 NULL, NULL, true, 3, 1),

-- 4. Imobiliário Top
('imobiliario_top', 'Imobiliário Top', 'Design profissional clássico para corretores estabelecidos', 'Imobiliário',
 ARRAY['profissional','corretor','clássico','confiável','institucional'],
 ARRAY['post','story','reels'],
 '{"overlay":{"inferior":"linear-gradient(to top, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.60) 30%, transparent 55%)"}}'::jsonb,
 '{"timeline":{"background":"#1A1A2E","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:linear-gradient(to top, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.60) 30%, transparent 55%)''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"title","text":"{{titulo_completo}}","style":"minimal","color":"#FFFFFF","size":"x-large"},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.22}}]},{"clips":[{"asset":{"type":"title","text":"{{subtitulo}}","style":"minimal","color":"#AAAAAA","size":"small"},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.13}}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:#3B82F6;border-radius:8px;padding:10px 28px;color:#fff;font-family:Inter,sans-serif;font-weight:600;font-size:14px;text-align:center''>{{cta_texto}}</div>","width":260,"height":44},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.04}}]},{"clips":[{"asset":{"type":"image","src":"{{logo_url}}"},"start":0,"length":5,"position":"topRight","offset":{"x":-0.04,"y":-0.04},"scale":0.14}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 'Popular', 'popular', true, 4, 1),

-- 5. IA Imobiliário
('ia_imobiliario', 'IA Imobiliário', 'Template educativo e informativo para conteúdo de valor', 'Imobiliário',
 ARRAY['educativo','dicas','informativo','conteúdo','blog'],
 ARRAY['post','story'],
 '{"overlay":{"inferior":"linear-gradient(to top, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.50) 35%, transparent 60%)"}}'::jsonb,
 '{"timeline":{"background":"#0F172A","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:linear-gradient(to top, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.50) 35%, transparent 60%)''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"html","html":"<div style=''background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.30);border-radius:6px;padding:4px 12px;color:#60A5FA;font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase''>{{badge_texto}}</div>","width":180,"height":28},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.28}}]},{"clips":[{"asset":{"type":"title","text":"{{titulo_completo}}","style":"minimal","color":"#FFFFFF","size":"large"},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.15}}]},{"clips":[{"asset":{"type":"title","text":"{{subtitulo}}","style":"minimal","color":"#94A3B8","size":"x-small"},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.06,"y":0.06}}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 NULL, NULL, true, 5, 1),

-- 6. Clássico Elegante
('classico_elegante', 'Clássico Elegante', 'Design clássico com tipografia serif e tons neutros', 'Imobiliário',
 ARRAY['clássico','elegante','serif','neutro','tradicional'],
 ARRAY['post','story','reels'],
 '{"overlay":{"lateral":"linear-gradient(to right, rgba(44,41,37,0.88) 0%, rgba(44,41,37,0.55) 45%, transparent 75%)","inferior":"linear-gradient(to top, rgba(44,41,37,0.92) 0%, rgba(44,41,37,0.55) 25%, transparent 50%)"}}'::jsonb,
 '{"timeline":{"background":"#2C2925","tracks":[{"clips":[{"asset":{"type":"image","src":"{{imagem_url}}"},"start":0,"length":5,"fit":"cover","position":"{{posicao_foto_background}}"}]},{"clips":[{"asset":{"type":"html","html":"<div style=''width:100%;height:100%;background:linear-gradient(to right, rgba(44,41,37,0.88) 0%, rgba(44,41,37,0.55) 45%, transparent 75%)''></div>","width":"{{largura}}","height":"{{altura}}"},"start":0,"length":5}]},{"clips":[{"asset":{"type":"title","text":"{{titulo_linha1}}\n{{titulo_linha2}}","style":"minimal","color":"#D4C5A9","size":"xx-large"},"start":0,"length":5,"position":"topLeft","offset":{"x":0.07,"y":-0.30}}]},{"clips":[{"asset":{"type":"title","text":"{{subtitulo}}","style":"minimal","color":"rgba(212,197,169,0.70)","size":"small"},"start":0,"length":5,"position":"topLeft","offset":{"x":0.07,"y":-0.10}}]},{"clips":[{"asset":{"type":"html","html":"<div style=''border:1.5px solid rgba(212,197,169,0.40);border-radius:4px;padding:10px 28px;color:#D4C5A9;font-family:Inter,sans-serif;font-weight:500;font-size:13px;text-align:center;letter-spacing:1px''>{{cta_texto}}</div>","width":260,"height":42},"start":0,"length":5,"position":"bottomLeft","offset":{"x":0.07,"y":0.10}}]},{"clips":[{"asset":{"type":"image","src":"{{logo_url}}"},"start":0,"length":5,"position":"bottomRight","offset":{"x":-0.05,"y":0.04},"scale":0.13}]}]}}'::jsonb,
 '{}'::jsonb,
 '{"analise_claude":true,"reestilizacao_flux":false,"composicao_shotstack":true}'::jsonb,
 NULL, NULL, true, 6, 1)

ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  config_visual = EXCLUDED.config_visual,
  shotstack_template = EXCLUDED.shotstack_template,
  pipeline_config = EXCLUDED.pipeline_config,
  updated_at = NOW();
