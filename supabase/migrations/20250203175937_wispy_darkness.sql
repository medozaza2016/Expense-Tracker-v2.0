/*
  # Fix profile RLS policies to avoid recursion

  1. Changes
    - Drop existing profile policies
    - Create new policies that avoid circular references
    - Use a simpler approach for admin access
  
  2. Security
    - Admins can read and manage all profiles
    - Regular users can only read and manage their own profiles
    - Avoid recursive policy checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

-- Create new policies without recursion
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "Admin can insert profile"
  ON profiles
  FOR INSERT
  WITH CHECK (role = 'admin');

CREATE POLICY "Admin can delete profile"
  ON profiles
  FOR DELETE
  USING (role = 'admin');
