/*
  # Consolidate users to ahmed@ahmedmohamed.org

  1. Changes
    - Keeps only ahmed's user account
    - Consolidates all financial data to ahmed's account
    - Removes other users while preserving data integrity
  
  2. Security
    - Maintains referential integrity
    - Handles unique constraints properly
*/

DO $$ 
DECLARE
  ahmed_id uuid;
  ahmed_financial_id uuid;
BEGIN
  -- Get ahmed's user ID
  SELECT id INTO ahmed_id
  FROM auth.users
  WHERE email = 'ahmed@ahmedmohamed.org';

  -- If ahmed's account doesn't exist, we can't proceed
  IF ahmed_id IS NULL THEN
    RAISE EXCEPTION 'Required user ahmed@ahmedmohamed.org does not exist';
  END IF;

  -- First, get ahmed's financial settings ID if it exists
  SELECT id INTO ahmed_financial_id
  FROM financial_settings
  WHERE user_id = ahmed_id;

  -- If ahmed doesn't have financial settings, use the first available one
  IF ahmed_financial_id IS NULL THEN
    SELECT id INTO ahmed_financial_id
    FROM financial_settings
    LIMIT 1;

    -- If we found settings, update them to belong to ahmed
    IF ahmed_financial_id IS NOT NULL THEN
      UPDATE financial_settings
      SET user_id = ahmed_id
      WHERE id = ahmed_financial_id;
    END IF;
  END IF;

  -- Delete other financial settings
  DELETE FROM financial_settings
  WHERE user_id != ahmed_id;

  -- Update all transactions to be owned by ahmed
  UPDATE transactions
  SET user_id = ahmed_id
  WHERE user_id != ahmed_id;

  -- Update all categories to be owned by ahmed
  UPDATE categories
  SET user_id = ahmed_id
  WHERE user_id != ahmed_id;

  -- Delete profiles for other users
  DELETE FROM profiles
  WHERE id != ahmed_id;

  -- Finally, delete other users from auth.users
  DELETE FROM auth.users
  WHERE email != 'ahmed@ahmedmohamed.org';

END $$;
