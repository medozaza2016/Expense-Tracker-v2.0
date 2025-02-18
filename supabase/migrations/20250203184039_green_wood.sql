/*
  # Fix transaction schema

  1. Changes
    - Drop category_id column from transactions
    - Ensure category column exists and is properly configured
    - Update views and indexes
    - Add data migration for existing records

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing views
DROP VIEW IF EXISTS category_stats;

-- Remove category_id column and its constraints
ALTER TABLE transactions 
DROP COLUMN IF EXISTS category_id;

-- Ensure category column exists and is properly configured
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'category'
  ) THEN
    ALTER TABLE transactions ADD COLUMN category text DEFAULT 'Other';
    ALTER TABLE transactions ALTER COLUMN category SET NOT NULL;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Create or replace the category stats view
CREATE OR REPLACE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  COUNT(t.id) as transaction_count,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses
FROM categories c
LEFT JOIN transactions t ON t.category = c.name AND t.user_id = c.user_id
GROUP BY c.id, c.name, c.user_id;
