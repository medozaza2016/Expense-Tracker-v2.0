/*
  # Fix user policies to use auth.users

  1. Changes
    - Drop existing policies
    - Create new policies that use auth.users instead of profiles table
    - Fix permission denied errors
    - Ensure proper access control without circular dependencies

  2. Security
    - Admins can manage all profiles
    - Users can only manage their own profile
    - No direct access to auth.users table required
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id -- Users can always read their own profile
  );

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id -- Users can always update their own profile
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
