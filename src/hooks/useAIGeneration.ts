import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PropertyData {
  title: string;
  subtitle: string;
  price: string;
  cta: string;
}

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCaption = async (propertyData: PropertyData, aiPrompt?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: { type: "caption", propertyData, aiPrompt },
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
        body: { type: "adjust-text", propertyData, aiPrompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Parse JSON from response
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
        body: { type: "regenerate-caption", propertyData, aiPrompt },
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
