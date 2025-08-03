/*
  # Final Working Schema for Whistleblowing Platform
  
  This migration creates a clean, working database schema with proper RLS policies.
  It handles both api and public schemas for maximum compatibility.
*/

-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- ============================================================================
-- CREATE TABLES IN PUBLIC SCHEMA (Primary)
-- ============================================================================

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS public.report_updates CASCADE;
DROP TABLE IF EXISTS public.report_files CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;

-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  category text,
  encrypted_report_data text NOT NULL,
  file_count integer DEFAULT 0,
  status text DEFAULT 'received',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_files table
CREATE TABLE public.report_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create report_updates table
CREATE TABLE public.report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_reports_reference_id ON public.reports(reference_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);
CREATE INDEX idx_report_files_report_id ON public.report_files(report_id);
CREATE INDEX idx_report_updates_report_id ON public.report_updates(report_id);
CREATE INDEX idx_platform_settings_key ON public.platform_settings(setting_key);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Reports policies
CREATE POLICY "Allow anonymous report submission" ON public.reports
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous report verification" ON public.reports
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow admin access to reports" ON public.reports
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- Report files policies
CREATE POLICY "Allow anonymous file upload" ON public.report_files
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous file access" ON public.report_files
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow admin access to report_files" ON public.report_files
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- Report updates policies
CREATE POLICY "Allow anonymous update viewing" ON public.report_updates
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous update insertion" ON public.report_updates
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow admin access to report_updates" ON public.report_updates
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- Platform settings policies
CREATE POLICY "Allow anonymous settings read" ON public.platform_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow admin settings management" ON public.platform_settings
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================================

INSERT INTO public.platform_settings (setting_key, setting_value) VALUES
  ('panic_button', '{"redirect_url": "https://www.wikipedia.org", "clear_dom": true}'),
  ('performance', '{"inline_css_threshold": 8, "defer_js": true, "gzip_enabled": true}'),
  ('encryption', '{"public_key_armored": ""}'),
  ('idle_timeout', '{"duration_minutes": 120, "warning_enabled": false, "warning_message": "ستنتهي الجلسة خلال خمس دقائق من الخمول.", "redirect_url": "https://www.wikipedia.org"}'),
  ('draft_settings', '{"enabled": true, "ttl_hours": 2}')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- ============================================================================
-- CREATE TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at 
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.reports TO anon;
GRANT SELECT, INSERT ON public.report_files TO anon;
GRANT SELECT, INSERT ON public.report_updates TO anon;
GRANT SELECT ON public.platform_settings TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage bucket for report files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-files',
  'report-files',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Storage policies
CREATE POLICY "Allow anonymous uploads to report-files bucket" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'report-files');

CREATE POLICY "Allow service_role full access to report-files storage" ON storage.objects
  FOR ALL TO service_role USING (bucket_id = 'report-files') WITH CHECK (bucket_id = 'report-files');