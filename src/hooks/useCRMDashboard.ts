import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCRMDashboard() {
  const [stats, setStats] = useState({
    leadsUnread:        0,
    leadsUnattended:    0,
    attendancesPending: 0,
    propertiesActive:   0,
    clientsActive:      0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: unread },
        { count: unattended },
        { count: pending },
        { count: properties },
        { count: clients },
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['new', 'read']),
        supabase.from('attendances').select('*', { count: 'exact', head: true })
          .not('stage', 'in', '("finished","canceled")'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        leadsUnread:        unread ?? 0,
        leadsUnattended:    unattended ?? 0,
        attendancesPending: pending ?? 0,
        propertiesActive:   properties ?? 0,
        clientsActive:      clients ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return { stats, loading };
}
