-- Drop existing view
DROP VIEW IF EXISTS vehicle_financials;

-- Create updated view for vehicle financials
CREATE OR REPLACE VIEW vehicle_financials AS
WITH expense_totals AS (
  SELECT 
    vehicle_id,
    COALESCE(SUM(amount), 0) as total_expenses
  FROM vehicle_expenses
  GROUP BY vehicle_id
),
distribution_totals AS (
  SELECT 
    vehicle_id,
    COALESCE(SUM(amount), 0) as total_distributed
  FROM profit_distributions
  GROUP BY vehicle_id
)
SELECT 
  v.id,
  v.vin,
  v.make,
  v.model,
  v.year,
  v.color,
  v.status,
  v.purchase_price,
  v.sale_price,
  v.purchase_date,
  v.sale_date,
  v.created_at,
  COALESCE(et.total_expenses, 0) as total_expenses,
  CASE 
    WHEN v.status = 'SOLD' THEN 
      v.sale_price - v.purchase_price - COALESCE(et.total_expenses, 0)
    ELSE 
      0
  END as net_profit,
  COALESCE(dt.total_distributed, 0) as total_distributed
FROM vehicles v
LEFT JOIN expense_totals et ON et.vehicle_id = v.id
LEFT JOIN distribution_totals dt ON dt.vehicle_id = v.id;
