CREATE TABLE public.workspace_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role            text NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner','admin','member')),
  allowed_modules text[],  -- null = acesso a todos os módulos ativos
  invited_at      timestamptz DEFAULT now(),
  accepted_at     timestamptz,
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_manages_members"
  ON public.workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "member_reads_own_membership"
  ON public.workspace_members FOR SELECT
  USING (user_id = auth.uid());
