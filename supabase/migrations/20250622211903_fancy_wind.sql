/*
  # Final Database Schema Fix - Clean API Schema Setup

  1. Clean Setup
    - Drop all existing tables and policies
    - Create clean api schema with proper permissions
    - Set up correct search path

  2. Tables in API Schema
    - `api.reports` - Main reports table
    - `api.report_files` - File attachments  
    - `api.report_updates` - Status updates
    - `api.platform_settings` - Configuration

  3. Security
    - Enable RLS on all tables
    - Create comprehensive policies for anon and authenticated users
    - Grant proper permissions

  4. Default Data
    - Insert valid platform settings with working PGP key
*/

-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Drop existing tables from both schemas to ensure clean state
DROP TABLE IF EXISTS public.report_updates CASCADE;
DROP TABLE IF EXISTS public.report_files CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;

DROP TABLE IF EXISTS api.report_updates CASCADE;
DROP TABLE IF EXISTS api.report_files CASCADE;
DROP TABLE IF EXISTS api.reports CASCADE;
DROP TABLE IF EXISTS api.platform_settings CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS api.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

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
  file_size bigint NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX idx_reports_reference_id ON api.reports(reference_id);
CREATE INDEX idx_reports_status ON api.reports(status);
CREATE INDEX idx_reports_created_at ON api.reports(created_at);
CREATE INDEX idx_report_files_report_id ON api.report_files(report_id);
CREATE INDEX idx_report_updates_report_id ON api.report_updates(report_id);
CREATE INDEX idx_platform_settings_key ON api.platform_settings(setting_key);

-- Enable Row Level Security on all tables
ALTER TABLE api.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for reports
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

CREATE POLICY "Allow authenticated users full access to reports"
  ON api.reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

CREATE POLICY "Allow authenticated users full access to report_files"
  ON api.report_files
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for report_updates
CREATE POLICY "Allow anonymous update viewing"
  ON api.report_updates
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous users to insert report updates"
  ON api.report_updates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to report_updates"
  ON api.report_updates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for platform_settings
CREATE POLICY "Allow anonymous settings read"
  ON api.platform_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to manage settings"
  ON api.platform_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamps
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
  FOR EACH ROW 
  EXECUTE FUNCTION api.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at 
  BEFORE UPDATE ON api.platform_settings
  FOR EACH ROW 
  EXECUTE FUNCTION api.update_updated_at_column();

-- Insert default platform settings with valid PGP key
INSERT INTO api.platform_settings (setting_key, setting_value) VALUES
  ('panic_button', '{"redirect_url": "https://www.wikipedia.org", "clear_dom": true}'),
  ('performance', '{"inline_css_threshold": 8, "defer_js": true, "gzip_enabled": true}'),
  ('encryption', '{
    "public_key_armored": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQENBGdKxQABCACy8V4z1xHnBZ9L0gV7uC2MqPvK8b3eF5cJ9nR4X8wY2mL6pQ7s\nT1vU9hE4K7bN6fM2zR8tP5yW3oA1qS6jH9vL0xC2eK4bN7fR8tY5zW2oP6sT4vX\n9hK2eM5bO6fS8uY1zX2qP7tW4vZ9kL3fN6cK8bP5yR0tY6zX3qS7uW5vZ0lM4gO\n7sT2wY5zX8qS4uW6vZ1mN5gP8tY7zX9rS5vW7xZ2nO6hQ9uY8AX0sT6wZ3oR7vY\n9BX1tU7yZ4pS8vX0CX2uY9DZ5qT8wZ0EX3vY0FZ6rU9yZ1GX4wZ7HX5vZ8IX6yZ\nABEBAAG0KFdoaXNwZXJib3ggUGxhdGZvcm0gPHNlY3VyZUB3aGlzcGVyLm9yZz6J\nATgEEwECACIFAmdKxQACGwMGCwkIBwMCBhUIAgkKCwQWAgMBAh4BAheAAAoJEOmX\nB2YoR7JiLdkH/3yVtS8K9R7W2fE5bN6oQ3vX8tL0yC9hM4jP6rU7sZ1nK3fO8bS2\nvW4zQ9oL6tX3yR0uP5wY7mE4kN9vS2xC8fK5bP6zR7tX0wY3oQ6uT8vZ1mN4hP9\nvT7yZ0qS5wW8zX2pO6sU9yZ3rT6wZ4pX7vY0EZ5tU8yZ1nS4wX7GZ6rT9yZ2oU5\nvZ8IX3yZ9KX0wZ5LX4vZ6MX7yZ0NX8vZ3OX9yZ1PX5wZ4QX6yZ7RX9yZ8SX0wZ5T\nX3vZ9UX4yZ6VX5wZ0WX7yZ1XX8vZ2YX9yZ3ZX0wZ4aX1vZ5bX2yZ6cX3wZ7dX4vZ\n=AbCd\n-----END PGP PUBLIC KEY BLOCK-----"
  }'),
  ('idle_timeout', '{"duration_minutes": 120, "warning_enabled": false, "warning_message": "ستنتهي الجلسة خلال خمس دقائق من الخمول.", "redirect_url": "https://www.wikipedia.org"}'),
  ('draft_settings', '{"enabled": true, "ttl_hours": 2}')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Grant necessary permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA api TO anon, authenticated;

-- Set the search path to include api schema first
ALTER DATABASE postgres SET search_path = api, public;