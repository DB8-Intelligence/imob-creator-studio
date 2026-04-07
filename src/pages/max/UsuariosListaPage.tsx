/**
 * UsuariosListaPage.tsx — Gestão de Equipe (MAX)
 *
 * Grid de membros + convidar + permissões granulares + créditos por membro.
 */
import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCog, Plus, Mail, Shield, Building2, Users, BarChart3,
  Pause, Trash2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string; nome: string; email: string; cargo: string;
  status: "ativo" | "pendente" | "suspenso"; ultimoAcesso: string | null;
  imoveis: number; leads: number; posts: number;
  creditsLimit: number; creditsUsed: number;
}

const MOCK_MEMBERS: TeamMember[] = [
  { id: "m1", nome: "Douglas (Você)", email: "douglas@db8.com.br", cargo: "Admin", status: "ativo", ultimoAcesso: "2026-04-05T11:00:00Z", imoveis: 12, leads: 8, posts: 24, creditsLimit: 0, creditsUsed: 0 },
  { id: "m2", nome: "Janaína Silva", email: "janaina@email.com", cargo: "Corretor", status: "ativo", ultimoAcesso: "2026-04-05T09:30:00Z", imoveis: 5, leads: 12, posts: 8, creditsLimit: 200, creditsUsed: 145 },
  { id: "m3", nome: "Pedro Costa", email: "pedro@email.com", cargo: "Captador", status: "ativo", ultimoAcesso: "2026-04-04T16:00:00Z", imoveis: 8, leads: 3, posts: 2, creditsLimit: 100, creditsUsed: 32 },
  { id: "m4", nome: "Camila Rocha", email: "camila@email.com", cargo: "Assistente", status: "pendente", ultimoAcesso: null, imoveis: 0, leads: 0, posts: 0, creditsLimit: 50, creditsUsed: 0 },
];

const STATUS_CFG = {
  ativo: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-500", dot: "bg-emerald-500" },
  pendente: { label: "Pendente", color: "bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
  suspenso: { label: "Suspenso", color: "bg-red-500/10 text-red-500", dot: "bg-red-500" },
};

const PERMISSIONS = [
  { id: "ver_leads", label: "Ver Leads" },
  { id: "editar_leads", label: "Editar Leads" },
  { id: "ver_imoveis", label: "Ver Imóveis" },
  { id: "cadastrar_imoveis", label: "Cadastrar Imóveis" },
  { id: "gerar_criativos", label: "Gerar Criativos" },
  { id: "ver_financeiro", label: "Ver Financeiro" },
  { id: "ver_relatorios", label: "Ver Relatórios" },
  { id: "gerenciar_automacoes", label: "Gerenciar Automações" },
  { id: "acessar_agentes", label: "Acessar Agentes de IA" },
  { id: "admin", label: "Admin (todas)" },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "Nunca acessou";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "Agora";
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UsuariosListaPage() {
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1100px]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Minha Equipe</h1>
              <p className="text-sm text-muted-foreground">{MOCK_MEMBERS.filter((m) => m.status === "ativo").length} membros ativos</p>
            </div>
          </div>
          <Button onClick={() => setInviteOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />Convidar Membro
          </Button>
        </div>

        {/* Members grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {MOCK_MEMBERS.map((member) => {
            const stCfg = STATUS_CFG[member.status];
            const creditPct = member.creditsLimit > 0 ? Math.round((member.creditsUsed / member.creditsLimit) * 100) : 0;
            const isAdmin = member.cargo === "Admin";

            return (
              <Card key={member.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
                      {getInitials(member.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-sm">{member.nome}</p>
                        <Badge variant="outline" className={cn("text-[10px]", stCfg.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1", stCfg.dot)} />{stCfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{member.cargo}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{timeAgo(member.ultimoAcesso)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center rounded-lg bg-muted/50 py-2">
                      <p className="text-lg font-bold text-foreground">{member.imoveis}</p>
                      <p className="text-[9px] text-muted-foreground">Imóveis</p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/50 py-2">
                      <p className="text-lg font-bold text-foreground">{member.leads}</p>
                      <p className="text-[9px] text-muted-foreground">Leads</p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/50 py-2">
                      <p className="text-lg font-bold text-foreground">{member.posts}</p>
                      <p className="text-[9px] text-muted-foreground">Posts</p>
                    </div>
                  </div>

                  {/* Credits */}
                  {member.creditsLimit > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Créditos IA</span>
                        <span>{member.creditsUsed}/{member.creditsLimit}</span>
                      </div>
                      <Progress value={creditPct} className="h-1.5" />
                    </div>
                  )}

                  {/* Actions */}
                  {!isAdmin && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-7"><Shield className="w-3 h-3 mr-1" />Permissões</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-500" title="Suspender"><Pause className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Remover"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Convidar Membro</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>E-mail</Label><Input type="email" placeholder="email@exemplo.com" /></div>
            <div><Label>Cargo</Label>
              <Select defaultValue="corretor"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="corretor">Corretor</SelectItem>
                <SelectItem value="assistente">Assistente</SelectItem>
                <SelectItem value="captador">Captador</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent></Select>
            </div>
            <div>
              <Label className="mb-2 block">Permissões</Label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="rounded" defaultChecked={p.id === "ver_leads" || p.id === "ver_imoveis"} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>Limite de créditos IA/mês</Label><Input type="number" defaultValue="100" placeholder="100" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground" onClick={() => { setInviteOpen(false); toast({ title: "Convite enviado!" }); }}>
              <Mail className="w-4 h-4 mr-2" />Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
