export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          id: string
          is_system: boolean | null
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          slogan: string | null
          slug: string
          typography_body: string | null
          typography_heading: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string
          secondary_color?: string
          slogan?: string | null
          slug: string
          typography_body?: string | null
          typography_heading?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          slogan?: string | null
          slug?: string
          typography_body?: string | null
          typography_heading?: string | null
        }
        Relationships: []
      }
      creatives: {
        Row: {
          brand_id: string | null
          caption: string | null
          content_data: Json | null
          created_at: string
          exported_url: string | null
          format: string
          hashtags: string[] | null
          id: string
          name: string
          property_id: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          caption?: string | null
          content_data?: Json | null
          created_at?: string
          exported_url?: string | null
          format: string
          hashtags?: string[] | null
          id?: string
          name: string
          property_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          caption?: string | null
          content_data?: Json | null
          created_at?: string
          exported_url?: string | null
          format?: string
          hashtags?: string[] | null
          id?: string
          name?: string
          property_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          creci: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          creci?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          brand_id: string | null
          built_area_m2: number | null
          city: string | null
          created_at: string
          description: string | null
          features: string[] | null
          highlights: string | null
          id: string
          investment_value: number | null
          neighborhood: string | null
          price: number | null
          price_type: string | null
          property_standard: string | null
          property_type: string | null
          state: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brand_id?: string | null
          built_area_m2?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          highlights?: string | null
          id?: string
          investment_value?: number | null
          neighborhood?: string | null
          price?: number | null
          price_type?: string | null
          property_standard?: string | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          brand_id?: string | null
          built_area_m2?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          highlights?: string | null
          id?: string
          investment_value?: number | null
          neighborhood?: string | null
          price?: number | null
          price_type?: string | null
          property_standard?: string | null
          property_type?: string | null
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_cover: boolean | null
          property_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_cover?: boolean | null
          property_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_cover?: boolean | null
          property_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          brand_id: string | null
          category: string | null
          created_at: string
          description: string | null
          format: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          style: string | null
          template_data: Json | null
          thumbnail_url: string | null
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          format: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          style?: string | null
          template_data?: Json | null
          thumbnail_url?: string | null
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          format?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          style?: string | null
          template_data?: Json | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
