import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Layers3, ShieldCheck } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

const TenantWorkspaceCard = () => {
  const { data } = useWorkspace();
  const workspace = data?.workspace;
  const membership = data?.membership;

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-accent text-accent-foreground">Workspace ativo</Badge>
              <Badge variant="outline">Base multi-tenant</Badge>
              {workspace?.plan && <Badge variant="outline">Plano {workspace.plan.toUpperCase()}</Badge>}
              {membership?.role && <Badge variant="outline">Role {membership.role}</Badge>}
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground">
              {workspace?.name || "Operação principal: IMOBCREATOR"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {workspace
                ? `Slug: ${workspace.slug} • Estruture marcas, usuários, templates e fluxos com visão de workspace.`
                : "Estruture marcas, usuários, templates e fluxos com visão de workspace para evoluir de operação individual para time e imobiliária."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <Building2 className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium text-foreground">Tenant / marca</p>
              <p className="text-xs text-muted-foreground mt-1">Isolamento visual e operacional</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <Users className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium text-foreground">Papéis</p>
              <p className="text-xs text-muted-foreground mt-1">Corretor, gestor e operação</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <Layers3 className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium text-foreground">Templates</p>
              <p className="text-xs text-muted-foreground mt-1">Padronização por workspace</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <ShieldCheck className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium text-foreground">Governança</p>
              <p className="text-xs text-muted-foreground mt-1">Aprovação antes de publicar</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantWorkspaceCard;
