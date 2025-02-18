/*
  # Fix transaction schema

  1. Changes
    - Add category column to transactions table with safe default
    - Update views
    - Add appropriate indexes

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing views
DROP VIEW IF EXISTS category_stats;

-- Add category column to transactions with a default value
ALTER TABLE transactions 
ADD COLUMN category text DEFAULT 'Other';

-- Make the column NOT NULL after adding it
ALTER TABLE transactions 
ALTER COLUMN category SET NOT NULL;

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
