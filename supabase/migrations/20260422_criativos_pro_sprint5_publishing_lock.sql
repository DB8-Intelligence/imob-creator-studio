-- Criativos Pro — Sprint 5: estado intermediário `publishing` pra lock atômico.
--
-- Problema: se corretor clica "Aprovar" no dashboard E responde 👍 no Zap
-- quase simultaneamente, ambos fluxos atualizam status='approved' e disparam
-- criativos-publish em paralelo. Sem lock, a Graph API pode publicar 2x.
--
-- Solução: estado intermediário `publishing`. criativos-publish faz
--   UPDATE creatives_gallery SET status='publishing'
--     WHERE id=? AND status='approved'
--     RETURNING id;
-- Se não retorna linha, outro processo já pegou → abort.

ALTER TABLE public.creatives_gallery
  DROP CONSTRAINT IF EXISTS creatives_gallery_status_check;

ALTER TABLE public.creatives_gallery
  ADD CONSTRAINT creatives_gallery_status_check CHECK (status IN (
    'analyzing',
    'generating',
    'pending_approval',
    'ready',
    'approved',
    'publishing',        -- ⚡ novo: lock transitório entre approved → published
    'rejected',
    'scheduled',
    'published',
    'expired',
    'error'
  ));
