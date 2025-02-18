/*
  # Transaction System Setup

  1. Changes
    - Drop existing views and tables
    - Create categories table
    - Create transactions table
    - Create indexes
    - Enable RLS
    - Create policies
    - Create statistics view
    - Add default categories

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
    - Ensure proper user access control

  3. Views
    - Add category_stats view for analytics
*/

-- Drop existing views first
DROP VIEW IF EXISTS category_stats;
DROP VIEW IF EXISTS category_usage;

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table with proper references
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category_id uuid REFERENCES categories(id) NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can read own categories"
  ON categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create view for category statistics
CREATE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  COUNT(t.id) as transaction_count,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses
FROM categories c
LEFT JOIN transactions t ON t.category_id = c.id
GROUP BY c.id, c.name, c.user_id;

-- Insert default categories for each user
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO categories (name, user_id)
    VALUES 
      ('Salary', user_record.id),
      ('Investment', user_record.id),
      ('Sales', user_record.id),
      ('Food', user_record.id),
      ('Transport', user_record.id),
      ('Utilities', user_record.id),
      ('Entertainment', user_record.id),
      ('Other', user_record.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
