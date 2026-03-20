import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Check, User, MapPin, MessageSquare, Target } from "lucide-react";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const SettingsProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    creci: "",
    state: "",
    city: "",
    phone: "",
    instagram: "",
    language_style: "formal",
    target_audience: "medio",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, creci, state, city, phone, instagram, language_style, target_audience")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          creci: data.creci ?? "",
          state: data.state ?? "",
          city: data.city ?? "",
          phone: data.phone ?? "",
          instagram: data.instagram ?? "",
          language_style: data.language_style ?? "formal",
          target_audience: data.target_audience ?? "medio",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        creci: form.creci || null,
        state: form.state || null,
        city: form.city || null,
        phone: form.phone || null,
        instagram: form.instagram || null,
        language_style: form.language_style,
        target_audience: form.target_audience,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Perfil salvo com sucesso!" });
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Perfil do Corretor</h1>
            <p className="text-muted-foreground mt-1">Configure seu perfil para personalizar prompts, copy e a futura estrutura do workspace</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave} disabled={saving}>
            {saved ? <><Check className="w-4 h-4 mr-2" />Salvo!</> :
             saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> :
             <><Save className="w-4 h-4 mr-2" />Salvar</>}
          </Button>
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Dados do Corretor
            </CardTitle>
            <CardDescription>Informações básicas de identificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome do Corretor</Label>
                <Input id="full_name" value={form.full_name} onChange={e => update("full_name", e.target.value)} className="mt-1" placeholder="Ex: João Silva" />
              </div>
              <div>
                <Label htmlFor="creci">CRECI</Label>
                <Input id="creci" value={form.creci} onChange={e => update("creci", e.target.value)} className="mt-1" placeholder="Ex: 123456-F" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">WhatsApp Padrão</Label>
                <Input id="phone" value={form.phone} onChange={e => update("phone", e.target.value)} className="mt-1" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={form.instagram} onChange={e => update("instagram", e.target.value)} className="mt-1" placeholder="@seuinstagram" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Localização
            </CardTitle>
            <CardDescription>Região principal de atuação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select value={form.state} onValueChange={v => update("state", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">Cidade Principal</Label>
                <Input id="city" value={form.city} onChange={e => update("city", e.target.value)} className="mt-1" placeholder="Ex: São Paulo" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estilo e público */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Estilo de Comunicação
            </CardTitle>
            <CardDescription>Define o tom dos textos gerados por IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Estilo de Linguagem</Label>
              <Select value={form.language_style} onValueChange={v => update("language_style", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="persuasivo">Persuasivo</SelectItem>
                  <SelectItem value="luxo">Luxo</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Influencia o tom das legendas e textos gerados</p>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                Público Alvo
              </Label>
              <Select value={form.target_audience} onValueChange={v => update("target_audience", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo Padrão</SelectItem>
                  <SelectItem value="medio">Médio Padrão</SelectItem>
                  <SelectItem value="alto">Alto Padrão</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Adapta a copy para o perfil do comprador</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsProfile;
