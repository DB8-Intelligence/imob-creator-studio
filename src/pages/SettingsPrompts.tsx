import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Check, Sparkles, Building2, Star, MapPin } from "lucide-react";

type PromptCategory = "property_type" | "property_standard" | "state";

interface PromptEntry {
  category: PromptCategory;
  category_value: string;
  prompt_text: string;
  label: string;
}

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "lancamento", label: "Lançamento" },
  { value: "terreno", label: "Terreno" },
  { value: "oportunidade", label: "Oportunidade" },
];

const PROPERTY_STANDARDS: { value: string; label: string }[] = [
  { value: "economico", label: "Econômico" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
  { value: "luxo", label: "Luxo" },
];

const ESTADOS_BR: { value: string; label: string }[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const SettingsPrompts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Store all prompts keyed by "category:category_value"
  const [prompts, setPrompts] = useState<Record<string, string>>({});

  const makeKey = (cat: string, val: string) => `${cat}:${val}`;

  const fetchPrompts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("category, category_value, prompt_text")
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Erro ao carregar prompts", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[makeKey(row.category, row.category_value)] = row.prompt_text;
    });
    setPrompts(map);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const updatePrompt = (category: string, value: string, text: string) => {
    setPrompts((prev) => ({ ...prev, [makeKey(category, value)]: text }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Build upsert array from all non-empty prompts
    const rows = Object.entries(prompts)
      .filter(([, text]) => text.trim() !== "")
      .map(([key, text]) => {
        const [category, category_value] = key.split(":");
        return {
          user_id: user.id,
          category,
          category_value,
          prompt_text: text.trim(),
        };
      });

    if (rows.length > 0) {
      const { error } = await supabase
        .from("prompt_templates")
        .upsert(rows, { onConflict: "user_id,category,category_value" });

      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSaved(true);
    toast({ title: "Prompts salvos com sucesso!" });
    setTimeout(() => setSaved(false), 3000);
  };

  const renderPromptCards = (
    items: { value: string; label: string }[],
    category: PromptCategory,
    placeholder: string
  ) => (
    <div className="space-y-4">
      {items.map((item) => {
        const key = makeKey(category, item.value);
        return (
          <div key={key} className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{item.label}</Badge>
            </Label>
            <Textarea
              value={prompts[key] || ""}
              onChange={(e) => updatePrompt(category, item.value, e.target.value)}
              placeholder={placeholder.replace("{label}", item.label)}
              rows={3}
              className="text-sm"
            />
          </div>
        );
      })}
    </div>
  );

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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Configuração de Prompts
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize os prompts base que a IA usa para gerar legendas e textos
            </p>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? (
              <><Check className="w-4 h-4 mr-2" />Salvo!</>
            ) : saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Salvar Prompts</>
            )}
          </Button>
        </div>

        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Os prompts configurados aqui serão utilizados como base pela IA ao gerar legendas e textos
              para seus imóveis. Quanto mais detalhado, melhor será o resultado. Deixe em branco para usar
              o prompt padrão do sistema.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="property_type">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="property_type" className="gap-1.5">
              <Building2 className="w-4 h-4" />
              Por Tipo
            </TabsTrigger>
            <TabsTrigger value="property_standard" className="gap-1.5">
              <Star className="w-4 h-4" />
              Por Padrão
            </TabsTrigger>
            <TabsTrigger value="state" className="gap-1.5">
              <MapPin className="w-4 h-4" />
              Por Estado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="property_type" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompts por Tipo de Imóvel</CardTitle>
                <CardDescription>
                  Defina instruções específicas para cada tipo de imóvel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPromptCards(
                  PROPERTY_TYPES,
                  "property_type",
                  "Ex: Para imóveis do tipo {label}, destaque..."
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="property_standard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompts por Padrão</CardTitle>
                <CardDescription>
                  Adapte o tom e a abordagem por padrão de imóvel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPromptCards(
                  PROPERTY_STANDARDS,
                  "property_standard",
                  "Ex: Para imóveis padrão {label}, use linguagem..."
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="state" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompts por Estado</CardTitle>
                <CardDescription>
                  Regionalize a copy com referências e expressões locais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPromptCards(
                  ESTADOS_BR,
                  "state",
                  "Ex: Para imóveis em {label}, mencione..."
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPrompts;
