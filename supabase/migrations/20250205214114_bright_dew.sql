-- First delete any duplicate vehicle purchase transactions
WITH duplicates AS (
  SELECT DISTINCT ON (reference_id) id
  FROM transactions 
  WHERE reference_id IS NOT NULL
  AND category IN ('Asset', 'Vehicle Purchase')
  ORDER BY reference_id, category DESC -- Keep 'Vehicle Purchase' over 'Asset'
)
DELETE FROM transactions
WHERE reference_id IN (
  SELECT reference_id 
  FROM transactions 
  WHERE reference_id IS NOT NULL
  AND category IN ('Asset', 'Vehicle Purchase')
)
AND id NOT IN (SELECT id FROM duplicates);

-- Update any remaining 'Asset' category transactions to 'Vehicle Purchase'
UPDATE transactions
SET category = 'Vehicle Purchase'
WHERE category = 'Asset'
AND reference_id IN (
  SELECT id 
  FROM vehicles
);

-- Drop and recreate the trigger to ensure clean state
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
DROP FUNCTION IF EXISTS create_vehicle_purchase_transaction();

-- Recreate the function with safeguards against duplicates
CREATE OR REPLACE FUNCTION create_vehicle_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction for new vehicles if one doesn't already exist
  IF TG_OP = 'INSERT' AND NOT EXISTS (
    SELECT 1 
    FROM transactions 
    WHERE reference_id = NEW.id
    AND category = 'Vehicle Purchase'
  ) THEN
    -- Create the purchase transaction
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

-- Recreate the trigger
CREATE TRIGGER vehicle_purchase_trigger
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION create_vehicle_purchase_transaction();
