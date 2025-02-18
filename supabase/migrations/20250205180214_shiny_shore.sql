-- Add reference_id to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reference_id uuid;

-- Add index for reference_id
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id);

-- Add categories for expense tracking
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Bank Expense', NULL),
  (gen_random_uuid(), 'Cash Expense', NULL)
ON CONFLICT (name) DO NOTHING;

-- Create view for expense tracking
CREATE OR REPLACE VIEW expense_summary AS
WITH expense_totals AS (
  SELECT
    date_trunc('month', date) as month,
    source,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
  FROM vehicle_expenses
  WHERE recipient = 'Ahmed'
  GROUP BY 1, 2
)
SELECT
  month,
  COALESCE(SUM(CASE WHEN source = 'bank' THEN total_amount ELSE 0 END), 0) as bank_expenses,
  COALESCE(SUM(CASE WHEN source = 'cash' THEN total_amount ELSE 0 END), 0) as cash_expenses,
  COALESCE(SUM(total_amount), 0) as total_expenses,
  COALESCE(SUM(transaction_count), 0) as total_transactions
FROM expense_totals
GROUP BY month
ORDER BY month DESC;
