-- Add expenses column to financial_settings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_settings' AND column_name = 'expenses'
  ) THEN
    ALTER TABLE financial_settings 
    ADD COLUMN expenses numeric(15,2) DEFAULT 0;
  END IF;
END $$;
