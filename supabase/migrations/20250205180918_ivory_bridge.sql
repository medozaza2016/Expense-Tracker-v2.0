-- Drop existing view
DROP VIEW IF EXISTS dashboard_calculations;

-- Create updated view with correct bank balance calculation
CREATE OR REPLACE VIEW dashboard_calculations AS
WITH expense_totals AS (
  SELECT
    COALESCE(SUM(CASE 
      WHEN recipient = 'Ahmed' AND source = 'bank' THEN amount
      ELSE 0
    END), 0) as ahmed_bank_expenses,
    COALESCE(SUM(CASE 
      WHEN recipient = 'Ahmed' AND source = 'cash' THEN amount
      ELSE 0
    END), 0) as ahmed_cash_expenses,
    COALESCE(SUM(CASE 
      WHEN recipient != 'Ahmed' OR recipient IS NULL THEN amount
      ELSE 0
    END), 0) as other_expenses
  FROM vehicle_expenses
),
transaction_totals AS (
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE 
      WHEN type = 'income' AND category = 'Contribution' THEN amount 
      ELSE 0 
    END), 0) as total_contribution,
    COALESCE(SUM(CASE 
      WHEN type = 'income' AND category = 'Profit-AHMED' THEN amount 
      ELSE 0 
    END), 0) as profit_ahmed,
    COALESCE(SUM(CASE 
      WHEN type = 'income' AND category = 'Profit-NADA' THEN amount 
      ELSE 0 
    END), 0) as profit_nada,
    COALESCE(SUM(CASE 
      WHEN type = 'expense' AND category IN ('Personal Expenses', 'Distribution') THEN amount 
      ELSE 0 
    END), 0) as personal_expenses
  FROM transactions
)
SELECT
  tt.total_income,
  tt.total_expenses,
  tt.total_contribution,
  tt.profit_ahmed,
  tt.profit_nada,
  et.ahmed_bank_expenses,
  et.ahmed_cash_expenses,
  et.other_expenses,
  fs.cash_on_hand,
  fs.showroom_balance,
  fs.personal_loan,
  fs.additional,
  -- Calculate bank balance:
  -- Start with all income
  tt.total_income +
  -- Add additional capital
  fs.additional -
  -- Subtract personal expenses and distributions
  tt.personal_expenses -
  -- Subtract loans
  (fs.showroom_balance + fs.personal_loan) -
  -- Subtract cash on hand
  fs.cash_on_hand -
  -- Subtract Nada's profit
  tt.profit_nada as bank_balance
FROM transaction_totals tt
CROSS JOIN expense_totals et
CROSS JOIN financial_settings fs
WHERE fs.id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
