import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CRMLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  source_detail: string | null;
  status: 'new' | 'read' | 'in_attendance' | 'archived';
  assigned_to: string | null;
  read_at: string | null;
  created_at: string;
  property_id: string | null;
}

export function useCRMLeads(filter: 'all' | 'new' | 'unread' | 'unattended' = 'all') {
  const [leads, setLeads]     = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter === 'new' || filter === 'unread') {
      query = query.eq('status', 'new');
    } else if (filter === 'unattended') {
      query = query.in('status', ['new', 'read']);
    }

    const { data, count, error } = await query;
    if (!error) {
      setLeads(data as CRMLead[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('leads').update({
      status: 'read', read_at: new Date().toISOString()
    }).eq('id', id);
    fetchLeads();
  }, [fetchLeads]);

  const startAttendance = useCallback(async (leadId: string, assignedTo: string) => {
    const { data: attendance } = await supabase.from('attendances').insert({
      lead_id: leadId,
      assigned_to: assignedTo,
      stage: 'in_attendance',
    }).select().maybeSingle();

    await supabase.from('leads').update({ status: 'in_attendance' }).eq('id', leadId);
    fetchLeads();
    return attendance;
  }, [fetchLeads]);

  return { leads, loading, total, fetchLeads, markAsRead, startAttendance };
}
