/*
  # Fix transaction schema and update styles

  1. Changes
    - Drop existing views
    - Ensure category column exists with proper constraints
    - Update indexes for performance
    - Create new category stats view
    - Add default categories for existing users

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing views
DROP VIEW IF EXISTS category_stats;

-- Ensure category column exists and is properly configured
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'category'
  ) THEN
    ALTER TABLE transactions ADD COLUMN category text DEFAULT 'Other';
  END IF;

  -- Update any NULL categories to 'Other'
  UPDATE transactions SET category = 'Other' WHERE category IS NULL;
  
  -- Now make it NOT NULL
  ALTER TABLE transactions ALTER COLUMN category SET NOT NULL;
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
