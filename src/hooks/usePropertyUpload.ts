import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface PropertyFormData {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
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
      // 1. Create the property
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          title: propertyData.title,
          address: propertyData.address || null,
          price: propertyData.price ? parseFloat(propertyData.price.replace(/\D/g, "")) : null,
          bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
          bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : null,
          area_sqm: propertyData.area ? parseFloat(propertyData.area) : null,
          description: propertyData.description || null,
        })
        .select()
        .single();

      if (propError) throw propError;

      setProgress(20);

      // 2. Upload files to storage and create media records
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${property.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(filePath, file.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error for file:", file.name, uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("property-media")
          .getPublicUrl(filePath);

        await supabase.from("property_media").insert({
          property_id: property.id,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_name: file.name,
          file_size: file.file.size,
          is_cover: i === 0,
          sort_order: i,
        });

        setProgress(20 + ((i + 1) / totalFiles) * 80);
      }

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
