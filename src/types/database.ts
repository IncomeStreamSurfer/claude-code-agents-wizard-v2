export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ab_tests: {
        Row: {
          campaign_id: string
          completed_at: string | null
          confidence_threshold: number | null
          created_at: string | null
          id: string
          minimum_sample_size: number | null
          name: string
          started_at: string | null
          status: Database["public"]["Enums"]["test_status"] | null
          updated_at: string | null
          variable_type: string
          winner_variant_id: string | null
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          minimum_sample_size?: number | null
          name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"] | null
          updated_at?: string | null
          variable_type: string
          winner_variant_id?: string | null
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          minimum_sample_size?: number | null
          name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"] | null
          updated_at?: string | null
          variable_type?: string
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ab_tests_winner_variant"
            columns: ["winner_variant_id"]
            isOneToOne: false
            referencedRelation: "ab_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_variants: {
        Row: {
          ad_id: string | null
          created_at: string | null
          id: string
          is_winner: boolean | null
          metrics: Json | null
          name: string
          test_id: string
          traffic_split: number | null
          updated_at: string | null
        }
        Insert: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          metrics?: Json | null
          name: string
          test_id: string
          traffic_split?: number | null
          updated_at?: string | null
        }
        Update: {
          ad_id?: string | null
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          metrics?: Json | null
          name?: string
          test_id?: string
          traffic_split?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_variants_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sets: {
        Row: {
          audience: Json | null
          bid_strategy: string | null
          budget: number | null
          campaign_id: string
          created_at: string | null
          id: string
          name: string
          placements: string[] | null
          platform: Database["public"]["Enums"]["platform_type"]
          platform_ad_set_id: string | null
          platform_status: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          audience?: Json | null
          bid_strategy?: string | null
          budget?: number | null
          campaign_id: string
          created_at?: string | null
          id?: string
          name: string
          placements?: string[] | null
          platform: Database["public"]["Enums"]["platform_type"]
          platform_ad_set_id?: string | null
          platform_status?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          audience?: Json | null
          bid_strategy?: string | null
          budget?: number | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          name?: string
          placements?: string[] | null
          platform?: Database["public"]["Enums"]["platform_type"]
          platform_ad_set_id?: string | null
          platform_status?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_set_id: string
          created_at: string | null
          creative_id: string | null
          cta: string | null
          description: string | null
          destination_url: string | null
          headline: string | null
          id: string
          name: string
          platform_ad_id: string | null
          platform_status: string | null
          review_status: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          tracking_params: Json | null
          updated_at: string | null
          variant_group: string | null
        }
        Insert: {
          ad_set_id: string
          created_at?: string | null
          creative_id?: string | null
          cta?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          name: string
          platform_ad_id?: string | null
          platform_status?: string | null
          review_status?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          tracking_params?: Json | null
          updated_at?: string | null
          variant_group?: string | null
        }
        Update: {
          ad_set_id?: string
          created_at?: string | null
          creative_id?: string | null
          cta?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          name?: string
          platform_ad_id?: string | null
          platform_status?: string | null
          review_status?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          tracking_params?: Json | null
          updated_at?: string | null
          variant_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          colors: Json | null
          created_at: string | null
          fonts: Json | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          org_id: string
          target_audience: Json | null
          updated_at: string | null
          voice_profile: Json | null
          website_url: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          org_id: string
          target_audience?: Json | null
          updated_at?: string | null
          voice_profile?: Json | null
          website_url?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          org_id?: string
          target_audience?: Json | null
          updated_at?: string | null
          voice_profile?: Json | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          daily_budget: number | null
          end_date: string | null
          id: string
          name: string
          objective: string | null
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_intel: {
        Row: {
          ad_library_data: Json | null
          brand_id: string
          competitor_url: string
          created_at: string | null
          id: string
          keywords: string[] | null
          last_scraped: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          ad_library_data?: Json | null
          brand_id: string
          competitor_url: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_scraped?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_library_data?: Json | null
          brand_id?: string
          competitor_url?: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_scraped?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_intel_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          brand_id: string
          created_at: string | null
          dimensions: Json | null
          duration_seconds: number | null
          file_size_bytes: number | null
          file_url: string
          id: string
          is_approved: boolean | null
          metadata: Json | null
          name: string | null
          source: Database["public"]["Enums"]["creative_source"]
          tags: string[] | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["creative_type"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          brand_id: string
          created_at?: string | null
          dimensions?: Json | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          name?: string | null
          source: Database["public"]["Enums"]["creative_source"]
          tags?: string[] | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["creative_type"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string
          created_at?: string | null
          dimensions?: Json | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          is_approved?: boolean | null
          metadata?: Json | null
          name?: string | null
          source?: Database["public"]["Enums"]["creative_source"]
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["creative_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_jobs: {
        Row: {
          attempts: number | null
          brand_id: string
          completed_at: string | null
          created_at: string | null
          creative_id: string | null
          error_message: string | null
          id: string
          negative_prompt: string | null
          parameters: Json | null
          product_id: string | null
          prompt: string
          result_metadata: Json | null
          result_url: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          talent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          brand_id: string
          completed_at?: string | null
          created_at?: string | null
          creative_id?: string | null
          error_message?: string | null
          id?: string
          negative_prompt?: string | null
          parameters?: Json | null
          product_id?: string | null
          prompt: string
          result_metadata?: Json | null
          result_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          talent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          brand_id?: string
          completed_at?: string | null
          created_at?: string | null
          creative_id?: string | null
          error_message?: string | null
          id?: string
          negative_prompt?: string | null
          parameters?: Json | null
          product_id?: string | null
          prompt?: string
          result_metadata?: Json | null
          result_url?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          talent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          action: string | null
          brand_id: string | null
          campaign_id: string | null
          created_at: string | null
          data: Json | null
          dismissed_at: string | null
          dismissed_by: string | null
          id: string
          is_dismissed: boolean | null
          message: string
          severity: Database["public"]["Enums"]["insight_severity"] | null
          title: string
          type: string
        }
        Insert: {
          action?: string | null
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          is_dismissed?: boolean | null
          message: string
          severity?: Database["public"]["Enums"]["insight_severity"] | null
          title: string
          type: string
        }
        Update: {
          action?: string | null
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          is_dismissed?: boolean | null
          message?: string
          severity?: Database["public"]["Enums"]["insight_severity"] | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_dismissed_by_fkey"
            columns: ["dismissed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          plan_id: string | null
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          plan_id?: string | null
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          plan_id?: string | null
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_daily: {
        Row: {
          ad_id: string
          clicks: number | null
          conversions: number | null
          cpa: number | null
          cpc: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          platform_data: Json | null
          revenue: number | null
          roas: number | null
          spend: number | null
          updated_at: string | null
        }
        Insert: {
          ad_id: string
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          platform_data?: Json | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          updated_at?: string | null
        }
        Update: {
          ad_id?: string
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          platform_data?: Json | null
          revenue?: number | null
          roas?: number | null
          spend?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_daily_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_hourly: {
        Row: {
          ad_id: string
          clicks: number | null
          conversions: number | null
          created_at: string | null
          hour: string
          id: string
          impressions: number | null
          spend: number | null
        }
        Insert: {
          ad_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          hour: string
          id?: string
          impressions?: number | null
          spend?: number | null
        }
        Update: {
          ad_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          hour?: string
          id?: string
          impressions?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_hourly_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          feed_product_id: string | null
          feed_source: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          price: number | null
          processed_images: Json | null
          sku: string | null
          updated_at: string | null
          variants: Json | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          feed_product_id?: string | null
          feed_source?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price?: number | null
          processed_images?: Json | null
          sku?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          feed_product_id?: string | null
          feed_source?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number | null
          processed_images?: Json | null
          sku?: string | null
          updated_at?: string | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      research_reports: {
        Row: {
          brand_id: string
          created_at: string | null
          data: Json | null
          generated_at: string | null
          id: string
          title: string | null
          type: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          data?: Json | null
          generated_at?: string | null
          id?: string
          title?: string | null
          type: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          data?: Json | null
          generated_at?: string | null
          id?: string
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          org_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          org_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          approved_platforms: Database["public"]["Enums"]["platform_type"][] | null
          brand_id: string
          created_at: string | null
          expires_at: string | null
          face_encoding: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          reference_images: string[]
          updated_at: string | null
          usage_rights: Json | null
        }
        Insert: {
          approved_platforms?: Database["public"]["Enums"]["platform_type"][] | null
          brand_id: string
          created_at?: string | null
          expires_at?: string | null
          face_encoding?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          reference_images: string[]
          updated_at?: string | null
          usage_rights?: Json | null
        }
        Update: {
          approved_platforms?: Database["public"]["Enums"]["platform_type"][] | null
          brand_id?: string
          created_at?: string | null
          expires_at?: string | null
          face_encoding?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          reference_images?: string[]
          updated_at?: string | null
          usage_rights?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "talents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage: {
        Row: {
          api_calls_used: number | null
          created_at: string | null
          generations_used: number | null
          id: string
          org_id: string
          period_end: string
          period_start: string
          storage_bytes_used: number | null
          updated_at: string | null
        }
        Insert: {
          api_calls_used?: number | null
          created_at?: string | null
          generations_used?: number | null
          id?: string
          org_id: string
          period_end: string
          period_start: string
          storage_bytes_used?: number | null
          updated_at?: string | null
        }
        Update: {
          api_calls_used?: number | null
          created_at?: string | null
          generations_used?: number | null
          id?: string
          org_id?: string
          period_end?: string
          period_start?: string
          storage_bytes_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_active_at: string | null
          org_id: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_active_at?: string | null
          org_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          org_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      campaign_status: "draft" | "pending" | "active" | "paused" | "completed" | "archived"
      creative_source: "uploaded" | "generated" | "imported"
      creative_type: "image" | "video" | "carousel" | "html5"
      insight_severity: "info" | "warning" | "critical" | "opportunity"
      job_status: "queued" | "processing" | "completed" | "failed" | "cancelled"
      platform_type: "meta" | "google" | "tiktok" | "linkedin" | "pinterest" | "programmatic"
      subscription_status: "active" | "past_due" | "cancelled" | "trialing"
      test_status: "draft" | "running" | "paused" | "completed"
      user_role: "owner" | "admin" | "manager" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

// Convenience type aliases
export type User = Tables<"users">
export type Organization = Tables<"organizations">
export type Team = Tables<"teams">
export type Plan = Tables<"plans">
export type Subscription = Tables<"subscriptions">
export type Usage = Tables<"usage">
export type Brand = Tables<"brands">
export type Product = Tables<"products">
export type Talent = Tables<"talents">
export type Creative = Tables<"creatives">
export type GenerationJob = Tables<"generation_jobs">
export type Campaign = Tables<"campaigns">
export type AdSet = Tables<"ad_sets">
export type Ad = Tables<"ads">
export type PerformanceDaily = Tables<"performance_daily">
export type PerformanceHourly = Tables<"performance_hourly">
export type AbTest = Tables<"ab_tests">
export type AbVariant = Tables<"ab_variants">
export type Insight = Tables<"insights">
export type CompetitorIntel = Tables<"competitor_intel">
export type ResearchReport = Tables<"research_reports">

// Enum type aliases
export type UserRole = Enums<"user_role">
export type CampaignStatus = Enums<"campaign_status">
export type CreativeType = Enums<"creative_type">
export type CreativeSource = Enums<"creative_source">
export type PlatformType = Enums<"platform_type">
export type JobStatus = Enums<"job_status">
export type TestStatus = Enums<"test_status">
export type InsightSeverity = Enums<"insight_severity">
export type SubscriptionStatus = Enums<"subscription_status">
