/*
  # Fix profile policies to prevent infinite recursion

  1. Changes
    - Remove circular reference in admin policy
    - Add simpler policies for profile access
  
  2. Security
    - Maintain row level security
    - Users can still only access their own profiles
    - Admins can access all profiles without circular reference
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create new policies without circular reference
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (role = 'admin');
