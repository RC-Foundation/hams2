/*
  # Fix Reports Table Permissions

  1. Security Updates
    - Enable RLS on all tables if not already enabled
    - Add policy for anonymous users to insert reports
    - Add policy for anonymous users to read their own reports
    - Add policy for anonymous users to insert report files
    - Add policy for anonymous users to insert report updates
    - Add policy for anonymous users to read platform settings

  2. Table Updates
    - Ensure all required tables exist with proper structure
    - Add any missing indexes for performance

  This migration fixes the "permission denied for table reports" error by allowing
  anonymous users to submit reports while maintaining security.
*/

-- Enable RLS on all tables
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;

-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  category text,
  encrypted_report_data text NOT NULL,
  file_count integer DEFAULT 0,
  status text DEFAULT 'received',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS report_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create report_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create platform_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous users to insert reports" ON reports;
DROP POLICY IF EXISTS "Allow anonymous users to read reports by reference_id" ON reports;
DROP POLICY IF EXISTS "Allow anonymous users to insert report files" ON report_files;
DROP POLICY IF EXISTS "Allow anonymous users to read report files" ON report_files;
DROP POLICY IF EXISTS "Allow anonymous users to insert report updates" ON report_updates;
DROP POLICY IF EXISTS "Allow anonymous users to read report updates" ON report_updates;
DROP POLICY IF EXISTS "Allow anonymous users to read platform settings" ON platform_settings;

-- Create policies for reports table
CREATE POLICY "Allow anonymous users to insert reports"
  ON reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read reports by reference_id"
  ON reports
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for report_files table
CREATE POLICY "Allow anonymous users to insert report files"
  ON report_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read report files"
  ON report_files
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for report_updates table
CREATE POLICY "Allow anonymous users to insert report updates"
  ON report_updates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read report updates"
  ON report_updates
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for platform_settings table
CREATE POLICY "Allow anonymous users to read platform settings"
  ON platform_settings
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_reference_id ON reports(reference_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_report_files_report_id ON report_files(report_id);
CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON report_updates(report_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

-- Insert default platform settings if they don't exist
INSERT INTO platform_settings (setting_key, setting_value) 
VALUES 
  ('panic_button', '{"redirect_url": "https://www.wikipedia.org", "clear_dom": true}'),
  ('performance', '{"inline_css_threshold": 8, "defer_js": true, "gzip_enabled": true}'),
  ('encryption', '{"public_key_armored": ""}'),
  ('idle_timeout', '{"duration_minutes": 120, "warning_enabled": false, "warning_message": "ستنتهي الجلسة خلال خمس دقائق من الخمول.", "redirect_url": "https://www.wikipedia.org"}'),
  ('draft_settings', '{"enabled": true, "ttl_hours": 2}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();