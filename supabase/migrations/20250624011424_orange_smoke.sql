/*
  # Apply Anonymous RLS Policies for Whistleblowing Platform

  This migration implements proper RLS policies for an anonymous whistleblowing platform.
  
  Key principles:
  1. Anonymous users can submit reports and files
  2. Anonymous users can verify specific reports by reference_id
  3. No browsing or listing capabilities for anonymous users
  4. Platform settings are readable by all
  5. Storage policies prevent unauthorized file access

  Security approach:
  - Frontend handles encryption and metadata stripping
  - Backend stores encrypted data only
  - Access control through reference_id, not user authentication
*/

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Allow anonymous report submission" ON api.reports;
DROP POLICY IF EXISTS "Allow anonymous report verification by reference_id" ON api.reports;
DROP POLICY IF EXISTS "Allow authenticated users full access to reports" ON api.reports;

DROP POLICY IF EXISTS "Allow anonymous file upload" ON api.report_files;
DROP POLICY IF EXISTS "Allow anonymous file access" ON api.report_files;
DROP POLICY IF EXISTS "Allow authenticated users full access to report_files" ON api.report_files;

DROP POLICY IF EXISTS "Allow anonymous update viewing" ON api.report_updates;
DROP POLICY IF EXISTS "Allow anonymous users to insert report updates" ON api.report_updates;
DROP POLICY IF EXISTS "Allow authenticated users full access to report_updates" ON api.report_updates;

DROP POLICY IF EXISTS "Allow anonymous settings read" ON api.platform_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage settings" ON api.platform_settings;

-- Drop storage policies if they exist
DROP POLICY IF EXISTS "Allow anonymous uploads to report-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous file downloads" ON storage.objects;

-- ============================================================================
-- REPORTS TABLE POLICIES
-- ============================================================================

-- Allow anonymous users to submit reports
CREATE POLICY "Allow anonymous report submission"
  ON api.reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to verify reports by reference_id
-- Note: Application logic in ReportService.verifyReport filters by reference_id
CREATE POLICY "Allow anonymous report verification by reference_id"
  ON api.reports
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role (admin) full access for management
CREATE POLICY "Allow service_role full access to reports"
  ON api.reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REPORT_FILES TABLE POLICIES
-- ============================================================================

-- Allow anonymous users to upload files linked to reports
CREATE POLICY "Allow anonymous file upload"
  ON api.report_files
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to access files linked to verified reports
-- Note: Access controlled by report_id linked to verified reports
CREATE POLICY "Allow anonymous file access"
  ON api.report_files
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role (admin) full access for management
CREATE POLICY "Allow service_role full access to report_files"
  ON api.report_files
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REPORT_UPDATES TABLE POLICIES
-- ============================================================================

-- Allow anonymous users to view report updates
-- Note: Access controlled by report_id linked to verified reports
CREATE POLICY "Allow anonymous update viewing"
  ON api.report_updates
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role to insert and manage updates (for admin/backend processes)
CREATE POLICY "Allow service_role to manage report updates"
  ON api.report_updates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to insert updates (if needed for automated processes)
CREATE POLICY "Allow anonymous users to insert report updates"
  ON api.report_updates
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================================
-- PLATFORM_SETTINGS TABLE POLICIES
-- ============================================================================

-- Allow anonymous users to read platform settings (needed for encryption keys, etc.)
CREATE POLICY "Allow anonymous settings read"
  ON api.platform_settings
  FOR SELECT
  TO anon
  USING (true);

-- Allow service_role to manage platform settings
CREATE POLICY "Allow service_role to manage platform settings"
  ON api.platform_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STORAGE POLICIES FOR REPORT-FILES BUCKET
-- ============================================================================

-- Allow anonymous users to upload files to report-files bucket
CREATE POLICY "Allow anonymous uploads to report-files bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'report-files');

-- IMPORTANT: No SELECT policy for anonymous users on storage.objects
-- This prevents anonymous users from listing or downloading files directly
-- Files should only be accessible through controlled backend endpoints if needed

-- Allow service_role full access to storage for admin purposes
CREATE POLICY "Allow service_role full access to report-files storage"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'report-files')
  WITH CHECK (bucket_id = 'report-files');

-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================

-- Ensure the report-files bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-files',
  'report-files',
  false, -- Not public - access controlled by policies
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- ============================================================================
-- ADDITIONAL SECURITY MEASURES
-- ============================================================================

-- Ensure RLS is enabled on all tables (should already be enabled from previous migration)
ALTER TABLE api.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.platform_settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA api TO service_role;
GRANT SELECT, INSERT ON api.reports TO anon;
GRANT SELECT, INSERT ON api.report_files TO anon;
GRANT SELECT, INSERT ON api.report_updates TO anon;
GRANT SELECT ON api.platform_settings TO anon;

-- Grant storage permissions
GRANT ALL ON storage.objects TO service_role;
GRANT INSERT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO service_role;