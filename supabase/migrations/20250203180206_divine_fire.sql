/*
  # Fix user list RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies that properly handle admin access
    - Fix recursive policy issues
    - Ensure admins can see all users
    - Ensure regular users can only see their own profile

  2. Security
    - Admins have full access to all profiles
    - Regular users can only read and update their own profile
    - No circular dependencies in policy definitions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profile" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can read profiles"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id -- User can read their own profile
    OR 
    EXISTS ( -- Admin can read all profiles
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can update profiles"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id -- User can update their own profile
    OR 
    EXISTS ( -- Admin can update all profiles
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS ( -- Only admins can insert new profiles
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can delete profiles"
  ON profiles
  FOR DELETE
  USING (
    EXISTS ( -- Only admins can delete profiles
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
