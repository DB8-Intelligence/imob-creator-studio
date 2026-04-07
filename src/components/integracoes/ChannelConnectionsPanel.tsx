/**
 * ChannelConnectionsPanel.tsx — Gerenciamento de conexões de canais (DEV-30)
 *
 * Lista canais com status de conexão + dialog para configurar credenciais.
 * Tokens nunca exibidos após salvar (apenas has_token).
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Plug, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChannelConnections } from "@/hooks/useChannelConnections";
import { PUBLICATION_CHANNELS } from "@/types/publication";
import type { PublicationChannel } from "@/types/publication";
import type { ChannelConnectionInput, ChannelConnectionSafe } from "@/types/channel-connection";

interface ChannelConnectionsPanelProps {
  workspaceId: string | null;
}

const CHANNEL_FIELDS: Record<string, { label: string; field: keyof ChannelConnectionInput; placeholder: string }[]> = {
  instagram_feed: [
    { label: "IG User ID", field: "ig_user_id", placeholder: "17841400000000" },
    { label: "Access Token", field: "ig_access_token", placeholder: "EAAxxxxxxx..." },
  ],
  instagram_stories: [
    { label: "IG User ID", field: "ig_user_id", placeholder: "17841400000000" },
    { label: "Access Token", field: "ig_access_token", placeholder: "EAAxxxxxxx..." },
  ],
  instagram_reels: [
    { label: "IG User ID", field: "ig_user_id", placeholder: "17841400000000" },
    { label: "Access Token", field: "ig_access_token", placeholder: "EAAxxxxxxx..." },
  ],
  facebook: [
    { label: "Page ID", field: "page_id", placeholder: "123456789" },
    { label: "Page Access Token", field: "page_access_token", placeholder: "EAAxxxxxxx..." },
  ],
  whatsapp: [
    { label: "Nome da Instância", field: "evolution_instance_name", placeholder: "minha-instancia" },
    { label: "API Key", field: "evolution_api_key", placeholder: "sua-api-key..." },
    { label: "Número WhatsApp", field: "evolution_phone", placeholder: "5511999990000" },
  ],
  tiktok: [],
  linkedin: [],
};

function isConnected(conn: ChannelConnectionSafe | undefined): boolean {
  if (!conn || !conn.is_active) return false;
  return conn.has_ig_token || conn.has_fb_token || conn.has_evolution_key;
}

export function ChannelConnectionsPanel({ workspaceId }: ChannelConnectionsPanelProps) {
  const { connections, upsert, toggle, remove, isUpserting } = useChannelConnections(workspaceId);

  const [editChannel, setEditChannel] = useState<PublicationChannel | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  function openEdit(channel: PublicationChannel) {
    setEditChannel(channel);
    setFormData({});
    setEditOpen(true);
  }

  function handleSave() {
    if (!editChannel) return;
    const input: ChannelConnectionInput = {
      channel: editChannel,
      display_name: formData.display_name || undefined,
      ig_user_id: formData.ig_user_id || undefined,
      ig_access_token: formData.ig_access_token || undefined,
      page_id: formData.page_id || undefined,
      page_access_token: formData.page_access_token || undefined,
      evolution_instance_name: formData.evolution_instance_name || undefined,
      evolution_api_key: formData.evolution_api_key || undefined,
      evolution_phone: formData.evolution_phone || undefined,
    };
    upsert(input);
    setEditOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Plug className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Canais de Publicação</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {PUBLICATION_CHANNELS.map((ch) => {
          const conn = connections.find((c) => c.channel === ch.id);
          const connected = isConnected(conn);
          const fields = CHANNEL_FIELDS[ch.id] ?? [];
          const hasFields = fields.length > 0;

          return (
            <Card key={ch.id} className={cn(!connected && "opacity-70")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{ch.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ch.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {connected ? (
                          <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" />Conectado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-zinc-400 gap-0.5">
                            <XCircle className="w-2.5 h-2.5" />Desconectado
                          </Badge>
                        )}
                        {conn && (
                          <span className="text-[10px] text-muted-foreground">
                            {conn.ig_user_id || conn.page_id || conn.evolution_phone || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn && <Switch checked={conn.is_active} onCheckedChange={(v) => toggle(conn.id, v)} />}
                    {hasFields && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEdit(ch.id)}>
                        {connected ? "Editar" : "Conectar"}
                      </Button>
                    )}
                    {!hasFields && (
                      <Badge variant="secondary" className="text-[10px]">Em breve</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {PUBLICATION_CHANNELS.find((c) => c.id === editChannel)?.icon}{" "}
              Configurar {PUBLICATION_CHANNELS.find((c) => c.id === editChannel)?.label}
            </DialogTitle>
            <DialogDescription>
              Insira as credenciais do canal. Tokens são armazenados de forma segura e nunca expostos no frontend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Nome de exibição (opcional)</label>
              <Input
                value={formData.display_name ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, display_name: e.target.value }))}
                placeholder="Ex: Conta principal"
              />
            </div>

            {editChannel && (CHANNEL_FIELDS[editChannel] ?? []).map((field) => (
              <div key={field.field}>
                <label className="text-sm font-medium text-foreground block mb-1">{field.label}</label>
                <Input
                  type={field.field.includes("token") ? "password" : "text"}
                  value={formData[field.field] ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.field]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isUpserting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isUpserting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
