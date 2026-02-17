import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PropertyData {
  title: string;
  subtitle?: string;
  price?: string;
  cta?: string;
  property_type?: string;
  property_standard?: string;
  city?: string;
  neighborhood?: string;
  state?: string;
  investment_value?: string | number | null;
  built_area_m2?: string | number | null;
  highlights?: string;
  [key: string]: unknown;
}

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const buildPayload = (propertyData: PropertyData) => ({
    title: propertyData.title,
    subtitle: propertyData.subtitle,
    price: propertyData.price,
    cta: propertyData.cta,
    propertyType: propertyData.property_type,
    propertyStandard: propertyData.property_standard,
    city: propertyData.city,
    neighborhood: propertyData.neighborhood,
    state: propertyData.state,
    investmentValue: propertyData.investment_value,
    builtAreaM2: propertyData.built_area_m2,
    highlights: propertyData.highlights,
  });

  const generateCaption = async (propertyData: PropertyData, aiPrompt?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: { type: "caption", propertyData: buildPayload(propertyData), aiPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.content as string;
    } catch (e: any) {
      toast({ title: "Erro ao gerar legenda", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const adjustTexts = async (propertyData: PropertyData, aiPrompt: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: { type: "adjust-text", propertyData: buildPayload(propertyData), aiPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const content = data.content as string;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Resposta inválida da IA");
      return JSON.parse(jsonMatch[0]) as Partial<PropertyData>;
    } catch (e: any) {
      toast({ title: "Erro ao ajustar textos", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateCaption = async (propertyData: PropertyData, aiPrompt?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: { type: "regenerate-caption", propertyData: buildPayload(propertyData), aiPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.content as string;
    } catch (e: any) {
      toast({ title: "Erro ao regenerar legenda", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateCaption, adjustTexts, regenerateCaption };
}
