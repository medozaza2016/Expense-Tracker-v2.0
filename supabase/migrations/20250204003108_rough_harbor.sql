-- Drop existing foreign key constraints
ALTER TABLE vehicle_expenses
DROP CONSTRAINT IF EXISTS vehicle_expenses_vehicle_id_fkey;

ALTER TABLE profit_distributions 
DROP CONSTRAINT IF EXISTS profit_distributions_vehicle_id_fkey;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE vehicle_expenses
ADD CONSTRAINT vehicle_expenses_vehicle_id_fkey
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE;

ALTER TABLE profit_distributions
ADD CONSTRAINT profit_distributions_vehicle_id_fkey
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE;
