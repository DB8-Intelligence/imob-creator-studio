-- ===========================================================
-- Config de layout do site do corretor: ordem + toggle das secoes.
-- ===========================================================

ALTER TABLE public.corretor_sites
  ADD COLUMN IF NOT EXISTS sections_config JSONB
    DEFAULT '{"order":["hero","imoveis","about","depoimentos","contato","footer"],"enabled":{"hero":true,"imoveis":true,"about":true,"depoimentos":true,"contato":true,"footer":true}}'::jsonb;

COMMENT ON COLUMN public.corretor_sites.sections_config IS
  'Config do layout do site publico: ordem + enabled de cada secao.';
