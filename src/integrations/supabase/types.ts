export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          landmark: string | null
          pincode: string
          state: string
          street_address: string
          user_id: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          pincode: string
          state: string
          street_address: string
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          pincode?: string
          state?: string
          street_address?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_id: string
          created_at: string | null
          estimated_delivery_time: number
          expected_delivery_date: string | null
          manufacturer_id: string
          notes: string | null
          price: number
          project_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          bid_id?: string
          created_at?: string | null
          estimated_delivery_time: number
          expected_delivery_date?: string | null
          manufacturer_id: string
          notes?: string | null
          price: number
          project_id: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_id?: string
          created_at?: string | null
          estimated_delivery_time?: number
          expected_delivery_date?: string | null
          manufacturer_id?: string
          notes?: string | null
          price?: number
          project_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          bid_id: string
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          project_id: string
          receiver_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          bid_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          project_id: string
          receiver_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          bid_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          project_id?: string
          receiver_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["bid_id"]
          },
          {
            foreignKeyName: "chat_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_addresses: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          landmark: string | null
          pincode: string
          state: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          pincode: string
          state: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          pincode?: string
          state?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          project_id: string
          read: boolean
          receiver_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          project_id: string
          read?: boolean
          receiver_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          project_id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bid_id: string
          created_at: string | null
          customer_id: string
          delivery_address_id: string | null
          id: string
          manufacturer_id: string
          order_date: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_id: string
          created_at?: string | null
          customer_id: string
          delivery_address_id?: string | null
          id?: string
          manufacturer_id: string
          order_date?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_id?: string
          created_at?: string | null
          customer_id?: string
          delivery_address_id?: string | null
          id?: string
          manufacturer_id?: string
          order_date?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["bid_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "delivery_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          business_docs: string[] | null
          certificates: string[] | null
          city: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          landmark: string | null
          phone: string | null
          pincode: string | null
          portfolio_files: string[] | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"]
          sample_projects: string[] | null
          state: string | null
          street_address: string | null
          total_reviews: number | null
          type_of_manufacturing: string | null
          updated_at: string
          verification_status: string | null
          website_link: string | null
          years_of_experience: number | null
        }
        Insert: {
          bio?: string | null
          business_docs?: string[] | null
          certificates?: string[] | null
          city?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id: string
          landmark?: string | null
          phone?: string | null
          pincode?: string | null
          portfolio_files?: string[] | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          sample_projects?: string[] | null
          state?: string | null
          street_address?: string | null
          total_reviews?: number | null
          type_of_manufacturing?: string | null
          updated_at?: string
          verification_status?: string | null
          website_link?: string | null
          years_of_experience?: number | null
        }
        Update: {
          bio?: string | null
          business_docs?: string[] | null
          certificates?: string[] | null
          city?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          landmark?: string | null
          phone?: string | null
          pincode?: string | null
          portfolio_files?: string[] | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          sample_projects?: string[] | null
          state?: string | null
          street_address?: string | null
          total_reviews?: number | null
          type_of_manufacturing?: string | null
          updated_at?: string
          verification_status?: string | null
          website_link?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      project_bids: {
        Row: {
          bid_amount: number | null
          created_at: string | null
          estimated_delivery_days: number | null
          id: string
          manufacturer_id: string | null
          message: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_amount?: number | null
          created_at?: string | null
          estimated_delivery_days?: number | null
          id?: string
          manufacturer_id?: string | null
          message?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_amount?: number | null
          created_at?: string | null
          estimated_delivery_days?: number | null
          id?: string
          manufacturer_id?: string | null
          message?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          customer_id: string | null
          deadline: string | null
          description: string | null
          expected_delivery_date: string | null
          file_url: string
          id: string
          manufacturing_type: string
          material: string
          preview_url: string | null
          project_name: string
          quantity: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          deadline?: string | null
          description?: string | null
          expected_delivery_date?: string | null
          file_url: string
          id?: string
          manufacturing_type: string
          material: string
          preview_url?: string | null
          project_name: string
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          deadline?: string | null
          description?: string | null
          expected_delivery_date?: string | null
          file_url?: string
          id?: string
          manufacturing_type?: string
          material?: string
          preview_url?: string | null
          project_name?: string
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          manufacturer_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          manufacturer_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          manufacturer_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_message_count: {
        Args: { user_id: string }
        Returns: number
      }
    }
    Enums: {
      user_role: "customer" | "manufacturer"
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
    Enums: {
      user_role: ["customer", "manufacturer"],
    },
  },
} as const
