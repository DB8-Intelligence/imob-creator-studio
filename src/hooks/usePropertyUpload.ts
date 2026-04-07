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
      const totalFiles = files.length;

      // Parallel file uploads (3x-5x faster than sequential)
      const uploadResults = await Promise.allSettled(
        files.map(async (file, i) => {
          const fileExt = file.name.split(".").pop();
          const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("property-media")
            .upload(filePath, file.file, {
              cacheControl: "31536000",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error for file:", file.name, uploadError);
            return null;
          }

          const { data: urlData } = supabase.storage
            .from("property-media")
            .getPublicUrl(filePath);

          setProgress(((i + 1) / totalFiles) * 60);
          return urlData.publicUrl;
        })
      );

      const imageUrls = uploadResults
        .filter((r): r is PromiseFulfilledResult<string | null> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((url): url is string => url !== null);

      setProgress(65);

      const body: Record<string, unknown> = {
        _method: "POST",
        _path: "/properties",
        title: propertyData.title,
        address: propertyData.address || null,
        price: propertyData.price ? Number(propertyData.price) : null,
        bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
        bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
        area: propertyData.area ? Number(propertyData.area) : null,
        description: propertyData.description || null,
        property_type: propertyData.property_type || "apartamento",
        property_standard: propertyData.property_standard || "medio",
        city: propertyData.city || null,
        neighborhood: propertyData.neighborhood || null,
        investment_value: propertyData.investment_value ? Number(propertyData.investment_value) : null,
        built_area_m2: propertyData.built_area_m2 ? Number(propertyData.built_area_m2) : null,
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
      toast({ title: "Imóvel salvo!", description: `${totalFiles} arquivo(s) enviado(s) com sucesso.` });
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
