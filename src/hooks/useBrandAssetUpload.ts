import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadResult {
  url: string;
  path: string;
}

export function useBrandAssetUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File, folder: "logos" | "frames"): Promise<UploadResult> => {
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(fileName);

      return { url: publicData.publicUrl, path: fileName };
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
