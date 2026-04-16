/**
 * useImageRestoration — Wrapper para o edge function image-restoration.
 * Restaura qualidade de fotos (denoise + upscale) via Gemini 2.0 Flash.
 * Modo restauracao (nao geracao): temperature 0.1, preserva conteudo original.
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RestorationResult {
  success: boolean;
  restoredImageUrl: string;
  mode: "restoration";
  fileName: string;
  mimeType: string;
}

export function useImageRestoration() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const restore = useCallback(
    async (imageBase64: string, workspaceId: string): Promise<string | null> => {
      setIsRestoring(true);
      setProgress(10);

      try {
        setProgress(30);

        const { data, error } = await supabase.functions.invoke("image-restoration", {
          body: { imageBase64, workspaceId },
        });

        setProgress(80);

        if (error) {
          throw new Error(error.message || "Erro na restauracao");
        }

        const result = data as RestorationResult;
        if (!result?.success || !result?.restoredImageUrl) {
          throw new Error("Restauracao nao retornou imagem");
        }

        setProgress(100);
        toast({
          title: "Restauracao concluida",
          description: "Imagem restaurada com sucesso (denoise + upscale)",
        });

        return result.restoredImageUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        toast({
          title: "Erro na restauracao",
          description: message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsRestoring(false);
        setProgress(0);
      }
    },
    [toast],
  );

  return { restore, isRestoring, progress };
}
