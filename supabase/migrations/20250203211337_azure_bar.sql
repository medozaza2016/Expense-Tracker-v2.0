-- Modify the global_settings table to replace tax_rate with exchange_rate
ALTER TABLE global_settings 
DROP COLUMN IF EXISTS tax_rate;

ALTER TABLE global_settings
ADD COLUMN exchange_rate numeric(10,4) DEFAULT 3.6725;

-- Update the default settings
UPDATE global_settings
SET 
  currency = 'AED',
  exchange_rate = 3.6725
WHERE id = 'global-settings';
