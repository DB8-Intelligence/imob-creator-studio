import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const PORTAIS_CONFIG = [
  { slug: 'zap',         name: 'Grupo ZAP',      logo: '🏠', active_default: true  },
  { slug: 'olx',         name: 'OLX',             logo: '🟠', active_default: true  },
  { slug: 'vivareal',    name: 'Viva Real',        logo: '🔵', active_default: true  },
  { slug: 'imovelweb',   name: 'ImovelWeb',        logo: '🌐', active_default: true  },
  { slug: 'chavesnamao', name: 'Chaves na Mão',    logo: '🔑', active_default: false },
  { slug: 'mitula',      name: 'Mitula',           logo: '📍', active_default: false },
  { slug: 'trovit',      name: 'Trovit',           logo: '🔍', active_default: false },
  { slug: 'quercasa',    name: 'QuerCasa',         logo: '🏡', active_default: false },
];

export function usePortais() {
  const [stats, setStats]     = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('property_portals')
        .select('portal_slug')
        .eq('status', 'sent');

      const counts: Record<string, number> = {};
      ((data as { portal_slug: string }[]) ?? []).forEach((row) => {
        counts[row.portal_slug] = (counts[row.portal_slug] ?? 0) + 1;
      });
      setStats(counts);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const getXmlUrl = useCallback((portalSlug: string, workspaceSlug: string) => {
    return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-xml-feed?workspace=${workspaceSlug}&portal=${portalSlug}`;
  }, []);

  return { stats, loading, getXmlUrl, PORTAIS_CONFIG };
}
