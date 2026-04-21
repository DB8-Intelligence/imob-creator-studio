/**
 * ImoveisEditorPage.tsx — Editor de imóvel com abas MAX
 *
 * Abas originais: Dados / Fotos
 * Abas MAX: Leads Interessados / Histórico de Visitas / Performance de Conteúdo
 *
 * Aceita /imoveis/editor/:id ou /imoveis/editor (sem ID = nova ficha).
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Save, PenSquare, Users, CalendarDays,
  TrendingUp, ImageIcon, Upload, Loader2, FileText,
} from "lucide-react";
import { usePropertyMAX } from "@/hooks/usePropertyMAX";
import { PropertyLeadsTab } from "@/components/imoveis/PropertyLeadsTab";
import { PropertyVisitsTab } from "@/components/imoveis/PropertyVisitsTab";
import { PropertyPerformanceTab } from "@/components/imoveis/PropertyPerformanceTab";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LPWizard from "@/components/landing-pages/LPWizard";
import type { SiteImovel } from "@/types/site";

export default function ImoveisEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = !id;

  const [lpWizardOpen, setLpWizardOpen] = useState(false);

  // MAX data for existing properties
  const { data: maxData } = usePropertyMAX(id ?? null);

  // Imóvel real carregado do Supabase (usado pelo LPWizard)
  const [imovel, setImovel] = useState<SiteImovel | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  // Form state — inicializado vazio; populado pelo useEffect de fetch
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [standard, setStandard] = useState("medio");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [highlights, setHighlights] = useState("");

  // Fetch do imóvel quando id presente
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_imoveis")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Imóvel não encontrado",
          description: error?.message || "Este imóvel não existe ou foi removido.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const row = data as unknown as SiteImovel;
      setImovel(row);
      setTitulo(row.titulo || "");
      setDescricao(row.descricao || "");
      setPropertyType(row.tipo || "apartamento");
      setCity(row.cidade || "");
      setNeighborhood(row.bairro || "");
      setPrice(row.preco ? String(row.preco) : "");
      setArea(row.area_total ? String(row.area_total) : "");
      setBedrooms(row.quartos ? String(row.quartos) : "");
      setBathrooms(row.banheiros ? String(row.banheiros) : "");
      setHighlights((row.features || []).join(", "));
      setLoading(false);
    })();
  }, [id, toast]);

  async function handleSave() {
    if (!user?.id) {
      toast({ title: "Sessão expirada", variant: "destructive" });
      return;
    }
    if (!titulo.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      titulo,
      descricao: descricao || null,
      tipo: propertyType,
      cidade: city || null,
      bairro: neighborhood || null,
      preco: price ? Number(price) : null,
      area_total: area ? Number(area) : null,
      quartos: bedrooms ? Number(bedrooms) : 0,
      banheiros: bathrooms ? Number(bathrooms) : 0,
      features: highlights
        ? highlights.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    if (isNew) {
      // Preciso do site_id do corretor — busca corretor_sites
      const { data: site } = await supabase
        .from("corretor_sites")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!site?.id) {
        toast({
          title: "Crie seu site primeiro",
          description: "Acesse 'Meu Site' e configure antes de cadastrar imóveis.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { data: created, error } = await supabase
        .from("site_imoveis")
        .insert({
          ...payload,
          user_id: user.id,
          site_id: site.id,
        })
        .select("id")
        .single();

      setSaving(false);

      if (error || !created) {
        toast({ title: "Erro ao criar", description: error?.message, variant: "destructive" });
        return;
      }

      toast({ title: "Imóvel criado" });
      navigate(`/imoveis/editor/${created.id}`, { replace: true });
    } else {
      const { error } = await supabase
        .from("site_imoveis")
        .update(payload)
        .eq("id", id);

      setSaving(false);

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Imóvel salvo" });
      // Atualiza o imovel local pra refletir no LPWizard
      setImovel((prev) => (prev ? { ...prev, ...payload } as SiteImovel : prev));
    }
  }

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/imoveis" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Imóveis
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{isNew ? "Novo imóvel" : titulo}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <PenSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{isNew ? "Novo Imóvel" : "Editor de Imóvel"}</h1>
              {!isNew && maxData && (
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] gap-1"><Users className="w-3 h-3" />{maxData.stats.totalLeads} leads</Badge>
                  <Badge variant="secondary" className="text-[10px] gap-1"><CalendarDays className="w-3 h-3" />{maxData.stats.totalVisits} visitas</Badge>
                  <Badge variant="secondary" className="text-[10px] gap-1"><TrendingUp className="w-3 h-3" />{maxData.stats.totalContent} criativos</Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && imovel && (
              <Button
                variant="outline"
                onClick={() => setLpWizardOpen(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Landing Page
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dados">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dados" className="gap-1.5">
              <PenSquare className="w-4 h-4" /> Dados
            </TabsTrigger>
            <TabsTrigger value="fotos" className="gap-1.5">
              <ImageIcon className="w-4 h-4" /> Fotos
            </TabsTrigger>
            {!isNew && (
              <>
                <TabsTrigger value="leads" className="gap-1.5">
                  <Users className="w-4 h-4" /> Leads
                  {maxData && maxData.stats.totalLeads > 0 && (
                    <span className="text-[10px] bg-accent/20 text-accent rounded-full px-1.5">{maxData.stats.totalLeads}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="visitas" className="gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Visitas
                </TabsTrigger>
                <TabsTrigger value="performance" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Performance
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* ── Aba Dados ─────────────────────────────────────────── */}
          <TabsContent value="dados" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Título *</Label>
                    <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Apt Vila Mariana 3Q" />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartamento">Apartamento</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="terreno">Terreno</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="lancamento">Lançamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Padrão</Label>
                    <Select value={standard} onValueChange={setStandard}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economico">Econômico</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="luxo">Luxo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Vila Mariana" />
                  </div>
                  <div>
                    <Label>Preço (R$)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="850000" />
                  </div>
                  <div>
                    <Label>Área (m²)</Label>
                    <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="120" />
                  </div>
                  <div>
                    <Label>Quartos</Label>
                    <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
                  </div>
                  <div>
                    <Label>Banheiros</Label>
                    <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Destaques</Label>
                    <Input value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Ex: Vista panorâmica, varanda gourmet, 2 vagas" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição completa do imóvel..." rows={4} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Aba Fotos ─────────────────────────────────────────── */}
          <TabsContent value="fotos" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium text-foreground">Arraste fotos ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WEBP — máx 20MB por foto</p>
                  <Button variant="outline" className="mt-4">Selecionar fotos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Aba Leads (MAX) ───────────────────────────────────── */}
          {!isNew && (
            <TabsContent value="leads" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <PropertyLeadsTab leads={maxData?.leads ?? []} propertyNome={titulo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ── Aba Visitas (MAX) ─────────────────────────────────── */}
          {!isNew && (
            <TabsContent value="visitas" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <PropertyVisitsTab visits={maxData?.visits ?? []} taxaConversao={maxData?.stats.taxaConversao ?? 0} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ── Aba Performance (MAX) ─────────────────────────────── */}
          {!isNew && (
            <TabsContent value="performance" className="mt-4">
              <PropertyPerformanceTab content={maxData?.content ?? []} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Wizard de Landing Page — usa o imóvel REAL carregado do Supabase */}
      {!isNew && imovel && user && (
        <LPWizard
          open={lpWizardOpen}
          onOpenChange={setLpWizardOpen}
          userId={user.id}
          imovel={imovel}
        />
      )}
    </AppLayout>
  );
}
