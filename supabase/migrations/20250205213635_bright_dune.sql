-- First ensure we have the Vehicle Purchase category
INSERT INTO categories (id, name, user_id)
VALUES (gen_random_uuid(), 'Vehicle Purchase', NULL)
ON CONFLICT (name) DO NOTHING;

-- Create function to automatically create transaction for vehicle purchases
CREATE OR REPLACE FUNCTION create_vehicle_purchase_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction for new vehicles
  IF TG_OP = 'INSERT' THEN
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
      format('PURCHASE %s %s %s #%s', 
        NEW.year, 
        NEW.make, 
        NEW.model,
        COALESCE(NEW.vin, '')
      ),
      NEW.purchase_date,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vehicle purchases
DROP TRIGGER IF EXISTS vehicle_purchase_trigger ON vehicles;
CREATE TRIGGER vehicle_purchase_trigger
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION create_vehicle_purchase_transaction();
