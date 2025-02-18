-- First clean up any existing duplicate transactions
WITH DuplicatesToDelete AS (
  SELECT t1.id
  FROM transactions t1
  JOIN transactions t2 
  ON t1.reference_id = t2.reference_id 
  AND t1.id != t2.id
  WHERE t1.reference_id IS NOT NULL
  AND t1.category IN ('Asset', 'Vehicle Purchase')
  AND t2.category IN ('Asset', 'Vehicle Purchase')
  AND (
    -- Keep Vehicle Purchase over Asset
    (t1.category = 'Asset' AND t2.category = 'Vehicle Purchase')
    OR 
    -- If same category, keep the newer one
    (t1.category = t2.category AND t1.created_at < t2.created_at)
  )
)
DELETE FROM transactions
WHERE id IN (SELECT id FROM DuplicatesToDelete);

-- Update any remaining Asset transactions to Vehicle Purchase
UPDATE transactions
SET category = 'Vehicle Purchase'
WHERE category = 'Asset'
AND reference_id IN (SELECT id FROM vehicles);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
DROP FUNCTION IF EXISTS create_vehicle_purchase_transaction();

-- Create improved function that ensures only one transaction
CREATE OR REPLACE FUNCTION create_vehicle_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- First, delete any existing transactions for this vehicle
  DELETE FROM transactions 
  WHERE reference_id = NEW.id;

  -- Then create exactly one transaction
  INSERT INTO transactions (
    amount,
    type,
    category,
    description,
    date,
    reference_id
  ) VALUES (
    NEW.purchase_price,
    'expense',
    'Vehicle Purchase',
    format('Vehicle Purchased - %s %s %s (VIN: %s)', 
      NEW.year, 
      NEW.make, 
      NEW.model,
      COALESCE(NEW.vin, 'N/A')
    ),
    NEW.purchase_date,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER vehicle_purchase_trigger
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION create_vehicle_purchase_transaction();
