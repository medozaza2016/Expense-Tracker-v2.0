-- Update the vehicle purchase transaction function with new description format
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
