export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          color_scheme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          color_scheme?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          color_scheme?: string;
          updated_at?: string;
        };
      };
      babies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_date: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birth_date?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          birth_date?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      feeds: {
        Row: {
          id: string;
          user_id: string;
          baby_id: string | null;
          title: string;
          amount: string | null;
          detail: string | null;
          time: string;
          caregiver: string;
          type: 'bottle' | 'breast' | 'solid' | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_id?: string | null;
          title: string;
          amount?: string | null;
          detail?: string | null;
          time: string;
          caregiver: string;
          type?: 'bottle' | 'breast' | 'solid' | null;
          date: string;
        };
        Update: {
          title?: string;
          amount?: string | null;
          detail?: string | null;
          time?: string;
          caregiver?: string;
          type?: 'bottle' | 'breast' | 'solid' | null;
          date?: string;
          updated_at?: string;
        };
      };
      diapers: {
        Row: {
          id: string;
          user_id: string;
          baby_id: string | null;
          title: string;
          detail: string | null;
          time: string;
          caregiver: string;
          type: 'wet' | 'dirty' | 'both' | null;
          notes: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_id?: string | null;
          title: string;
          detail?: string | null;
          time: string;
          caregiver: string;
          type?: 'wet' | 'dirty' | 'both' | null;
          notes?: string | null;
          date: string;
        };
        Update: {
          title?: string;
          detail?: string | null;
          time?: string;
          caregiver?: string;
          type?: 'wet' | 'dirty' | 'both' | null;
          notes?: string | null;
          date?: string;
          updated_at?: string;
        };
      };
      sleeps: {
        Row: {
          id: string;
          user_id: string;
          baby_id: string | null;
          title: string;
          detail: string | null;
          duration: string | null;
          start_time: string | null;
          end_time: string | null;
          caregiver: string;
          type: 'nap' | 'overnight' | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_id?: string | null;
          title: string;
          detail?: string | null;
          duration?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          caregiver: string;
          type?: 'nap' | 'overnight' | null;
          date: string;
        };
        Update: {
          title?: string;
          detail?: string | null;
          duration?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          caregiver?: string;
          type?: 'nap' | 'overnight' | null;
          date?: string;
          updated_at?: string;
        };
      };
      preferences: {
        Row: {
          id: string;
          user_id: string;
          feed_reminders: boolean;
          diaper_alerts: boolean;
          sleep_tracking: boolean;
          theme: string;
          time_format: string;
          default_caregiver: string | null;
          measurement_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feed_reminders?: boolean;
          diaper_alerts?: boolean;
          sleep_tracking?: boolean;
          theme?: string;
          time_format?: string;
          default_caregiver?: string | null;
          measurement_unit?: string;
        };
        Update: {
          feed_reminders?: boolean;
          diaper_alerts?: boolean;
          sleep_tracking?: boolean;
          theme?: string;
          time_format?: string;
          default_caregiver?: string | null;
          measurement_unit?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types for easier access
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Baby = Database['public']['Tables']['babies']['Row'];
export type Feed = Database['public']['Tables']['feeds']['Row'];
export type Diaper = Database['public']['Tables']['diapers']['Row'];
export type Sleep = Database['public']['Tables']['sleeps']['Row'];
export type Preferences = Database['public']['Tables']['preferences']['Row'];

export type FeedInsert = Database['public']['Tables']['feeds']['Insert'];
export type FeedUpdate = Database['public']['Tables']['feeds']['Update'];
export type DiaperInsert = Database['public']['Tables']['diapers']['Insert'];
export type DiaperUpdate = Database['public']['Tables']['diapers']['Update'];
export type SleepInsert = Database['public']['Tables']['sleeps']['Insert'];
export type SleepUpdate = Database['public']['Tables']['sleeps']['Update'];
export type PreferencesInsert = Database['public']['Tables']['preferences']['Insert'];
export type PreferencesUpdate = Database['public']['Tables']['preferences']['Update'];
