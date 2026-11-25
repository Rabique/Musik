export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      musics: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          prompt: string;
          genre: string | null;
          duration: string | null;
          audio_url: string | null;
          cover_url: string | null;
          is_instrumental: boolean | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          prompt: string;
          genre?: string | null;
          duration?: string | null;
          audio_url?: string | null;
          cover_url?: string | null;
          is_instrumental?: boolean | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          prompt?: string;
          genre?: string | null;
          duration?: string | null;
          audio_url?: string | null;
          cover_url?: string | null;
          is_instrumental?: boolean | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type MusicRow = Database["public"]["Tables"]["musics"]["Row"];
export type MusicInsert = Database["public"]["Tables"]["musics"]["Insert"];
export type MusicUpdate = Database["public"]["Tables"]["musics"]["Update"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
