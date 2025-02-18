/*
  # Update Financial Settings Schema
  
  1. Changes
    - Remove user_id foreign key constraint
    - Update existing data to use fixed ID
    - Add constraint to ensure single record
  
  2. Security
    - Update RLS policies for single record access
*/

-- First remove the foreign key constraint
ALTER TABLE financial_settings
DROP CONSTRAINT IF EXISTS financial_settings_user_id_fkey;

-- Update existing data to use the fixed ID
UPDATE financial_settings
SET id = 'ef87c799-ef55-4608-bf91-a902229ee6b6',
    user_id = 'ef87c799-ef55-4608-bf91-a902229ee6b6'
WHERE id IS NOT NULL;

-- Delete any extra records, keeping only one
DELETE FROM financial_settings
WHERE id != 'ef87c799-ef55-4608-bf91-a902229ee6b6';

-- If no record exists, create one
INSERT INTO financial_settings (id, user_id, cash_on_hand, showroom_balance, personal_loan, additional)
SELECT 
  'ef87c799-ef55-4608-bf91-a902229ee6b6',
  'ef87c799-ef55-4608-bf91-a902229ee6b6',
  18400,
  20135,
  22500,
  -4100
WHERE NOT EXISTS (
  SELECT 1 FROM financial_settings 
  WHERE id = 'ef87c799-ef55-4608-bf91-a902229ee6b6'
);

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read financial settings" ON financial_settings;
DROP POLICY IF EXISTS "Authenticated users can manage financial settings" ON financial_settings;

-- Create new policies for single record access
CREATE POLICY "Anyone can read financial settings"
  ON financial_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage financial settings"
  ON financial_settings
  FOR ALL
  USING (auth.role() = 'authenticated');
