export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PlanType = "trial" | "economic" | "premium" | "elegant";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: PlanType;
          trial_start_date: string | null;
          trial_end_date: string | null;
          monthly_scan_count: number;
          scan_month: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: PlanType;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          monthly_scan_count?: number;
          scan_month?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: PlanType;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          monthly_scan_count?: number;
          scan_month?: string | null;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          content: string;
          fg_color: string;
          bg_color: string;
          ec_level: string;
          frame: string;
          shape: string;
          status: "active" | "paused";
          scan_count: number;
          logo_url: string | null;
          body_type: string | null;
          eye_frame_type: string | null;
          eye_ball_type: string | null;
          color_mode: string | null;
          gradient_color1: string | null;
          gradient_color2: string | null;
          gradient_angle: number | null;
          qr_scale: number | null;
          shape_scale: number | null;
          qr_offset_x: number | null;
          qr_offset_y: number | null;
          shape_offset_x: number | null;
          shape_offset_y: number | null;
          active_template: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          content: string;
          fg_color?: string;
          bg_color?: string;
          ec_level?: string;
          frame?: string;
          shape?: string;
          status?: "active" | "paused";
          scan_count?: number;
          logo_url?: string | null;
          body_type?: string | null;
          eye_frame_type?: string | null;
          eye_ball_type?: string | null;
          color_mode?: string | null;
          gradient_color1?: string | null;
          gradient_color2?: string | null;
          gradient_angle?: number | null;
          qr_scale?: number | null;
          shape_scale?: number | null;
          qr_offset_x?: number | null;
          qr_offset_y?: number | null;
          shape_offset_x?: number | null;
          shape_offset_y?: number | null;
          active_template?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          content?: string;
          fg_color?: string;
          bg_color?: string;
          ec_level?: string;
          frame?: string;
          shape?: string;
          status?: "active" | "paused";
          scan_count?: number;
          logo_url?: string | null;
          body_type?: string | null;
          eye_frame_type?: string | null;
          eye_ball_type?: string | null;
          color_mode?: string | null;
          gradient_color1?: string | null;
          gradient_color2?: string | null;
          gradient_angle?: number | null;
          qr_scale?: number | null;
          shape_scale?: number | null;
          qr_offset_x?: number | null;
          qr_offset_y?: number | null;
          shape_offset_x?: number | null;
          shape_offset_y?: number | null;
          active_template?: string | null;
        };
      };
      scan_events: {
        Row: {
          id: string;
          qr_code_id: string;
          scanned_at: string;
          country: string | null;
          state: string | null;
          city: string | null;
          device_type: "desktop" | "mobile" | null;
        };
        Insert: {
          id?: string;
          qr_code_id: string;
          scanned_at?: string;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          device_type?: "desktop" | "mobile" | null;
        };
        Update: Record<string, never>;
      };
      chat_requests: {
        Row: {
          id: string;
          name: string;
          phone: string;
          message: string | null;
          status: "pending" | "accepted";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          message?: string | null;
          status?: "pending" | "accepted";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          message?: string | null;
          status?: "pending" | "accepted";
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
