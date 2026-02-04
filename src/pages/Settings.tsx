import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import { 
  Palette, 
  Type, 
  Image as ImageIcon,
  Upload,
  Save,
  RefreshCw,
  Plus,
  Check,
  Bell,
  Shield,
  CreditCard,
  User
} from "lucide-react";

// Brand presets
const brandPresets = [
  {
    id: "douglas-bonanzza",
    name: "Douglas Bonanzza Imóveis",
    primaryColor: "#1E3A5F",
    secondaryColor: "#D4AF37",
    fontDisplay: "Montserrat",
    fontBody: "Open Sans",
    slogan: "Tradição e excelência no mercado imobiliário",
    toneOfVoice: "Sofisticado, confiável, tradicional"
  },
  {
    id: "db8",
    name: "DB8 Imobiliária",
    primaryColor: "#18181B",
    secondaryColor: "#FACC15",
    fontDisplay: "Inter",
    fontBody: "Inter",
    slogan: "Inovação e agilidade em cada negócio",
    toneOfVoice: "Moderno, dinâmico, inovador"
  }
];

const Settings = () => {
  const [activeBrand, setActiveBrand] = useState(brandPresets[1]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize sua marca e preferências
            </p>
          </div>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salvo!
              </>
            ) : isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="brand">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brand">
              <Palette className="w-4 h-4 mr-2" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="w-4 h-4 mr-2" />
              Conta
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Plano
            </TabsTrigger>
          </TabsList>

          {/* Brand Settings */}
          <TabsContent value="brand" className="mt-6 space-y-6">
            {/* Brand Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Marca</CardTitle>
                <CardDescription>
                  Escolha a marca para editar as configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {brandPresets.map((brand) => (
                    <div
                      key={brand.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeBrand.id === brand.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                      onClick={() => setActiveBrand(brand)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: brand.primaryColor }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: brand.secondaryColor }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{brand.name}</p>
                          <p className="text-xs text-muted-foreground">{brand.fontDisplay}</p>
                        </div>
                        {activeBrand.id === brand.id && (
                          <Check className="w-5 h-5 text-accent ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-accent" />
                  Paleta de Cores
                </CardTitle>
                <CardDescription>
                  Defina as cores principais da marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                        style={{ backgroundColor: activeBrand.primaryColor }}
                      />
                      <Input 
                        id="primaryColor"
                        value={activeBrand.primaryColor}
                        onChange={(e) => setActiveBrand({...activeBrand, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Cor Secundária (Acento)</Label>
                    <div className="flex gap-2 mt-1">
                      <div 
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                        style={{ backgroundColor: activeBrand.secondaryColor }}
                      />
                      <Input 
                        id="secondaryColor"
                        value={activeBrand.secondaryColor}
                        onChange={(e) => setActiveBrand({...activeBrand, secondaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-accent" />
                  Tipografia
                </CardTitle>
                <CardDescription>
                  Fontes utilizadas nos criativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fontDisplay">Fonte de Títulos</Label>
                    <Input 
                      id="fontDisplay"
                      value={activeBrand.fontDisplay}
                      onChange={(e) => setActiveBrand({...activeBrand, fontDisplay: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usada em headlines e destaques
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="fontBody">Fonte de Corpo</Label>
                    <Input 
                      id="fontBody"
                      value={activeBrand.fontBody}
                      onChange={(e) => setActiveBrand({...activeBrand, fontBody: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usada em descrições e textos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  Logotipo
                </CardTitle>
                <CardDescription>
                  Faça upload do logo da marca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label>Logo Principal (Horizontal)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-accent/50 cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG ou SVG, max 2MB
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Logo Secundário (Vertical/Ícone)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-accent/50 cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG ou SVG, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Voice */}
            <Card>
              <CardHeader>
                <CardTitle>Tom de Voz & Slogan</CardTitle>
                <CardDescription>
                  Defina a personalidade da marca para textos gerados por IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input 
                    id="slogan"
                    value={activeBrand.slogan}
                    onChange={(e) => setActiveBrand({...activeBrand, slogan: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="toneOfVoice">Tom de Voz</Label>
                  <Textarea 
                    id="toneOfVoice"
                    value={activeBrand.toneOfVoice}
                    onChange={(e) => setActiveBrand({...activeBrand, toneOfVoice: e.target.value})}
                    className="mt-1"
                    placeholder="Descreva o tom de voz da marca (ex: formal, amigável, luxuoso...)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este texto guia a IA na geração de legendas e textos
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" defaultValue="Maria Costa" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="maria@db8.com.br" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input id="phone" defaultValue="(11) 99999-9999" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Alterar Senha</Button>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Autenticação em duas etapas</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Publicações agendadas", desc: "Receber lembrete antes da publicação" },
                  { label: "Novos templates", desc: "Quando novos templates forem adicionados" },
                  { label: "Créditos baixos", desc: "Quando os créditos estiverem acabando" },
                  { label: "Dicas e novidades", desc: "Receber dicas para melhorar seus criativos" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent text-accent-foreground">PRO</Badge>
                      <span className="font-semibold text-foreground">R$ 97/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      100 créditos/mês • Todos os templates • Sem marca d'água
                    </p>
                  </div>
                  <Button variant="outline">Gerenciar Plano</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Créditos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Créditos usados este mês</span>
                      <span className="font-medium text-foreground">53 / 100</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: "53%" }} />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Comprar Créditos Extras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
