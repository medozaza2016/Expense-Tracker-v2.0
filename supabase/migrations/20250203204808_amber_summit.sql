-- Drop existing policies first
DROP POLICY IF EXISTS "Open access for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Open access for authenticated users" ON categories;

-- Create new policies for transactions with true condition
CREATE POLICY "Allow all access"
  ON transactions
  FOR ALL
  USING (true);

-- Create new policies for categories with true condition
CREATE POLICY "Allow all access"
  ON categories
  FOR ALL
  USING (true);

-- Ensure RLS is enabled but allows all access
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;

-- Update existing data to remove user_id restrictions
UPDATE transactions SET user_id = NULL;
UPDATE categories SET user_id = NULL;
