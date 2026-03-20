import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Save } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

const WorkspaceSettingsCard = () => {
  const { workspaceName, workspaceSlug, workspacePlan, workspaceRole } = useWorkspaceContext();
  const [name, setName] = useState(workspaceName || "");
  const [slug, setSlug] = useState(workspaceSlug || "");

  const canEdit = useMemo(() => ["owner", "admin"].includes(workspaceRole || ""), [workspaceRole]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Workspace ativo
        </CardTitle>
        <CardDescription>
          Base para gestão do tenant, branding e governança operacional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Plano {workspacePlan?.toUpperCase() || "N/D"}</Badge>
          <Badge variant="outline">Role {workspaceRole || "N/D"}</Badge>
          {canEdit ? <Badge className="bg-accent text-accent-foreground">Pode editar</Badge> : <Badge variant="secondary">Somente leitura</Badge>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workspace-name">Nome do workspace</Label>
            <Input id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="workspace-slug">Slug</Label>
            <Input id="workspace-slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" disabled={!canEdit} />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          Nesta sprint, a UI de workspace foi preparada. O próximo passo é ligar salvar/editar no backend Railway + Supabase com enforcement por membership.
        </div>

        <Button disabled={!canEdit}>
          <Save className="w-4 h-4 mr-2" />
          Salvar workspace
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkspaceSettingsCard;
