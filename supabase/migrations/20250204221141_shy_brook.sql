-- Drop existing view if it exists
DROP VIEW IF EXISTS category_stats;

-- Create view for category statistics
CREATE OR REPLACE VIEW category_stats AS
WITH transaction_stats AS (
  SELECT 
    c.id,
    COUNT(t.id) as transaction_count,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses
  FROM categories c
  LEFT JOIN transactions t ON t.category = c.name
  GROUP BY c.id
)
SELECT 
  c.*,
  COALESCE(ts.transaction_count, 0) as transaction_count,
  COALESCE(ts.total_income, 0) as total_income,
  COALESCE(ts.total_expenses, 0) as total_expenses
FROM categories c
LEFT JOIN transaction_stats ts ON ts.id = c.id
ORDER BY c.name;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
