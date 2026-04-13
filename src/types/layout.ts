export type LayoutScope =
  | "site_corretor"
  | "dashboard_user"
  | "site_mae"
  | "video_timeline"
  | "whatsapp_flow"
  | "social_calendar";

export type BlockType =
  // Site Corretor
  | "hero_site"
  | "gallery_site"
  | "about_corretor"
  | "featured_properties"
  | "contact_site"
  | "testimonials"
  | "cta_site"
  | "stats_site"
  | "services_site"
  // Dashboard User
  | "widget_credits"
  | "widget_recent_creatives"
  | "widget_leads"
  | "widget_videos"
  | "widget_schedule"
  | "widget_performance"
  | "widget_quick_actions"
  // Site Mãe (admin)
  | "section_hero_mae"
  | "section_features"
  | "section_pricing"
  | "section_testimonials_mae"
  | "section_faq"
  | "section_cta_mae"
  | "section_stats_mae"
  // Vídeo
  | "video_photo_clip"
  | "video_text_overlay"
  | "video_music"
  | "video_transition"
  // WhatsApp
  | "wa_message"
  | "wa_condition"
  | "wa_delay"
  | "wa_action"
  | "wa_end"
  // Social
  | "post_instagram"
  | "post_facebook"
  | "post_story"
  | "post_reel";

export type BlockPlan = "starter" | "basico" | "pro" | "max";

export interface LayoutBlockStyle {
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  customClass?: string;
}

export interface LayoutBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, unknown>;
  style?: LayoutBlockStyle;
}

export interface LayoutConfig {
  id: string;
  scope: LayoutScope;
  blocks: LayoutBlock[];
  theme?: string;
  globalStyles?: Record<string, unknown>;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  scopes: LayoutScope[];
  minPlan: BlockPlan;
  defaultProps: Record<string, unknown>;
  previewComponent: string;
}

export interface LayoutBlockRegistryRow {
  id: string;
  block_type: BlockType;
  scope: LayoutScope[];
  label: string;
  description: string;
  icon: string;
  default_props: Record<string, unknown>;
  min_plan: BlockPlan;
  preview_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface UserLayoutRow {
  id: string;
  user_id: string;
  scope: LayoutScope;
  template_id: string | null;
  name: string;
  blocks: LayoutBlock[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLayoutRow {
  id: string;
  scope: "site_mae" | "dashboard_global";
  name: string;
  blocks: LayoutBlock[];
  is_active: boolean;
  activated_by: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LayoutTemplateRow {
  id: string;
  scope: LayoutScope;
  name: string;
  description: string;
  thumbnail_url: string;
  is_default: boolean;
  is_system: boolean;
  blocks: LayoutBlock[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
