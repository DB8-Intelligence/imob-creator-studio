import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, Mail, Users, CalendarDays, Home, TrendingUp,
  UserPlus, Building2, BarChart3,
} from "lucide-react";

interface CRMStats {
  unreadLeads: number;
  unattendedLeads: number;
  pendingAttendances: number;
  activeClients: number;
  clientsThisMonth: number;
  activeProperties: number;
  propertiesThisMonth: number;
  appointmentsToday: number;
  appointmentsTomorrow: number;
}

export function CRMDashboardWidgets() {
  const [stats, setStats] = useState<CRMStats>({
    unreadLeads: 0, unattendedLeads: 0, pendingAttendances: 0,
    activeClients: 0, clientsThisMonth: 0,
    activeProperties: 0, propertiesThisMonth: 0,
    appointmentsToday: 0, appointmentsTomorrow: 0,
  });

  useEffect(() => {
    async function load() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      const [leads, clients, properties, appointments] = await Promise.all([
        supabase.from("leads").select("status, read_at", { count: "exact" }),
        supabase.from("clients").select("created_at, status", { count: "exact" }),
        supabase.from("properties").select("created_at, status", { count: "exact" }),
        supabase.from("appointments").select("scheduled_at"),
      ]);

      const leadsData = (leads.data ?? []) as { status: string; read_at: string | null }[];
      const clientsData = (clients.data ?? []) as { created_at: string; status: string }[];
      const propsData = (properties.data ?? []) as { created_at: string; status: string }[];
      const apptData = (appointments.data ?? []) as { scheduled_at: string }[];

      setStats({
        unreadLeads: leadsData.filter((l) => !l.read_at).length,
        unattendedLeads: leadsData.filter((l) => l.status === "new").length,
        pendingAttendances: 0,
        activeClients: clientsData.filter((c) => c.status === "active").length,
        clientsThisMonth: clientsData.filter((c) => c.created_at >= monthStart).length,
        activeProperties: propsData.filter((p) => p.status === "active").length,
        propertiesThisMonth: propsData.filter((p) => p.created_at >= monthStart).length,
        appointmentsToday: apptData.filter((a) =>
          new Date(a.scheduled_at).toDateString() === today.toDateString()
        ).length,
        appointmentsTomorrow: apptData.filter((a) =>
          new Date(a.scheduled_at).toDateString() === tomorrow.toDateString()
        ).length,
      });
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(stats.unreadLeads > 0 || stats.unattendedLeads > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {stats.unreadLeads > 0 && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm"><strong>{stats.unreadLeads}</strong> leads não lidos</span>
              </div>
            )}
            {stats.unattendedLeads > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                <span className="text-sm"><strong>{stats.unattendedLeads}</strong> não atendidos</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.appointmentsToday}</p>
            <p className="text-xs text-gray-500">Compromissos hoje</p>
            {stats.appointmentsTomorrow > 0 && (
              <Badge variant="secondary" className="text-[10px] mt-1">+{stats.appointmentsTomorrow} amanhã</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Home className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.activeProperties}</p>
            <p className="text-xs text-gray-500">Imóveis ativos</p>
            <Badge variant="secondary" className="text-[10px] mt-1">+{stats.propertiesThisMonth} este mês</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.activeClients}</p>
            <p className="text-xs text-gray-500">Clientes ativos</p>
            <Badge variant="secondary" className="text-[10px] mt-1">+{stats.clientsThisMonth} este mês</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.unreadLeads + stats.unattendedLeads}</p>
            <p className="text-xs text-gray-500">Leads pendentes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
