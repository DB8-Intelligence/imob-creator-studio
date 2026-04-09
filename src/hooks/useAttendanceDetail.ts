import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAttendanceDetail(attendanceId: string | null) {
  const [attendance, setAttendance] = useState<Record<string, unknown> | null>(null);
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]       = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!attendanceId) return;
    setLoading(true);

    const [{ data: att }, { data: acts }] = await Promise.all([
      supabase.from('attendances')
        .select('*, lead:leads(*), client:clients(*)')
        .eq('id', attendanceId).maybeSingle(),
      supabase.from('attendance_activities')
        .select('*')
        .eq('attendance_id', attendanceId)
        .order('created_at', { ascending: false }),
    ]);

    setAttendance(att);
    setActivities((acts as Record<string, unknown>[]) ?? []);
    setLoading(false);
  }, [attendanceId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const addActivity = useCallback(async (type: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('attendance_activities').insert({
      attendance_id: attendanceId,
      type,
      content,
      created_by: user?.id,
    });
    if (!error) fetchDetail();
    return !error;
  }, [attendanceId, fetchDetail]);

  return { attendance, activities, loading, fetchDetail, addActivity };
}
