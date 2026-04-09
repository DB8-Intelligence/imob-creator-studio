import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AttendanceStage =
  | 'waiting' | 'awaiting_return' | 'in_attendance'
  | 'visit_scheduled' | 'proposal' | 'contract'
  | 'finished' | 'canceled';

export interface Attendance {
  id: string;
  lead_id: string | null;
  client_id: string | null;
  assigned_to: string;
  stage: AttendanceStage;
  thermometer: number;
  notes: string | null;
  stage_changed_at: string;
  created_at: string;
  updated_at: string;
  lead?: { name: string; phone: string | null; email: string | null; property_id: string | null };
  client?: { name: string; phone_mobile: string | null };
}

export const STAGES: { key: AttendanceStage; label: string }[] = [
  { key: 'waiting',          label: 'Em espera'          },
  { key: 'awaiting_return',  label: 'Aguardando retorno' },
  { key: 'in_attendance',    label: 'Em atendimento'     },
  { key: 'visit_scheduled',  label: 'Em visita'          },
  { key: 'proposal',         label: 'Em proposta'        },
  { key: 'contract',         label: 'Em contrato'        },
];

export function useAttendances() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendances')
      .select('*, lead:leads(name, phone, email, property_id), client:clients(name, phone_mobile)')
      .not('stage', 'in', '("finished","canceled")')
      .order('stage_changed_at', { ascending: false });

    if (!error) setAttendances(data as Attendance[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAttendances(); }, [fetchAttendances]);

  const updateStage = useCallback(async (id: string, stage: AttendanceStage) => {
    const { error } = await supabase.from('attendances').update({
      stage, stage_changed_at: new Date().toISOString()
    }).eq('id', id);
    if (!error) fetchAttendances();
    return !error;
  }, [fetchAttendances]);

  const byStage = (stage: AttendanceStage) =>
    attendances.filter(a => a.stage === stage);

  const counts = Object.fromEntries(
    STAGES.map(s => [s.key, attendances.filter(a => a.stage === s.key).length])
  ) as Record<AttendanceStage, number>;

  return { attendances, loading, fetchAttendances, updateStage, byStage, counts };
}
