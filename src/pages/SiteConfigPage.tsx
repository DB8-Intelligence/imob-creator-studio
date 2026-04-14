import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette, Globe, Building2, Search, LayoutGrid, Rss, Link2,
  Save, Loader2, CheckCircle2, Sparkles, Image, Upload,
} from "lucide-react";
import { PortaisPanel } from "@/components/site/PortaisPanel";
import { useToast } from "@/hooks/use-toast";

interface SiteConfig {
  subdomain: string;
  custom_domain: string;
  theme_slug: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  company_name: string;
  creci: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  address: string;
  about_text: string;
  seo_title: string;
  seo_description: string;
  show_price: boolean;
  show_address: boolean;
}

const THEMES = [
  { slug: "brisa", name: "Brisa", preview: "bg-blue-50" },
  { slug: "terra", name: "Terra", preview: "bg-amber-50" },
  { slug: "noite", name: "Noite", preview: "bg-gray-900" },
  { slug: "verde", name: "Verde", preview: "bg-emerald-50" },
];

const DEFAULT_CONFIG: SiteConfig = {
  subdomain: "", custom_domain: "", theme_slug: "brisa",
  primary_color: "#1E3A8A", secondary_color: "#F59E0B",
  logo_url: "", company_name: "", creci: "",
  phone1: "", phone2: "", whatsapp: "", email: "", address: "",
  about_text: "", seo_title: "", seo_description: "",
  show_price: true, show_address: true,
};

export default function SiteConfigPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("site_config").select("*").maybeSingle().then(({ data }) => {
      if (data) setConfig(data as unknown as SiteConfig);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_config").upsert(config as never);
    if (error) toast({ title: "Erro ao salvar", variant: "destructive" });
    else toast({ title: "Configuração salva!" });
    setSaving(false);
  };

  const update = (field: keyof SiteConfig, value: string | boolean) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meu Site</h1>
            <p className="text-sm text-gray-500 mt-1">Configure seu portal imobiliário profissional</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>

        <Tabs defaultValue="identity">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="identity"><Palette className="h-4 w-4 mr-1" />Visual</TabsTrigger>
            <TabsTrigger value="company"><Building2 className="h-4 w-4 mr-1" />Empresa</TabsTrigger>
            <TabsTrigger value="seo"><Search className="h-4 w-4 mr-1" />SEO</TabsTrigger>
            <TabsTrigger value="portals"><Rss className="h-4 w-4 mr-1" />Portais</TabsTrigger>
            <TabsTrigger value="domain"><Link2 className="h-4 w-4 mr-1" />Domínio</TabsTrigger>
          </TabsList>

          {/* Identity */}
          <TabsContent value="identity" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tema Visual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {THEMES.map((t) => (
                    <div key={t.slug} onClick={() => update("theme_slug", t.slug)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        config.theme_slug === t.slug ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className={`w-full h-16 rounded-lg mb-2 ${t.preview}`} />
                      <p className="text-sm font-medium">{t.name}</p>
                      {config.theme_slug === t.slug && <CheckCircle2 className="h-4 w-4 text-blue-500 mx-auto mt-1" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Cores</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: config.primary_color }} />
                    <Input value={config.primary_color} onChange={(e) => update("primary_color", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: config.secondary_color }} />
                    <Input value={config.secondary_color} onChange={(e) => update("secondary_color", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company */}
          <TabsContent value="company" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Informações da Empresa</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome da Empresa</Label><Input className="mt-1" value={config.company_name} onChange={(e) => update("company_name", e.target.value)} /></div>
                  <div><Label>CRECI</Label><Input className="mt-1" value={config.creci} onChange={(e) => update("creci", e.target.value)} /></div>
                  <div><Label>Telefone 1</Label><Input className="mt-1" value={config.phone1} onChange={(e) => update("phone1", e.target.value)} /></div>
                  <div><Label>Telefone 2</Label><Input className="mt-1" value={config.phone2} onChange={(e) => update("phone2", e.target.value)} /></div>
                  <div><Label>WhatsApp</Label><Input className="mt-1" value={config.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></div>
                  <div><Label>Email</Label><Input className="mt-1" value={config.email} onChange={(e) => update("email", e.target.value)} /></div>
                </div>
                <div><Label>Endereço</Label><Input className="mt-1" value={config.address} onChange={(e) => update("address", e.target.value)} /></div>
                <div><Label>Sobre</Label><Textarea className="mt-1" rows={4} value={config.about_text} onChange={(e) => update("about_text", e.target.value)} /></div>
                <div className="flex items-center justify-between py-2">
                  <div><p className="font-medium text-sm">Exibir preço</p><p className="text-xs text-gray-500">Mostrar preço dos imóveis no site</p></div>
                  <Switch checked={config.show_price} onCheckedChange={(v) => update("show_price", v)} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div><p className="font-medium text-sm">Exibir endereço</p><p className="text-xs text-gray-500">Mostrar endereço completo</p></div>
                  <Switch checked={config.show_address} onCheckedChange={(v) => update("show_address", v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />SEO
                </CardTitle>
                <CardDescription>Otimize seu site para buscadores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Título SEO</Label>
                    <Button size="sm" variant="ghost" className="text-xs gap-1"><Sparkles className="h-3 w-3" />Gerar com IA</Button>
                  </div>
                  <Input className="mt-1" value={config.seo_title} onChange={(e) => update("seo_title", e.target.value)} placeholder="Ex: Imóveis em Salvador | Douglas Bonanzza" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Descrição SEO</Label>
                    <Button size="sm" variant="ghost" className="text-xs gap-1"><Sparkles className="h-3 w-3" />Gerar com IA</Button>
                  </div>
                  <Textarea className="mt-1" rows={3} value={config.seo_description} onChange={(e) => update("seo_description", e.target.value)} placeholder="Descrição que aparece nos resultados do Google" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portals */}
          <TabsContent value="portals" className="mt-4">
            <PortaisPanel workspaceSlug={config.subdomain} />
          </TabsContent>

          {/* Domain */}
          <TabsContent value="domain" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Subdomínio NexoImob</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input value={config.subdomain} onChange={(e) => update("subdomain", e.target.value)} placeholder="meu-site" />
                  <span className="text-sm text-gray-500 whitespace-nowrap">.imobcreatorai.com.br</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Domínio Próprio</CardTitle><CardDescription>Configure seu domínio customizado</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Domínio</Label>
                  <Input className="mt-1" value={config.custom_domain ?? ""} onChange={(e) => update("custom_domain", e.target.value)} placeholder="www.meusite.com.br" />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-gray-600">Entradas DNS necessárias:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <span className="font-mono">CNAME</span>
                    <span className="font-mono">www</span>
                    <span className="font-mono">cname.vercel-dns.com</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <span className="font-mono">A</span>
                    <span className="font-mono">@</span>
                    <span className="font-mono">76.76.21.21</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
