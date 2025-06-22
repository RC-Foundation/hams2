/*
  # Fix platform_settings RLS policies

  1. Security Updates
    - Enable RLS on platform_settings table (if not already enabled)
    - Add proper SELECT policy for anon and authenticated users
    - Add optional admin policies for modifying settings

  2. Changes
    - Drop existing policies if they exist to prevent conflicts
    - Create new policies with proper permissions
    - Ensure anon users can read platform settings
*/

-- Enable RLS on platform_settings table (if not already enabled)
ALTER TABLE api.platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Allow anonymous settings read" ON api.platform_settings;
DROP POLICY IF EXISTS "Allow select for all users" ON api.platform_settings;
DROP POLICY IF EXISTS "Allow admin to modify settings" ON api.platform_settings;

-- Allow SELECT for anon and authenticated users
CREATE POLICY "Allow select for all users"
  ON api.platform_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Optional: Allow service_role to modify settings (for admin operations)
CREATE POLICY "Allow admin to modify settings"
  ON api.platform_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);