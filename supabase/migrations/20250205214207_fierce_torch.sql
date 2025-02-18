-- First clean up any existing duplicate transactions
WITH duplicates AS (
  SELECT DISTINCT ON (reference_id) id
  FROM transactions 
  WHERE reference_id IS NOT NULL
  AND category IN ('Asset', 'Vehicle Purchase')
  ORDER BY reference_id, created_at DESC -- Keep the most recent transaction
)
DELETE FROM transactions
WHERE reference_id IN (
  SELECT reference_id 
  FROM transactions 
  WHERE reference_id IS NOT NULL
  AND category IN ('Asset', 'Vehicle Purchase')
)
AND id NOT IN (SELECT id FROM duplicates);

-- Update any remaining transactions to use 'Vehicle Purchase' category
UPDATE transactions
SET category = 'Vehicle Purchase'
WHERE category = 'Asset'
AND reference_id IN (
  SELECT id 
  FROM vehicles
);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
DROP FUNCTION IF EXISTS create_vehicle_purchase_transaction();

-- Create improved function with better duplicate prevention
CREATE OR REPLACE FUNCTION create_vehicle_purchase_transaction()
RETURNS TRIGGER AS $$
DECLARE
  existing_transaction_id uuid;
BEGIN
  -- Check for existing transaction
  SELECT id INTO existing_transaction_id
  FROM transactions
  WHERE reference_id = NEW.id
  AND category = 'Vehicle Purchase'
  LIMIT 1;

  -- Only create transaction if none exists
  IF existing_transaction_id IS NULL THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER vehicle_purchase_trigger
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION create_vehicle_purchase_transaction();
