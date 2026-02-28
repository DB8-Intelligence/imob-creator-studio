import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ArtFormat = "feed" | "story" | "reels";

interface GenerateArtParams {
  propertyId: string;
  imageUrl: string;
  title?: string;
  description?: string;
  brandId?: string;
  format?: ArtFormat;
  customPrompt?: string;
}

interface GenerateArtResult {
  success: boolean;
  artUrl: string;
  fileName: string;
  format: string;
  creativeId: string | null;
}

interface Creative {
  id: string;
  name: string;
  format: string;
  exported_url: string | null;
  status: string | null;
  created_at: string;
  content_data: Record<string, unknown> | null;
}

export function useArtGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateArt = async (params: GenerateArtParams): Promise<GenerateArtResult | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-art", {
        body: {
          propertyId: params.propertyId,
          imageUrl: params.imageUrl,
          title: params.title,
          description: params.description,
          brandId: params.brandId,
          format: params.format || "feed",
          customPrompt: params.customPrompt,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({ title: "Arte gerada com sucesso!" });
      return data as GenerateArtResult;
    } catch (e: any) {
      const msg = e.message || "Erro desconhecido";
      if (msg.includes("429")) {
        toast({ title: "Limite excedido", description: "Aguarde alguns segundos e tente novamente.", variant: "destructive" });
      } else if (msg.includes("402")) {
        toast({ title: "Créditos insuficientes", description: "Adicione créditos para continuar gerando artes.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao gerar arte", description: msg, variant: "destructive" });
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateArt };
}

export function usePropertyCreatives(propertyId: string | null) {
  return useQuery({
    queryKey: ["property-creatives", propertyId],
    queryFn: async (): Promise<Creative[]> => {
      if (!propertyId) return [];
      const { data, error } = await supabase
        .from("creatives")
        .select("id, name, format, exported_url, status, created_at, content_data")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Creative[];
    },
    enabled: !!propertyId,
  });
}
