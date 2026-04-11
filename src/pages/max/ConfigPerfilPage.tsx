/**
 * ConfigPerfilPage.tsx — Configurações MAX
 *
 * Abas: Perfil & Marca | Notificações | Personalização MAX | Dados e Privacidade | Plano
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UserCircle, Bell, Palette, Shield, CreditCard, Save, Upload,
  Download, Trash2, Globe, Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NOTIFICATION_EVENTS = [
  { id: "novo_lead", label: "Novo lead chegou", default: true },
  { id: "agendamento", label: "Agendamento confirmado/cancelado", default: true },
  { id: "post_aprovado", label: "Post aprovado pelo cliente", default: false },
  { id: "video_gerado", label: "Vídeo gerado com sucesso", default: true },
  { id: "creditos_baixos", label: "Créditos de IA abaixo de 20%", default: true },
  { id: "agente_erro", label: "Agente de IA com erro", default: true },
];

export default function ConfigPerfilPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nome, setNome] = useState("Douglas");
  const [email] = useState("douglas@db8.com.br");
  const [creci, setCreci] = useState("123456-F");
  const [bio, setBio] = useState("Corretor especializado em imóveis de alto padrão na zona sul de São Paulo.");
  const [temaCor, setTemaCor] = useState("#7c3aed");
  const [nomeCustom, setNomeCustom] = useState("NexoImob AI");

  const handleSave = () => toast({ title: "Configurações salvas" });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[900px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList className="flex-wrap">
            <TabsTrigger value="perfil" className="gap-1.5"><UserCircle className="w-4 h-4" />Perfil & Marca</TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-1.5"><Bell className="w-4 h-4" />Notificações</TabsTrigger>
            <TabsTrigger value="personalizacao" className="gap-1.5"><Palette className="w-4 h-4" />Personalização MAX</TabsTrigger>
            <TabsTrigger value="privacidade" className="gap-1.5"><Shield className="w-4 h-4" />Dados & Privacidade</TabsTrigger>
            <TabsTrigger value="plano" className="gap-1.5" onClick={() => navigate("/configuracoes/plano")}><CreditCard className="w-4 h-4" />Plano</TabsTrigger>
          </TabsList>

          {/* ── Perfil & Marca ────────────────────────────── */}
          <TabsContent value="perfil" className="mt-4">
            <Card><CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center text-2xl font-bold text-accent">D</div>
                <div>
                  <Button variant="outline" size="sm"><Upload className="w-3.5 h-3.5 mr-1.5" />Alterar foto</Button>
                  <p className="text-[10px] text-muted-foreground mt-1">JPG ou PNG, máx 5MB</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Nome completo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
                <div><Label>E-mail</Label><Input value={email} disabled className="bg-muted" /></div>
                <div><Label>CRECI</Label><Input value={creci} onChange={(e) => setCreci(e.target.value)} /></div>
                <div><Label>Telefone</Label><Input defaultValue="(11) 99999-0000" /></div>
              </div>
              <div><Label>Bio profissional</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
              <div>
                <Label>Logo da imobiliária</Label>
                <div className="mt-1 rounded-xl border-2 border-dashed border-border p-4 text-center">
                  <Upload className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Arraste ou clique para upload</p>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="w-4 h-4 mr-2" />Salvar perfil</Button>
            </CardContent></Card>
          </TabsContent>

          {/* ── Notificações ──────────────────────────────── */}
          <TabsContent value="notificacoes" className="mt-4">
            <Card><CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Notificações por evento</h3>
              {NOTIFICATION_EVENTS.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{ev.label}</span>
                  <Switch defaultChecked={ev.default} />
                </div>
              ))}
              <div className="pt-2">
                <Label>Canal preferido</Label>
                <div className="flex gap-2 mt-1">
                  {["Push", "Email", "WhatsApp", "Todos"].map((c) => (
                    <Badge key={c} variant="secondary" className="cursor-pointer hover:bg-accent/10 text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            </CardContent></Card>
          </TabsContent>

          {/* ── Personalização MAX ────────────────────────── */}
          <TabsContent value="personalizacao" className="mt-4">
            <Card><CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground">Personalização MAX</h3>
                <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent">Exclusivo MAX</Badge>
              </div>
              <div><Label>Domínio personalizado (Book Agente)</Label><Input defaultValue="book.seunome.com.br" placeholder="book.seunome.com.br" /><p className="text-[10px] text-muted-foreground mt-1">Configure o CNAME no seu provedor DNS.</p></div>
              <div className="flex items-center justify-between"><div><Label>Watermark nas artes</Label><p className="text-[10px] text-muted-foreground">Logo do corretor nas artes geradas</p></div><Switch defaultChecked /></div>
              <div>
                <Label>Cor do tema</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="color" value={temaCor} onChange={(e) => setTemaCor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" title="Cor do tema" />
                  <Input value={temaCor} onChange={(e) => setTemaCor(e.target.value)} className="w-28 font-mono text-xs" />
                </div>
              </div>
              <div><Label>Nome da plataforma</Label><Input value={nomeCustom} onChange={(e) => setNomeCustom(e.target.value)} placeholder="Studio Janaína Imóveis" /><p className="text-[10px] text-muted-foreground mt-1">White-label básico — aparece no header do dashboard.</p></div>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="w-4 h-4 mr-2" />Salvar</Button>
            </CardContent></Card>
          </TabsContent>

          {/* ── Dados & Privacidade ───────────────────────── */}
          <TabsContent value="privacidade" className="mt-4">
            <Card><CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Shield className="w-4 h-4" />Dados e Privacidade</h3>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div><p className="text-sm font-medium text-foreground">Exportar todos meus dados</p><p className="text-xs text-muted-foreground">JSON e CSV com todos os leads, imóveis, posts e financeiro</p></div>
                <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div><p className="text-sm font-medium text-foreground">Retenção de conteúdo gerado</p><p className="text-xs text-muted-foreground">Apagar automaticamente após X dias</p></div>
                <Input type="number" defaultValue="365" className="w-20 text-center" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div><p className="text-sm font-medium text-red-500">Excluir minha conta (LGPD)</p><p className="text-xs text-muted-foreground">Apaga permanentemente todos os dados</p></div>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 mr-1.5" />Solicitar exclusão</Button>
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
