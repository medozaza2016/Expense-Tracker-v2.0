-- First clean up any existing duplicate transactions
DELETE FROM transactions t1 
USING transactions t2
WHERE t1.reference_id = t2.reference_id 
  AND t1.id < t2.id
  AND t1.reference_id IS NOT NULL
  AND t1.category IN ('Asset', 'Vehicle Purchase')
  AND t2.category IN ('Asset', 'Vehicle Purchase');

-- Update any remaining Asset transactions to Vehicle Purchase
UPDATE transactions
SET category = 'Vehicle Purchase'
WHERE category = 'Asset'
AND reference_id IN (SELECT id FROM vehicles);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
DROP FUNCTION IF EXISTS create_vehicle_purchase_transaction();

-- Create improved function with strict duplicate prevention
CREATE OR REPLACE FUNCTION create_vehicle_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any existing transactions for this vehicle first
  DELETE FROM transactions 
  WHERE reference_id = NEW.id 
  AND category IN ('Asset', 'Vehicle Purchase');

  -- Create single transaction
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
