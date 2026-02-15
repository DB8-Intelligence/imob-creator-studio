export interface BrandTemplate {
  id: string;
  name: string;
  logo_url?: string;
  frame_url?: string;
  primary_color: string;
  secondary_color: string;
  footer_text?: string;
  logo_position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  created_at?: string;
}

export type BrandTemplateInput = Omit<BrandTemplate, "id" | "created_at">;
