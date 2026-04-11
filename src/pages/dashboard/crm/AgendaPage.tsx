/**
 * AgendaPage.tsx — CRM Agenda (upgraded)
 * Route: /dashboard/crm/agenda
 * Delegates to the full CRM Agenda module.
 */
import AppLayout from "@/components/app/AppLayout";
import CrmAgenda from "@/pages/CrmAgenda";

export default function AgendaPage() {
  return (
    <AppLayout>
      <CrmAgenda />
    </AppLayout>
  );
}
