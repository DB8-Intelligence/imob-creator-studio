import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

const checks = [
  "validar workspace_id na API principal",
  "confirmar membership ativo do usuário",
  "validar role para ações de escrita/administração",
  "impedir acesso cruzado entre workspaces",
  "registrar auditoria por workspace e user",
];

const BackendEnforcementCard = () => {
  const { workspaceId, workspaceRole } = useWorkspaceContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          Contrato de enforcement do backend
        </CardTitle>
        <CardDescription>
          Checklist operacional para o Railway/API principal respeitar workspace e role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">workspace_id: {workspaceId || "pendente"}</Badge>
          <Badge variant="outline">role: {workspaceRole || "pendente"}</Badge>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {checks.map((item) => (
            <li key={item} className="rounded-lg border border-border/60 px-3 py-2 bg-muted/30">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default BackendEnforcementCard;
