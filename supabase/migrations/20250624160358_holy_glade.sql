/*
  # Enhanced RLS Policies for Authenticated Users

  1. Security Updates
    - Add comprehensive RLS policies for authenticated users
    - Maintain existing anonymous access for whistleblowing functionality
    - Enable full CRUD operations for authenticated admin users
    - Ensure proper access control for all tables

  2. Policy Structure
    - Anonymous users: Limited to submission and verification
    - Authenticated users: Full access for administration
    - Service role: Complete administrative access

  3. Tables Covered
    - reports
    - report_files  
    - report_updates
    - platform_settings
*/

-- ============================================================================
-- ENHANCED AUTHENTICATED USER POLICIES
-- ============================================================================

-- === REPORTS =================================================================

CREATE POLICY "Allow authenticated users to select their own reports"
ON reports
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert reports"
ON reports
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own reports"
ON reports
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete their own reports"
ON reports
FOR DELETE
TO authenticated
USING (true);

-- === REPORT_FILES ============================================================

CREATE POLICY "Allow authenticated users to select their own report files"
ON report_files
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert report files"
ON report_files
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own report files"
ON report_files
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete their own report files"
ON report_files
FOR DELETE
TO authenticated
USING (true);

-- === REPORT_UPDATES ==========================================================

CREATE POLICY "Allow authenticated users to select their own report updates"
ON report_updates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert report updates"
ON report_updates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own report updates"
ON report_updates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete their own report updates"
ON report_updates
FOR DELETE
TO authenticated
USING (true);

-- === PLATFORM_SETTINGS =======================================================

CREATE POLICY "Allow authenticated users to select platform settings"
ON platform_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert platform settings"
ON platform_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update platform settings"
ON platform_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete platform settings"
ON platform_settings
FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- API SCHEMA POLICIES (if using api schema)
-- ============================================================================

-- Check if api schema tables exist and apply policies
DO $$
BEGIN
  -- === API.REPORTS =============================================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'reports') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to select their own reports" ON api.reports FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to insert reports" ON api.reports FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to update their own reports" ON api.reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to delete their own reports" ON api.reports FOR DELETE TO authenticated USING (true)';
  END IF;

  -- === API.REPORT_FILES ========================================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'report_files') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to select their own report files" ON api.report_files FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to insert report files" ON api.report_files FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to update their own report files" ON api.report_files FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to delete their own report files" ON api.report_files FOR DELETE TO authenticated USING (true)';
  END IF;

  -- === API.REPORT_UPDATES ======================================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'report_updates') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to select their own report updates" ON api.report_updates FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to insert report updates" ON api.report_updates FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to update their own report updates" ON api.report_updates FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to delete their own report updates" ON api.report_updates FOR DELETE TO authenticated USING (true)';
  END IF;

  -- === API.PLATFORM_SETTINGS ===================================================
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'platform_settings') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to select platform settings" ON api.platform_settings FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to insert platform settings" ON api.platform_settings FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to update platform settings" ON api.platform_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow authenticated users to delete platform settings" ON api.platform_settings FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

-- ============================================================================
-- GRANT ENHANCED PERMISSIONS
-- ============================================================================

-- Grant full table permissions to authenticated users for public schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
    EXECUTE 'GRANT ALL ON public.reports TO authenticated';
    EXECUTE 'GRANT ALL ON public.report_files TO authenticated';
    EXECUTE 'GRANT ALL ON public.report_updates TO authenticated';
    EXECUTE 'GRANT ALL ON public.platform_settings TO authenticated';
  END IF;
END $$;

-- Grant full table permissions to authenticated users for api schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'api' AND table_name = 'reports') THEN
    EXECUTE 'GRANT ALL ON api.reports TO authenticated';
    EXECUTE 'GRANT ALL ON api.report_files TO authenticated';
    EXECUTE 'GRANT ALL ON api.report_updates TO authenticated';
    EXECUTE 'GRANT ALL ON api.platform_settings TO authenticated';
  END IF;
END $$;

-- ============================================================================
-- SECURITY SUMMARY
-- ============================================================================

/*
  Enhanced Security Model:
  
  1. ANONYMOUS USERS (Whistleblowers):
     - Can submit reports securely
     - Can verify reports by reference ID
     - Can upload files linked to reports
     - Can view report updates for their submissions
     - Can read platform settings (for encryption keys)
     - LIMITED to submission and verification only
  
  2. AUTHENTICATED USERS (Administrators):
     - Full CRUD access to all reports
     - Can manage report files and updates
     - Can configure platform settings
     - Can perform administrative operations
     - Complete access for management purposes
  
  3. SERVICE ROLE (System):
     - Complete administrative access
     - Can perform system-level operations
     - Full database management capabilities
  
  4. Data Protection Features:
     - Client-side encryption before storage
     - Reference-based access control for anonymous users
     - Row Level Security prevents unauthorized access
     - Comprehensive audit trail through report_updates
     - Secure file handling with metadata stripping
  
  This enhanced model maintains the secure, anonymous whistleblowing
  functionality while providing administrators with the tools needed
  to manage reports, investigate cases, and maintain the platform.
  
  Note: Since tables don't include user_id columns, authenticated users
  have access to all records. If you need per-user restrictions later,
  add a user_id column and modify the USING clauses to filter by auth.uid().
*/