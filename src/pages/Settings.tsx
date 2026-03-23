import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import { Link } from "react-router-dom";
import WorkspaceSettingsCard from "@/components/workspace/WorkspaceSettingsCard";
import WorkspaceMembersCard from "@/components/workspace/WorkspaceMembersCard";
import BackendEnforcementCard from "@/components/workspace/BackendEnforcementCard";
import { supabase } from "@/integrations/supabase/client";
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
  User,
  FileText,
  ExternalLink,
  Mail,
  AlertTriangle,
  Info,
  Trash2,
  Download,
  X,
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
  const { toast } = useToast();
  const [activeBrand, setActiveBrand] = useState(brandPresets[1]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("brands")
        .update({
          primary_color: activeBrand.primaryColor,
          secondary_color: activeBrand.secondaryColor,
          typography_heading: activeBrand.fontDisplay,
          typography_body: activeBrand.fontBody,
          slogan: activeBrand.slogan,
        })
        .eq("slug", activeBrand.id);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao salvar", description: msg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="brand">
              <Palette className="w-4 h-4 mr-2" />
              Marca
            </TabsTrigger>
            <TabsTrigger value="workspace">
              <Settings className="w-4 h-4 mr-2" />
              Workspace
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
            <TabsTrigger value="legal">
              <FileText className="w-4 h-4 mr-2" />
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="mt-6 space-y-6">
            <WorkspaceSettingsCard />
            <WorkspaceMembersCard />
            <BackendEnforcementCard />
          </TabsContent>

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
                <CardDescription>Base pessoal do usuário para futura estrutura de membership e roles.</CardDescription>
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
                <CardDescription>Organize seu crescimento por estágio operacional.</CardDescription>
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

            {/* Credit policy info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent" />
                  Regras de créditos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3 p-3 rounded-xl bg-muted/40">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium text-foreground">Créditos do plano acumulam</span> — Os créditos da sua assinatura acumulam mês a mês enquanto a assinatura estiver ativa e adimplente.</p>
                </div>
                <div className="flex gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium text-foreground">Créditos extras expiram em 30 dias</span> — Créditos comprados avulsos são válidos por 30 dias e não são reembolsáveis.</p>
                </div>
                <div className="flex gap-3 p-3 rounded-xl bg-muted/40">
                  <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p><span className="font-medium text-foreground">Garantia de 7 dias</span> — Para novas assinaturas sem uso efetivo (sem créditos consumidos e sem processamentos iniciados), solicitações de reembolso são aceitas em até 7 dias da contratação.</p>
                </div>
                <p className="text-xs pt-1">
                  Consulte a{" "}
                  <Link to="/termos" className="text-accent underline hover:text-accent/80" onClick={() => {}}>
                    Política de Reembolso completa
                  </Link>{" "}
                  para mais detalhes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal & LGPD */}
          <TabsContent value="legal" className="mt-6 space-y-6">

            {/* Accepted policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Documentos aceitos
                </CardTitle>
                <CardDescription>
                  Ao utilizar o IMOVIE você declara ter lido e aceito os documentos abaixo. O aceite é automático ao clicar em "Comprar", "Assinar" ou "Finalizar compra".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Termos de Uso", tab: "termos", updated: "04/03/2026", desc: "Regras de uso, conteúdo proibido, responsabilidades e foro" },
                  { label: "Política de Privacidade (LGPD)", tab: "privacidade", updated: "04/03/2026", desc: "Dados coletados, finalidades, compartilhamento e direitos do titular" },
                  { label: "Política de Reembolso", tab: "reembolso", updated: "04/03/2026", desc: "Garantia de 7 dias, créditos, chargeback e como solicitar" },
                  { label: "Política de Cancelamento", tab: "cancelamento", updated: "Em breve", desc: "Processo de cancelamento de assinatura" },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">{doc.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Atualizado em: {doc.updated}</p>
                    </div>
                    <Link
                      to={`/termos`}
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Content prohibition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Conteúdo proibido
                </CardTitle>
                <CardDescription>
                  De acordo com os Termos de Uso (Seção 5), é proibido enviar:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Fotos com pessoas identificáveis (rosto ou corpo)",
                    "Documentos pessoais (CPF, RG, CNH, contratos, comprovantes)",
                    "Dados sensíveis, cartões bancários ou informações de pagamento",
                    "Conteúdo ilegal, ofensivo, discriminatório, sexual explícito ou violento",
                    "Material que viole direitos de terceiros (autoria, marca, imagem)",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <span className="font-semibold text-destructive">Consequências:</span> Bloqueio do processamento, remoção do conteúdo, suspensão e/ou encerramento da conta, sem reembolso.
                </p>
              </CardContent>
            </Card>

            {/* LGPD rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Seus direitos (LGPD)
                </CardTitle>
                <CardDescription>
                  Como titular de dados sob a Lei Geral de Proteção de Dados, você tem os seguintes direitos:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { icon: "📋", title: "Acesso", desc: "Solicitar quais dados seus estão armazenados" },
                    { icon: "✏️", title: "Correção", desc: "Corrigir dados incompletos, inexatos ou desatualizados" },
                    { icon: "🗑️", title: "Exclusão", desc: "Solicitar a eliminação de dados desnecessários (quando aplicável)" },
                    { icon: "📦", title: "Portabilidade", desc: "Receber seus dados em formato estruturado (quando aplicável)" },
                    { icon: "ℹ️", title: "Informação", desc: "Saber com quais terceiros seus dados são compartilhados" },
                  ].map((right) => (
                    <div key={right.title} className="flex gap-3 p-3 rounded-xl bg-muted/30">
                      <span className="text-base">{right.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{right.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Para exercer qualquer direito, envie e-mail para{" "}
                    <a
                      href="mailto:suporteimovie@imobcreatorai.com.br?subject=LGPD – IMOVIE"
                      className="text-accent underline hover:text-accent/80"
                    >
                      suporteimovie@imobcreatorai.com.br
                    </a>{" "}
                    com o assunto <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">"LGPD – IMOVIE"</span>.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="mailto:suporteimovie@imobcreatorai.com.br?subject=LGPD%20–%20IMOVIE%20–%20Solicitação%20de%20acesso%20aos%20dados"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Solicitar meus dados
                    </a>
                    <a
                      href="mailto:suporteimovie@imobcreatorai.com.br?subject=LGPD%20–%20IMOVIE%20–%20Solicitação%20de%20exclusão%20de%20dados"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-destructive/30 hover:bg-destructive/5 transition-colors text-destructive/80 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Solicitar exclusão de dados
                    </a>
                    <a
                      href="mailto:suporteimovie@imobcreatorai.com.br?subject=LGPD%20–%20IMOVIE%20–%20Dúvida"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Entrar em contato
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Responsável pelo tratamento</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">DB8 INTERPRACE LTDA</span></p>
                <p>CNPJ 31.982.768/0001-31 · Nome fantasia: DB8 INTELLIGENCE AI</p>
                <p>Plataforma: IMOVIE · <span className="text-accent">imobcreatorai.com.br</span></p>
                <p>Foro: Salvador/BA · Lei brasileira</p>
                <p className="pt-1">
                  Suporte:{" "}
                  <a href="mailto:suporteimovie@imobcreatorai.com.br" className="text-accent underline hover:text-accent/80">
                    suporteimovie@imobcreatorai.com.br
                  </a>
                </p>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
