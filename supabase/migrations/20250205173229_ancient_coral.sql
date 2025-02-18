-- Add source column to vehicle_expenses table
ALTER TABLE vehicle_expenses
ADD COLUMN IF NOT EXISTS source text CHECK (source IN ('bank', 'cash'));

-- Create view for dashboard calculations that includes expense sources
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
    END), 0) as profit_nada
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
  fs.additional
FROM transaction_totals tt
CROSS JOIN expense_totals et
CROSS JOIN financial_settings fs
WHERE fs.id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';

-- Create function to update financial settings based on expense source
CREATE OR REPLACE FUNCTION update_financial_settings_on_expense()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process Ahmed's expenses
  IF NEW.recipient = 'Ahmed' AND NEW.source IS NOT NULL THEN
    -- For new expenses
    IF TG_OP = 'INSERT' THEN
      IF NEW.source = 'bank' THEN
        UPDATE financial_settings 
        SET showroom_balance = showroom_balance - NEW.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      ELSIF NEW.source = 'cash' THEN
        UPDATE financial_settings 
        SET cash_on_hand = cash_on_hand - NEW.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      END IF;
    -- For updated expenses
    ELSIF TG_OP = 'UPDATE' THEN
      -- Reverse old transaction
      IF OLD.source = 'bank' THEN
        UPDATE financial_settings 
        SET showroom_balance = showroom_balance + OLD.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      ELSIF OLD.source = 'cash' THEN
        UPDATE financial_settings 
        SET cash_on_hand = cash_on_hand + OLD.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      END IF;
      
      -- Apply new transaction
      IF NEW.source = 'bank' THEN
        UPDATE financial_settings 
        SET showroom_balance = showroom_balance - NEW.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      ELSIF NEW.source = 'cash' THEN
        UPDATE financial_settings 
        SET cash_on_hand = cash_on_hand - NEW.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      END IF;
    -- For deleted expenses
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.source = 'bank' THEN
        UPDATE financial_settings 
        SET showroom_balance = showroom_balance + OLD.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      ELSIF OLD.source = 'cash' THEN
        UPDATE financial_settings 
        SET cash_on_hand = cash_on_hand + OLD.amount
        WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6';
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update financial settings
DROP TRIGGER IF EXISTS expense_insert_trigger ON vehicle_expenses;
CREATE TRIGGER expense_insert_trigger
  AFTER INSERT ON vehicle_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_settings_on_expense();

DROP TRIGGER IF EXISTS expense_update_trigger ON vehicle_expenses;
CREATE TRIGGER expense_update_trigger
  AFTER UPDATE ON vehicle_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_settings_on_expense();

DROP TRIGGER IF EXISTS expense_delete_trigger ON vehicle_expenses;
CREATE TRIGGER expense_delete_trigger
  AFTER DELETE ON vehicle_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_settings_on_expense();
