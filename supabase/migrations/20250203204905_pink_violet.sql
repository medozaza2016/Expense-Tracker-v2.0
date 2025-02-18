-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all access" ON transactions;
DROP POLICY IF EXISTS "Allow all access" ON categories;
DROP POLICY IF EXISTS "Anyone can read financial settings" ON financial_settings;
DROP POLICY IF EXISTS "Authenticated users can manage financial settings" ON financial_settings;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "System can manage profiles" ON profiles;

-- Create simple policies that only check if user is authenticated
CREATE POLICY "Basic auth access"
  ON profiles
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Basic auth access"
  ON transactions
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Basic auth access"
  ON categories
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Basic auth access"
  ON financial_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Simplify profiles table
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make all user_id columns optional
ALTER TABLE transactions
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE categories
ALTER COLUMN user_id DROP NOT NULL;

-- Update trigger function to be as simple as possible
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing data is accessible
UPDATE transactions SET user_id = NULL;
UPDATE categories SET user_id = NULL;
