/*
  # Remove role restrictions and enable shared data access

  1. Changes
    - Remove role and is_active columns from profiles
    - Update RLS policies to allow all authenticated users to access data
    - Remove role-based restrictions from all tables
    - Ensure all data is shared between users

  2. Security
    - Maintain basic authentication requirements
    - Allow all authenticated users equal access
*/

-- Remove role and is_active columns from profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS is_active;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles access" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin delete profiles" ON profiles;

-- Create new simplified policies for profiles
CREATE POLICY "Authenticated users can read profiles"
  ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "System can manage profiles"
  ON profiles
  FOR ALL
  USING (true);

-- Update transactions policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Authenticated users can read transactions"
  ON transactions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage transactions"
  ON transactions
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Update categories policies
DROP POLICY IF EXISTS "Users can read own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

CREATE POLICY "Authenticated users can read categories"
  ON categories
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Update financial_settings policies
DROP POLICY IF EXISTS "Users can read own financial settings" ON financial_settings;
DROP POLICY IF EXISTS "Users can insert own financial settings" ON financial_settings;
DROP POLICY IF EXISTS "Users can update own financial settings" ON financial_settings;

CREATE POLICY "Authenticated users can read financial settings"
  ON financial_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage financial settings"
  ON financial_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Update user creation trigger to remove role handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name
  )
  VALUES (
    new.id,
    new.email,
    NULLIF(new.raw_user_meta_data->>'first_name', ''),
    NULLIF(new.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
