import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyWithCover {
  id: string;
  title: string;
  address: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  price_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  description: string | null;
  coverUrl: string | null;
}

export function usePropertyWithCover(propertyId: string | null) {
  return useQuery({
    queryKey: ["property-with-cover", propertyId],
    enabled: !!propertyId,
    queryFn: async (): Promise<PropertyWithCover | null> => {
      if (!propertyId) return null;

      const { data: property, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (error || !property) return null;

      const { data: media } = await supabase
        .from("property_media")
        .select("file_url")
        .eq("property_id", propertyId)
        .eq("is_cover", true)
        .maybeSingle();

      // Fallback to first media if no cover
      let coverUrl = media?.file_url ?? null;
      if (!coverUrl) {
        const { data: firstMedia } = await supabase
          .from("property_media")
          .select("file_url")
          .eq("property_id", propertyId)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();
        coverUrl = firstMedia?.file_url ?? null;
      }

      return {
        id: property.id,
        title: property.title,
        address: property.address,
        city: property.city,
        state: property.state,
        price: property.price,
        price_type: property.price_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqm: property.area_sqm,
        description: property.description,
        coverUrl,
      };
    },
  });
}
