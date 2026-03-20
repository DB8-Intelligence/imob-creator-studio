import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";

const mockMembers = [
  { name: "Douglas", email: "owner@workspace.local", role: "owner", status: "active" },
  { name: "Operação", email: "operacao@workspace.local", role: "editor", status: "planned" },
  { name: "Gestão", email: "gestao@workspace.local", role: "admin", status: "planned" },
];

const WorkspaceMembersCard = () => {
  const { workspaceRole } = useWorkspaceContext();
  const canManage = ["owner", "admin"].includes(workspaceRole || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Membros e papéis
        </CardTitle>
        <CardDescription>
          Estrutura inicial para membership management e governança por role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-[1fr,160px,auto] gap-3 items-end">
          <div>
            <Label htmlFor="invite-email">Convidar membro</Label>
            <Input id="invite-email" placeholder="email@empresa.com" className="mt-1" disabled={!canManage} />
          </div>
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <Input id="invite-role" placeholder="admin / editor" className="mt-1" disabled={!canManage} />
          </div>
          <Button disabled={!canManage}>
            <Plus className="w-4 h-4 mr-2" />
            Convidar
          </Button>
        </div>

        <div className="space-y-3">
          {mockMembers.map((member) => (
            <div key={member.email} className="rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{member.role}</Badge>
                <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          Próximo passo: listar membros reais de <code>workspace_memberships</code>, enviar convites e trocar role com enforcement no backend.
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceMembersCard;
