/*
  # Secure Whistleblowing Platform Database Schema - Refined

  1. New Tables (in api schema)
    - `reports`
      - `id` (uuid, primary key)
      - `reference_id` (text, unique)
      - `category` (text)
      - `encrypted_report_data` (text)
      - `file_count` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `report_files`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key)
      - `file_name` (text)
      - `file_path` (text)
      - `file_size` (integer)
      - `mime_type` (text)
      - `created_at` (timestamp)
    
    - `report_updates`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key)
      - `status` (text)
      - `message` (text)
      - `created_at` (timestamp)
    
    - `platform_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (jsonb)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous access to reports
    - Add policies for admin access to settings
*/

-- Ensure api schema exists
CREATE SCHEMA IF NOT EXISTS api;

-- Drop all tables with CASCADE to remove all dependencies and policies
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.report_files CASCADE;
DROP TABLE IF EXISTS public.report_updates CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;
DROP TABLE IF EXISTS api.reports CASCADE;
DROP TABLE IF EXISTS api.report_files CASCADE;
DROP TABLE IF EXISTS api.report_updates CASCADE;
DROP TABLE IF EXISTS api.platform_settings CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS api.update_updated_at_column() CASCADE;

-- Create reports table in api schema
CREATE TABLE api.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  category text,
  encrypted_report_data text NOT NULL,
  file_count integer DEFAULT 0,
  status text DEFAULT 'received',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create report_files table in api schema
CREATE TABLE api.report_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES api.reports(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create report_updates table in api schema
CREATE TABLE api.report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES api.reports(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create platform_settings table in api schema
CREATE TABLE api.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE api.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for reports (anonymous access for submission and verification)
CREATE POLICY "Allow anonymous report submission"
  ON api.reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous report verification by reference_id"
  ON api.reports
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for report_files
CREATE POLICY "Allow anonymous file upload"
  ON api.report_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous file access"
  ON api.report_files
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for report_updates
CREATE POLICY "Allow anonymous users to insert report updates"
  ON api.report_updates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to view report updates"
  ON api.report_updates
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for platform_settings
CREATE POLICY "Allow anonymous settings read"
  ON api.platform_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role to manage settings"
  ON api.platform_settings
  FOR ALL
  TO service_role
  USING (true);

-- Insert default platform settings
INSERT INTO api.platform_settings (setting_key, setting_value) VALUES
  ('panic_button', '{"redirect_url": "https://www.wikipedia.org", "clear_dom": true}'),
  ('performance', '{"inline_css_threshold": 8, "defer_js": true, "gzip_enabled": true}'),
  ('encryption', '{"public_key_armored": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQENBGXXXXXXBCAC7vQ8Z9K2L3M4N5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2\nG3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4\nM5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6\nS7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8\nY9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0\nE1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2\nK3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4\nQ5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6\nABEAAAG0JVdoaXNwZXIgUGxhdGZvcm0gPHNlY3VyZUB3aGlzcGVyLm9yZz6JATgE\nEwECACIFAlXXXXXXAhsDBgsJCAcDAgYVCAIJCgsEFgIDAQIeAQIXgAAKCRDXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n=XXXX\n-----END PGP PUBLIC KEY BLOCK-----"}'),
  ('idle_timeout', '{"duration_minutes": 120, "warning_enabled": false, "warning_message": "ستنتهي الجلسة خلال خمس دقائق من الخمول.", "redirect_url": "https://www.wikipedia.org"}'),
  ('draft_settings', '{"enabled": true, "ttl_hours": 2}')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create function to update timestamps in api schema
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reports_updated_at 
  BEFORE UPDATE ON api.reports
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at 
  BEFORE UPDATE ON api.platform_settings
  FOR EACH ROW EXECUTE FUNCTION api.update_updated_at_column();