-- Drop existing view if it exists
DROP VIEW IF EXISTS category_stats;

-- Create view for category statistics
CREATE OR REPLACE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  COUNT(t.id) as transaction_count,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses
FROM categories c
LEFT JOIN transactions t ON t.category = c.name
GROUP BY c.id, c.name, c.user_id;
