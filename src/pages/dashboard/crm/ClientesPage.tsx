/**
 * ClientesPage.tsx — CRM Clients (upgraded)
 * Route: /dashboard/crm/clientes
 * Delegates to the full CRM Clientes module.
 */
import AppLayout from "@/components/app/AppLayout";
import CrmClientes from "@/pages/CrmClientes";

export default function ClientesPage() {
  return (
    <AppLayout>
      <CrmClientes />
    </AppLayout>
  );
}
