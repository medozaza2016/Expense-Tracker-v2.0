-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can read transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can manage transactions" ON transactions;

DROP POLICY IF EXISTS "Users can read own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

-- Create new open access policies for transactions
CREATE POLICY "Open access for authenticated users"
  ON transactions
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create new open access policies for categories
CREATE POLICY "Open access for authenticated users"
  ON categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Remove user_id foreign key constraints
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Make user_id optional
ALTER TABLE transactions
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE categories
ALTER COLUMN user_id DROP NOT NULL;
