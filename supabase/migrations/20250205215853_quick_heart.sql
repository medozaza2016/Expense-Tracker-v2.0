-- Drop the automatic transaction trigger and function
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
DROP FUNCTION IF EXISTS create_vehicle_purchase_transaction();

-- Remove the Vehicle Purchase category since it's no longer needed
DELETE FROM categories WHERE name = 'Vehicle Purchase';

-- Clean up any existing vehicle purchase transactions
DELETE FROM transactions 
WHERE category = 'Vehicle Purchase' 
OR (category = 'Asset' AND reference_id IN (SELECT id FROM vehicles));
