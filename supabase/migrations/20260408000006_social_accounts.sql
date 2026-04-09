-- Social accounts for Instagram/Facebook publishing via Meta Graph API

CREATE TABLE public.social_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  platform        text NOT NULL CHECK (platform IN ('instagram','facebook')),
  account_id      text NOT NULL,
  account_name    text,
  account_picture text,
  access_token    text NOT NULL,
  token_expires_at timestamptz,
  profile_slot    int NOT NULL DEFAULT 1,
  status          text DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  UNIQUE(workspace_id, platform, profile_slot)
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_owner_manages_accounts"
  ON public.social_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

-- Scheduled posts queue
CREATE TABLE public.scheduled_posts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  creative_id       uuid REFERENCES public.creatives_gallery(id) ON DELETE CASCADE,
  platform          text NOT NULL CHECK (platform IN ('instagram','facebook','both')),
  social_account_id uuid REFERENCES public.social_accounts(id),
  caption           text,
  hashtags          text,
  format            text DEFAULT 'feed' CHECK (format IN ('feed','story','reel')),
  scheduled_at      timestamptz NOT NULL,
  status            text DEFAULT 'pending'
                    CHECK (status IN ('pending','publishing','published','failed')),
  platform_post_id  text,
  error_message     text,
  published_at      timestamptz,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_owner_manages_posts"
  ON public.scheduled_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );
