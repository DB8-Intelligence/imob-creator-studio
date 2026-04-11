/**
 * DashboardCRMPage.tsx — Kanban pipeline (upgraded)
 * Route: /dashboard/crm
 * Delegates to the full CRM Kanban module.
 */
import AppLayout from "@/components/app/AppLayout";
import CrmKanban from "@/pages/CrmKanban";

export default function DashboardCRMPage() {
  return (
    <AppLayout>
      <CrmKanban />
    </AppLayout>
  );
}
