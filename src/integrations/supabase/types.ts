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
      acquisition_attribution: {
        Row: {
          created_at: string
          first_touch_at: string | null
          id: string
          landing_page: string | null
          last_touch_at: string | null
          last_utm_campaign: string | null
          last_utm_content: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          last_utm_term: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          first_touch_at?: string | null
          id?: string
          landing_page?: string | null
          last_touch_at?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          first_touch_at?: string | null
          id?: string
          landing_page?: string | null
          last_touch_at?: string | null
          last_utm_campaign?: string | null
          last_utm_content?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          last_utm_term?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_attribution_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_agent_jobs: {
        Row: {
          brand_snapshot: Json | null
          canal: string
          created_at: string
          error_message: string | null
          format: string
          id: string
          n8n_execution_id: string | null
          options: Json | null
          output_metadata: Json | null
          output_type: string | null
          output_url: string | null
          phase: number
          selected_option_id: string | null
          status: string
          subtopic: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_snapshot?: Json | null
          canal?: string
          created_at?: string
          error_message?: string | null
          format: string
          id?: string
          n8n_execution_id?: string | null
          options?: Json | null
          output_metadata?: Json | null
          output_type?: string | null
          output_url?: string | null
          phase?: number
          selected_option_id?: string | null
          status?: string
          subtopic?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_snapshot?: Json | null
          canal?: string
          created_at?: string
          error_message?: string | null
          format?: string
          id?: string
          n8n_execution_id?: string | null
          options?: Json | null
          output_metadata?: Json | null
          output_type?: string | null
          output_url?: string | null
          phase?: number
          selected_option_id?: string | null
          status?: string
          subtopic?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creatives: {
        Row: {
          brand_id: string | null
          caption: string | null
          content_data: Json | null
          created_at: string
          exported_url: string | null
          format: string
          id: string
          name: string
          property_id: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          brand_id?: string | null
          caption?: string | null
          content_data?: Json | null
          created_at?: string
          exported_url?: string | null
          format?: string
          id?: string
          name?: string
          property_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          brand_id?: string | null
          caption?: string | null
          content_data?: Json | null
          created_at?: string
          exported_url?: string | null
          format?: string
          id?: string
          name?: string
          property_id?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          credits_after: number
          description: string | null
          id: string
          metadata: Json | null
          order_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_after: number
          description?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_after?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_config: {
        Row: {
          ad_spend_google_brl: number
          ad_spend_meta_brl: number
          config_month: string
          created_at: string
          id: string
          notes: string | null
          other_acquisition_costs_brl: number
        }
        Insert: {
          ad_spend_google_brl?: number
          ad_spend_meta_brl?: number
          config_month: string
          created_at?: string
          id?: string
          notes?: string | null
          other_acquisition_costs_brl?: number
        }
        Update: {
          ad_spend_google_brl?: number
          ad_spend_meta_brl?: number
          config_month?: string
          created_at?: string
          id?: string
          notes?: string | null
          other_acquisition_costs_brl?: number
        }
        Relationships: []
      }
      generated_assets: {
        Row: {
          asset_type: string | null
          asset_url: string
          created_at: string | null
          engine_id: string | null
          file_size_bytes: number | null
          format: string | null
          generation_type: string | null
          height: number | null
          id: string
          job_id: string
          metadata: Json | null
          preview_url: string | null
          property_id: string | null
          storage_path: string | null
          template_id: string | null
          user_id: string
          width: number | null
          workspace_id: string | null
        }
        Insert: {
          asset_type?: string | null
          asset_url: string
          created_at?: string | null
          engine_id?: string | null
          file_size_bytes?: number | null
          format?: string | null
          generation_type?: string | null
          height?: number | null
          id?: string
          job_id: string
          metadata?: Json | null
          preview_url?: string | null
          property_id?: string | null
          storage_path?: string | null
          template_id?: string | null
          user_id: string
          width?: number | null
          workspace_id?: string | null
        }
        Update: {
          asset_type?: string | null
          asset_url?: string
          created_at?: string | null
          engine_id?: string | null
          file_size_bytes?: number | null
          format?: string | null
          generation_type?: string | null
          height?: number | null
          id?: string
          job_id?: string
          metadata?: Json | null
          preview_url?: string | null
          property_id?: string | null
          storage_path?: string | null
          template_id?: string | null
          user_id?: string
          width?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          aspect_ratio: string | null
          branding: Json | null
          callback_mode: string
          callback_url: string | null
          completed_at: string | null
          created_at: string | null
          credits_consumed: number | null
          editable_fields: Json | null
          engine_id: string
          error_message: string | null
          from_studio: boolean | null
          generation_type: string
          id: string
          image_urls: string[] | null
          metadata: Json | null
          n8n_execution_id: string | null
          preview_url: string | null
          prompt_base: string | null
          property_id: string | null
          request_payload: Json | null
          result_url: string | null
          result_urls: string[] | null
          status: string
          style: string | null
          template_id: string | null
          template_name: string | null
          updated_at: string | null
          use_case_id: string | null
          user_id: string
          visual_style: string | null
          workspace_id: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          branding?: Json | null
          callback_mode?: string
          callback_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_consumed?: number | null
          editable_fields?: Json | null
          engine_id: string
          error_message?: string | null
          from_studio?: boolean | null
          generation_type: string
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          n8n_execution_id?: string | null
          preview_url?: string | null
          prompt_base?: string | null
          property_id?: string | null
          request_payload?: Json | null
          result_url?: string | null
          result_urls?: string[] | null
          status?: string
          style?: string | null
          template_id?: string | null
          template_name?: string | null
          updated_at?: string | null
          use_case_id?: string | null
          user_id: string
          visual_style?: string | null
          workspace_id?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          branding?: Json | null
          callback_mode?: string
          callback_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_consumed?: number | null
          editable_fields?: Json | null
          engine_id?: string
          error_message?: string | null
          from_studio?: boolean | null
          generation_type?: string
          id?: string
          image_urls?: string[] | null
          metadata?: Json | null
          n8n_execution_id?: string | null
          preview_url?: string | null
          prompt_base?: string | null
          property_id?: string | null
          request_payload?: Json | null
          result_url?: string | null
          result_urls?: string[] | null
          status?: string
          style?: string | null
          template_id?: string | null
          template_name?: string | null
          updated_at?: string | null
          use_case_id?: string | null
          user_id?: string
          visual_style?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generation_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          job_id: string
          level: string
          message: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          job_id: string
          level?: string
          message: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          job_id?: string
          level?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          images: Json | null
          sender_phone: string | null
          source: string | null
          status: string | null
          template_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          sender_phone?: string | null
          source?: string | null
          status?: string | null
          template_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          sender_phone?: string | null
          source?: string | null
          status?: string | null
          template_id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      mrr_snapshots: {
        Row: {
          active_paid_users: number
          arpu_brl: number | null
          churned_users: number
          created_at: string
          id: string
          mrr_brl: number
          new_paid_users: number
          notes: string | null
          snapshot_month: string
        }
        Insert: {
          active_paid_users?: number
          arpu_brl?: number | null
          churned_users?: number
          created_at?: string
          id?: string
          mrr_brl?: number
          new_paid_users?: number
          notes?: string | null
          snapshot_month: string
        }
        Update: {
          active_paid_users?: number
          arpu_brl?: number | null
          churned_users?: number
          created_at?: string
          id?: string
          mrr_brl?: number
          new_paid_users?: number
          notes?: string | null
          snapshot_month?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          activated_at: string | null
          created_at: string
          dismissed: boolean
          steps_done: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          dismissed?: boolean
          steps_done?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          dismissed?: boolean
          steps_done?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      platform_stats: {
        Row: {
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          key: string
          updated_at?: string
          value?: number
        }
        Update: {
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          creci: string | null
          evolution_instance_name: string | null
          full_name: string | null
          id: string
          instagram: string | null
          language_style: string | null
          motivo_uso: string | null
          onboarding_completed: boolean | null
          phone: string | null
          profissao: string | null
          segmento_mercado: string | null
          state: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          whatsapp_connected: boolean | null
          whatsapp_number: string | null
          whatsapp_verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          creci?: string | null
          evolution_instance_name?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          language_style?: string | null
          motivo_uso?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          profissao?: string | null
          segmento_mercado?: string | null
          state?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_connected?: boolean | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          creci?: string | null
          evolution_instance_name?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          language_style?: string | null
          motivo_uso?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          profissao?: string | null
          segmento_mercado?: string | null
          state?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_connected?: boolean | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          category: string
          category_value: string
          created_at: string
          id: string
          prompt_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          category_value: string
          created_at?: string
          id?: string
          prompt_text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          category_value?: string
          created_at?: string
          id?: string
          prompt_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          investment_value: number | null
          neighborhood: string | null
          price: number | null
          price_type: string | null
          property_type: string | null
          size_m2: number | null
          standard: string | null
          state: string | null
          status: string | null
          title: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          investment_value?: number | null
          neighborhood?: string | null
          price?: number | null
          price_type?: string | null
          property_type?: string | null
          size_m2?: number | null
          standard?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          investment_value?: number | null
          neighborhood?: string | null
          price?: number | null
          price_type?: string | null
          property_type?: string | null
          size_m2?: number | null
          standard?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          is_cover: boolean | null
          property_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          is_cover?: boolean | null
          property_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          file_type?: string | null
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
      referral_codes: {
        Row: {
          click_count: number
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          click_count?: number
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          click_count?: number
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_events: {
        Row: {
          code: string
          created_at: string
          event_type: string
          id: string
          referred_user_id: string | null
          referrer_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          event_type: string
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          event_type?: string
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_events_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          description: string | null
          granted_at: string
          id: string
          referral_event_id: string | null
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          description?: string | null
          granted_at?: string
          id?: string
          referral_event_id?: string | null
          reward_type: string
          reward_value: number
          user_id: string
        }
        Update: {
          description?: string | null
          granted_at?: string
          id?: string
          referral_event_id?: string | null
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_event_id_fkey"
            columns: ["referral_event_id"]
            isOneToOne: false
            referencedRelation: "referral_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string | null
          frame_url: string | null
          id: string
          logo_url: string | null
          name: string | null
          primary_color: string | null
          secondary_color: string | null
        }
        Insert: {
          created_at?: string | null
          frame_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          created_at?: string | null
          frame_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          email: string
          id: string
          user_plan: string | null
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          email: string
          id?: string
          user_plan?: string | null
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          email?: string
          id?: string
          user_plan?: string | null
        }
        Relationships: []
      }
      user_events: {
        Row: {
          category: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_teste2: {
        Row: {
          "credits_remaining:": number | null
          email: string | null
          id: number
          user_plan: string | null
        }
        Insert: {
          "credits_remaining:"?: number | null
          email?: string | null
          id?: number
          user_plan?: string | null
        }
        Update: {
          "credits_remaining:"?: number | null
          email?: string | null
          id?: number
          user_plan?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          credits_total: number
          email: string | null
          id: string
          user_plan: string | null
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total?: number
          email?: string | null
          id?: string
          user_plan?: string | null
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          credits_total?: number
          email?: string | null
          id?: string
          user_plan?: string | null
        }
        Relationships: []
      }
      video_job_segments: {
        Row: {
          clip_duration_seconds: number
          created_at: string
          id: string
          metadata: Json | null
          output_clip_url: string | null
          provider: string | null
          provider_job_id: string | null
          sequence_index: number
          source_image_name: string | null
          source_image_path: string | null
          status: string
          updated_at: string
          video_job_id: string
          workspace_id: string
        }
        Insert: {
          clip_duration_seconds?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          output_clip_url?: string | null
          provider?: string | null
          provider_job_id?: string | null
          sequence_index: number
          source_image_name?: string | null
          source_image_path?: string | null
          status?: string
          updated_at?: string
          video_job_id: string
          workspace_id: string
        }
        Update: {
          clip_duration_seconds?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          output_clip_url?: string | null
          provider?: string | null
          provider_job_id?: string | null
          sequence_index?: number
          source_image_name?: string | null
          source_image_path?: string | null
          status?: string
          updated_at?: string
          video_job_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_job_segments_video_job_id_fkey"
            columns: ["video_job_id"]
            isOneToOne: false
            referencedRelation: "video_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_job_segments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      video_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          credits_used: number
          duration_seconds: number
          format: string
          id: string
          metadata: Json | null
          output_url: string | null
          photos_count: number
          property_id: string | null
          resolution: string
          status: string
          style: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credits_used?: number
          duration_seconds: number
          format: string
          id?: string
          metadata?: Json | null
          output_url?: string | null
          photos_count?: number
          property_id?: string | null
          resolution?: string
          status?: string
          style: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credits_used?: number
          duration_seconds?: number
          format?: string
          id?: string
          metadata?: Json | null
          output_url?: string | null
          photos_count?: number
          property_id?: string | null
          resolution?: string
          status?: string
          style?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_jobs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      video_plan_addons: {
        Row: {
          addon_type: string
          billing_cycle: string
          created_at: string
          credits_total: number | null
          credits_used: number
          expires_at: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          addon_type?: string
          billing_cycle?: string
          created_at?: string
          credits_total?: number | null
          credits_used?: number
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          addon_type?: string
          billing_cycle?: string
          created_at?: string
          credits_total?: number | null
          credits_used?: number
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_plan_addons_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workspace_memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workspace_memberships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          plan: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          plan?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          plan?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      funnel_metrics_personal: {
        Row: {
          first_creative_at: string | null
          first_login_at: string | null
          paid_at: string | null
          signup_at: string | null
          total_creatives: number | null
          trial_start_at: string | null
          upgrade_views: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "retargeting_segments"
            referencedColumns: ["user_id"]
          },
        ]
      }
      retargeting_segments: {
        Row: {
          creative_count: number | null
          email: string | null
          first_creative_at: string | null
          paid_at: string | null
          retargeting_segment: string | null
          signup_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_video_addon: {
        Args: {
          target_addon_type: string
          target_billing_cycle?: string
          target_workspace_id: string
        }
        Returns: {
          addon_type: string
          billing_cycle: string
          created_at: string
          credits_total: number | null
          credits_used: number
          expires_at: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "video_plan_addons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bootstrap_workspace_for_user: {
        Args: { target_user_id: string }
        Returns: string
      }
      consume_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      consume_video_credit: {
        Args: { target_workspace_id: string }
        Returns: {
          addon_type: string
          billing_cycle: string
          created_at: string
          credits_total: number | null
          credits_used: number
          expires_at: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "video_plan_addons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      credit_purchase: {
        Args: {
          p_amount: number
          p_description?: string
          p_email: string
          p_metadata?: Json
          p_order_id: string
        }
        Returns: Json
      }
      ensure_workspace_for_current_user: { Args: never; Returns: string }
      release_video_credit: {
        Args: { credit_amount?: number; target_workspace_id: string }
        Returns: {
          addon_type: string
          billing_cycle: string
          created_at: string
          credits_total: number | null
          credits_used: number
          expires_at: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "video_plan_addons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
