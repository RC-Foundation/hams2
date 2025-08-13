import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist sessions for anonymity
  },
  db: {
45wgrc-codex/verify-functionality-of-hams-website
    schema: 'api', // Set default schema to 'api'

    // Use dedicated "api" schema instead of default "public"
    schema: 'api',
main
  },
});

// Database types
export interface Report {
  id: string;
  reference_id: string;
  category?: string;
  encrypted_report_data: string;
  file_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFile {
  id: string;
  report_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ReportUpdate {
  id: string;
  report_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  updated_at: string;
}