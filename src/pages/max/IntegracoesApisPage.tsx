/**
 * IntegracoesApisPage.tsx — Integrações (MAX)
 *
 * Grid de integrações disponíveis + webhooks avançados.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { ChannelConnectionsPanel } from "@/components/integracoes/ChannelConnectionsPanel";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plug, Settings, Unplug, CheckCircle, Lock, ExternalLink,
  Webhook, Plus, Copy, TestTube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string; slug: string; nome: string; descricao: string;
  categoria: string; logo: string;
  status: "conectado" | "disponivel" | "max_only";
  conta?: string; conectadoEm?: string;
}

const MOCK_INTEGRATIONS: Integration[] = [
  // Redes Sociais
  { id: "i1", slug: "instagram", nome: "Instagram", descricao: "Agendar posts e reels diretamente", categoria: "Redes Sociais", logo: "📸", status: "conectado", conta: "@corretor.pro", conectadoEm: "2026-03-15" },
  { id: "i2", slug: "facebook", nome: "Facebook Pages", descricao: "Publicação cruzada automática", categoria: "Redes Sociais", logo: "📘", status: "disponivel" },
  { id: "i3", slug: "evolution", nome: "WhatsApp (Evolution API)", descricao: "Automações de WhatsApp", categoria: "Redes Sociais", logo: "💬", status: "conectado", conta: "(11) 99999-0000", conectadoEm: "2026-03-10" },
  // Portais
  { id: "i4", slug: "zapimoveis", nome: "Zap Imóveis", descricao: "Importar/exportar listagens", categoria: "Portais", logo: "🏠", status: "disponivel" },
  { id: "i5", slug: "vivareal", nome: "Viva Real", descricao: "Sincronizar portfólio", categoria: "Portais", logo: "🔵", status: "disponivel" },
  { id: "i6", slug: "olx", nome: "OLX Imóveis", descricao: "Publicação automática", categoria: "Portais", logo: "🟠", status: "max_only" },
  // Comunicação
  { id: "i7", slug: "gmail", nome: "Gmail", descricao: "Emails com templates", categoria: "Comunicação", logo: "📧", status: "disponivel" },
  { id: "i8", slug: "resend", nome: "Resend", descricao: "Email marketing para leads", categoria: "Comunicação", logo: "📬", status: "max_only" },
  // CRM
  { id: "i9", slug: "pipedrive", nome: "Pipedrive", descricao: "Sincronizar leads bidirecional", categoria: "CRM", logo: "🔄", status: "max_only" },
  { id: "i10", slug: "hubspot", nome: "HubSpot", descricao: "Integração CRM completa", categoria: "CRM", logo: "🟧", status: "max_only" },
  // IA
  { id: "i11", slug: "n8n", nome: "n8n", descricao: "Workflows de automação", categoria: "IA e Automação", logo: "⚡", status: "conectado", conta: "6 workflows ativos", conectadoEm: "2026-01-01" },
  { id: "i12", slug: "openai", nome: "OpenAI", descricao: "Modelo alternativo de IA", categoria: "IA e Automação", logo: "🤖", status: "disponivel" },
  { id: "i13", slug: "elevenlabs", nome: "ElevenLabs", descricao: "Voice para vídeos", categoria: "IA e Automação", logo: "🎙️", status: "max_only" },
  // Design
  { id: "i14", slug: "canva", nome: "Canva", descricao: "Enviar criativos para edição", categoria: "Design", logo: "🎨", status: "disponivel" },
  // Analytics
  { id: "i15", slug: "ga4", nome: "Google Analytics", descricao: "Trackear visitas ao book", categoria: "Analytics", logo: "📊", status: "disponivel" },
  { id: "i16", slug: "metapixel", nome: "Meta Pixel", descricao: "Remarketing para leads", categoria: "Analytics", logo: "📈", status: "max_only" },
];

const STATUS_CFG = {
  conectado: { label: "Conectado", color: "text-emerald-500", dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  disponivel: { label: "Disponível", color: "text-muted-foreground", dot: "bg-gray-400", badge: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  max_only: { label: "MAX", color: "text-amber-500", dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

interface WebhookEntry { id: string; url: string; events: string[]; status: "ativo" | "erro"; lastSent: string | null; }

const MOCK_WEBHOOKS: WebhookEntry[] = [
  { id: "wh1", url: "https://meusite.com/api/imobcreator", events: ["lead.created", "appointment.created"], status: "ativo", lastSent: "2026-04-05T09:00:00Z" },
];

export default function IntegracoesApisPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workspaceId } = useWorkspaceContext();
  const [configSlug, setConfigSlug] = useState<string | null>(null);

  const categories = [...new Set(MOCK_INTEGRATIONS.map((i) => i.categoria))];
  const configIntegration = configSlug ? MOCK_INTEGRATIONS.find((i) => i.slug === configSlug) : null;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Plug className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
            <p className="text-sm text-muted-foreground">{MOCK_INTEGRATIONS.filter((i) => i.status === "conectado").length} conectadas</p>
          </div>
        </div>

        <Tabs defaultValue="apis">
          <TabsList>
            <TabsTrigger value="apis" className="gap-1.5"><Plug className="w-4 h-4" />APIs Conectadas</TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-1.5"><Webhook className="w-4 h-4" />Webhooks</TabsTrigger>
            <TabsTrigger value="canais" className="gap-1.5"><Plug className="w-4 h-4" />Canais</TabsTrigger>
          </TabsList>

          <TabsContent value="apis" className="mt-4 space-y-6">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{cat}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_INTEGRATIONS.filter((i) => i.categoria === cat).map((integ) => {
                    const stCfg = STATUS_CFG[integ.status];
                    return (
                      <Card key={integ.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{integ.logo}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground text-sm">{integ.nome}</p>
                                <Badge variant="outline" className={cn("text-[9px]", stCfg.badge)}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1", stCfg.dot)} />{stCfg.label}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{integ.descricao}</p>
                              {integ.conta && (
                                <p className="text-[10px] text-accent mt-1">{integ.conta}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            {integ.status === "conectado" ? (
                              <>
                                <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => setConfigSlug(integ.slug)}>
                                  <Settings className="w-3 h-3 mr-1" />Configurar
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive"><Unplug className="w-3 h-3 mr-1" />Desconectar</Button>
                              </>
                            ) : integ.status === "disponivel" ? (
                              <Button size="sm" className="flex-1 text-xs h-7 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast({ title: `Conectar ${integ.nome}`, description: "Redirecionando para autenticação..." })}>
                                <Plug className="w-3 h-3 mr-1" />Conectar
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="flex-1 text-xs h-7" disabled>
                                <Lock className="w-3 h-3 mr-1" />Plano MAX
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Webhooks configurados</h3>
              <Button size="sm" variant="outline"><Plus className="w-3.5 h-3.5 mr-1.5" />Novo Webhook</Button>
            </div>
            {MOCK_WEBHOOKS.map((wh) => (
              <Card key={wh.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Webhook className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-foreground truncate">{wh.url}</p>
                      <div className="flex gap-1.5 mt-1">
                        {wh.events.map((ev) => <Badge key={ev} variant="secondary" className="text-[9px]">{ev}</Badge>)}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><TestTube className="w-3 h-3 mr-1" />Testar</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs"><Copy className="w-3 h-3 mr-1" />Secret</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Webhook secret info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Secret de validação</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-3 py-1.5 rounded font-mono flex-1 truncate">whsec_imob_*****************************k3f9</code>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { navigator.clipboard.writeText("whsec_imob_example"); toast({ title: "Secret copiado" }); }}>
                    <Copy className="w-3 h-3 mr-1" />Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Canais de Publicação (DEV-30) ───────────── */}
          <TabsContent value="canais" className="mt-4">
            <ChannelConnectionsPanel workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Config dialog */}
      <Dialog open={Boolean(configSlug)} onOpenChange={(open) => !open && setConfigSlug(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{configIntegration?.logo}</span>
              Configurar {configIntegration?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-foreground">Conta: {configIntegration?.conta}</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" defaultChecked /> Publicar automaticamente posts aprovados</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> Watermark automática</label>
            </div>
            <div><Label>Hashtags fixas</Label><Input placeholder="#imoveis #corretor #sp" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigSlug(null)}>Fechar</Button>
            <Button className="bg-accent text-accent-foreground" onClick={() => { setConfigSlug(null); toast({ title: "Configuração salva" }); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
