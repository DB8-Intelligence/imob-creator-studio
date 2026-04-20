import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteConfig {
  id?: string;
  workspace_id?: string;
  subdomain?: string;
  custom_domain?: string;
  theme_slug: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  banner_urls: string[];
  company_name?: string;
  creci?: string;
  phone1?: string;
  whatsapp?: string;
  email?: string;
  about_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  show_price: boolean;
  show_address: boolean;
}

const DEFAULTS: SiteConfig = {
  theme_slug: 'brisa',
  primary_color: '#1E3A8A',
  secondary_color: '#F59E0B',
  banner_urls: [],
  show_price: true,
  show_address: true,
};

export function useSiteConfig() {
  const [config, setConfig]   = useState<SiteConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: ws } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    if (!ws) { setLoading(false); return; }

    const { data } = await supabase
      .from('site_config')
      .select('*')
      .eq('workspace_id', ws.id)
      .maybeSingle();

    setConfig(data ? (data as unknown as SiteConfig) : { ...DEFAULTS, workspace_id: ws.id });
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const save = useCallback(async (updates: Partial<SiteConfig>) => {
    setSaving(true);
    const merged = { ...config, ...updates };

    const { data: { user } } = await supabase.auth.getUser();
    const { data: ws } = await supabase
      .from('workspaces').select('id').eq('owner_user_id', user!.id).maybeSingle();

    const { error } = await supabase.from('site_config').upsert({
      ...merged,
      workspace_id: ws!.id,
    } as never, { onConflict: 'workspace_id' });

    if (!error) setConfig(merged);
    setSaving(false);
    return !error;
  }, [config]);

  const generateSEO = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-seo`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: config.company_name,
          about_text: config.about_text,
          city: 'Salvador',
        }),
      }
    );
    return res.json();
  }, [config]);

  return { config, loading, saving, save, fetchConfig, generateSEO };
}
