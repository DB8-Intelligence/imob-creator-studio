import AppLayout from "@/components/app/AppLayout";
import { useSite } from "@/hooks/useCorretorSite";
import { SiteLeadsManager } from "@/components/site/SiteLeadsManager";
import { Loader2, Users } from "lucide-react";

export default function SiteLeads() {
  const { data: site, isLoading } = useSite();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Leads do Site</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os contatos recebidos através do seu site imobiliário
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <SiteLeadsManager siteId={site?.id} />
        )}
      </div>
    </AppLayout>
  );
}
