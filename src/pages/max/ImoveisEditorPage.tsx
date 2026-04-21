/**
 * ImoveisEditorPage.tsx — Editor de imóvel com abas MAX
 *
 * Abas originais: Dados / Fotos
 * Abas MAX: Leads Interessados / Histórico de Visitas / Performance de Conteúdo
 *
 * Aceita /imoveis/editor/:id ou /imoveis/editor (sem ID = nova ficha).
 */
import { useState } from "react";
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

  // Form state (simplified — in real app, would fetch from properties table)
  const [titulo, setTitulo] = useState(id ? "Apt Vila Mariana 3Q" : "");
  const [descricao, setDescricao] = useState("");
  const [propertyType, setPropertyType] = useState("apartamento");
  const [standard, setStandard] = useState("medio");
  const [city, setCity] = useState(id ? "São Paulo" : "");
  const [neighborhood, setNeighborhood] = useState(id ? "Vila Mariana" : "");
  const [price, setPrice] = useState(id ? "850000" : "");
  const [area, setArea] = useState(id ? "120" : "");
  const [bedrooms, setBedrooms] = useState(id ? "3" : "");
  const [bathrooms, setBathrooms] = useState(id ? "2" : "");
  const [highlights, setHighlights] = useState("");

  const handleSave = () => {
    toast({ title: isNew ? "Imóvel criado" : "Imóvel salvo" });
    if (isNew) navigate("/imoveis");
  };

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
            {!isNew && id && (
              <Button
                variant="outline"
                onClick={() => setLpWizardOpen(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar Landing Page
              </Button>
            )}
            <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
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

      {/* Wizard de Landing Page */}
      {!isNew && id && user && (
        <LPWizard
          open={lpWizardOpen}
          onOpenChange={setLpWizardOpen}
          userId={user.id}
          imovel={{
            id,
            user_id: user.id,
            site_id: "",
            titulo,
            descricao,
            tipo: propertyType as SiteImovel["tipo"],
            finalidade: "venda",
            status: "disponivel",
            endereco: "",
            bairro: neighborhood,
            cidade: city,
            estado: "",
            cep: "",
            preco: Number(price) || 0,
            preco_condominio: 0,
            area_total: Number(area) || 0,
            area_construida: 0,
            quartos: Number(bedrooms) || 0,
            suites: 0,
            banheiros: Number(bathrooms) || 0,
            vagas: 0,
            fotos: [],
            foto_capa: "",
            features: [],
            publicar_zap: false,
            publicar_olx: false,
            publicar_vivareal: false,
            codigo_externo: "",
            destaque: false,
            ordem_exibicao: 0,
            created_at: "",
            updated_at: "",
          } as SiteImovel}
        />
      )}
    </AppLayout>
  );
}
