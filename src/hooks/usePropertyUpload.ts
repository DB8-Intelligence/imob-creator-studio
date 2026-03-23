import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { toast } from "@/hooks/use-toast";

interface PropertyFormData {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
  property_type?: string;
  property_standard?: string;
  city?: string;
  neighborhood?: string;
  investment_value?: string;
  built_area_m2?: string;
  highlights?: string;
}

interface UploadedMedia {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  name: string;
}

/** Converte string para número, retornando null para strings vazias ou NaN */
const toNum = (val: string | undefined): number | null => {
  if (!val || val.trim() === "") return null;
  const n = Number(val.trim());
  return isNaN(n) ? null : n;
};

export function usePropertyUpload() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const createPropertyWithMedia = async (
    propertyData: PropertyFormData,
    files: UploadedMedia[]
  ) => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return null;
    }

    if (!propertyData.title.trim()) {
      toast({ title: "Título obrigatório", description: "Informe o título do imóvel.", variant: "destructive" });
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const imageUrls: string[] = [];
      const totalFiles = files.length;
      let uploadFailed = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(filePath, file.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error for file:", file.name, uploadError);
          uploadFailed += 1;
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("property-media")
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
        setProgress(((i + 1) / totalFiles) * 60);
      }

      if (uploadFailed > 0) {
        toast({
          title: `${uploadFailed} arquivo(s) não enviado(s)`,
          description: "Alguns arquivos falharam no upload. Tente novamente se necessário.",
          variant: "destructive",
        });
      }

      setProgress(65);

      const body: Record<string, unknown> = {
        _method: "POST",
        _path: "/properties",
        title: propertyData.title,
        address: propertyData.address || null,
        price: toNum(propertyData.price),
        bedrooms: toNum(propertyData.bedrooms),
        bathrooms: toNum(propertyData.bathrooms),
        area: toNum(propertyData.area),
        description: propertyData.description || null,
        property_type: propertyData.property_type || "apartamento",
        property_standard: propertyData.property_standard || "medio",
        city: propertyData.city || null,
        neighborhood: propertyData.neighborhood || null,
        investment_value: toNum(propertyData.investment_value),
        built_area_m2: toNum(propertyData.built_area_m2),
        highlights: propertyData.highlights || null,
        workspace_id: workspaceId,
        images: imageUrls,
      };

      const res = await supabase.functions.invoke("inbox-proxy", {
        method: "POST",
        body,
      });

      if (res.error) throw new Error(res.error.message);

      setProgress(100);

      const property = res.data;
      const sent = totalFiles - uploadFailed;
      toast({ title: "Imóvel salvo!", description: `${sent} de ${totalFiles} arquivo(s) enviado(s) com sucesso.` });
      return property;
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { isUploading, progress, createPropertyWithMedia };
}
